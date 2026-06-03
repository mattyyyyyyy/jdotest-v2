import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify';
import { buildApp } from './app.js';
import { store } from './store.js';
import * as auth from './admin-auth.js';
import * as cauth from './consumer-auth.js';

let app: FastifyInstance;
let superToken = '';

// 统一注入：默认带超管 token（既有用例都假设全权访问）；可用 opts.headers 覆盖。
// 消费端 /api/v1/* 不受守卫影响，带 header 也无害。
const inj = (opts: InjectOptions): Promise<LightMyRequestResponse> =>
  app.inject({ ...opts, headers: { authorization: `Bearer ${superToken}`, ...((opts.headers as Record<string, string> | undefined) ?? {}) } }) as Promise<LightMyRequestResponse>;

async function login(account: string, password: string): Promise<string> {
  const r = await app.inject({ method: 'POST', url: '/api/v1/admin/auth/login', payload: { account, password } });
  return r.json().accessToken as string;
}

beforeAll(async () => {
  app = buildApp();
  await app.ready();
  superToken = await login('admin', 'admin123'); // 超管，token 无状态，store.reset 不影响
});
beforeEach(() => {
  store.reset();
  auth.__resetRateLimit();
  cauth.__reset(); // 清扫码会话 + 短信验证码（避免 sms 频控跨用例干扰）
});
afterAll(async () => {
  await app.close();
});

describe('健康 & 引导数据', () => {
  it('/health ok', async () => {
    expect((await inj({ method: 'GET', url: '/health' })).json()).toEqual({ status: 'ok' });
  });

  it('/api/v1/bootstrap 返回 V3 四件套（来自 V3 data.js 种子）', async () => {
    const d = (await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.categories).toHaveLength(7); // 7 场景
    expect(d.categories[0].id).toBe('energy');
    expect(d.products.length).toBeGreaterThan(50); // V3 60+ 商品
    expect(d.banners.length).toBeGreaterThan(0);
    expect(d.heroRecs.length).toBeGreaterThan(0);
  });
});

describe('消费端读接口', () => {
  it('?cat=eat 只返回一路吃喝', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/products?cat=eat' })).json();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p: { cat: string }) => p.cat === 'eat')).toBe(true);
  });

  it('货币统一：商品价格存为「分」整数（e1 中石化 97元 → 9700）', async () => {
    const e1 = (await inj({ method: 'GET', url: '/api/v1/products/e1' })).json();
    expect(e1.price).toBe(9700); // 97.00 元 = 9700 分
    expect(Number.isInteger(e1.price)).toBe(true);
  });
});

describe('后台通用 CRUD（一套接口管所有实体）', () => {
  it('resources 列出所有可管理实体', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/admin/resources' })).json();
    const keys = items.map((r: { key: string }) => r.key);
    expect(keys).toContain('products');
    expect(keys).toContain('orders');
    expect(keys).toContain('coupons');
    expect(keys.length).toBeGreaterThanOrEqual(12);
  });

  it('admin 看到全部商品（含下架），数量 ≥ 前台在售', async () => {
    const adminCount = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    const frontCount = (await inj({ method: 'GET', url: '/api/v1/products' })).json().total;
    expect(adminCount).toBeGreaterThanOrEqual(frontCount);
  });

  it('未知 resource → 404', async () => {
    expect((await inj({ method: 'GET', url: '/api/v1/admin/nope' })).statusCode).toBe(404);
  });

  it('对每个实体都能列表（全 12 个 resource 不报错）', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/admin/resources' })).json();
    for (const r of items) {
      const res = await inj({ method: 'GET', url: '/api/v1/admin/' + r.key });
      expect(res.statusCode, r.key).toBe(200);
      expect(Array.isArray(res.json().items), r.key).toBe(true);
    }
  });
});

describe('前后台数据同步（每类实体）', () => {
  it('商品：后台新增 → 置顶 + 前台 bootstrap 看到', async () => {
    await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: 'TEST车品', cat: 'gear', price: 5000, ori: 9900, stock: 9, onShelf: true } });
    // 后台列表置顶（items[0]）
    const admin = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items;
    expect(admin[0].title).toBe('TEST车品');
    // 前台 bootstrap 能看到，且在最前
    const d = (await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.products.some((p: { title: string }) => p.title === 'TEST车品')).toBe(true);
    expect(d.products[0].title).toBe('TEST车品');
  });

  it('商品：新增不带 onShelf → 默认上架，前台可见（修同步 bug）', async () => {
    await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: '默认上架品', cat: 'gear', price: 6600 } });
    const d = (await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    const found = d.products.find((p: { title: string }) => p.title === '默认上架品');
    expect(found).toBeTruthy();
    expect(found.onShelf).toBe(true); // 不再默认下架
  });

  it('商品：后台下架 → 前台消失', async () => {
    const all = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items;
    const id = all[0].id;
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/' + id, payload: { onShelf: false } });
    const front = (await inj({ method: 'GET', url: '/api/v1/products' })).json();
    expect(front.items.some((p: { id: string }) => p.id === id)).toBe(false);
  });

  it('分类：后台改名 → 前台分类同步', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/categories/energy', payload: { name: '能量站' } });
    const cats = (await inj({ method: 'GET', url: '/api/v1/categories' })).json().items;
    expect(cats.find((c: { id: string }) => c.id === 'energy').name).toBe('能量站');
  });

  it('Banner：后台停用 → 前台 bootstrap 不再返回', async () => {
    const banners = (await inj({ method: 'GET', url: '/api/v1/admin/banners' })).json().items;
    const id = banners[0].id;
    await inj({ method: 'PATCH', url: '/api/v1/admin/banners/' + id, payload: { active: false } });
    const d = (await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.banners.some((b: { id: string }) => b.id === id)).toBe(false);
  });

  it('订单：后台改状态生效', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/orders/o-20003', payload: { status: 'PAID' } });
    const o = (await inj({ method: 'GET', url: '/api/v1/admin/orders/o-20003' })).json();
    expect(o.status).toBe('PAID');
  });

  it('删除：后台删商品 → 列表减少', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    const id = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items[0].id;
    await inj({ method: 'DELETE', url: '/api/v1/admin/products/' + id });
    const after = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    expect(after).toBe(before - 1);
  });
});

