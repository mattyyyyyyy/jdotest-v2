import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { transition, type OrderState, type OrderEvent } from '@jdo/order-state-machine';
import { categories, products } from './seed.js';

/** 统一错误格式（PRD §后端接入方案）：{ code, message, details, traceId } */
function errBody(code: string, message: string, details: unknown = {}) {
  return { code, message, details, traceId: 'demo-trace' };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  // 健康检查
  app.get('/health', async () => ({ status: 'ok' }));

  // 一级分类（7 场景）
  app.get('/api/v1/categories', async () => ({
    items: [...categories].sort((a, b) => a.sort - b.sort),
  }));

  // 商品列表（支持 ?categoryId= 过滤）
  app.get('/api/v1/products', async (req) => {
    const q = z.object({ categoryId: z.string().optional() }).parse(req.query);
    const items = q.categoryId ? products.filter((p) => p.categoryId === q.categoryId) : products;
    return { items, total: items.length };
  });

  // 商品详情
  app.get('/api/v1/products/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const product = products.find((p) => p.id === id);
    if (!product) {
      return reply.code(404).send(errBody('PRODUCT_NOT_FOUND', '商品不存在', { id }));
    }
    return product;
  });

  // 订单状态转换（演示：复用 @jdo/order-state-machine 单一真相）
  // 真实实现会从 DB 读订单当前态；此处接收 state 入参做演示，证明前后端共用同一状态机。
  app.post('/api/v1/orders/transition', async (req, reply) => {
    const body = z
      .object({
        state: z.string(),
        event: z.string(),
      })
      .parse(req.body);
    const result = transition(body.state as OrderState, body.event as OrderEvent);
    if (!result.ok) {
      return reply
        .code(409)
        .send(errBody('INVALID_TRANSITION', '非法订单状态转换', { from: body.state, event: body.event }));
    }
    return { state: result.state };
  });

  return app;
}
