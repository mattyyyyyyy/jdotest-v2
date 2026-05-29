/**
 * 后台相关实体的样例种子（这些不在 V3 data.js 里，单独造样例）。
 * 用于演示「每个 V3 界面背后的数据都有后台管理」。
 */

export interface User {
  id: string;
  phone: string;
  name: string;
  points: number;
  balance: number; // 钱包余额（分）
  banned: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string; // 复用 order-state-machine 的 OrderState
  totalAmount: number; // 分
  itemTitles: string[];
  createdAt: string;
  channel: 'car' | 'phone'; // 车机 vs 手机入口（PRD US-39）
}

export interface Coupon {
  id: string;
  name: string;
  type: 'fixed' | 'discount';
  amount: number; // fixed=减多少分；discount=折扣 *100（85=8.5折）
  threshold: number; // 满多少分可用
  stock: number;
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  star: number;
  text: string;
  hidden: boolean;
  createdAt: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  open: boolean;
}

export interface AftersaleTicket {
  id: string;
  orderId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ShippingTrack {
  orderId: string;
  trackingNo: string;
  status: string;
  nodes: string[];
}

export interface AdminUser {
  id: string;
  account: string;
  role: '超管' | '运营' | '客服' | '财务';
}

export const users: User[] = [
  { id: 'u-1001', phone: '138****0001', name: '车主小李', points: 1200, balance: 5000, banned: false, createdAt: '2026-04-01' },
  { id: 'u-1002', phone: '139****0002', name: '车主老王', points: 380, balance: 0, banned: false, createdAt: '2026-04-12' },
  { id: 'u-1003', phone: '137****0003', name: '副驾小张', points: 60, balance: 12800, banned: true, createdAt: '2026-05-02' },
];

export const orders: Order[] = [
  { id: 'o-20001', userId: 'u-1001', status: 'PAID', totalAmount: 9700, itemTitles: ['中石化 95# 加油 ¥100 油卡'], createdAt: '2026-05-20', channel: 'car' },
  { id: 'o-20002', userId: 'u-1001', status: 'SHIPPING', totalAmount: 29900, itemTitles: ['便携应急启动电源 1500A'], createdAt: '2026-05-22', channel: 'phone' },
  { id: 'o-20003', userId: 'u-1002', status: 'PENDING_PAYMENT', totalAmount: 3390, itemTitles: ['瑞幸 4 杯豆桶套餐'], createdAt: '2026-05-26', channel: 'car' },
  { id: 'o-20004', userId: 'u-1003', status: 'COMPLETED', totalAmount: 19800, itemTitles: ['24h 拖车救援 100km'], createdAt: '2026-05-18', channel: 'car' },
];

export const coupons: Coupon[] = [
  { id: 'cp-1', name: '车主权益日 满200减30', type: 'fixed', amount: 3000, threshold: 20000, stock: 500, active: true },
  { id: 'cp-2', name: '充电 95 折', type: 'discount', amount: 95, threshold: 0, stock: 9999, active: true },
  { id: 'cp-3', name: '新人首单减10', type: 'fixed', amount: 1000, threshold: 5000, stock: 0, active: false },
];

export const reviews: Review[] = [
  { id: 'rv-1', productId: 'e4', userId: 'u-1001', star: 5, text: '玻璃水很好用，冬天不结冰', hidden: false, createdAt: '2026-05-21' },
  { id: 'rv-2', productId: 'c1', userId: 'u-1002', star: 4, text: '上门洗车师傅准时', hidden: false, createdAt: '2026-05-23' },
  { id: 'rv-3', productId: 'g2', userId: 'u-1003', star: 1, text: '广告刷屏差评（待审核隐藏）', hidden: true, createdAt: '2026-05-24' },
];

export const pickupPoints: PickupPoint[] = [
  { id: 'pp-1', name: '张江服务区自提点', address: '浦东新区张江高速服务区', lat: 31.2, lng: 121.6, hours: '06:00-23:00', open: true },
  { id: 'pp-2', name: '虹桥枢纽自提柜', address: '闵行区虹桥火车站 B2', lat: 31.19, lng: 121.32, hours: '24h', open: true },
  { id: 'pp-3', name: '亚朵浦东店自提', address: '浦东新区张江路 88 号', lat: 31.21, lng: 121.59, hours: '08:00-22:00', open: false },
];

export const aftersale: AftersaleTicket[] = [
  { id: 'as-1', orderId: 'o-20004', reason: '救援未及时到达，申请退款', status: 'pending', createdAt: '2026-05-25' },
];

export const shipping: ShippingTrack[] = [
  { orderId: 'o-20002', trackingNo: 'SF1234567890', status: '运输中', nodes: ['已揽收 上海', '到达 浦东分拨中心', '运输中'] },
];

export const banners_extra: never[] = []; // banner 来自 V3 data.js

export const adminUsers: AdminUser[] = [
  { id: 'a-1', account: 'admin', role: '超管' },
  { id: 'a-2', account: 'ops01', role: '运营' },
  { id: 'a-3', account: 'cs01', role: '客服' },
];

export const config = {
  drivingSpeedThreshold: 5, // km/h 进入行车态
  drivingExitSeconds: 3, // 停车持续秒数退出
  degradeBannerInDriving: true,
};