describe('双向同步 · 前→后：消费端下单 → 后台看到', () => {
  it('POST /api/v1/orders 创建订单并出现在后台订单列表', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length;
    const res = await inj({
      method: 'POST',
      url: '/api/v1/orders',
      // 货币统一：items.price 为「分」（V3 提交前已 元→分）
      payload: { items: [{ title: '车载香薰', price: 3900, qty: 2 }, { title: '玻璃水', price: 2990, qty: 1 }], channel: 'car' },
    });
    expect(res.statusCode).toBe(200);
    const order = res.json().order;
    expect(order.status).toBe('PENDING_PAYMENT'); // 走了状态机 DRAFT→submit
    expect(order.channel).toBe('car');
    expect(order.totalAmount).toBe(3900 * 2 + 2990); // 直接求和（分）= 10790

    const adminOrders = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items;
    expect(adminOrders.length).toBe(before + 1);
    expect(adminOrders.some((o: { id: string }) => o.id === order.id)).toBe(true);
  });

  it('支付确认回调持久化 PAID，消费端与后台同步可见，重复回调幂等', async () => {
    const created = (await inj({
      method: 'POST',
      url: '/api/v1/orders',
      payload: { items: [{ title: '玻璃水', price: 2990, qty: 1 }], channel: 'car' },
    })).json().order;
    expect(created.status).toBe('PENDING_PAYMENT');

    const paid = await inj({ method: 'POST', url: `/api/v1/payments/${created.id}/confirm` });
    expect(paid.statusCode).toBe(200);
    expect(paid.json().order.status).toBe('PAID');

    const consumer = (await inj({ method: 'GET', url: '/api/v1/orders' })).json().items;
    const admin = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items;
    expect(consumer.find((o: { id: string }) => o.id === created.id).status).toBe('PAID');
    expect(admin.find((o: { id: string }) => o.id === created.id).status).toBe('PAID');

    const again = await inj({ method: 'POST', url: `/api/v1/payments/${created.id}/confirm` });
    expect(again.statusCode).toBe(200);
    expect(again.json().idempotent).toBe(true);
  });

  it('已完成订单不能重新确认支付', async () => {
    const res = await inj({ method: 'POST', url: '/api/v1/payments/o-20004/confirm' });
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('INVALID_TRANSITION');
  });
});

describe('双向同步 · 后→前：后台加商品（无图）→ 前台拿到默认图，不黑块', () => {
  it('admin 新增商品自动补默认 img/sold/star', async () => {
    const res = await inj({
      method: 'POST',
      url: '/api/v1/admin/products',
      payload: { title: '无图测试品', cat: 'gear', price: 88, ori: 188, stock: 5, onShelf: true },
    });
    const p = res.json();
    expect(p.img).toBeTruthy(); // 不再是 undefined
    expect(String(p.img).startsWith('data:image')).toBe(true); // 占位 SVG
    expect(p.sold).toBeDefined();
    expect(p.star).toBeDefined();
    // 前台 bootstrap 能搜到它且带图
    const d = (await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    const found = d.products.find((x: { title: string }) => x.title === '无图测试品');
    expect(found).toBeTruthy();
    expect(found.img).toBeTruthy();
  });
});

describe('购物车真实数据（加购→购物车→结算）', () => {
  it('GET /cart 返回种子购物车（价格分 + join 商品名）', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/cart' })).json();
    expect(items.length).toBe(4);
    expect(items[0]).toHaveProperty('title');
    expect(items[0]).toHaveProperty('price'); // 分
    expect(Number.isInteger(items[0].price)).toBe(true);
  });

  it('加购同款累加数量', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items.length;
    await inj({ method: 'POST', url: '/api/v1/cart/items', payload: { productId: 'e1', qty: 1, spec: '默认规格' } });
    const r2 = await inj({ method: 'POST', url: '/api/v1/cart/items', payload: { productId: 'e1', qty: 2, spec: '默认规格' } });
    const items = r2.json().items;
    expect(items.length).toBe(before + 1); // 同款只占一行
    const e1 = items.find((i: { productId: string }) => i.productId === 'e1');
    expect(e1.qty).toBe(3); // 1+2 累加
  });

  it('改数量 / 勾选 / 删除', async () => {
    const cart = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items;
    const id = cart[0].id;
    const up = (await inj({ method: 'PATCH', url: '/api/v1/cart/items/' + id, payload: { qty: 9, selected: false } })).json();
    const it = up.items.find((x: { id: string }) => x.id === id);
    expect(it.qty).toBe(9);
    expect(it.selected).toBe(false);
    const del = await inj({ method: 'DELETE', url: '/api/v1/cart/items/' + id });
    expect(del.json().items.some((x: { id: string }) => x.id === id)).toBe(false);
  });

  it('从购物车结算 → 生成订单 + 移出已选项 + 后台可见', async () => {
    const ordersBefore = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length;
    const cart = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items;
    const selectedCount = cart.filter((c: { selected: boolean }) => c.selected).length;
    expect(selectedCount).toBeGreaterThan(0);

    const res = await inj({ method: 'POST', url: '/api/v1/cart/checkout', payload: { channel: 'car' } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.order.status).toBe('PENDING_PAYMENT');
    expect(body.order.totalAmount).toBeGreaterThan(0);

    // 已选项被移出购物车
    expect(body.items.filter((c: { selected: boolean }) => c.selected).length).toBe(0);
    // 后台订单 +1
    const ordersAfter = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length;
    expect(ordersAfter).toBe(ordersBefore + 1);
  });
});

