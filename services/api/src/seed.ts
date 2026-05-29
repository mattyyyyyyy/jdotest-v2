/**
 * Demo 阶段内存种子数据（薄切片，先不接 PG/Prisma）。
 * 分类对齐 ADR-0009 的 7 类用车场景。后续由 admin-catalog 或 Prisma seed 取代。
 */

export interface Category {
  id: string;
  name: string;
  sort: number;
}

export interface Product {
  id: string;
  title: string;
  categoryId: string;
  price: number; // 单位：分
  stock: number;
  image: string;
  onShelf: boolean; // 是否上架（后台可切；前台只展示已上架）
}

/** ADR-0009 锁定的 7 类场景型一级分类 */
export const categories: Category[] = [
  { id: 'energy', name: '能量补给', sort: 1 },
  { id: 'care', name: '爱车养护', sort: 2 },
  { id: 'food', name: '一路吃喝', sort: 3 },
  { id: 'travel', name: '远行出差', sort: 4 },
  { id: 'goods', name: '车内好物', sort: 5 },
  { id: 'rescue', name: '24h 救援', sort: 6 },
  { id: 'select', name: '严选好物', sort: 7 },
];

export const products: Product[] = [
  { id: 'p-001', title: '玻璃水 -25℃ 防冻 2L', categoryId: 'care', price: 2900, stock: 120, image: '/img/p-001.jpg', onShelf: true },
  { id: 'p-002', title: '车载充电器 65W 双口', categoryId: 'goods', price: 9900, stock: 60, image: '/img/p-002.jpg', onShelf: true },
  { id: 'p-003', title: '车载香薰 木质调', categoryId: 'goods', price: 4900, stock: 200, image: '/img/p-003.jpg', onShelf: true },
  { id: 'p-004', title: '充电桩快充券 60kWh', categoryId: 'energy', price: 19900, stock: 999, image: '/img/p-004.jpg', onShelf: true },
  { id: 'p-005', title: '便携咖啡 速溶 12 条', categoryId: 'food', price: 3900, stock: 300, image: '/img/p-005.jpg', onShelf: true },
  { id: 'p-006', title: '应急搭电宝 12V', categoryId: 'rescue', price: 29900, stock: 35, image: '/img/p-006.jpg', onShelf: true },
  { id: 'p-007', title: '长途颈枕 记忆棉', categoryId: 'travel', price: 6900, stock: 80, image: '/img/p-007.jpg', onShelf: true },
  { id: 'p-008', title: '严选车规级行车记录仪', categoryId: 'select', price: 39900, stock: 25, image: '/img/p-008.jpg', onShelf: true },
];
