import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

/**
 * 契约漂移守卫：openapi.yaml 里记录的每个 path 必须是 services/api 已注册的路由。
 * 捕获「文档了但没实现 / 实现删了文档没删」的正向漂移。无 yaml 依赖——
 * 对自家格式良好的 openapi.yaml 做轻量正则抽取（path 2 空格缩进、method 4 空格缩进）。
 */
const OPENAPI = fileURLToPath(new URL('../../../packages/api-contracts/openapi.yaml', import.meta.url));
const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

function extractOperations(): Array<{ method: string; url: string }> {
  const lines = readFileSync(OPENAPI, 'utf8').split('\n');
  const ops: Array<{ method: string; url: string }> = [];
  let current: string | null = null;
  for (const line of lines) {
    const pathM = /^ {2}(\/\S*):\s*$/.exec(line); // 2 空格缩进的 path key
    if (pathM) {
      current = pathM[1]!.replace(/\{(\w+)\}/g, ':$1'); // {id} → :id（Fastify 风格）
      continue;
    }
    const methodM = /^ {4}([a-z]+):\s*$/.exec(line); // 4 空格缩进的 method
    if (methodM && current && METHODS.has(methodM[1]!)) {
      ops.push({ method: methodM[1]!.toUpperCase(), url: current });
    }
  }
  return ops;
}

let app: FastifyInstance;
beforeAll(async () => {
  app = buildApp();
  await app.ready();
});
afterAll(async () => {
  await app.close();
});

describe('OpenAPI 契约漂移守卫（packages/api-contracts/openapi.yaml）', () => {
  it('能从 openapi.yaml 抽取到合理数量的操作', () => {
    expect(extractOperations().length).toBeGreaterThanOrEqual(35);
  });

  it('openapi.yaml 每个 path 都是已注册路由（无文档孤儿）', () => {
    const missing = extractOperations().filter((op) => !app.hasRoute({ method: op.method, url: op.url }));
    expect(missing, `openapi 列出但未实现的路由: ${JSON.stringify(missing)}`).toEqual([]);
  });
});