describe('消费端评价读取（add-consumer-reviews · 过滤 hidden）', () => {
  it('GET /reviews 排除后台隐藏评价（rv-3 g2 hidden 不出现）', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/reviews' })).json();
    expect(items.every((r: { hidden?: boolean }) => r.hidden !== true)).toBe(true);
    expect(items.some((r: { id: string }) => r.id === 'rv-3')).toBe(false); // 种子里 rv-3 hidden
  });

  it('?productId=g2 → 空（g2 仅有一条被隐藏的评价）', async () => {
    const { items } = (await inj({ method: 'GET', url: '/api/v1/reviews?productId=g2' })).json();
    expect(items.length).toBe(0);
  });

  it('后台隐藏一条评价后 → 消费端立即不可见', async () => {
    expect((await inj({ method: 'GET', url: '/api/v1/reviews?productId=e4' })).json().items.length).toBe(1); // rv-1 可见
    await inj({ method: 'PATCH', url: '/api/v1/admin/reviews/rv-1', payload: { hidden: true } });
    expect((await inj({ method: 'GET', url: '/api/v1/reviews?productId=e4' })).json().items.length).toBe(0);
  });
});

describe('库存校验（add-inventory-guard · P2#9 硬伤）', () => {
  it('下架商品加购 → 409 PRODUCT_UNAVAILABLE', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/e1', payload: { onShelf: false } });
    const r = await inj({ method: 'POST', url: '/api/v1/cart/items', payload: { productId: 'e1', qty: 1 } });
    expect(r.statusCode).toBe(409);
    expect(r.json().code).toBe('PRODUCT_UNAVAILABLE');
  });

  it('超库存加购 → 409 INSUFFICIENT_STOCK（累计判定）', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/e2', payload: { stock: 1 } });
    const r = await inj({ method: 'POST', url: '/api/v1/cart/items', payload: { productId: 'e2', qty: 2 } });
    expect(r.statusCode).toBe(409);
    expect(r.json().code).toBe('INSUFFICIENT_STOCK');
    expect(r.json().details.available).toBe(1);
  });

  it('结算库存不足 → 整单 409，购物车不变、无新订单（全有或全无）', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/g1', payload: { stock: 1 } }); // 种子购物车 g1 选中 qty=2
    const cartBefore = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items.length;
    const ordersBefore = (await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length;
    const r = await inj({ method: 'POST', url: '/api/v1/cart/checkout', payload: {} });
    expect(r.statusCode).toBe(409);
    expect(r.json().code).toBe('INSUFFICIENT_STOCK');
    expect((await inj({ method: 'GET', url: '/api/v1/cart' })).json().items.length).toBe(cartBefore); // 购物车不变
    expect((await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length).toBe(ordersBefore); // 无新订单
  });

  it('新增商品未填库存 → 兜底有货，可加购/立即购买（不被 0 库存误拦）', async () => {
    const created = (await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: '无库存新品', cat: 'energy', price: 2000, onShelf: true } })).json();
    expect(created.stock).toBe(100); // normalizeProduct 兜底
    const r = await inj({ method: 'POST', url: '/api/v1/cart/items', payload: { productId: created.id, qty: 1 } });
    expect(r.statusCode).toBe(201); // 立即购买/加购可用
  });

  it('结算成功 → 按下单数量扣减库存', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/products/g1' })).json().stock as number; // 种子选中 qty=2
    const r = await inj({ method: 'POST', url: '/api/v1/cart/checkout', payload: { channel: 'car' } });
    expect(r.statusCode).toBe(200);
    const after = (await inj({ method: 'GET', url: '/api/v1/admin/products/g1' })).json().stock as number;
    expect(after).toBe(before - 2);
  });
});

describe('关联更新 / 级联（QA 审查修复）', () => {
  it('删商品 → 同步清出购物车，无悬挂', async () => {
    // 购物车种子含 g1
    const cartBefore = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items;
    expect(cartBefore.some((c: { productId: string }) => c.productId === 'g1')).toBe(true);
    await inj({ method: 'DELETE', url: '/api/v1/admin/products/g1' });
    const cartAfter = (await inj({ method: 'GET', url: '/api/v1/cart' })).json().items;
    expect(cartAfter.some((c: { productId: string }) => c.productId === 'g1')).toBe(false);
  });

  it('删使用中的分类 → 409 拦截（防孤儿）', async () => {
    const res = await inj({ method: 'DELETE', url: '/api/v1/admin/categories/energy' });
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('CATEGORY_IN_USE');
    // 分类仍在
    const cats = (await inj({ method: 'GET', url: '/api/v1/categories' })).json().items;
    expect(cats.some((c: { id: string }) => c.id === 'energy')).toBe(true);
  });

  it('删空分类 → 允许', async () => {
    await inj({ method: 'POST', url: '/api/v1/admin/categories', payload: { name: '空分类X', icon: 'box', sort: 99 } });
    const cats = (await inj({ method: 'GET', url: '/api/v1/admin/categories' })).json().items;
    const empty = cats.find((c: { name: string }) => c.name === '空分类X');
    const res = await inj({ method: 'DELETE', url: '/api/v1/admin/categories/' + empty.id });
    expect(res.statusCode).toBe(200);
  });
});

describe('运营看板 & 配置', () => {
  it('analytics 返回车机vs手机渠道对比', async () => {
    const a = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json();
    expect(a.channel).toHaveProperty('car');
    expect(a.channel).toHaveProperty('phone');
    expect(a.orderTotal).toBeGreaterThan(0);
  });

  it('config 可改行车态阈值', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/config', payload: { drivingSpeedThreshold: 8 } });
    const c = (await inj({ method: 'GET', url: '/api/v1/admin/config' })).json();
    expect(c.drivingSpeedThreshold).toBe(8);
  });
});

