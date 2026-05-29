import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import fstatic from '@fastify/static';
import { z } from 'zod';
import { transition, type OrderState, type OrderEvent } from '@jdo/order-state-machine';
import { store } from './store.js';
import { ADMIN_APP_HTML, ADMIN_APP_JS } from './admin-spa.js';

function errBody(code: string, message: string, details: unknown = {}) {
  return { code, message, details, traceId: 'demo-trace' };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok' }));

  // ============ 消费端（前台）/api/v1/* ============

  // 一次性引导数据：V3 的 data.js 改成 fetch 这个即可（替代静态 data）
  app.get('/api/v1/bootstrap', async () => ({
    categories: store.categories(),
    products: store.productsOnShelf(),
    banners: store.activeBanners(),
    heroRecs: store.activeHeroRecs(),
  }));

  app.get('/api/v1/categories', async () => ({ items: store.categories() }));

  app.get('/api/v1/products', async (req) => {
    const q = z.object({ cat: z.string().optional() }).parse(req.query);
    const items = store.productsOnShelf(q.cat);
    return { items, total: items.length };
  });

  app.get('/api/v1/products/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const p = store.product(id);
    if (!p) return reply.code(404).send(errBody('PRODUCT_NOT_FOUND', '商品不存在或已下架', { id }));
    return p;
  });

  app.get('/api/v1/orders', async (req) => {
    const q = z.object({ userId: z.string().optional() }).parse(req.query);
    return { items: store.ordersByUser(q.userId) };
  });

  // 消费端下单：创建真实订单 → 后台订单管理立刻能看到（双向同步的"前→后"方向）
  app.post('/api/v1/orders', async (req) => {
    const body = z
      .object({
        items: z.array(z.object({ title: z.string(), price: z.number(), qty: z.number().int().positive().default(1) })).min(1),
        userId: z.string().optional(),
        channel: z.enum(['car', 'phone']).optional(),
        createdAt: z.string().optional(),
      })
      .parse(req.body);
    // 走订单状态机：DRAFT --submit--> PENDING_PAYMENT
    const submitted = transition('DRAFT', 'submit');
    const status = submitted.ok ? submitted.state : 'PENDING_PAYMENT';
    const totalAmount = body.items.reduce((s, it) => s + Math.round(it.price * 100) * it.qty, 0);
    const order = store.create('orders', {
      userId: body.userId ?? 'u-1001',
      status,
      totalAmount,
      itemTitles: body.items.map((it) => it.title),
      channel: body.channel ?? 'car',
      createdAt: body.createdAt ?? '刚刚',
    });
    return { ok: true, order };
  });

  app.post('/api/v1/orders/transition', async (req, reply) => {
    const body = z.object({ state: z.string(), event: z.string() }).parse(req.body);
    const r = transition(body.state as OrderState, body.event as OrderEvent);
    if (!r.ok) return reply.code(409).send(errBody('INVALID_TRANSITION', '非法订单状态转换', body));
    return { state: r.state };
  });

  // ============ 后台（admin）/api/v1/admin/* ============
  // 通用 CRUD：一套接口管所有实体（products/categories/banners/...）
  // Demo 未挂 RBAC（见 ADR-0011 / openspec add-admin-auth）

  app.get('/api/v1/admin/resources', async () => ({ items: RESOURCE_LIST }));

  app.get('/api/v1/admin/analytics', async () => {
    const orders = store.list('orders');
    const car = orders.filter((o) => o.channel === 'car').length;
    const phone = orders.filter((o) => o.channel === 'phone').length;
    return {
      pv: 12840,
      uv: 3210,
      drivingSwitches: 487,
      orderTotal: orders.length,
      channel: { car, phone },
      gmv: orders.reduce((s, o) => s + (o.totalAmount as number), 0),
    };
  });

  app.get('/api/v1/admin/config', async () => store.config());
  app.patch('/api/v1/admin/config', async (req) => store.setConfig(req.body as Record<string, unknown>));

  app.get('/api/v1/admin/:resource', async (req, reply) => {
    const { resource } = req.params as { resource: string };
    if (!store.isResource(resource)) return reply.code(404).send(errBody('UNKNOWN_RESOURCE', '未知资源', { resource }));
    return { items: store.list(resource) };
  });

  app.get('/api/v1/admin/:resource/:id', async (req, reply) => {
    const { resource, id } = req.params as { resource: string; id: string };
    if (!store.isResource(resource)) return reply.code(404).send(errBody('UNKNOWN_RESOURCE', '未知资源', { resource }));
    const row = store.get(resource, id);
    if (!row) return reply.code(404).send(errBody('NOT_FOUND', '记录不存在', { resource, id }));
    return row;
  });

  app.post('/api/v1/admin/:resource', async (req, reply) => {
    const { resource } = req.params as { resource: string };
    if (!store.isResource(resource)) return reply.code(404).send(errBody('UNKNOWN_RESOURCE', '未知资源', { resource }));
    const row = store.create(resource, (req.body ?? {}) as Record<string, unknown>);
    return reply.code(201).send(row);
  });

  app.patch('/api/v1/admin/:resource/:id', async (req, reply) => {
    const { resource, id } = req.params as { resource: string; id: string };
    if (!store.isResource(resource)) return reply.code(404).send(errBody('UNKNOWN_RESOURCE', '未知资源', { resource }));
    const row = store.update(resource, id, (req.body ?? {}) as Record<string, unknown>);
    if (!row) return reply.code(404).send(errBody('NOT_FOUND', '记录不存在', { resource, id }));
    return row;
  });

  app.delete('/api/v1/admin/:resource/:id', async (req, reply) => {
    const { resource, id } = req.params as { resource: string; id: string };
    if (!store.isResource(resource)) return reply.code(404).send(errBody('UNKNOWN_RESOURCE', '未知资源', { resource }));
    const ok = store.remove(resource, id);
    if (!ok) return reply.code(404).send(errBody('NOT_FOUND', '记录不存在', { resource, id }));
    return { ok: true };
  });

  // ============ 后台管理站 SPA（/admin-ui）============
  app.get('/admin-ui', async (_req, reply) => reply.type('text/html; charset=utf-8').send(ADMIN_APP_HTML));
  app.get('/admin-ui/app.js', async (_req, reply) => reply.type('application/javascript; charset=utf-8').send(ADMIN_APP_JS));

  // ============ 同源托管 V3 消费端原型（/app）解决 CORS ============
  const v3Root = fileURLToPath(new URL('../../../mockups/jdo-pencil-v3', import.meta.url));
  app.register(fstatic, { root: v3Root, prefix: '/app/' });

  app.get('/', async (_req, reply) =>
    reply.type('text/html; charset=utf-8').send(
      `<meta charset="utf-8"><body style="font-family:sans-serif;background:#0e1116;color:#e8edf2;padding:40px">
       <h1>JDO 车机电商 v2 · 前后台</h1>
       <ul style="font-size:18px;line-height:2">
         <li>🛠 <a style="color:#39d98a" href="/admin-ui">后台管理站</a>（管理所有实体）</li>
         <li>🛒 <a style="color:#7cc4ff" href="/app/JDO%20%E8%BD%A6%E6%9C%BA%E7%94%B5%E5%95%86.html">消费端 V3 商城</a>（21 屏原型）</li>
       </ul>
       <p style="color:#8b98a8">后台改数据 → 前台刷新即同步（同一份 API 数据）。</p></body>`,
    ),
  );

  return app;
}

