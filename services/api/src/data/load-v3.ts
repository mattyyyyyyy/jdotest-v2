/**
 * 从消费端 V3 原型的 data.js 加载种子数据 —— 单一真相，不重复抄 60+ 商品。
 * data.js 形如 `window.JDO_DATA = (function(){...})()`，用 vm 跑一遍取出。
 * 给 product 补上后台需要的 stock / onShelf 字段。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export interface V3Category {
  id: string;
  name: string;
  icon: string;
  sort?: number;
}
export interface V3Product {
  id: string;
  cat: string;
  img: string;
  title: string;
  price: number;
  ori: number;
  tag?: string;
  tagKind?: string;
  sold?: number;
  star?: number;
  stock: number;
  onShelf: boolean;
}
export interface V3Banner {
  id: string;
  tone: string;
  title: string;
  sub: string;
  img: string;
  active: boolean;
}
export interface V3HeroRec {
  id: string;
  kind: string;
  icon: string;
  tag: string;
  title: string;
  sub: string;
  items: string[];
  cta: string;
  tone: string;
  navScene: string;
  active: boolean;
}

interface RawData {
  categories: Array<Omit<V3Category, 'sort'>>;
  products: Array<Omit<V3Product, 'stock' | 'onShelf'>>;
  banners: Array<Omit<V3Banner, 'active'>>;
  heroRecs: Array<Omit<V3HeroRec, 'active'>>;
}

export function loadV3Data(): {
  categories: V3Category[];
  products: V3Product[];
  banners: V3Banner[];
  heroRecs: V3HeroRec[];
} {
  const dataPath = fileURLToPath(new URL('../../../../mockups/jdo-pencil-v3/data.js', import.meta.url));
  const code = readFileSync(dataPath, 'utf8');
  const sandbox: { window: { JDO_DATA?: RawData } } = { window: {} };
  vm.runInNewContext(code, sandbox, { timeout: 2000 });
  const raw = sandbox.window.JDO_DATA;
  if (!raw) throw new Error('无法从 V3 data.js 读取 JDO_DATA');

  return {
    categories: raw.categories.map((c, i) => ({ ...c, sort: i + 1 })),
    // 给商品补库存（按销量粗略给）+ 默认上架
    products: raw.products.map((p) => ({
      ...p,
      stock: Math.max(10, Math.round((p.sold ?? 1) * 100)),
      onShelf: true,
    })),
    banners: raw.banners.map((b) => ({ ...b, active: true })),
    heroRecs: raw.heroRecs.map((h) => ({ ...h, active: true })),
  };
}