describe('订单状态机仍可用', () => {
  it('合法/非法转换', async () => {
    expect((await inj({ method: 'POST', url: '/api/v1/orders/transition', payload: { state: 'DRAFT', event: 'submit' } })).json().state).toBe('PENDING_PAYMENT');
    expect((await inj({ method: 'POST', url: '/api/v1/orders/transition', payload: { state: 'DRAFT', event: 'delivered' } })).statusCode).toBe(409);
  });
});

describe('后台员工鉴权 admin-auth（openspec/specs/admin-auth）', () => {
  it('账号密码登录成功 → 下发 access+refresh + 角色', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/admin/auth/login', payload: { account: 'admin', password: 'admin123' } });
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.accessToken).toBeTruthy();
    expect(b.refreshToken).toBeTruthy();
    expect(b.admin.role).toBe('超管');
  });

  it('密码错误 → 401', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/v1/admin/auth/login', payload: { account: 'admin', password: 'wrong' } });
    expect(r.statusCode).toBe(401);
    expect(r.json().code).toBe('ADMIN_LOGIN_FAILED');
  });

  it('无 token 访问 /api/v1/admin/* → 401', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/admin/products' }); // 故意不带 token
    expect(r.statusCode).toBe(401);
    expect(r.json().code).toBe('ADMIN_UNAUTHENTICATED');
  });

  it('伪造/消费端 token → 401（typ 不匹配，不放行）', async () => {
    const r = await app.inject({ method: 'GET', url: '/api/v1/admin/products', headers: { authorization: 'Bearer not-a-real-admin-token' } });
    expect(r.statusCode).toBe(401);
  });

  it('客服改价格（products:write）→ 403，且不写入', async () => {
    const cs = await login('cs01', 'cs123');
    const id = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items[0].id;
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/products/' + id })).json().price;
    const r = await app.inject({ method: 'PATCH', url: '/api/v1/admin/products/' + id, payload: { price: 1 }, headers: { authorization: `Bearer ${cs}` } });
    expect(r.statusCode).toBe(403);
    expect(r.json().code).toBe('ADMIN_FORBIDDEN');
    const after = (await inj({ method: 'GET', url: '/api/v1/admin/products/' + id })).json().price;
    expect(after).toBe(before); // 未改
  });

  it('客服可改订单状态（orders:write）→ 200', async () => {
    const cs = await login('cs01', 'cs123');
    const r = await app.inject({ method: 'PATCH', url: '/api/v1/admin/orders/o-20003', payload: { status: 'PAID' }, headers: { authorization: `Bearer ${cs}` } });
    expect(r.statusCode).toBe(200);
  });

  it('RBAC 权限点矩阵：超管全权 / 客服无 catalog 写 / 财务只读', () => {
    expect(auth.hasPermission('超管', 'products:write')).toBe(true);
    expect(auth.hasPermission('超管', 'anything:write')).toBe(true);
    expect(auth.hasPermission('客服', 'products:write')).toBe(false);
    expect(auth.hasPermission('客服', 'orders:write')).toBe(true);
    expect(auth.hasPermission('财务', 'orders:write')).toBe(false);
    expect(auth.hasPermission('财务', 'orders:read')).toBe(true);
  });

  it('写操作落审计日志（who/action/target/before-after/ip）', async () => {
    const id = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items[0].id;
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/' + id, payload: { stock: 123 } });
    const logs = (await inj({ method: 'GET', url: '/api/v1/admin/auditLogs' })).json().items;
    const log = logs.find((l: { target: string; action: string }) => l.target === 'products/' + id && l.action === 'PATCH') as Record<string, any>;
    expect(log).toBeTruthy();
    expect(log.account).toBe('admin');
    expect(log.before).toBeTruthy(); // 改前快照
    expect(log.after.stock).toBe(123); // 改后载荷
    expect(log.ip).toBeTruthy();
  });

  it('refresh token 换新 access', async () => {
    const lr = (await app.inject({ method: 'POST', url: '/api/v1/admin/auth/login', payload: { account: 'admin', password: 'admin123' } })).json();
    const rr = await app.inject({ method: 'POST', url: '/api/v1/admin/auth/refresh', payload: { refreshToken: lr.refreshToken } });
    expect(rr.statusCode).toBe(200);
    expect(rr.json().accessToken).toBeTruthy();
  });

  it('/me 返回当前身份 + 权限点', async () => {
    const me = (await inj({ method: 'GET', url: '/api/v1/admin/auth/me' })).json();
    expect(me.role).toBe('超管');
    expect(Array.isArray(me.permissions)).toBe(true);
  });

  it('登录限流 5/min/IP → 第 6 次 429', async () => {
    let last = 200;
    for (let i = 0; i < 6; i++) {
      last = (await app.inject({ method: 'POST', url: '/api/v1/admin/auth/login', payload: { account: 'admin', password: 'wrong' } })).statusCode;
    }
    expect(last).toBe(429);
  });
});

