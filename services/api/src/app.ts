import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import fstatic from '@fastify/static';
import { z } from 'zod';
import { transition, allowedEvents, type OrderState, type OrderEvent } from '@jdo/order-state-machine';
import { store } from './store.js';
import { ADMIN_APP_HTML, ADMIN_APP_JS } from './admin-spa.js';
import * as auth from './admin-auth.js';
import * as cauth from './consumer-auth.js';

function errBody(code: string, message: string, details: unknown = {}) {
  return { code, message, details, traceId: 'demo-trace' };
}

/** 签发车主 token（access+refresh）+ 用户信息。扫码 confirmed 与 mock-login 共用。 */
function issueUserToken(userId: string) {
  const user = store.get('users', userId);
  const now = Math.floor(Date.now() / 1000);
  const claims = { sub: userId, name: (user?.name as string) ?? '车主' };
  return {
    accessToken: cauth.signToken(claims, 'user', cauth.ACCESS_TTL, now),
    refreshToken: cauth.signToken(claims, 'user-refresh', cauth.REFRESH_TTL, now),
    user: user ? { id: user.id, name: user.name, phone: user.phone } : { id: userId },
  };
}

/** 扩展请求：守卫填入的 admin 身份与审计改前快照 */
type Req = FastifyRequest & { admin?: auth.TokenPayload; auditBefore?: unknown };

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok' }));

  // ============ 后台员工鉴权 /api/v1/admin/auth/*（openspec/specs/admin-auth）============
  // 账号密码登录 → 下发 admin token；与车主账号隔离。
  app.post('/api/v1/admin/auth/login', async (req, reply) => {
    if (auth.rateLimited(req.ip)) return reply.code(429).send(errBody('RATE_LIMITED', '登录尝试过于频繁，请稍后再试', {}));
    const body = z.object({ account: z.string(), password: z.string() }).parse(req.body);
    const u = store.list('adminUsers').find((x) => x.account === body.account);
    if (!u) return reply.code(401).send(errBody('ADMIN_LOGIN_FAILED', '账号或密码错误', {}));
    // 惰性补 passwordHash（Demo 默认密码；store.reset 后仍可登录）
    if (!u.passwordHash) store.update('adminUsers', u.id, { passwordHash: auth.hashPassword(auth.demoPassword(u.account as string)) });
    const stored = store.get('adminUsers', u.id)?.passwordHash as string;
    if (!auth.verifyPassword(body.password, stored)) return reply.code(401).send(errBody('ADMIN_LOGIN_FAILED', '账号或密码错误', {}));
    const now = Math.floor(Date.now() / 1000);
    const claims = { sub: u.id, account: u.account as string, role: u.role as string };
    return {
      accessToken: auth.signToken(claims, 'admin', auth.ACCESS_TTL, now),
      refreshToken: auth.signToken(claims, 'admin-refresh', auth.REFRESH_TTL, now),
      admin: { id: u.id, account: u.account, role: u.role },
      permissions: auth.ROLE_PERMS[u.role as string] ?? [],
    };
  });

  app.post('/api/v1/admin/auth/refresh', async (req, reply) => {
    const body = z.object({ refreshToken: z.string() }).parse(req.body);
    const p = auth.verifyToken(body.refreshToken, 'admin-refresh');
    if (!p) return reply.code(401).send(errBody('ADMIN_REFRESH_INVALID', 'refresh token 失效，请重新登录', {}));
    const now = Math.floor(Date.now() / 1000);
    return { accessToken: auth.signToken({ sub: p.sub, account: p.account, role: p.role }, 'admin', auth.ACCESS_TTL, now) };
  });

  app.get('/api/v1/admin/auth/me', async (req, reply) => {
    const p = auth.verifyToken(auth.bearer(req.headers.authorization), 'admin');
    if (!p) return reply.code(401).send(errBody('ADMIN_UNAUTHENTICATED', '需要后台登录', {}));
    return { id: p.sub, account: p.account, role: p.role, permissions: auth.ROLE_PERMS[p.role] ?? [] };
  });

  // 守卫：/api/v1/admin/*（除 login/refresh）必须带有效 admin token + 对应权限点。
  // 消费端 token / 无 token 一律 401；权限不足 403。BREAKING per add-admin-auth。
  app.addHook('preHandler', async (req, reply) => {
    const r = auth.parseAdminRoute(req.method, req.url);
    if (!r.underAdmin || r.isAuthPublic) return; // 非后台，或 login/refresh：放行
    const payload = auth.verifyToken(auth.bearer(req.headers.authorization), 'admin');
    if (!payload) return reply.code(401).send(errBody('ADMIN_UNAUTHENTICATED', '需要后台登录（admin token 缺失或失效）', {}));
    (req as Req).admin = payload;
    if (r.permission && !auth.hasPermission(payload.role, r.permission)) {
      return reply.code(403).send(errBody('ADMIN_FORBIDDEN', '权限不足', { need: r.permission, role: payload.role }));
    }
    // 写操作：抓改前快照供审计 before-after
    if (r.isWrite && r.resource && r.id && store.isResource(r.resource)) {
      const before = store.get(r.resource, r.id);
      (req as Req).auditBefore = before ? { ...before } : null;
    }
  });

  // 审计：admin 写操作成功后落 auditLogs（who/when/action/target/before-after/ip）。
  // 用 onSend（响应发出前执行且被 await），保证审计在请求返回前已落库，避免竞态。
  app.addHook('onSend', async (req, reply, payload) => {
    const r = auth.parseAdminRoute(req.method, req.url);
    const admin = (req as Req).admin;
    if (r.underAdmin && !r.isAuth && r.isWrite && reply.statusCode < 400 && admin) {
      store.create('auditLogs', {
        adminId: admin.sub,
        account: admin.account,
        role: admin.role,
        action: req.method,
        target: r.id ? `${r.resource}/${r.id}` : r.resource,
        before: (req as Req).auditBefore ?? null,
        after: (req.body as unknown) ?? null,
        ip: req.ip,
        at: new Date().toISOString(),
      });
    }
    return payload;
  });

  // ============ 消费端（前台）/api/v1/* ============

  // 一次性引导数据：V3 的 data.js 改成 fetch 这个即可（替代静态 data）
  app.get('/api/v1/bootstrap', async () => ({
    categories: store.categories(),
    products: store.productsOnShelf(),
    banners: store.activeBanners(),
    heroRecs: store.activeHeroRecs(),
  }));

  // ============ 车主登录 /api/v1/auth/*（openspec/specs/auth-qr）============
  // 车机出码 → 手机确认 → 车机轮询拿车主 JWT；与 admin token 物理隔离（typ='user'）。
  app.post('/api/v1/auth/qr-code', async () => cauth.createSession());

  app.post('/api/v1/auth/qr-confirm', async (req, reply) => {
    const body = z.object({ sessionId: z.string(), userId: z.string().optional() }).parse(req.body);
    const userId = body.userId ?? 'u-1001';
    const user = store.get('users', userId);
    if (!user) return reply.code(404).send(errBody('USER_NOT_FOUND', '车主不存在', { userId }));
    if (user.banned === true) return reply.code(403).send(errBody('USER_BANNED', '该车主已被封禁，无法登录', { userId }));
    if (!cauth.confirmSession(body.sessionId, userId)) return reply.code(410).send(errBody('QR_EXPIRED', '二维码已过期，请重新获取', { sessionId: body.sessionId }));
    return { ok: true };
  });

  app.get('/api/v1/auth/qr-status', async (req) => {
    const q = z.object({ sessionId: z.string() }).parse(req.query);
    const s = cauth.getSession(q.sessionId);
    if (s.status !== 'confirmed' || !s.userId) return { status: s.status };
    return { status: 'confirmed', ...issueUserToken(s.userId) };
  });

  app.post('/api/v1/auth/mock-login', async () => issueUserToken('u-1001'));

  app.get('/api/v1/auth/me', async (req, reply) => {
    const p = cauth.verifyToken(cauth.bearer(req.headers.authorization), 'user');
    if (!p) return reply.code(401).send(errBody('UNAUTHENTICATED', '需要车主登录', {}));
    const user = store.get('users', p.sub);
    return user ? { id: user.id, name: user.name, phone: user.phone } : { id: p.sub, name: p.name };
  });

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
    // 货币统一：items.price 为「分」，直接求和（不再 *100）
    const totalAmount = body.items.reduce((s, it) => s + it.price * it.qty, 0);
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

  // ---------- 购物车（真实数据）----------
  app.get('/api/v1/cart', async () => ({ items: store.cartView() }));

  app.post('/api/v1/cart/items', async (req, reply) => {
    const body = z.object({ productId: z.string(), qty: z.number().int().positive().default(1), spec: z.string().optional() }).parse(req.body);
    const item = store.cartAdd(body.productId, body.qty, body.spec ?? '默认规格');
    return reply.code(201).send({ ok: true, item, items: store.cartView() });
  });

  app.patch('/api/v1/cart/items/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const patch = z.object({ qty: z.number().int().optional(), selected: z.boolean().optional() }).parse(req.body);
    const it = store.cartUpdate(id, patch);
    if (!it) return reply.code(404).send(errBody('CART_ITEM_NOT_FOUND', '购物车项不存在', { id }));
    return { ok: true, items: store.cartView() };
  });

  app.delete('/api/v1/cart/items/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string() }).parse(req.params);
    if (!store.cartRemove(id)) return reply.code(404).send(errBody('CART_ITEM_NOT_FOUND', '购物车项不存在', { id }));
    return { ok: true, items: store.cartView() };
  });

  // 从购物车结算：取已选项 → 创建订单（走状态机）→ 移出购物车
  app.post('/api/v1/cart/checkout', async (req, reply) => {
    const body = z.object({ channel: z.enum(['car', 'phone']).optional() }).parse(req.body ?? {});
    const { items, removed } = store.cartCheckout();
    if (removed === 0) return reply.code(400).send(errBody('EMPTY_SELECTION', '没有选中的商品', {}));
    const submitted = transition('DRAFT', 'submit');
    const status = submitted.ok ? submitted.state : 'PENDING_PAYMENT';
    const totalAmount = items.reduce((s, it) => s + it.price * it.qty, 0);
    const order = store.create('orders', {
      userId: 'u-1001',
      status,
      totalAmount,
      itemTitles: items.map((it) => it.title),
      channel: body.channel ?? 'car',
      createdAt: '刚刚',
    });
    return { ok: true, order, items: store.cartView() };
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

  // 订单状态流转：走与消费端同一套订单状态机（openspec/specs/order）。
  // 发货=prepared/delivered、取消=cancel、退款=refundReq/refunded；非法流转→409。
  app.patch('/api/v1/admin/orders/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = z.object({ event: z.string() }).parse(req.body);
    const order = store.get('orders', id);
    if (!order) return reply.code(404).send(errBody('NOT_FOUND', '订单不存在', { id }));
    const from = order.status as OrderState;
    const result = transition(from, body.event as OrderEvent);
    if (!result.ok) {
      return reply.code(409).send(errBody('INVALID_TRANSITION', '非法订单状态流转', { from, event: body.event, allowed: allowedEvents(from) }));
    }
    const updated = store.update('orders', id, { status: result.state });
    return { ok: true, order: updated, from, to: result.state };
  });

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
    // 关联校验：分类被商品引用时不允许删除（防止商品 cat 变孤儿）
    if (resource === 'categories') {
      const used = store.categoryInUse(id);
      if (used > 0) return reply.code(409).send(errBody('CATEGORY_IN_USE', '该分类下还有 ' + used + ' 个商品，不能删除', { id, used }));
    }
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

/**
 * 后台导航 + 列/表单定义（带中文标签与类型，对应 docs/design/data-dictionary.md）。
 * 列 col = { k, label, type }；表单字段 f = { k, label, type, opts? }
 * type: text/num/yuan(元)/fen(分)/bool/image/cat(分类)/orderStatus/channel/couponType/aftStatus/role/list
 */
const RESOURCE_LIST = [
  {
    key: 'products', label: '商品管理',
    columns: [
      { k: 'img', label: '图', type: 'image' },
      { k: 'id', label: '商品ID', type: 'text' },
      { k: 'title', label: '商品名称', type: 'text' },
      { k: 'cat', label: '分类', type: 'cat' },
      { k: 'price', label: '现价', type: 'fen' },
      { k: 'ori', label: '原价', type: 'fen' },
      { k: 'stock', label: '库存', type: 'num' },
      { k: 'sold', label: '销量(万)', type: 'num' },
      { k: 'onShelf', label: '上架状态', type: 'bool' },
    ],
    fields: [
      { k: 'img', label: '商品图片（上传或填 URL）', type: 'image' },
      { k: 'title', label: '商品名称', type: 'text' },
      { k: 'cat', label: '分类', type: 'cat' },
      { k: 'price', label: '现价(元)', type: 'money' },
      { k: 'ori', label: '原价(元)', type: 'money' },
      { k: 'stock', label: '库存(件)', type: 'num' },
      { k: 'tag', label: '角标文案', type: 'text' },
      { k: 'onShelf', label: '上架', type: 'bool' },
    ],
  },
  {
    key: 'categories', label: '分类管理',
    columns: [
      { k: 'id', label: '分类ID', type: 'text' },
      { k: 'name', label: '分类名', type: 'text' },
      { k: 'icon', label: '图标', type: 'text' },
      { k: 'sort', label: '排序', type: 'num' },
    ],
    fields: [
      { k: 'name', label: '分类名', type: 'text' },
      { k: 'icon', label: '图标(bolt/wrench/cookie/luggage/car/phone/sparkles)', type: 'text' },
      { k: 'sort', label: '排序', type: 'num' },
    ],
  },
  {
    key: 'banners', label: 'Banner 横幅',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'title', label: '主标题', type: 'text' },
      { k: 'sub', label: '副标题', type: 'text' },
      { k: 'tone', label: '配色', type: 'text' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
    fields: [
      { k: 'title', label: '主标题', type: 'text' },
      { k: 'sub', label: '副标题', type: 'text' },
      { k: 'tone', label: '配色(blue/emerald)', type: 'text' },
      { k: 'img', label: '图 URL', type: 'text' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
  },
  {
    key: 'heroRecs', label: '推荐位',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'tag', label: '角标', type: 'text' },
      { k: 'title', label: '标题', type: 'text' },
      { k: 'navScene', label: '跳转场景', type: 'cat' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
    fields: [
      { k: 'tag', label: '角标', type: 'text' },
      { k: 'title', label: '标题', type: 'text' },
      { k: 'sub', label: '副文', type: 'text' },
      { k: 'navScene', label: '跳转场景', type: 'cat' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
  },
  {
    key: 'orders', label: '订单管理',
    columns: [
      { k: 'id', label: '订单号', type: 'text' },
      { k: 'userId', label: '用户', type: 'text' },
      { k: 'itemTitles', label: '商品清单', type: 'list' },
      { k: 'totalAmount', label: '金额', type: 'fen' },
      { k: 'status', label: '状态', type: 'orderStatus' },
      { k: 'channel', label: '入口', type: 'channel' },
      { k: 'createdAt', label: '下单时间', type: 'text' },
    ],
    fields: [
      { k: 'status', label: '状态', type: 'orderStatus' },
      { k: 'channel', label: '入口渠道', type: 'channel' },
    ],
  },
  {
    key: 'users', label: '用户管理',
    columns: [
      { k: 'id', label: '用户ID', type: 'text' },
      { k: 'phone', label: '手机号', type: 'text' },
      { k: 'name', label: '昵称', type: 'text' },
      { k: 'points', label: '积分', type: 'num' },
      { k: 'balance', label: '余额', type: 'fen' },
      { k: 'banned', label: '账号状态', type: 'bool' },
    ],
    fields: [
      { k: 'name', label: '昵称', type: 'text' },
      { k: 'points', label: '积分', type: 'num' },
      { k: 'banned', label: '封禁', type: 'bool' },
    ],
  },
  {
    key: 'coupons', label: '优惠券',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'name', label: '券名', type: 'text' },
      { k: 'type', label: '类型', type: 'couponType' },
      { k: 'amount', label: '面额(分/折)', type: 'num' },
      { k: 'threshold', label: '门槛', type: 'fen' },
      { k: 'stock', label: '剩余(张)', type: 'num' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
    fields: [
      { k: 'name', label: '券名', type: 'text' },
      { k: 'type', label: '类型', type: 'couponType' },
      { k: 'amount', label: '面额(满减填分,折扣填折数*10)', type: 'num' },
      { k: 'threshold', label: '门槛(分)', type: 'num' },
      { k: 'stock', label: '剩余张数', type: 'num' },
      { k: 'active', label: '启用', type: 'bool' },
    ],
  },
  {
    key: 'reviews', label: '评价管理',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'productId', label: '商品', type: 'text' },
      { k: 'star', label: '评分', type: 'num' },
      { k: 'text', label: '内容', type: 'text' },
      { k: 'hidden', label: '显示状态', type: 'bool' },
    ],
    fields: [{ k: 'hidden', label: '隐藏', type: 'bool' }],
  },
  {
    key: 'pickupPoints', label: '自提点',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'name', label: '名称', type: 'text' },
      { k: 'address', label: '地址', type: 'text' },
      { k: 'hours', label: '营业时间', type: 'text' },
      { k: 'open', label: '营业状态', type: 'bool' },
    ],
    fields: [
      { k: 'name', label: '名称', type: 'text' },
      { k: 'address', label: '地址', type: 'text' },
      { k: 'hours', label: '营业时间', type: 'text' },
      { k: 'open', label: '营业', type: 'bool' },
    ],
  },
  {
    key: 'aftersale', label: '售后',
    columns: [
      { k: 'id', label: '售后单号', type: 'text' },
      { k: 'orderId', label: '关联订单', type: 'text' },
      { k: 'reason', label: '原因', type: 'text' },
      { k: 'status', label: '状态', type: 'aftStatus' },
    ],
    fields: [{ k: 'status', label: '状态', type: 'aftStatus' }],
  },
  {
    key: 'shipping', label: '物流',
    columns: [
      { k: 'id', label: '订单号', type: 'text' },
      { k: 'trackingNo', label: '运单号', type: 'text' },
      { k: 'status', label: '状态', type: 'text' },
      { k: 'nodes', label: '轨迹', type: 'list' },
    ],
    fields: [
      { k: 'trackingNo', label: '运单号', type: 'text' },
      { k: 'status', label: '状态', type: 'text' },
    ],
  },
  {
    key: 'adminUsers', label: '系统·账号',
    columns: [
      { k: 'id', label: 'ID', type: 'text' },
      { k: 'account', label: '账号', type: 'text' },
      { k: 'role', label: '角色', type: 'text' },
    ],
    fields: [
      { k: 'account', label: '账号', type: 'text' },
      { k: 'role', label: '角色(超管/运营/客服/财务)', type: 'text' },
    ],
  },
];
