// JDO 车机电商后台 · Mock 数据
window.JDO = (function () {
  const CATEGORIES = [
    { id: 'C01', name: '能量补给', icon: 'bolt', sort: 1 },
    { id: 'C02', name: '爱车养护', icon: 'wrench', sort: 2 },
    { id: 'C03', name: '一路吃喝', icon: 'cookie', sort: 3 },
    { id: 'C04', name: '远行出差', icon: 'luggage', sort: 4 },
    { id: 'C05', name: '车内好物', icon: 'car', sort: 5 },
    { id: 'C06', name: '24h救援', icon: 'phone', sort: 6 },
    { id: 'C07', name: '严选好物', icon: 'sparkles', sort: 7 },
  ];

  // 缩略图用纯色 + emoji-free SVG 占位，避免外链
  const swatch = (a, b) => `linear-gradient(135deg, ${a}, ${b})`;
  const PROD_ART = {
    bolt: swatch('#f59e0b', '#b45309'),
    wrench: swatch('#06b6d4', '#0e7490'),
    cookie: swatch('#f43f5e', '#9f1239'),
    luggage: swatch('#3b82f6', '#1e40af'),
    car: swatch('#22c55e', '#15803d'),
    phone: swatch('#a855f7', '#6b21a8'),
    sparkles: swatch('#eab308', '#a16207'),
  };

  const PRODUCTS = [
    ['P10231', '京东京造 100W 车载快充', 'C01', 'bolt', 89, 129, 1200, 3.2, true, '热销'],
    ['P10232', '车载应急启动电源 16000mAh', 'C06', 'phone', 299, 399, 430, 0.8, true, ''],
    ['P10233', '镀晶喷雾 纳米疏水镀膜', 'C02', 'wrench', 59, 99, 860, 1.5, true, '新品'],
    ['P10234', '后备箱折叠收纳箱 大容量', 'C05', 'car', 45, 79, 2400, 5.6, true, ''],
    ['P10235', '能量胶 运动补给 6支装', 'C01', 'bolt', 39, 49, 90, 0.3, false, ''],
    ['P10236', '便携咖啡挂耳 黑咖 20袋', 'C03', 'cookie', 49, 69, 3100, 8.1, true, '回购王'],
    ['P10237', '差旅洗漱包 旅行套装', 'C04', 'luggage', 69, 119, 540, 1.2, true, ''],
    ['P10238', '车载香薰 古龙木质调', 'C05', 'car', 35, 55, 1800, 4.4, true, ''],
    ['P10239', '雨刮精 浓缩去油膜 2瓶', 'C02', 'wrench', 25, 39, 980, 2.7, false, ''],
    ['P10240', '坚果零食大礼包 每日坚果', 'C03', 'cookie', 79, 99, 1340, 3.9, true, ''],
    ['P10241', '便携充气泵 数显胎压', 'C06', 'phone', 159, 229, 670, 1.8, true, '严选'],
    ['P10242', '旅行枕 记忆棉 U型颈枕', 'C04', 'luggage', 55, 89, 420, 0.9, true, ''],
    ['P10243', '玻璃水 -25℃ 防冻 4L', 'C02', 'wrench', 29, 45, 3200, 9.4, true, ''],
    ['P10244', '车载冰箱 12L 制冷制热', 'C05', 'car', 499, 699, 210, 0.5, false, ''],
    ['P10245', '功能饮料 维生素 整箱', 'C01', 'bolt', 88, 108, 760, 2.1, true, ''],
    ['P10246', '一次性马桶垫 出行卫生', 'C04', 'luggage', 19, 29, 1500, 3.3, true, ''],
    ['P10247', '搭电线 纯铜大功率', 'C06', 'phone', 79, 119, 340, 0.7, true, ''],
    ['P10248', '车载纸巾盒 遮阳板挂式', 'C05', 'car', 22, 35, 2700, 6.2, true, ''],
  ].map((r) => ({
    id: r[0], name: r[1], cat: r[2], icon: r[3], price: r[4],
    origPrice: r[5], stock: r[6], sales: r[7], onSale: r[8], tag: r[9],
  }));

  const ORDER_STATUS = {
    pending: { label: '待支付', tone: 'amber' },
    paid: { label: '已支付', tone: 'green' },
    shipping: { label: '配送中', tone: 'cyan' },
    done: { label: '已完成', tone: 'green' },
    canceled: { label: '已取消', tone: 'red' },
    expired: { label: '已过期', tone: 'gray' },
    refunding: { label: '退款中', tone: 'amber' },
    refunded: { label: '已退款', tone: 'gray' },
  };

  const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '黄敏', '周杰', '吴婷', '徐强', '孙丽'];
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rand(a.length)];
  const statusKeys = Object.keys(ORDER_STATUS);

  const ORDERS = Array.from({ length: 24 }).map((_, i) => {
    const itemCount = 1 + rand(3);
    const items = Array.from({ length: itemCount }).map(() => {
      const p = pick(PRODUCTS);
      const qty = 1 + rand(2);
      return { name: p.name, qty, price: p.price, icon: p.icon };
    });
    const amount = items.reduce((s, it) => s + it.price * it.qty, 0);
    const st = i < 3 ? 'pending' : i < 7 ? 'paid' : i < 11 ? 'shipping' : i < 17 ? 'done' : statusKeys[rand(statusKeys.length)];
    const d = new Date(2026, 4, 28 - rand(20), 8 + rand(14), rand(60));
    return {
      id: 'JD' + (20260500000 + 1037 - i),
      user: pick(names),
      items,
      amount,
      status: st,
      channel: Math.random() > 0.45 ? 'car' : 'phone',
      time: `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
  });

  const USERS = Array.from({ length: 16 }).map((_, i) => ({
    id: 'U' + (88200 + i),
    phone: `138****${String(1000 + rand(8999)).slice(0, 4)}`,
    nick: pick(names) + (Math.random() > 0.6 ? '的车' : ''),
    points: rand(9000),
    balance: (rand(50000) / 100),
    banned: Math.random() > 0.85,
  }));

  const COUPONS = [
    { id: 'CP01', name: '新人首单立减', type: '满减', value: 20, threshold: 99, left: 3200, on: true },
    { id: 'CP02', name: '能量补给 8折', type: '折扣', value: 0.8, threshold: 0, left: 1500, on: true },
    { id: 'CP03', name: '满199减30', type: '满减', value: 30, threshold: 199, left: 870, on: true },
    { id: 'CP04', name: '养护专享 9折', type: '折扣', value: 0.9, threshold: 50, left: 0, on: false },
    { id: 'CP05', name: '远行出差满100减15', type: '满减', value: 15, threshold: 100, left: 2400, on: true },
    { id: 'CP06', name: '严选好物 85折', type: '折扣', value: 0.85, threshold: 0, left: 640, on: false },
  ];

  const BANNERS = [
    { id: 'B01', title: '一键满电 出发无忧', sub: '车载快充全场低至 5 折', color: 'blue', on: true },
    { id: 'B02', title: '爱车焕新季', sub: '镀晶 / 玻璃水 / 雨刮 满减', color: 'emerald', on: true },
    { id: 'B03', title: '远行补给站', sub: '出差差旅好物一站备齐', color: 'blue', on: false },
    { id: 'B04', title: '24h 道路救援', sub: '应急电源 · 搭电线 · 充气泵', color: 'emerald', on: true },
  ];

  const RECOS = [
    { id: 'R01', tag: '热销', title: '车载快充', sub: '出门必备', target: 'C01', on: true },
    { id: 'R02', tag: '新品', title: '车内好物', sub: '提升驾乘体验', target: 'C05', on: true },
    { id: 'R03', tag: '严选', title: '应急救援', sub: '关键时刻不掉链', target: 'C06', on: false },
  ];

  const ACCOUNTS = [
    { id: 'A001', account: 'admin@jdo', role: '超管' },
    { id: 'A002', account: 'yunying01@jdo', role: '运营' },
    { id: 'A003', account: 'yunying02@jdo', role: '运营' },
    { id: 'A004', account: 'kefu01@jdo', role: '客服' },
    { id: 'A005', account: 'caiwu01@jdo', role: '财务' },
  ];

  const KPI = [
    { label: 'PV 浏览量', value: 184320, fmt: 'int', delta: 12.4 },
    { label: 'UV 访客数', value: 42870, fmt: 'int', delta: 8.1 },
    { label: '订单总数', value: 3642, fmt: 'int', delta: 5.6 },
    { label: 'GMV', value: 486200, fmt: 'money', delta: 9.3 },
    { label: '车机入口订单', value: 2104, fmt: 'int', delta: 14.2 },
    { label: '手机入口订单', value: 1538, fmt: 'int', delta: -2.1 },
    { label: '行车态切换次数', value: 9821, fmt: 'int', delta: 3.4 },
    { label: '客单价', value: 13350, fmt: 'money', delta: 1.8 },
  ];

  // 30 天 GMV 趋势
  const TREND = Array.from({ length: 30 }).map((_, i) => {
    const base = 12000 + Math.sin(i / 3) * 3000 + i * 220;
    return Math.round(base + (Math.random() - 0.5) * 2600);
  });

  const TODOS = [
    { t: '待审核售后单', n: 7, tone: 'amber' },
    { t: '待发货订单', n: 23, tone: 'cyan' },
    { t: '库存预警商品', n: 4, tone: 'red' },
    { t: '待回复评价', n: 12, tone: 'blue' },
  ];

  return {
    CATEGORIES, PRODUCTS, ORDERS, ORDER_STATUS, USERS, COUPONS,
    BANNERS, RECOS, ACCOUNTS, KPI, TREND, TODOS, PROD_ART,
    catName: (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || '—',
  };
})();