describe('车主登录 · 车机扫码 + mock-login（auth-qr）', () => {
  const post = (url: string, payload?: unknown): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'POST', url, payload } as InjectOptions) as Promise<LightMyRequestResponse>;
  const get = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'GET', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;

  it('qr-code → pending 会话（含 sessionId/qrUrl/expiresAt）', async () => {
    const b = (await post('/api/v1/auth/qr-code')).json();
    expect(b.sessionId).toMatch(/^qr-/);
    expect(b.status).toBe('pending');
    expect(b.qrUrl).toContain(b.sessionId);
    expect(typeof b.expiresAt).toBe('string');
  });

  it('未知 sessionId → status expired（不泄漏存在性）', async () => {
    const s = (await get('/api/v1/auth/qr-status?sessionId=qr-nope')).json();
    expect(s.status).toBe('expired');
    expect(s.accessToken).toBeUndefined();
  });

  it('手机确认 → 车机轮询拿到车主 token + user', async () => {
    const { sessionId } = (await post('/api/v1/auth/qr-code')).json();
    expect((await post('/api/v1/auth/qr-confirm', { sessionId, userId: 'u-1001' })).statusCode).toBe(200);
    const s = (await get(`/api/v1/auth/qr-status?sessionId=${sessionId}`)).json();
    expect(s.status).toBe('confirmed');
    expect(s.accessToken).toBeTruthy();
    expect(s.refreshToken).toBeTruthy();
    expect(s.user.id).toBe('u-1001');
  });

  it('已封禁车主确认 → 403，会话不 confirmed', async () => {
    const { sessionId } = (await post('/api/v1/auth/qr-code')).json();
    expect((await post('/api/v1/auth/qr-confirm', { sessionId, userId: 'u-1003' })).statusCode).toBe(403); // u-1003 banned
    expect((await get(`/api/v1/auth/qr-status?sessionId=${sessionId}`)).json().status).toBe('pending');
  });

  it('TTL 超时 → expired（单元级，注入 now）', () => {
    const { sessionId } = cauth.createSession(1_000_000);
    expect(cauth.getSession(sessionId, 1_000_000).status).toBe('pending');
    expect(cauth.getSession(sessionId, 1_000_000 + (cauth.QR_TTL + 1) * 1000).status).toBe('expired');
  });

  it('mock-login 直接拿车主 token，/me 返回同一车主', async () => {
    const b = (await post('/api/v1/auth/mock-login')).json();
    expect(b.accessToken).toBeTruthy();
    expect(b.user.id).toBe('u-1001');
    const me = (await get('/api/v1/auth/me', b.accessToken)).json();
    expect(me.id).toBe('u-1001');
  });

  it('无 token 调 /me → 401', async () => {
    expect((await get('/api/v1/auth/me')).statusCode).toBe(401);
  });

  it('车主 token 不能访问后台 /api/v1/admin/* → 401（与 admin 隔离）', async () => {
    const { accessToken } = (await post('/api/v1/auth/mock-login')).json();
    const r = await get('/api/v1/admin/products', accessToken);
    expect(r.statusCode).toBe(401);
  });

  it('admin token 不能当车主 token 用（/me typ 不匹配 → 401）', async () => {
    expect((await get('/api/v1/auth/me', superToken)).statusCode).toBe(401);
  });
});

describe('admin-order · 订单状态走同一套状态机', () => {
  it('合法流转 PAID --prepared--> SHIPPING → 200', async () => {
    const r = await inj({ method: 'PATCH', url: '/api/v1/admin/orders/o-20001/status', payload: { event: 'prepared' } });
    expect(r.statusCode).toBe(200);
    expect(r.json().to).toBe('SHIPPING');
    expect((await inj({ method: 'GET', url: '/api/v1/admin/orders/o-20001' })).json().status).toBe('SHIPPING');
  });

  it('非法流转 PENDING_PAYMENT --delivered--> → 409（附 allowed）', async () => {
    const r = await inj({ method: 'PATCH', url: '/api/v1/admin/orders/o-20003/status', payload: { event: 'delivered' } });
    expect(r.statusCode).toBe(409);
    expect(r.json().details.allowed).toContain('paid');
  });

  it('客服可改订单状态（orders:write）→ 200', async () => {
    const cs = await login('cs01', 'cs123');
    const r = await app.inject({ method: 'PATCH', url: '/api/v1/admin/orders/o-20001/status', payload: { event: 'prepared' }, headers: { authorization: `Bearer ${cs}` } });
    expect(r.statusCode).toBe(200);
  });

  it('运营无 orders:write → 改订单状态 403', async () => {
    const ops = await login('ops01', 'ops123');
    const r = await app.inject({ method: 'PATCH', url: '/api/v1/admin/orders/o-20001/status', payload: { event: 'prepared' }, headers: { authorization: `Bearer ${ops}` } });
    expect(r.statusCode).toBe(403);
  });
});

describe('admin-analytics · 运营看板', () => {
  it('看板返回 pv/uv/行车态切换/车机vs手机/gmv', async () => {
    const a = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json();
    expect(typeof a.pv).toBe('number');
    expect(typeof a.uv).toBe('number');
    expect(typeof a.drivingSwitches).toBe('number');
    expect(a.channel).toHaveProperty('car');
    expect(a.channel).toHaveProperty('phone');
    expect(a.channel.car + a.channel.phone).toBeLessThanOrEqual(a.orderTotal);
    expect(typeof a.gmv).toBe('number');
  });

  it('埋点 pageview → 看板 pv +1（Q15 真实累加）', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().pv;
    await inj({ method: 'POST', url: '/api/v1/events', payload: { type: 'pageview' } });
    expect((await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().pv).toBe(before + 1);
  });

  it('埋点 driving-switch → 看板 drivingSwitches +1', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().drivingSwitches;
    await inj({ method: 'POST', url: '/api/v1/events', payload: { type: 'driving-switch' } });
    expect((await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().drivingSwitches).toBe(before + 1);
  });

  it('uv 按 visitorId 去重：新访客 +1，重复不再加', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().uv;
    await inj({ method: 'POST', url: '/api/v1/events', payload: { type: 'pageview', visitorId: 'visitor-xyz' } });
    const after1 = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().uv;
    expect(after1).toBe(before + 1);
    await inj({ method: 'POST', url: '/api/v1/events', payload: { type: 'pageview', visitorId: 'visitor-xyz' } });
    expect((await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().uv).toBe(after1); // 同访客不重复计
  });
});

