/**
 * 内存数据 store —— 前台与后台共享的同一份数据（Demo 阶段，未接 DB）。
 *
 * 这就是"前后台数据同步"的关键：consumer 读接口和 admin 写接口
 * 操作的是同一个 products 数组。后台写 → 前台立刻读到。
 * 真实实现会把这层换成 Prisma + PostgreSQL，但接口语义不变。
 */

import { products as seedProducts, categories, type Product, type Category } from './seed.js';

export interface ProductCreateInput {
  title: string;
  categoryId: string;
  price: number;
  stock?: number | undefined;
  image?: string | undefined;
  onShelf?: boolean | undefined;
  id?: string | undefined;
}

export interface ProductPatch {
  title?: string | undefined;
  price?: number | undefined;
  stock?: number | undefined;
  onShelf?: boolean | undefined;
}

// 从种子拷一份可变副本（避免直接改 seed 常量）
let products: Product[] = seedProducts.map((p) => ({ ...p }));
let nextId = products.length + 1;

export const store = {
  categories(): Category[] {
    return [...categories].sort((a, b) => a.sort - b.sort);
  },

  /** 前台用：只看已上架 */
  listOnShelf(categoryId?: string): Product[] {
    return products.filter((p) => p.onShelf && (!categoryId || p.categoryId === categoryId));
  },

  /** 后台用：看全部（含下架） */
  listAll(): Product[] {
    return [...products];
  },

  find(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  },

  /** 后台：新增商品（默认上架） */
  create(input: ProductCreateInput): Product {
    const id = input.id ?? `p-${String(nextId++).padStart(3, '0')}`;
    const product: Product = {
      id,
      title: input.title,
      categoryId: input.categoryId,
      price: input.price,
      stock: input.stock ?? 0,
      image: input.image ?? `/img/${id}.jpg`,
      onShelf: input.onShelf ?? true,
    };
    products.push(product);
    return product;
  },

  /** 后台：改商品（价格 / 库存 / 标题 / 上下架）。忽略值为 undefined 的字段。 */
  update(id: string, patch: ProductPatch): Product | undefined {
    const p = products.find((x) => x.id === id);
    if (!p) return undefined;
    if (patch.title !== undefined) p.title = patch.title;
    if (patch.price !== undefined) p.price = patch.price;
    if (patch.stock !== undefined) p.stock = patch.stock;
    if (patch.onShelf !== undefined) p.onShelf = patch.onShelf;
    return p;
  },

  /** 测试用：重置回种子态 */
  reset(): void {
    products = seedProducts.map((p) => ({ ...p }));
    nextId = products.length + 1;
  },
};

export type { Product, Category };