/** 后台导航：resource key → 中文标签 + 列表展示字段 + 表单字段 */
const RESOURCE_LIST = [
  { key: 'products', label: '商品管理', columns: ['id', 'title', 'cat', 'price', 'stock', 'onShelf'], fields: ['title', 'cat', 'price', 'ori', 'stock', 'tag', 'onShelf'] },
  { key: 'categories', label: '分类管理', columns: ['id', 'name', 'icon', 'sort'], fields: ['name', 'icon', 'sort'] },
  { key: 'banners', label: 'Banner', columns: ['id', 'title', 'sub', 'tone', 'active'], fields: ['title', 'sub', 'tone', 'img', 'active'] },
  { key: 'heroRecs', label: '推荐位', columns: ['id', 'tag', 'title', 'navScene', 'active'], fields: ['tag', 'title', 'sub', 'kind', 'navScene', 'active'] },
  { key: 'orders', label: '订单管理', columns: ['id', 'userId', 'status', 'totalAmount', 'channel'], fields: ['status', 'channel'] },
  { key: 'users', label: '用户管理', columns: ['id', 'phone', 'name', 'points', 'balance', 'banned'], fields: ['name', 'points', 'banned'] },
  { key: 'coupons', label: '优惠券', columns: ['id', 'name', 'type', 'amount', 'stock', 'active'], fields: ['name', 'type', 'amount', 'threshold', 'stock', 'active'] },
  { key: 'reviews', label: '评价管理', columns: ['id', 'productId', 'star', 'text', 'hidden'], fields: ['hidden'] },
  { key: 'pickupPoints', label: '自提点', columns: ['id', 'name', 'address', 'hours', 'open'], fields: ['name', 'address', 'hours', 'open'] },
  { key: 'aftersale', label: '售后', columns: ['id', 'orderId', 'reason', 'status'], fields: ['status'] },
  { key: 'shipping', label: '物流', columns: ['id', 'trackingNo', 'status'], fields: ['trackingNo', 'status'] },
  { key: 'adminUsers', label: '系统·账号', columns: ['id', 'account', 'role'], fields: ['account', 'role'] },
];