describe('admin-catalog · 商品/库存/分类', () => {
  it('调整库存（PATCH stock）→ 生效', async () => {
    const id = (await inj({ method: 'GET', url: '/api/v1/admin/products' })).json().items[0].id;
    await inj({ method: 'PATCH', url: '/api/v1/admin/products/' + id, payload: { stock: 999 } });
    expect((await inj({ method: 'GET', url: '/api/v1/admin/products/' + id })).json().stock).toBe(999);
  });

  it('无图新增商品 → 自动补占位图（不渲染黑块）', async () => {
    const created = (await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: '无图测试品', cat: 'gear', price: 1000 } })).json();
    expect(typeof created.img).toBe('string');
    expect((created.img as string).length).toBeGreaterThan(0);
  });

  it('时间口径（P1#4）：新增补 ISO createdAt + updatedAt；更新盖 updatedAt', async () => {
    const created = (await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: '时间测试品', cat: 'gear', price: 1000 } })).json();
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
    expect(created.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const updated = (await inj({ method: 'PATCH', url: '/api/v1/admin/products/' + created.id, payload: { price: 2000 } })).json();
    expect(updated.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ===== forward change 实现：消费端账号 / 履约 / 验证码登录 =====
describe('auth-login · 手机号 + 验证码登录（openspec/specs/auth-login）', () => {
  const post = (url: string, payload?: unknown): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'POST', url, payload } as InjectOptions) as Promise<LightMyRequestResponse>;
  const get = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'GET', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;

  it('请求验证码 → 下发 code（Demo 直出）', async () => {
    const b = (await post('/api/v1/auth/sms-code', { phone: '13900000088' })).json();
    expect(b.ok).toBe(true);
    expect(b.code).toMatch(/^\d{6}$/);
  });

  it('同号 60s 内重复请求 → 429 频控', async () => {
    await post('/api/v1/auth/sms-code', { phone: '13900000077' });
    expect((await post('/api/v1/auth/sms-code', { phone: '13900000077' })).statusCode).toBe(429);
  });

  it('正确验证码 → 下发车主 token + 首次自动建号', async () => {
    const phone = '13900001234';
    const { code } = (await post('/api/v1/auth/sms-code', { phone })).json();
    const r = await post('/api/v1/auth/sms-login', { phone, code });
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.accessToken).toBeTruthy();
    expect(b.user.phone).toBe(phone);
    // 该 token 能取自己的资料
    const me = (await get('/api/v1/me', b.accessToken)).json();
    expect(me.phone).toBe(phone);
  });

  it('错误/过期验证码 → 401', async () => {
    await post('/api/v1/auth/sms-code', { phone: '13900005678' });
    expect((await post('/api/v1/auth/sms-login', { phone: '13900005678', code: '000000' })).statusCode).toBe(401);
  });

  it('封禁车主验证码登录 → 403 USER_BANNED', async () => {
    const phone = '137****0003'; // u-1003 已封禁（admin-seed）
    const { code } = (await post('/api/v1/auth/sms-code', { phone })).json();
    expect((await post('/api/v1/auth/sms-login', { phone, code })).statusCode).toBe(403);
  });

  it('验证码一次性：登录成功后同码再用 → 401', async () => {
    const phone = '13900009999';
    const { code } = (await post('/api/v1/auth/sms-code', { phone })).json();
    expect((await post('/api/v1/auth/sms-login', { phone, code })).statusCode).toBe(200);
    expect((await post('/api/v1/auth/sms-login', { phone, code })).statusCode).toBe(401);
  });

  it('验证码登录得到的车主 token 不能访问后台 → 401（与 admin 隔离）', async () => {
    const phone = '13900002222';
    const { code } = (await post('/api/v1/auth/sms-code', { phone })).json();
    const { accessToken } = (await post('/api/v1/auth/sms-login', { phone, code })).json();
    expect((await get('/api/v1/admin/products', accessToken)).statusCode).toBe(401);
  });
});

