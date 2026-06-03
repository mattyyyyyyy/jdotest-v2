/**
 * 内存数据 store —— 前台与后台共享的同一份数据（Demo；后续换 Prisma+PG，接口不变）。
 *
 * 通用 resource 注册表：每个实体一个集合，统一 list/get/create/update/remove。
 * 后台用通用 CRUD 操作任意 resource；前台用下方定制读取（V3 shape）。
 *
 * 商品/分类/banner/推荐位 的种子来自消费端 V3 data.js（单一真相，见 data/load-v3.ts）。
 * 订单/用户/优惠券/评价/自提点 等来自 data/admin-seed.ts 的样例。
 *
 * 持久化（ADR-0014）：设 `STORE_PERSIST_PATH` 时，启动加载快照、每次变更落盘 JSON，
 * 重启不丢数据；不设时纯内存（测试默认）。PG（ADR-0003）仍为生产目标，store 接口不变。
 */
import fs from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
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
  'auditLogs',
] as const;
export type ResourceName = (typeof RESOURCE_NAMES)[number];

let config: Record<string, unknown> = {};

interface CartItem { id: string; productId: string; qty: number; selected: boolean; spec: string }
let cart: CartItem[] = [];
let cartCounter = 1;

// 收货地址（按 userId 归属；Demo 内存，持久化待 Q2）。
interface Address { id: string; userId: string; receiver: string; phone: string; addr: string; isDefault: boolean }
let addresses: Address[] = [];
let addressCounter = 1;
function seedAddresses(): void {
  addresses = [
    { id: 'addr-1', userId: 'u-1001', receiver: '车主小李', phone: '138****0001', addr: '上海市浦东新区张江路 88 号', isDefault: true },
    { id: 'addr-2', userId: 'u-1001', receiver: '李太太', phone: '138****8888', addr: '上海市闵行区虹桥枢纽 B2', isDefault: false },
  ];
  addressCounter = 3;
}

// 收藏（按 userId 归属，存 productId；Demo 内存）。
interface Favorite { id: string; userId: string; productId: string }
let favorites: Favorite[] = [];
let favoriteCounter = 1;
function seedFavorites(): void {
  favorites = [
    { id: 'fav-1', userId: 'u-1001', productId: 'e4' },
    { id: 'fav-2', userId: 'u-1001', productId: 'g1' },
  ];
  favoriteCounter = 3;
}

// 运营埋点指标（Q15）：种子给一个历史基线，真实事件在其上累加（pv 页面浏览 / uv 独立访客 / 行车态切换）。
interface Metrics { pv: number; uv: number; drivingSwitches: number }
let metrics: Metrics = { pv: 12840, uv: 3210, drivingSwitches: 487 };
let seenVisitors = new Set<string>();
function seedMetrics(): void {
  metrics = { pv: 12840, uv: 3210, drivingSwitches: 487 };
  seenVisitors = new Set<string>();
}
function seedCart(): void {
  cart = [
    { id: 'ci-1', productId: 'g1', qty: 2, selected: true, spec: '木质香调' },
    { id: 'ci-2', productId: 'e4', qty: 1, selected: true, spec: '6 瓶 / 箱' },
    { id: 'ci-3', productId: 'g5', qty: 1, selected: true, spec: '岩石黑 · M' },
    { id: 'ci-4', productId: 'f5', qty: 3, selected: false, spec: '30 包 / 箱' },
  ];
  cartCounter = 5;
}

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
    auditLogs: { prefix: 'log-', rows: [] as Row[] },
  };

  for (const name of RESOURCE_NAMES) {
    const r = init[name];
    resources.set(name, { prefix: r.prefix, rows: r.rows.map((x) => ({ ...x })), counter: r.rows.length + 1 });
  }
  config = { ...seed.config };
  seedCart();
  seedAddresses();
  seedFavorites();
  seedMetrics();
  // 持久化：已有快照则加载覆盖种子；否则把种子落盘建立首个快照。
  if (!loadFromDisk()) save();
}

