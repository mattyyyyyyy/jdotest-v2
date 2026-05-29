import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('返回 ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('GET /api/v1/categories', () => {
  it('返回 7 类场景且按 sort 排序', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/categories' });
    expect(res.statusCode).toBe(200);
    const { items } = res.json();
    expect(items).toHaveLength(7);
    expect(items[0].id).toBe('energy');
    expect(items.map((c: { id: string }) => c.id)).toContain('rescue');
  });
});

describe('GET /api/v1/products', () => {
  it('返回全部商品', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/products' });
    expect(res.statusCode).toBe(200);
    expect(res.json().total).toBeGreaterThan(0);
  });

  it('?categoryId=goods 只返回车内好物', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/products?categoryId=goods' });
    const { items } = res.json();
    expect(items.every((p: { categoryId: string }) => p.categoryId === 'goods')).toBe(true);
  });
});

describe('GET /api/v1/products/:id', () => {
  it('存在返回商品', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/products/p-001' });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toContain('玻璃水');
  });

  it('不存在返回 404 + 统一错误格式', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/products/nope' });
    expect(res.statusCode).toBe(404);
    expect(res.json().code).toBe('PRODUCT_NOT_FOUND');
    expect(res.json()).toHaveProperty('traceId');
  });
});

describe('POST /api/v1/orders/transition · 复用 order-state-machine', () => {
  it('合法转换 DRAFT--submit-->PENDING_PAYMENT', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/orders/transition',
      payload: { state: 'DRAFT', event: 'submit' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().state).toBe('PENDING_PAYMENT');
  });

  it('非法转换返回 409 INVALID_TRANSITION', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/orders/transition',
      payload: { state: 'DRAFT', event: 'delivered' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('INVALID_TRANSITION');
  });
});
