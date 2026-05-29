// Shared data for the mall: 7 scenes + rich products (60+ items).
// Images are public Unsplash photo URLs.

window.JDO_DATA = (function () {
  const u = (id, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

  // ─── 7 大场景（一级菜单）─────────────────────────────────────
  const categories = [
    { id: 'energy', name: '能量补给',  icon: 'bolt' },
    { id: 'care',   name: '爱车养护',  icon: 'wrench' },
    { id: 'eat',    name: '一路吃喝',  icon: 'cookie' },
    { id: 'trip',   name: '远行出差',  icon: 'luggage' },
    { id: 'gear',   name: '车内好物',  icon: 'car' },
    { id: 'sos',    name: '24h 救援',  icon: 'phone' },
    { id: 'select', name: '严选好物',  icon: 'sparkles' },
  ];

  // For backward compat — favorites screen filter chips still reference these
  const products = [
    // ───── 能量补给 energy（加油 + 充电 + 玻璃水 + 车充 + 油卡）─────
    { id: 'e1', cat: 'energy', img: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23E60012'/%3E%3Cpath d='M30 65 C30 45 50 35 50 50 C50 35 70 45 70 65 L70 72 C70 55 50 45 50 58 C50 45 30 55 30 72Z' fill='white'/%3E%3C/svg%3E", title: '中石化 95# 加油 ¥100 油卡',                       price: 97.0,  ori: 100, tag: '车主直降 3%', tagKind: 'mint',   sold: 24.6, star: 4.9 },
    { id: 'e2', cat: 'energy', img: u('photo-1593941707882-a5bba14938c7'), title: '特来电充电桩 月度无限卡',                          price: 88.0,  ori: 168, tag: '充电 95 折', tagKind: 'mint',     sold: 5.2,  star: 4.8 },
    { id: 'e3', cat: 'energy', img: u('photo-1648412781131-e5cdbf7a5a02'), title: '国家电网车主月卡 · 全国通用',                       price: 188,   ori: 268, tag: '车厂联名', tagKind: 'cyan',       sold: 1.8,  star: 4.7 },
    { id: 'e4', cat: 'energy', img: u('photo-1607860108855-64acf2078ed9'), title: '玻璃水四季通用 防冻除胶 6 瓶/箱',                  price: 29.9,  ori: 59,  tag: '车主必备', tagKind: 'mint',       sold: 3.4,  star: 4.8 },
    { id: 'e5', cat: 'energy', img: u('photo-1597844808531-72732dee06d4'), title: 'PD 100W 车载快充 双口 type-c',                     price: 79.0,  ori: 129, tag: '新品', tagKind: 'cyan',            sold: 0.8,  star: 4.7 },
    { id: 'e6', cat: 'energy', img: u('photo-1593642634367-d91a135587b5'), title: '车载磁吸无线充 15W 桌面立架',                       price: 119,   ori: 199, tag: '热销', tagKind: 'gold',           sold: 1.5,  star: 4.7 },
    { id: 'e7', cat: 'energy', img: u('photo-1565043666747-69f6646db940'), title: '中石油加油充值卡 ¥500 装 立返 12 元',               price: 488,   ori: 500, tag: '充值返现', tagKind: 'gold',       sold: 18.2, star: 4.9 },
    { id: 'e8', cat: 'energy', img: u('photo-1611273426858-450d8e3c9fce'), title: '冬季-25°C 防冻玻璃水 4L 单瓶装',                    price: 19.9,  ori: 39,  tag: '冬季款', tagKind: 'red',          sold: 4.8,  star: 4.8 },
    { id: 'e9', cat: 'energy', img: u('photo-1558389186-438424b00a13'),    title: '便携应急启动电源 1500A 大功率',                     price: 399,   ori: 599, tag: '黑科技', tagKind: 'cyan',         sold: 0.6,  star: 4.7 },

    // ───── 爱车养护 care（洗车 + 保养 + 脚垫 + 清洁 + 香氛）─────
    { id: 'c1', cat: 'care', img: u('photo-1605559424843-9e4c228bf1c2'),  title: '上门洗车 · 标准外洗一次',                          price: 35.0,  ori: 49,  tag: '60 分钟达', tagKind: 'mint',      sold: 12.4, star: 4.9 },
    { id: 'c2', cat: 'care', img: u('photo-1492144534655-ae79c964c9d7'),  title: '京东养车 · 内饰深度清洁',                          price: 268,   ori: 388, tag: '黄金车主直减', tagKind: 'gold',    sold: 0.7,  star: 4.8 },
    { id: 'c3', cat: 'care', img: u('photo-1542362567-b07e54358753'),    title: '镀晶套餐 · 标准车型 · 含工时',                     price: 1280,  ori: 1880,tag: '12 个月质保', tagKind: 'cyan',     sold: 0.3,  star: 4.9 },
    { id: 'c4', cat: 'care', img: u('photo-1503376780353-7e6692767b70'),  title: '小保养套餐 · 机油 + 机滤 + 工时',                  price: 399,   ori: 588, tag: '原厂正品', tagKind: 'mint',       sold: 0.9,  star: 4.8 },
    { id: 'c5', cat: 'care', img: u('photo-1492144534655-ae79c964c9d7'),  title: '全包围 TPE 汽车脚垫 易清洁防滑',                   price: 268,   ori: 498, tag: '热销', tagKind: 'gold',           sold: 1.6,  star: 4.9 },
    { id: 'c6', cat: 'care', img: u('photo-1605559424843-9e4c228bf1c2'),  title: '车载迷你吸尘器 大吸力无线 60W',                    price: 99.0,  ori: 199, tag: '会员', tagKind: 'gold',           sold: 2.1,  star: 4.7 },
    { id: 'c7', cat: 'care', img: u('photo-1583947215259-38e31be8751f'),  title: '香氛挂件 持久车内家居两用 法式调',                price: 35.0,  ori: 69,  tag: '车上香薰', tagKind: 'cyan',       sold: 1.0,  star: 4.6 },
    { id: 'c8', cat: 'care', img: u('photo-1568849676085-51415703900f'),  title: '车漆抛光蜡 50ml 鸳鸯款 含海绵',                     price: 49.0,  ori: 89,  tag: '车主必备', tagKind: 'mint',      sold: 2.6,  star: 4.7 },
    { id: 'c9', cat: 'care', img: u('photo-1525498128493-380d1990a112'),  title: '原厂同款喷雾型轮胎养护剂 600ml',                   price: 39.0,  ori: 69,  tag: '日用', tagKind: 'mint',           sold: 3.8,  star: 4.8 },

    // ───── 一路吃喝 eat（盒饭 + 咖啡 + 茶 + 坚果 + 巧克力 + 牛肉干）─────
    { id: 'f1', cat: 'eat', img: u('photo-1565895405127-481853366cf8'),  title: '老乡鸡速达便餐 ¥ 35 套餐',                          price: 32.0,  ori: 35,  tag: '30 分钟到车', tagKind: 'red',      sold: 16.8, star: 4.7 },
    { id: 'f2', cat: 'eat', img: u('photo-1517248135467-4c7edcad34c4'),  title: '瑞幸 · 4 杯豆桶套餐 · 自提',                        price: 33.9,  ori: 56,  tag: '到店即取', tagKind: 'mint',       sold: 22.1, star: 4.9 },
    { id: 'f3', cat: 'eat', img: u('photo-1551024601-bec78aea704b'),    title: '麦当劳早餐 · 油条 + 豆浆 + 鸡蛋',                  price: 19.0,  ori: 28,  tag: '早间限时', tagKind: 'cyan',       sold: 8.5,  star: 4.8 },
    { id: 'f4', cat: 'eat', img: u('photo-1556909114-f6e7ad7d3136'),    title: '霸王茶姬 · 杨枝甘露 + 蜜雪柠檬 双拼',                price: 36.0,  ori: 42,  tag: '车主券立减', tagKind: 'mint',     sold: 4.4,  star: 4.8 },
    { id: 'f5', cat: 'eat', img: u('photo-1606312619070-d48b4c652a52'),  title: '每日坚果混合装 25g×30 包 营养零食',                price: 69.0,  ori: 129, tag: '车上零食', tagKind: 'mint',       sold: 8.2,  star: 4.9 },
    { id: 'f6', cat: 'eat', img: u('photo-1481391319762-47dff72954d9'),  title: '黑巧克力 70% 可可 100g × 4 块',                     price: 49.9,  ori: 89,  tag: '热销', tagKind: 'gold',           sold: 3.0,  star: 4.8 },
    { id: 'f7', cat: 'eat', img: u('photo-1559056199-641a0ac8b55e'),    title: '原产地咖啡豆 中度烘焙 500g',                        price: 99.0,  ori: 158, tag: '会员', tagKind: 'gold',           sold: 1.4,  star: 4.7 },
    { id: 'f8', cat: 'eat', img: u('photo-1571997478779-2adcbbe9ab2f'),  title: '潮汕牛肉干 原切风干 麻辣味 250g',                  price: 79.0,  ori: 129, tag: '秒杀', tagKind: 'red',            sold: 2.2,  star: 4.8 },
    { id: 'f9', cat: 'eat', img: u('photo-1551024601-bec78aea704b'),    title: '手工法式马卡龙 12 枚礼盒装',                        price: 89.0,  ori: 149, tag: '新品', tagKind: 'cyan',           sold: 1.1,  star: 4.5 },
    { id: 'f10',cat: 'eat', img: u('photo-1559181567-c3190ca9959b'),    title: '冷压初榨橄榄油 750ml 礼盒装',                        price: 129,   ori: 199, tag: '送礼', tagKind: 'cyan',           sold: 0.6,  star: 4.6 },

    // ───── 远行出差 trip（机票 + 酒店 + ETC + 行李箱 + 保温壶 + 颈枕）─────
    { id: 't1', cat: 'trip', img: u('photo-1436491865332-7a61a109cc05'), title: '上海 ⇌ 北京 · 春秋航空特价',                        price: 480,   ori: 920, tag: '今日 15:30', tagKind: 'red',      sold: 0.4,  star: 4.6 },
    { id: 't2', cat: 'trip', img: u('photo-1564501049412-61c2a3083791'), title: '亚朵酒店 · 浦东张江 · 标准大床',                    price: 488,   ori: 698, tag: '今晚仅余 3 间', tagKind: 'red',    sold: 1.2,  star: 4.8 },
    { id: 't3', cat: 'trip', img: u('photo-1505373877841-8d25f7d46678'), title: '全国高速 ETC · 车主联名免审',                       price: 0,     ori: 0,   tag: '0 元开卡', tagKind: 'mint',       sold: 32.6, star: 4.9 },
    { id: 't4', cat: 'trip', img: u('photo-1488521787991-ed7bbaae773c'), title: '机场停车券 · 浦东 T2 · 24h',                        price: 38,    ori: 78,  tag: '出行必备', tagKind: 'cyan',       sold: 2.8,  star: 4.7 },
    { id: 't5', cat: 'trip', img: u('photo-1553062407-98eeb64c6a62'),  title: '20 寸登机箱 静音万向轮 PC 材质',                     price: 399,   ori: 699, tag: '限时', tagKind: 'red',           sold: 0.8,  star: 4.7 },
    { id: 't6', cat: 'trip', img: u('photo-1581605405669-fcdf81165afa'), title: '便携保温壶 24h 保温 大容量 700ml',                   price: 129,   ori: 199, tag: '车上', tagKind: 'mint',          sold: 1.5,  star: 4.8 },
    { id: 't7', cat: 'trip', img: u('photo-1473625247510-8ceb1760943f'), title: '记忆棉颈枕 · 便携可压缩 + 眼罩',                    price: 79,    ori: 139, tag: '车主推荐', tagKind: 'mint',      sold: 1.8,  star: 4.7 },
    { id: 't8', cat: 'trip', img: u('photo-1502920917128-1aa500764cbd'), title: '5 万毫安 PD 22.5W 充电宝 · 飞机可带',               price: 168,   ori: 269, tag: '差旅必备', tagKind: 'cyan',     sold: 1.1,  star: 4.6 },
    { id: 't9', cat: 'trip', img: u('photo-1565008447742-97f6f38c985c'), title: '差旅西装收纳袋 · 防皱 4 件套',                       price: 99,    ori: 169, tag: '热销', tagKind: 'gold',           sold: 0.7,  star: 4.6 },

    // ───── 车内好物 gear（香薰 + 记录仪 + HUD + 太阳镜 + 蓝牙 + 吸尘器）─────
    { id: 'g1', cat: 'gear', img: u('photo-1503376780353-7e6692767b70'),  title: '车载香薰 持久车内固体香膏 木香调',                  price: 39.0,  ori: 89,  tag: '秒杀', tagKind: 'red',            sold: 1.2,  star: 4.9 },
    { id: 'g2', cat: 'gear', img: u('photo-1542362567-b07e54358753'),    title: '4K 行车记录仪 前后双录 夜视增强',                  price: 599,   ori: 899, tag: '限时', tagKind: 'red',            sold: 0.5,  star: 4.6 },
    { id: 'g3', cat: 'gear', img: u('photo-1625948515291-69613efd103f'),  title: 'AR 增强 HUD 抬头显示 即插即用',                     price: 458,   ori: 698, tag: '黑科技', tagKind: 'cyan',         sold: 0.4,  star: 4.5 },
    { id: 'g4', cat: 'gear', img: u('photo-1572635196237-14b3f281503f'),  title: '偏光太阳镜 开车防紫外线 男女款',                    price: 159,   ori: 299, tag: '驾驶必备', tagKind: 'mint',      sold: 2.0,  star: 4.7 },
    { id: 'g5', cat: 'gear', img: u('photo-1546435770-a3e426bf472b'),   title: '主动降噪蓝牙耳机 入耳式无线运动通话',              price: 199,   ori: 399, tag: '直降 50%', tagKind: 'red',        sold: 5.2,  star: 4.8 },
    { id: 'g6', cat: 'gear', img: u('photo-1608043152269-423dbba4e7e1'),  title: '便携蓝牙音箱 IPX7 防水 户外大音量',                  price: 249,   ori: 349, tag: '新品', tagKind: 'cyan',           sold: 0.9,  star: 4.6 },
    { id: 'g7', cat: 'gear', img: u('photo-1572569511254-d8f925fe2cbb'),  title: '10000mAh 磁吸无线快充充电宝 PD 22.5W',               price: 129,   ori: 199, tag: '车机配套', tagKind: 'mint',     sold: 1.8,  star: 4.7 },
    { id: 'g8', cat: 'gear', img: u('photo-1581094271901-8022df4466f9'),  title: '车载后视镜 防眩光 流媒体 高清',                     price: 459,   ori: 798, tag: '车主优选', tagKind: 'gold',     sold: 0.6,  star: 4.7 },
    { id: 'g9', cat: 'gear', img: u('photo-1493238792000-8113da705763'),  title: '车载座椅腰托 4D 记忆棉 久坐神器',                   price: 89,    ori: 169, tag: '舒适', tagKind: 'mint',           sold: 2.4,  star: 4.8 },

    // ───── 24h 救援 sos（拖车 + 搭电 + 换胎 + 救援卡 + 工具箱 + 三角警示）─────
    { id: 's1', cat: 'sos', img: u('photo-1494976388531-d1058494cdd8'),  title: '24h 拖车救援 · 100 km 内一次',                      price: 198,   ori: 388, tag: '车主必备', tagKind: 'mint',      sold: 4.6,  star: 4.9 },
    { id: 's2', cat: 'sos', img: u('photo-1605559424843-9e4c228bf1c2'),  title: '搭电服务 · 30 分钟上门',                              price: 68,    ori: 128, tag: '24h', tagKind: 'red',             sold: 2.4,  star: 4.8 },
    { id: 's3', cat: 'sos', img: u('photo-1581094271901-8022df4466f9'),  title: '换胎服务 · 含轮胎平衡 + 工时',                       price: 98,    ori: 158, tag: '到店免预约', tagKind: 'cyan',    sold: 1.2,  star: 4.7 },
    { id: 's4', cat: 'sos', img: u('photo-1556909114-d8bb6cd6dde7'),    title: '车主道路救援年卡 · 全险一站式',                       price: 268,   ori: 488, tag: '年度', tagKind: 'gold',          sold: 0.8,  star: 4.8 },
    { id: 's5', cat: 'sos', img: u('photo-1623787064265-13c41efb5be9'),  title: '应急工具箱 · 含搭电线 + 拖车带',                     price: 168,   ori: 248, tag: '常备', tagKind: 'mint',          sold: 1.6,  star: 4.7 },
    { id: 's6', cat: 'sos', img: u('photo-1581094272013-cda3e90c2dd5'),  title: '车载三角警示牌 + 反光衣套装',                          price: 35,    ori: 69,  tag: '安全合规', tagKind: 'cyan',     sold: 2.2,  star: 4.8 },
    { id: 's7', cat: 'sos', img: u('photo-1559234938-b60fff04894d'),    title: '便携应急锤 + 切割带  二合一',                          price: 25,    ori: 49,  tag: '必备', tagKind: 'red',           sold: 3.4,  star: 4.9 },
    { id: 's8', cat: 'sos', img: u('photo-1530036846422-fd2fbf78e4ce'),  title: '智能胎压检测仪 4 路无线监测',                          price: 199,   ori: 359, tag: '推荐', tagKind: 'mint',          sold: 0.9,  star: 4.7 },
    { id: 's9', cat: 'sos', img: u('photo-1605559424843-9e4c228bf1c2'),  title: '车载灭火器 · 1 kg 干粉 国标认证',                      price: 79,    ori: 139, tag: '合规', tagKind: 'gold',          sold: 1.8,  star: 4.8 },

    // ───── 严选好物 select（数码 / 食品 / 生活 / 服饰 / 运动 / 图书 / 母婴）─────
    { id: 'x1',  cat: 'select', img: u('photo-1593642632559-0c6d3fc62b89'), title: 'USB-C 编织数据线 60W 1.5m 三色可选',               price: 19.9,  ori: 49,  tag: '凑单', tagKind: 'mint',          sold: 4.5,  star: 4.9 },
    { id: 'x2',  cat: 'select', img: u('photo-1505740420928-5e560c06d30e'), title: '一年保修 入耳式有线耳机 高保真',                    price: 39,    ori: 79,  tag: '低价', tagKind: 'mint',          sold: 2.6,  star: 4.7 },
    { id: 'x3',  cat: 'select', img: u('photo-1556228852-80b6e5eeff06'),  title: '三层抽纸 4 层加厚 27 包整箱 家庭装',                  price: 39.9,  ori: 69,  tag: '日用', tagKind: 'mint',          sold: 6.6,  star: 4.9 },
    { id: 'x4',  cat: 'select', img: u('photo-1571781926291-c477ebfd024b'), title: '声波电动牙刷 IPX7 防水 4 刷头',                      price: 199,   ori: 399, tag: '直降', tagKind: 'red',           sold: 2.4,  star: 4.7 },
    { id: 'x5',  cat: 'select', img: u('photo-1556228720-195a672e8a03'),  title: '氨基酸洗发水 控油蓬松 500ml',                          price: 49.9,  ori: 99,  tag: '回购', tagKind: 'gold',          sold: 3.8,  star: 4.8 },
    { id: 'x6',  cat: 'select', img: u('photo-1542291026-7eec264c27ff'),  title: '休闲运动鞋 透气网面 男女同款',                         price: 299,   ori: 459, tag: '新品', tagKind: 'cyan',          sold: 1.7,  star: 4.8 },
    { id: 'x7',  cat: 'select', img: u('photo-1571902943202-507ec2618e8f'), title: '专业瑜伽垫 加厚防滑 双面 NBR',                        price: 89.0,  ori: 169, tag: '促销', tagKind: 'red',           sold: 1.3,  star: 4.6 },
    { id: 'x8',  cat: 'select', img: u('photo-1517649763962-0c623066013b'), title: '智能跳绳 计数蓝牙 健身减脂',                          price: 79.0,  ori: 159, tag: '新品', tagKind: 'cyan',          sold: 0.7,  star: 4.5 },
    { id: 'x9',  cat: 'select', img: u('photo-1544947950-fa07a98d237f'),  title: '深度工作 4 小时高效法则 精装版',                       price: 35,    ori: 59,  tag: '热卖', tagKind: 'gold',          sold: 2.5,  star: 4.9 },
    { id: 'x10', cat: 'select', img: u('photo-1515488042361-ee00e0ddd4e4'), title: '车载儿童安全座椅 0-12 岁可调',                        price: 1299,  ori: 1699,tag: '安全', tagKind: 'cyan',          sold: 0.3,  star: 4.9 },
    { id: 'x11', cat: 'select', img: u('photo-1503602642458-232111445657'), title: '电竞游戏鼠标 RGB 16000 DPI',                          price: 159,   ori: 269, tag: '电竞', tagKind: 'cyan',          sold: 1.2,  star: 4.6 },
    { id: 'x12', cat: 'select', img: u('photo-1521572163474-6864f9cf17ab'), title: '修身简约长袖 T 恤 4 色可选',                           price: 99,    ori: 159, tag: '基础款', tagKind: 'mint',        sold: 4.2,  star: 4.7 },
  ];

  const banners = [
    { id: 'b1', tone: 'blue',    title: '车主权益日',  sub: '充电 95 折 · 油卡满减',   img: u('photo-1593941707882-a5bba14938c7', 300) },
    { id: 'b2', tone: 'emerald', title: '附近自提',    sub: '500m 内 18 家自提点',     img: u('photo-1488521787991-ed7bbaae773c', 300) },
  ];

  // ─── 时空推荐 hero（位置 / 时段 / 消耗规律 / 日历 4 触发场景）─────
  const heroRecs = [
    {
      id: 'rec-svc-area',
      kind: 'location',
      icon: 'location',
      tag: '前方 3 km · 服务区',
      title: '张江服务区 · 8 家可自提',
      sub: '继续直行 · 预计 4 分钟可达 · 充电桩可用 4 / 6',
      stat: { v: '4 / 6', l: '充电桩 · 实时' },
      items: ['e2', 'f2', 't4', 'e5'],
      cta: '导航前往',
      tone: 'mint',
      navScene: 'energy',
    },
    {
      id: 'rec-noon',
      kind: 'time',
      icon: 'cookie',
      tag: '正午 11:42 · 速达',
      title: '12 点前到家 · 老乡鸡 / 瑞幸 / 麦当劳',
      sub: '基于车辆当前路径 · 预计 32 分钟后抵家',
      stat: { v: '32 分钟', l: '到家 ETA' },
      items: ['f1', 'f2', 'f3', 'f4'],
      cta: '看 28 家速达',
      tone: 'gold',
      navScene: 'eat',
    },
    {
      id: 'rec-low',
      kind: 'consumption',
      icon: 'bolt',
      tag: '该补给了',
      title: '玻璃水还剩 1 瓶 · 上次买 28 天前',
      sub: '基于车主常买规律 · 一键再买送上车',
      stat: { v: '28 天前', l: '上次购买' },
      items: ['e4', 'e1', 'g1', 'g2'],
      cta: '一键再买 ¥ 29.9',
      tone: 'cyan',
      navScene: 'energy',
    },
    {
      id: 'rec-night',
      kind: 'time',
      icon: 'sparkles',
      tag: '今晚 21:00 · 出差',
      title: '虹桥 ⇌ 浦东 · 8 家亚朵酒店有房',
      sub: '日历提示 · 明日 09:00 北京会议 · 同城已订',
      stat: { v: '¥ 488', l: '起 / 晚' },
      items: ['t1', 't2', 't4', 't5'],
      cta: '看 12 家酒店',
      tone: 'blue',
      navScene: 'trip',
    },
  ];

  return { categories, products, banners, heroRecs };
})();