// ---------- 持久化（ADR-0014：SQLite 实库 via better-sqlite3；PostgreSQL/ADR-0003 仍为生产目标）----------
// 设 STORE_PERSIST_PATH(.db 文件) → SQLite 落盘，重启不丢；不设 → 纯内存(测试默认)。
// better-sqlite3 是同步驱动，故 store 对外仍全同步、读写逻辑零改动。
// 每个集合行存为 (coll,id,seq,data) 关系行，写操作在事务内整体重持久化（Demo 量级 ~百行，原子且简单）。
function persistPath(): string | undefined {
  return process.env.STORE_PERSIST_PATH;
}

type DB = Database.Database;
let db: DB | null = null;
let dbPath: string | null = null;
function getDb(): DB | null {
  const p = persistPath();
  if (!p) return null;
  if (db && dbPath === p) return db;
  if (db) { try { db.close(); } catch { /* ignore */ } db = null; dbPath = null; }
  try {
    const dir = dirname(p);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
    const d = new Database(p);
    d.pragma('journal_mode = WAL');
    d.exec(
      'CREATE TABLE IF NOT EXISTS store_kv (coll TEXT NOT NULL, id TEXT NOT NULL, seq INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY (coll, id));' +
        'CREATE TABLE IF NOT EXISTS store_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);',
    );
    db = d; dbPath = p;
    return db;
  } catch {
    return null; // 打不开（如损坏文件）→ 回退纯内存种子，不阻断启动
  }
}

interface Snapshot {
  resources: Record<string, { prefix: string; rows: Row[]; counter: number }>;
  cart: CartItem[];
  cartCounter: number;
  addresses: Address[];
  addressCounter: number;
  favorites: Favorite[];
  favoriteCounter: number;
  config: Record<string, unknown>;
  metrics: Metrics;
  seenVisitors: string[];
}
function snapshot(): Snapshot {
  const res: Snapshot['resources'] = {};
  for (const [name, r] of resources) res[name] = { prefix: r.prefix, rows: r.rows, counter: r.counter };
  return { resources: res, cart, cartCounter, addresses, addressCounter, favorites, favoriteCounter, config, metrics, seenVisitors: [...seenVisitors] };
}

/** 落盘到 SQLite（best-effort，事务内整体重写）。无路径时 no-op。 */
function save(): void {
  const d = getDb();
  if (!d) return;
  try {
    const snap = snapshot();
    const ins = d.prepare('INSERT INTO store_kv (coll, id, seq, data) VALUES (?, ?, ?, ?)');
    const meta = d.prepare('INSERT INTO store_meta (k, v) VALUES (?, ?)');
    d.transaction(() => {
      d.prepare('DELETE FROM store_kv').run();
      d.prepare('DELETE FROM store_meta').run();
      for (const [name, r] of Object.entries(snap.resources)) {
        meta.run('counter:' + name, String(r.counter));
        meta.run('prefix:' + name, r.prefix);
        r.rows.forEach((row, i) => ins.run(name, String(row.id), i, JSON.stringify(row)));
      }
      snap.cart.forEach((row, i) => ins.run('__cart', row.id, i, JSON.stringify(row)));
      snap.addresses.forEach((row, i) => ins.run('__addresses', row.id, i, JSON.stringify(row)));
      snap.favorites.forEach((row, i) => ins.run('__favorites', row.id, i, JSON.stringify(row)));
      meta.run('cartCounter', String(snap.cartCounter));
      meta.run('addressCounter', String(snap.addressCounter));
      meta.run('favoriteCounter', String(snap.favoriteCounter));
      meta.run('config', JSON.stringify(snap.config));
      meta.run('metrics', JSON.stringify(snap.metrics));
      meta.run('seenVisitors', JSON.stringify(snap.seenVisitors));
    })();
  } catch {
    /* best-effort：磁盘/DB 问题不应让 API 崩 */
  }
}

