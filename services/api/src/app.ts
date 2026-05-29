import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { transition, type OrderState, type OrderEvent } from '@jdo/order-state-machine';
import { store } from './store.js';
import { STORE_HTML, ADMIN_HTML } from './demo-pages.js';

/** 统一错误格式（PRD §后端接入方案）：{ code, message, details, traceId } */
function errBody(code: string, message: string, details: unknown = {}) {
  return { code, message, details, traceId: 'demo-trace' };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok' }));

  // ---------- 消费端（前台）/api/v1/* ----------
  app.get('/api/v1/categories', async () => ({ items: store.categories() }));

  // 前台只看「已上架」商品 —— 后台一下架，这里立刻就没了
  app.get('/api/v1/products', async (req) => {
    const q = z.object({ categoryId: z.string().optional() }).parse(req.query);
    const items = store.listOnShelf(q.categoryId);
    return { items, total: items.length };
  });

  app.get('/api/v1/products/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const p = store.find(id);
    if (!p || !p.onShelf) return reply.code(404).send(errBody('PRODUCT_NOT_FOUND', '商品不存在或已下架', { id }));
    return p;
  });

  app.post('/api/v1/orders/transition', async (req, reply) => {
    const body = z.object({ state: z.string(), event: z.string() }).parse(req.body);
    const r = transition(body.state as OrderState, body.event as OrderEvent);
    if (!r.ok) return reply.code(409).send(errBody('INVALID_TRANSITION', '非法订单状态转换', { from: body.state, event: body.event }));
    return { state: r.state };
  });

  // ---------- 后台（admin）/api/v1/admin/* ----------
  // Demo 阶段未挂 RBAC（见 ADR-0011 / openspec add-admin-auth），仅演示数据同步
  app.get('/api/v1/admin/products', async () => ({ items: store.listAll() }));

  app.post('/api/v1/admin/products', async (req, reply) => {
    const body = z
      .object({
        title: z.string().min(1),
        categoryId: z.string().min(1),
        price: z.number().int().nonnegative(),
        stock: z.number().int().nonnegative().optional(),
        onShelf: z.boolean().optional(),
      })
      .parse(req.body);
    const p = store.create(body);
    return reply.code(201).send(p);
  });

  app.patch('/api/v1/admin/products/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const patch = z
      .object({
        title: z.string().min(1).optional(),
        price: z.number().int().nonnegative().optional(),
        stock: z.number().int().nonnegative().optional(),
        onShelf: z.boolean().optional(),
      })
      .parse(req.body);
    const p = store.update(id, patch);
    if (!p) return reply.code(404).send(errBody('PRODUCT_NOT_FOUND', '商品不存在', { id }));
    return p;
  });

  // ---------- 演示页（两个网页，并排打开看同步）----------
  app.get('/demo/store', async (_req, reply) => reply.type('text/html; charset=utf-8').send(STORE_HTML));
  app.get('/demo/admin', async (_req, reply) => reply.type('text/html; charset=utf-8').send(ADMIN_HTML));
  app.get('/demo', async (_req, reply) =>
    reply.type('text/html; charset=utf-8').send(
      `<meta charset="utf-8"><h1 style="font-family:sans-serif">JDO 前后台同步演示</h1>
       <p style="font-family:sans-serif">并排打开这两个页面：</p>
       <ul style="font-family:sans-serif;font-size:18px">
         <li><a href="/demo/admin" target="_blank">🛠 后台管理（改数据）</a></li>
         <li><a href="/demo/store" target="_blank">🛒 前台商城（自动刷新看变化）</a></li>
       </ul>`,
    ),
  );

  return app;
}