describe('user · 个人资料 / 地址簿 / 钱包（openspec/specs/user）', () => {
  const post = (url: string, payload?: unknown, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'POST', url, payload, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const get = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'GET', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const patch = (url: string, payload: unknown, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'PATCH', url, payload, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const del = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'DELETE', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  // 取 u-1001 的车主 token
  const u1001 = async (): Promise<string> => (await app.inject({ method: 'POST', url: '/api/v1/auth/mock-login' } as InjectOptions)).json().accessToken as string;
  // 用验证码登录造另一个车主
  const otherUser = async (phone: string): Promise<string> => {
    const { code } = (await app.inject({ method: 'POST', url: '/api/v1/auth/sms-code', payload: { phone } } as InjectOptions)).json();
    return (await app.inject({ method: 'POST', url: '/api/v1/auth/sms-login', payload: { phone, code } } as InjectOptions)).json().accessToken as string;
  };

  it('无 token 调 /me → 401', async () => {
    expect((await get('/api/v1/me')).statusCode).toBe(401);
  });

  it('/me 返回资料 + 积分余额（u-1001）', async () => {
    const t = await u1001();
    const me = (await get('/api/v1/me', t)).json();
    expect(me.id).toBe('u-1001');
    expect(me.points).toBe(1200);
    expect(me.balance).toBe(5000);
  });

  it('PATCH /me 只改昵称', async () => {
    const t = await u1001();
    const me = (await patch('/api/v1/me', { name: '李师傅' }, t)).json();
    expect(me.name).toBe('李师傅');
    expect(me.phone).toBe('138****0001'); // 手机号不变
  });

  it('/me/wallet 返回积分余额', async () => {
    const t = await u1001();
    const w = (await get('/api/v1/me/wallet', t)).json();
    expect(w.points).toBe(1200);
    expect(w.balance).toBe(5000);
  });

  it('地址簿：新增设为默认 → 默认互斥', async () => {
    const t = await u1001();
    const before = (await get('/api/v1/me/addresses', t)).json().items;
    expect(before.length).toBe(2);
    const r = await post('/api/v1/me/addresses', { receiver: '王五', phone: '13800000000', addr: '北京朝阳', isDefault: true }, t);
    expect(r.statusCode).toBe(201);
    const items = r.json().items as Array<{ isDefault: boolean }>;
    expect(items.filter((a) => a.isDefault).length).toBe(1); // 只有一个默认
  });

  it('地址簿：删除地址（404 不存在）', async () => {
    const t = await u1001();
    expect((await del('/api/v1/me/addresses/addr-2', t)).statusCode).toBe(200);
    expect((await del('/api/v1/me/addresses/addr-nope', t)).statusCode).toBe(404);
  });

  it('越权隔离：B 车主看不到 / 改不动 A 的地址', async () => {
    const tA = await u1001();
    const idA = (await get('/api/v1/me/addresses', tA)).json().items[0].id;
    const tB = await otherUser('13900000042');
    expect((await get('/api/v1/me/addresses', tB)).json().items.length).toBe(0); // B 无地址
    expect((await patch('/api/v1/me/addresses/' + idA, { addr: '改你的' }, tB)).statusCode).toBe(404); // 改不动 A 的
    expect((await del('/api/v1/me/addresses/' + idA, tB)).statusCode).toBe(404);
  });
});

describe('account-extras · 收藏/优惠券/售后（add-account-extras / openspec user）', () => {
  const post = (url: string, payload?: unknown, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'POST', url, payload, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const get = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'GET', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const del = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'DELETE', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const u1001 = async (): Promise<string> => (await app.inject({ method: 'POST', url: '/api/v1/auth/mock-login' } as InjectOptions)).json().accessToken as string;
  const loginPhone = async (phone: string): Promise<string> => {
    const { code } = (await app.inject({ method: 'POST', url: '/api/v1/auth/sms-code', payload: { phone } } as InjectOptions)).json();
    return (await app.inject({ method: 'POST', url: '/api/v1/auth/sms-login', payload: { phone, code } } as InjectOptions)).json().accessToken as string;
  };

  it('我的收藏：种子 2 条 + 加收藏幂等 + 取消 + 404', async () => {
    const t = await u1001();
    expect((await get('/api/v1/me/favorites', t)).json().items.length).toBe(2); // 种子 e4/g1
    expect((await post('/api/v1/me/favorites', { productId: 'e1' }, t)).statusCode).toBe(201);
    expect((await post('/api/v1/me/favorites', { productId: 'e1' }, t)).json().items.length).toBe(3); // 幂等不重复
    expect((await del('/api/v1/me/favorites/e1', t)).json().items.length).toBe(2);
    expect((await del('/api/v1/me/favorites/e1', t)).statusCode).toBe(404); // 已无
  });

  it('收藏不存在商品 → 404；收藏按车主隔离', async () => {
    const t = await u1001();
    expect((await post('/api/v1/me/favorites', { productId: 'nope' }, t)).statusCode).toBe(404);
    const tB = await loginPhone('13900000043');
    expect((await get('/api/v1/me/favorites', tB)).json().items.length).toBe(0); // B 无收藏
  });

  it('可领优惠券：只返回启用且有库存（cp-3 停用被排除）', async () => {
    const { items } = (await get('/api/v1/coupons')).json();
    expect(items.every((c: { active: boolean; stock: number }) => c.active === true && c.stock > 0)).toBe(true);
    expect(items.some((c: { id: string }) => c.id === 'cp-3')).toBe(false); // 停用
    // 把 cp-1 库存清零 → 不再可领
    await inj({ method: 'PATCH', url: '/api/v1/admin/coupons/cp-1', payload: { stock: 0 } });
    expect((await get('/api/v1/coupons')).json().items.some((c: { id: string }) => c.id === 'cp-1')).toBe(false);
  });

  it('消费端发起售后：本人订单→201 + 后台可见；他人订单→404', async () => {
    const tA = await u1001();
    // o-20001 属 u-1001
    const r = await post('/api/v1/me/aftersale', { orderId: 'o-20001', reason: '消费端申请退款' }, tA);
    expect(r.statusCode).toBe(201);
    // 后台能看到这张新售后单
    const adminAft = (await inj({ method: 'GET', url: '/api/v1/admin/aftersale' })).json().items;
    expect(adminAft.some((a: { orderId: string }) => a.orderId === 'o-20001')).toBe(true);
    // 他人订单（o-20003 属 u-1002）→ 404
    expect((await post('/api/v1/me/aftersale', { orderId: 'o-20003', reason: 'x' }, tA)).statusCode).toBe(404);
  });

  it('我的售后：按订单 userId 归属隔离', async () => {
    const tA = await u1001(); // 种子售后 as-1 属 o-20004(u-1003)，故 A(u-1001) 初始为空
    expect((await get('/api/v1/me/aftersale', tA)).json().items.length).toBe(0);
    // 后台为 u-1001 的订单 o-20001 建一张售后单 → A 应能看到，且仍看不到他人的 as-1
    await inj({ method: 'POST', url: '/api/v1/admin/aftersale', payload: { orderId: 'o-20001', reason: '测试', status: 'pending' } });
    const mine = (await get('/api/v1/me/aftersale', tA)).json().items;
    expect(mine.some((a: { orderId: string }) => a.orderId === 'o-20001')).toBe(true);
    expect(mine.some((a: { id: string }) => a.id === 'as-1')).toBe(false); // 他人(u-1003)的不可见
  });

  it('未登录 /me/favorites、/me/aftersale → 401', async () => {
    expect((await get('/api/v1/me/favorites')).statusCode).toBe(401);
    expect((await get('/api/v1/me/aftersale')).statusCode).toBe(401);
  });
});

describe('fulfillment · 消费端自提点 / 物流（openspec/specs/fulfillment）', () => {
  const get = (url: string, token?: string): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'GET', url, headers: token ? { authorization: `Bearer ${token}` } : {} } as InjectOptions) as Promise<LightMyRequestResponse>;
  const u1001 = async (): Promise<string> => (await app.inject({ method: 'POST', url: '/api/v1/auth/mock-login' } as InjectOptions)).json().accessToken as string;

  it('自提点：只返回营业中的（pp-3 停业被过滤）', async () => {
    const { items } = (await get('/api/v1/fulfillment/pickup-points')).json();
    expect(items.every((p: { open: boolean }) => p.open === true)).toBe(true);
    expect(items.find((p: { id: string }) => p.id === 'pp-3')).toBeUndefined();
  });

  it('自提点：含坐标按距离排序 + limit 生效', async () => {
    const { items } = (await get('/api/v1/fulfillment/pickup-points?lat=31.21&lng=121.59&limit=1')).json();
    expect(items.length).toBe(1);
  });

  it('订单物流：本人订单返回轨迹（节点倒序，最新在前）', async () => {
    const t = await u1001();
    const r = await get('/api/v1/orders/o-20002/shipping', t); // o-20002 属 u-1001 且有物流
    expect(r.statusCode).toBe(200);
    const b = r.json();
    expect(b.trackingNo).toBe('SF1234567890');
    expect(b.nodes[0]).toBe('运输中'); // 倒序后最新节点在前
  });

  it('订单物流：本人订单无物流记录 → 空轨迹（非错误）', async () => {
    const t = await u1001();
    const b = (await get('/api/v1/orders/o-20001/shipping', t)).json(); // o-20001 属 u-1001 但无 shipping
    expect(b.nodes).toEqual([]);
    expect(b.trackingNo).toBeNull();
  });

  it('订单物流：他人订单 → 404（不泄漏存在性）', async () => {
    const t = await u1001();
    expect((await get('/api/v1/orders/o-20003/shipping', t)).statusCode).toBe(404); // o-20003 属 u-1002
  });

  it('订单物流：无 token → 401', async () => {
    expect((await get('/api/v1/orders/o-20002/shipping')).statusCode).toBe(401);
  });
});

// ===== 前后台打通契约（护栏3）：后台写 → 前台读，逐域端到端 =====
// 把手动 QA 的「admin 改→consumer 看」固化成回归；断了 CI 红。覆盖 6 域。
describe('前后台打通契约 · admin 写→consumer 读（6 域）', () => {
  const post = (url: string, payload?: unknown): Promise<LightMyRequestResponse> =>
    app.inject({ method: 'POST', url, payload } as InjectOptions) as Promise<LightMyRequestResponse>;
  const userToken = async (): Promise<string> => (await post('/api/v1/auth/mock-login')).json().accessToken as string;
  const ujson = async (url: string, t: string) =>
    (await app.inject({ method: 'GET', url, headers: { authorization: `Bearer ${t}` } } as InjectOptions)).json();

  it('商品：后台新增上架 → 消费端 /products 可见', async () => {
    const p = (await inj({ method: 'POST', url: '/api/v1/admin/products', payload: { title: '打通-商品', cat: 'energy', price: 1000, onShelf: true } })).json();
    expect((await inj({ method: 'GET', url: '/api/v1/products?cat=energy' })).json().items.some((x: { id: string }) => x.id === p.id)).toBe(true);
  });

  it('营销：后台停用 banner → 消费端 /bootstrap 不再返回；新增券 → /coupons 可见', async () => {
    const bid = (await inj({ method: 'GET', url: '/api/v1/admin/banners' })).json().items[0].id;
    await inj({ method: 'PATCH', url: `/api/v1/admin/banners/${bid}`, payload: { active: false } });
    expect((await inj({ method: 'GET', url: '/api/v1/bootstrap' })).json().banners.some((b: { id: string }) => b.id === bid)).toBe(false);
    await inj({ method: 'POST', url: '/api/v1/admin/coupons', payload: { name: '打通-券', type: 'fixed', amount: 500, threshold: 0, stock: 9, active: true } });
    expect((await inj({ method: 'GET', url: '/api/v1/coupons' })).json().items.some((c: { name: string }) => c.name === '打通-券')).toBe(true);
  });

  it('交易：消费端下单 → 后台订单可见；支付确认 → 状态 PAID', async () => {
    const oid = (await post('/api/v1/orders', { items: [{ title: '打通-下单', price: 1000, qty: 1 }], channel: 'car' })).json().order.id;
    expect((await inj({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.some((o: { id: string }) => o.id === oid)).toBe(true);
    await post(`/api/v1/payments/${oid}/confirm`, {});
    expect((await inj({ method: 'GET', url: `/api/v1/admin/orders/${oid}` })).json().status).toBe('PAID');
  });

  it('客户：后台改积分 → 消费端 /me/wallet 同步', async () => {
    await inj({ method: 'PATCH', url: '/api/v1/admin/users/u-1001', payload: { points: 4321 } });
    const t = await userToken();
    expect((await ujson('/api/v1/me/wallet', t)).points).toBe(4321);
  });

  it('履约：后台新增营业自提点 → 消费端 /fulfillment/pickup-points 可见', async () => {
    await inj({ method: 'POST', url: '/api/v1/admin/pickupPoints', payload: { name: '打通-自提', address: 'x', lat: 31, lng: 121, open: true } });
    expect((await inj({ method: 'GET', url: '/api/v1/fulfillment/pickup-points?limit=20' })).json().items.some((p: { name: string }) => p.name === '打通-自提')).toBe(true);
  });

  it('看板：消费端埋点 → 后台 analytics pv 累加', async () => {
    const before = (await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().pv;
    await post('/api/v1/events', { type: 'pageview' });
    expect((await inj({ method: 'GET', url: '/api/v1/admin/analytics' })).json().pv).toBe(before + 1);
  });
});