/** 从 SQLite 恢复，覆盖内存态。返回 false = 无路径/空库/损坏（调用方回退种子）。 */
function loadFromDisk(): boolean {
  const d = getDb();
  if (!d) return false;
  try {
    const kvCount = (d.prepare('SELECT COUNT(*) AS c FROM store_kv').get() as { c: number }).c;
    const metaCount = (d.prepare('SELECT COUNT(*) AS c FROM store_meta').get() as { c: number }).c;
    if (kvCount === 0 && metaCount === 0) return false; // 空库 → 用种子
    const metaRows = d.prepare('SELECT k, v FROM store_meta').all() as Array<{ k: string; v: string }>;
    const meta = new Map(metaRows.map((m) => [m.k, m.v]));
    const rowsOf = (coll: string): Row[] =>
      (d.prepare('SELECT data FROM store_kv WHERE coll = ? ORDER BY seq').all(coll) as Array<{ data: string }>)
        .map((x) => JSON.parse(x.data) as Row);

    resources.clear();
    for (const name of RESOURCE_NAMES) {
      const rows = rowsOf(name);
      resources.set(name, {
        prefix: meta.get('prefix:' + name) ?? '',
        rows,
        counter: Number(meta.get('counter:' + name) ?? rows.length + 1),
      });
    }
    cart = rowsOf('__cart') as unknown as CartItem[];
    addresses = rowsOf('__addresses') as unknown as Address[];
    favorites = rowsOf('__favorites') as unknown as Favorite[];
    cartCounter = Number(meta.get('cartCounter') ?? 1);
    addressCounter = Number(meta.get('addressCounter') ?? 1);
    favoriteCounter = Number(meta.get('favoriteCounter') ?? 1);
    const cfg = meta.get('config');
    config = cfg ? (JSON.parse(cfg) as Record<string, unknown>) : {};
    const m = meta.get('metrics');
    if (m) metrics = JSON.parse(m) as Metrics;
    const sv = meta.get('seenVisitors');
    seenVisitors = sv ? new Set<string>(JSON.parse(sv) as string[]) : new Set<string>();
    return true;
  } catch {
    return false; // 库损坏 → 回退种子，不阻断启动
  }
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
    let row: Row = { ...data, id };
    if (name === 'products') row = normalizeProduct(row);
    // 统一时间口径（consistency-plan P1#4，加性）：新增补 ISO createdAt + updatedAt，不改既有值
    const nowIso = new Date().toISOString();
    if (row.createdAt === undefined) row.createdAt = nowIso;
    row.updatedAt = nowIso;
    r.rows.unshift(row); // 新增置顶：后台列表/前台都最先看到
    save();
    return row;
  },
  update(name: string, id: string, patch: Record<string, unknown>): Row | undefined {
    const row = res(name).rows.find((x) => x.id === id);
    if (!row) return undefined;
    for (const [k, v] of Object.entries(patch)) {
      if (k !== 'id' && v !== undefined) row[k] = v;
    }
    row.updatedAt = new Date().toISOString(); // 每次写盖 updatedAt（ISO）
    save();
    return row;
  },
  remove(name: string, id: string): boolean {
    const r = res(name);
    const i = r.rows.findIndex((x) => x.id === id);
    if (i < 0) return false;
    r.rows.splice(i, 1);
    // 级联：删商品时同步清出购物车，避免悬挂的购物车行
    if (name === 'products') cart = cart.filter((c) => c.productId !== id);
    save();
    return true;
  },
  /** 分类是否被商品引用（删除前校验，防止商品 cat 变孤儿）*/
  categoryInUse(id: string): number {
    return res('products').rows.filter((p) => p.cat === id).length;
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
  /** 消费端评价：排除后台隐藏(hidden)的，可按商品过滤。 */
  reviewsByProduct(productId?: string): Row[] {
    return res('reviews').rows.filter((r) => r.hidden !== true && (!productId || r.productId === productId));
  },
  config(): Record<string, unknown> {
    return { ...config };
  },
  setConfig(patch: Record<string, unknown>): Record<string, unknown> {
    config = { ...config, ...patch };
    save();
    return { ...config };
  },

  // ---------- 运营埋点（Q15）----------
  /** 记一条埋点事件。type: pageview / driving-switch；visitorId 用于 uv 去重。 */
  trackEvent(type: string, visitorId?: string): Metrics {
    if (type === 'pageview') metrics.pv += 1;
    else if (type === 'driving-switch') metrics.drivingSwitches += 1;
    if (visitorId && !seenVisitors.has(visitorId)) {
      seenVisitors.add(visitorId);
      metrics.uv += 1;
    }
    save();
    return { ...metrics };
  },
  metrics(): Metrics {
    return { ...metrics };
  },

  // ---------- 购物车（真实数据；价格 join 商品现价，单位分）----------
  cartView(): Array<Record<string, unknown>> {
    return cart.map((c) => {
      const p = res('products').rows.find((x) => x.id === c.productId);
      return {
        id: c.id,
        productId: c.productId,
        title: p ? p.title : c.productId,
        img: p ? p.img : '',
        price: p ? (p.price as number) : 0, // 分
        qty: c.qty,
        selected: c.selected,
        spec: c.spec,
        onShelf: p ? p.onShelf === true : false,
      };
    });
  },
  cartAdd(productId: string, qty = 1, spec = '默认规格'): CartItem {
    const exist = cart.find((c) => c.productId === productId && c.spec === spec);
    if (exist) {
      exist.qty += qty;
      save();
      return exist;
    }
    const item: CartItem = { id: `ci-${cartCounter++}`, productId, qty, selected: true, spec };
    cart.unshift(item); // 新加购置顶
    save();
    return item;
  },
  cartUpdate(id: string, patch: { qty?: number | undefined; selected?: boolean | undefined }): CartItem | undefined {
    const it = cart.find((c) => c.id === id);
    if (!it) return undefined;
    if (patch.qty !== undefined) it.qty = Math.max(1, patch.qty);
    if (patch.selected !== undefined) it.selected = patch.selected;
    save();
    return it;
  },
  cartRemove(id: string): boolean {
    const i = cart.findIndex((c) => c.id === id);
    if (i < 0) return false;
    cart.splice(i, 1);
    save();
    return true;
  },
  /** 结算：取已选项，移出购物车，返回结算明细（分） */
  cartCheckout(): { items: Array<{ title: string; price: number; qty: number }>; removed: number } {
    const sel = cart.filter((c) => c.selected);
    const items = sel.map((c) => {
      const p = res('products').rows.find((x) => x.id === c.productId);
      return { title: p ? (p.title as string) : c.productId, price: p ? (p.price as number) : 0, qty: c.qty };
    });
    cart = cart.filter((c) => !c.selected);
    save();
    return { items, removed: sel.length };
  },

  // ---------- 库存（add-inventory-guard）----------
  /** 商品当前库存（缺失/未知商品视为 0）。 */
  productStock(id: string): number {
    const p = res('products').rows.find((x) => x.id === id);
    return typeof p?.stock === 'number' ? (p.stock as number) : 0;
  },
  /** 购物车中某款某规格已有数量（用于加购累计校验）。 */
  cartQty(productId: string, spec: string): number {
    return cart.find((c) => c.productId === productId && c.spec === spec)?.qty ?? 0;
  },
  /**
   * 带库存校验的结算（全有或全无）：
   * 任一选中项 商品缺失/下架/库存<数量 → 返回 { ok:false, insufficient }，不动购物车；
   * 全部满足 → 扣减库存 + 移出已选 + 返回 { ok:true, items, removed }。
   */
  cartCheckoutWithStock():
    | { ok: true; items: Array<{ title: string; price: number; qty: number }>; removed: number }
    | { ok: false; insufficient: Array<{ productId: string; want: number; available: number; reason: string }> } {
    const sel = cart.filter((c) => c.selected);
    const insufficient: Array<{ productId: string; want: number; available: number; reason: string }> = [];
    for (const c of sel) {
      const p = res('products').rows.find((x) => x.id === c.productId);
      if (!p || p.onShelf !== true) {
        insufficient.push({ productId: c.productId, want: c.qty, available: 0, reason: 'PRODUCT_UNAVAILABLE' });
      } else if ((p.stock as number) < c.qty) {
        insufficient.push({ productId: c.productId, want: c.qty, available: (p.stock as number) || 0, reason: 'INSUFFICIENT_STOCK' });
      }
    }
    if (insufficient.length > 0) return { ok: false, insufficient }; // 全有或全无：不动购物车
    const items = sel.map((c) => {
      const p = res('products').rows.find((x) => x.id === c.productId)!;
      p.stock = (p.stock as number) - c.qty; // 扣减库存（售罄归 0）
      return { title: p.title as string, price: p.price as number, qty: c.qty };
    });
    cart = cart.filter((c) => !c.selected);
    save();
    return { ok: true, items, removed: sel.length };
  },

  // ---------- 消费端账号 / 地址簿（add-user）----------
  userByPhone(phone: string): Row | undefined {
    return res('users').rows.find((u) => u.phone === phone);
  },
  /** 首次手机登录自动建号（默认未封禁、零积分余额）。 */
  createUser(data: { phone: string; name?: string }): Row {
    return this.create('users', {
      phone: data.phone,
      name: data.name ?? '新车主',
      points: 0,
      balance: 0,
      banned: false,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  },
  /** 个人资料只读视图（车主自己）。 */
  userProfile(userId: string): Row | undefined {
    const u = res('users').rows.find((x) => x.id === userId);
    if (!u) return undefined;
    return { id: u.id, name: u.name, phone: u.phone, points: u.points ?? 0, balance: u.balance ?? 0 } as Row;
  },
  /** 改资料：仅允许改昵称（手机号是登录标识，不可由此改）。 */
  updateUserName(userId: string, name: string): Row | undefined {
    return this.update('users', userId, { name });
  },
  addressesByUser(userId: string): Address[] {
    return addresses.filter((a) => a.userId === userId);
  },
  addressAdd(userId: string, data: { receiver: string; phone: string; addr: string; isDefault?: boolean | undefined }): Address {
    const first = addresses.filter((a) => a.userId === userId).length === 0;
    const isDefault = data.isDefault === true || first; // 首个地址自动默认
    if (isDefault) addresses.forEach((a) => { if (a.userId === userId) a.isDefault = false; });
    const item: Address = { id: `addr-${addressCounter++}`, userId, receiver: data.receiver, phone: data.phone, addr: data.addr, isDefault };
    addresses.unshift(item);
    save();
    return item;
  },
  addressUpdate(userId: string, id: string, patch: { receiver?: string | undefined; phone?: string | undefined; addr?: string | undefined; isDefault?: boolean | undefined }): Address | undefined {
    const a = addresses.find((x) => x.id === id && x.userId === userId); // 按 userId 隔离
    if (!a) return undefined;
    if (patch.isDefault === true) addresses.forEach((x) => { if (x.userId === userId) x.isDefault = false; }); // 默认互斥
    if (patch.receiver !== undefined) a.receiver = patch.receiver;
    if (patch.phone !== undefined) a.phone = patch.phone;
    if (patch.addr !== undefined) a.addr = patch.addr;
    if (patch.isDefault !== undefined) a.isDefault = patch.isDefault;
    save();
    return a;
  },
  addressRemove(userId: string, id: string): boolean {
    const i = addresses.findIndex((x) => x.id === id && x.userId === userId);
    if (i < 0) return false;
    addresses.splice(i, 1);
    save();
    return true;
  },

  // ---------- 我的：收藏 / 优惠券 / 售后（add-account-extras）----------
  /** 收藏列表（join 商品现状；下架商品标 onShelf=false 仍展示，便于提示失效）。 */
  favoritesByUser(userId: string): Row[] {
    return favorites
      .filter((f) => f.userId === userId)
      .map((f) => {
        const p = res('products').rows.find((x) => x.id === f.productId);
        return { id: f.id, productId: f.productId, title: p?.title ?? f.productId, img: p?.img ?? '', price: (p?.price as number) ?? 0, onShelf: p?.onShelf === true } as Row;
      });
  },
  /** 加收藏（同款幂等，不重复）。返回该收藏行。 */
  favoriteAdd(userId: string, productId: string): Favorite {
    const exist = favorites.find((f) => f.userId === userId && f.productId === productId);
    if (exist) return exist;
    const item: Favorite = { id: `fav-${favoriteCounter++}`, userId, productId };
    favorites.unshift(item);
    save();
    return item;
  },
  /** 取消收藏（按 userId + productId 隔离）。 */
  favoriteRemove(userId: string, productId: string): boolean {
    const i = favorites.findIndex((f) => f.userId === userId && f.productId === productId);
    if (i < 0) return false;
    favorites.splice(i, 1);
    save();
    return true;
  },
  /** 可领优惠券：启用且有剩余库存。 */
  activeCoupons(): Row[] {
    return res('coupons').rows.filter((c) => c.active === true && (c.stock as number) > 0);
  },
  /** 某车主的售后单：经关联订单的 userId 归属（aftersale 自身无 userId）。 */
  aftersaleByUser(userId: string): Row[] {
    const myOrderIds = new Set(res('orders').rows.filter((o) => o.userId === userId).map((o) => o.id));
    return res('aftersale').rows.filter((a) => myOrderIds.has(a.orderId as string));
  },

  // ---------- 消费端履约读取（add-fulfillment；读后台 admin-fulfillment 同源数据）----------
  /** 附近自提点：仅营业，含坐标时按距离升序，最多 limit 个。 */
  nearbyPickupPoints(lat?: number, lng?: number, limit = 5): Row[] {
    let open = res('pickupPoints').rows.filter((p) => p.open === true);
    if (typeof lat === 'number' && typeof lng === 'number') {
      open = [...open].sort((a, b) => dist2(a, lat, lng) - dist2(b, lat, lng));
    }
    return open.slice(0, limit);
  },
  /** 订单物流轨迹（节点按时间倒序展示）。无记录返回 null。 */
  shippingByOrder(orderId: string): Row | undefined {
    const s = res('shipping').rows.find((x) => x.id === orderId);
    if (!s) return undefined;
    const nodes = Array.isArray(s.nodes) ? [...(s.nodes as string[])].reverse() : [];
    return { id: orderId, orderId, trackingNo: s.trackingNo, status: s.status, nodes } as Row;
  },

  reset(): void {
    seedAll();
  },
};

/** 平方欧氏距离（Demo 排序够用，不必精确 haversine）。 */
function dist2(p: Row, lat: number, lng: number): number {
  const dy = (p.lat as number) - lat;
  const dx = (p.lng as number) - lng;
  return dy * dy + dx * dx;
}

/** 后台新增/缺字段的商品补默认值，避免前台渲染成黑块（无图）或报错 */
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23223040'/%3E%3Cstop offset='1' stop-color='%230f1722'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23g)'/%3E%3Cg fill='none' stroke='%235eead4' stroke-width='8' opacity='0.6'%3E%3Crect x='250' y='160' width='100' height='90' rx='10'/%3E%3Cpath d='M270 160 v-16 a30 30 0 0 1 60 0 v16'/%3E%3C/g%3E%3Ctext x='300' y='300' fill='%237c8b9a' font-family='sans-serif' font-size='28' text-anchor='middle'%3EJDO 严选%3C/text%3E%3C/svg%3E";

function normalizeProduct(row: Row): Row {
  const p: Row = { ...row };
  if (!p.img) p.img = PLACEHOLDER_IMG;
  if (typeof p.price === 'string') p.price = Number(p.price) || 0;
  if (typeof p.ori === 'string') p.ori = Number(p.ori) || 0;
  if (p.price === undefined) p.price = 0;
  if (p.ori === undefined) p.ori = 0;
  if (p.sold === undefined) p.sold = 0.1;
  if (p.star === undefined) p.star = 5;
  if (!p.tagKind) p.tagKind = 'mint';
  if (p.onShelf === undefined) p.onShelf = true;
  // 新增商品兜底库存：未填或 <=0 → 默认有货，否则库存校验会把加购/立即购买 409 拦掉（后台可再改 0 表示缺货）
  if (typeof p.stock !== 'number' || (p.stock as number) <= 0) p.stock = 100;
  return p;
}
