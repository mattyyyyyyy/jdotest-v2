/**
 * 内存数据 store —— 前台与后台共享的同一份数据（Demo；后续换 Prisma+PG，接口不变）。
 *
 * 通用 resource 注册表：每个实体一个集合，统一 list/get/create/update/remove。
 * 后台用通用 CRUD 操作任意 resource；前台用下方定制读取（V3 shape）。
 *
 * 商品/分类/banner/推荐位 的种子来自消费端 V3 data.js（单一真相，见 data/load-v3.ts）。
 * 订单/用户/优惠券/评价/自提点 等来自 data/admin-seed.ts 的样例。
 */
import { loadV3Data } from './data/load-v3.js';
import * as seed from './data/admin-seed.js';

export type Row = Record<string, unknown> & { id: string };

interface Resource {
  prefix: string;
  rows: Row[];
  counter: number;
}

const resources = new Map<string, Resource>();

/** 配置：哪些 resource 可被后台通用 CRUD 管理 */
export const RESOURCE_NAMES = [
  'products',
  'categories',
  'banners',
  'heroRecs',
  'orders',
  'users',
  'coupons',
  'reviews',
  'pickupPoints',
  'aftersale',
  'shipping',
  'adminUsers',
] as const;
export type ResourceName = (typeof RESOURCE_NAMES)[number];

let config: Record<string, unknown> = {};

function seedAll(): void {
  resources.clear();
  const v3 = loadV3Data();

  const init: Record<ResourceName, { prefix: string; rows: Row[] }> = {
    products: { prefix: 'p', rows: v3.products as unknown as Row[] },
    categories: { prefix: 'cat', rows: v3.categories as unknown as Row[] },
    banners: { prefix: 'b', rows: v3.banners as unknown as Row[] },
    heroRecs: { prefix: 'rec', rows: v3.heroRecs as unknown as Row[] },
    orders: { prefix: 'o-', rows: seed.orders.map((o) => ({ ...o })) as unknown as Row[] },
    users: { prefix: 'u-', rows: seed.users.map((u) => ({ ...u })) as unknown as Row[] },
    coupons: { prefix: 'cp-', rows: seed.coupons.map((c) => ({ ...c })) as unknown as Row[] },
    reviews: { prefix: 'rv-', rows: seed.reviews.map((r) => ({ ...r })) as unknown as Row[] },
    pickupPoints: { prefix: 'pp-', rows: seed.pickupPoints.map((p) => ({ ...p })) as unknown as Row[] },
    aftersale: { prefix: 'as-', rows: seed.aftersale.map((a) => ({ ...a })) as unknown as Row[] },
    // shipping 用 orderId 作 id
    shipping: { prefix: 'sh-', rows: seed.shipping.map((s) => ({ id: s.orderId, ...s })) as unknown as Row[] },
    adminUsers: { prefix: 'a-', rows: seed.adminUsers.map((a) => ({ ...a })) as unknown as Row[] },
  };

  for (const name of RESOURCE_NAMES) {
    const r = init[name];
    resources.set(name, { prefix: r.prefix, rows: r.rows.map((x) => ({ ...x })), counter: r.rows.length + 1 });
  }
  config = { ...seed.config };
}

seedAll();

function res(name: string): Resource {
  const r = resources.get(name);
  if (!r) throw new Error(`未知 resource: ${name}`);
  return r;
}

export const store = {
  isResource(name: string): name is ResourceName {
    return (RESOURCE_NAMES as readonly string[]).includes(name);
  },

  // ---------- 通用 CRUD（后台用）----------
  list(name: string): Row[] {
    return [...res(name).rows];
  },
  get(name: string, id: string): Row | undefined {
    return res(name).rows.find((x) => x.id === id);
  },
  create(name: string, data: Record<string, unknown>): Row {
    const r = res(name);
    const id = (data.id as string) ?? `${r.prefix}${r.counter++}`;
    const row: Row = { ...data, id };
    r.rows.push(row);
    return row;
  },
  update(name: string, id: string, patch: Record<string, unknown>): Row | undefined {
    const row = res(name).rows.find((x) => x.id === id);
    if (!row) return undefined;
    for (const [k, v] of Object.entries(patch)) {
      if (k !== 'id' && v !== undefined) row[k] = v;
    }
    return row;
  },
  remove(name: string, id: string): boolean {
    const r = res(name);
    const i = r.rows.findIndex((x) => x.id === id);
    if (i < 0) return false;
    r.rows.splice(i, 1);
    return true;
  },

  // ---------- 消费端定制读取（V3 shape）----------
  categories(): Row[] {
    return [...res('categories').rows].sort((a, b) => (a.sort as number) - (b.sort as number));
  },
  /** 前台首页/分类：只看上架商品，可按 cat 过滤 */
  productsOnShelf(cat?: string): Row[] {
    return res('products').rows.filter((p) => p.onShelf === true && (!cat || p.cat === cat));
  },
  product(id: string): Row | undefined {
    const p = res('products').rows.find((x) => x.id === id);
    return p && p.onShelf ? p : undefined;
  },
  activeBanners(): Row[] {
    return res('banners').rows.filter((b) => b.active !== false);
  },
  activeHeroRecs(): Row[] {
    return res('heroRecs').rows.filter((h) => h.active !== false);
  },
  ordersByUser(userId?: string): Row[] {
    return res('orders').rows.filter((o) => !userId || o.userId === userId);
  },
  config(): Record<string, unknown> {
    return { ...config };
  },
  setConfig(patch: Record<string, unknown>): Record<string, unknown> {
    config = { ...config, ...patch };
    return { ...config };
  },

  reset(): void {
    seedAll();
  },
};
