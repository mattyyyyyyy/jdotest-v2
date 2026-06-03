import { defineConfig } from 'vitest/config';

// 覆盖率门槛 = TDD 的牙齿（CLAUDE.md §测试驱动开发）。
// 棘轮策略：thresholds 设在「当前基线略下方」，只防退化、不一刀切；提高时只升不降。
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/server.ts', // 进程入口（listen），不在单测范围
        'src/admin-spa.ts', // 内嵌后台的 HTML/JS 字符串，非逻辑
        'src/data/**', // seed 数据
      ],
      thresholds: {
        // 基线（2026-06-03）：lines/stmts 97.6% · funcs 98.8% · branch 80.4%。
        // 门槛设基线略下方：只防退化、留小缓冲不脆。只升不降。
        lines: 95,
        functions: 95,
        branches: 78,
        statements: 95,
      },
    },
  },
});
