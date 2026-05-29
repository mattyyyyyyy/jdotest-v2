import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { store } from './store.js';

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});
beforeEach(() => store.reset());
afterAll(async () => {
  await app.close();
});

describe('健康 & 引导数据', () => {
  it('/health ok', async () => {
    expect((await app.inject({ method: 'GET', url: '/health' })).json()).toEqual({ status: 'ok' });
  });

  it('/api/v1/bootstrap 返回 V3 四件套（来自 V3 data.js 种子）', async () => {
    const d = (await app.inject({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.categories).toHaveLength(7); // 7 场景
    expect(d.categories[0].id).toBe('energy');
    expect(d.products.length).toBeGreaterThan(50); // V3 60+ 商品
    expect(d.banners.length).toBeGreaterThan(0);
    expect(d.heroRecs.length).toBeGreaterThan(0);
  });
});

describe('消费端读接口', () => {
  it('?cat=eat 只返回一路吃喝', async () => {
    const { items } = (await app.inject({ method: 'GET', url: '/api/v1/products?cat=eat' })).json();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p: { cat: string }) => p.cat === 'eat')).toBe(true);
  });
});

describe('后台通用 CRUD（一套接口管所有实体）', () => {
  it('resources 列出所有可管理实体', async () => {
    const { items } = (await app.inject({ method: 'GET', url: '/api/v1/admin/resources' })).json();
    const keys = items.map((r: { key: string }) => r.key);
    expect(keys).toContain('products');
    expect(keys).toContain('orders');
    expect(keys).toContain('coupons');
    expect(keys.length).toBeGreaterThanOrEqual(12);
  });

  it('admin 看到全部商品（含下架），数量 ≥ 前台在售', async () => {
    const adminCount = (await app.inject({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    const frontCount = (await app.inject({ method: 'GET', url: '/api/v1/products' })).json().total;
    expect(adminCount).toBeGreaterThanOrEqual(frontCount);
  });

  it('未知 resource → 404', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/admin/nope' })).statusCode).toBe(404);
  });

  it('对每个实体都能列表（全 12 个 resource 不报错）', async () => {
    const { items } = (await app.inject({ method: 'GET', url: '/api/v1/admin/resources' })).json();
    for (const r of items) {
      const res = await app.inject({ method: 'GET', url: '/api/v1/admin/' + r.key });
      expect(res.statusCode, r.key).toBe(200);
      expect(Array.isArray(res.json().items), r.key).toBe(true);
    }
  });
});

describe('前后台数据同步（每类实体）', () => {
  it('商品：后台新增 → 前台 bootstrap 看到', async () => {
    await app.inject({ method: 'POST', url: '/api/v1/admin/products', payload: { title: 'TEST车品', cat: 'gear', price: 50, ori: 99, stock: 9, onShelf: true } });
    const d = (await app.inject({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.products.some((p: { title: string }) => p.title === 'TEST车品')).toBe(true);
  });

  it('商品：后台下架 → 前台消失', async () => {
    const all = (await app.inject({ method: 'GET', url: '/api/v1/admin/products' })).json().items;
    const id = all[0].id;
    await app.inject({ method: 'PATCH', url: '/api/v1/admin/products/' + id, payload: { onShelf: false } });
    const front = (await app.inject({ method: 'GET', url: '/api/v1/products' })).json();
    expect(front.items.some((p: { id: string }) => p.id === id)).toBe(false);
  });

  it('分类：后台改名 → 前台分类同步', async () => {
    await app.inject({ method: 'PATCH', url: '/api/v1/admin/categories/energy', payload: { name: '能量站' } });
    const cats = (await app.inject({ method: 'GET', url: '/api/v1/categories' })).json().items;
    expect(cats.find((c: { id: string }) => c.id === 'energy').name).toBe('能量站');
  });

  it('Banner：后台停用 → 前台 bootstrap 不再返回', async () => {
    const banners = (await app.inject({ method: 'GET', url: '/api/v1/admin/banners' })).json().items;
    const id = banners[0].id;
    await app.inject({ method: 'PATCH', url: '/api/v1/admin/banners/' + id, payload: { active: false } });
    const d = (await app.inject({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    expect(d.banners.some((b: { id: string }) => b.id === id)).toBe(false);
  });

  it('订单：后台改状态生效', async () => {
    await app.inject({ method: 'PATCH', url: '/api/v1/admin/orders/o-20003', payload: { status: 'PAID' } });
    const o = (await app.inject({ method: 'GET', url: '/api/v1/admin/orders/o-20003' })).json();
    expect(o.status).toBe('PAID');
  });

  it('删除：后台删商品 → 列表减少', async () => {
    const before = (await app.inject({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    const id = (await app.inject({ method: 'GET', url: '/api/v1/admin/products' })).json().items[0].id;
    await app.inject({ method: 'DELETE', url: '/api/v1/admin/products/' + id });
    const after = (await app.inject({ method: 'GET', url: '/api/v1/admin/products' })).json().items.length;
    expect(after).toBe(before - 1);
  });
});

describe('双向同步 · 前→后：消费端下单 → 后台看到', () => {
  it('POST /api/v1/orders 创建订单并出现在后台订单列表', async () => {
    const before = (await app.inject({ method: 'GET', url: '/api/v1/admin/orders' })).json().items.length;
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/orders',
      payload: { items: [{ title: '车载香薰', price: 39, qty: 2 }, { title: '玻璃水', price: 29.9, qty: 1 }], channel: 'car' },
    });
    expect(res.statusCode).toBe(200);
    const order = res.json().order;
    expect(order.status).toBe('PENDING_PAYMENT'); // 走了状态机 DRAFT→submit
    expect(order.channel).toBe('car');
    expect(order.totalAmount).toBe(39 * 100 * 2 + Math.round(29.9 * 100)); // 分

    const adminOrders = (await app.inject({ method: 'GET', url: '/api/v1/admin/orders' })).json().items;
    expect(adminOrders.length).toBe(before + 1);
    expect(adminOrders.some((o: { id: string }) => o.id === order.id)).toBe(true);
  });
});

describe('双向同步 · 后→前：后台加商品（无图）→ 前台拿到默认图，不黑块', () => {
  it('admin 新增商品自动补默认 img/sold/star', async () => {
    const res = await app.inject({
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
    const d = (await app.inject({ method: 'GET', url: '/api/v1/bootstrap' })).json();
    const found = d.products.find((x: { title: string }) => x.title === '无图测试品');
    expect(found).toBeTruthy();
    expect(found.img).toBeTruthy();
  });
});

describe('运营看板 & 配置', () => {
  it('analytics 返回车机vs手机渠道对比', async () => {
    const a = (await app.inject({ method: 'GET', url: '/api/v1/admin/analytics' })).json();
    expect(a.channel).toHaveProperty('car');
    expect(a.channel).toHaveProperty('phone');
    expect(a.orderTotal).toBeGreaterThan(0);
  });

  it('config 可改行车态阈值', async () => {
    await app.inject({ method: 'PATCH', url: '/api/v1/admin/config', payload: { drivingSpeedThreshold: 8 } });
    const c = (await app.inject({ method: 'GET', url: '/api/v1/admin/config' })).json();
    expect(c.drivingSpeedThreshold).toBe(8);
  });
});

describe('订单状态机仍可用', () => {
  it('合法/非法转换', async () => {
    expect((await app.inject({ method: 'POST', url: '/api/v1/orders/transition', payload: { state: 'DRAFT', event: 'submit' } })).json().state).toBe('PENDING_PAYMENT');
    expect((await app.inject({ method: 'POST', url: '/api/v1/orders/transition', payload: { state: 'DRAFT', event: 'delivered' } })).statusCode).toBe(409);
  });
});
