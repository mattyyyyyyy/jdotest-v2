# 数据字典 Data Dictionary

> 状态：Draft · 日期：2026-05-29 · 维护者：数据 agent
> 目的：把**前端界面字段**与**后台数据字段**对齐，统一命名、类型、单位、取值范围，作为前后台字段的单一真相。
> 上游：消费端 `mockups/jdo-pencil-v3/data.js` + 后端 `services/api/src/data/*` · 下游：后台 SPA 列/表单配置、API schema

## 0. 为什么有这份文档

历史问题（本次修复）：
1. **金额单位不统一**——商品价格来自 V3 用「元」(`price: 97.0`)，订单/优惠券/余额用「分」(`9700`)。
2. **分类显示成 id**——后台显示 `energy`，看不懂是「能量补给」。
3. **表头是英文字段名**——`id/title/cat` 难读，"不知道是什么产品"。
4. **枚举无中文**——`status: PAID`、`channel: car`、`tagKind: mint` 等。

**统一决议**（本字典执行）：
- **单位**：每个金额字段在本表显式标注单位。**后台显示层一律格式化成 `¥`**（元字段直接 `¥X`，分字段 `¥X/100`）。V3 商品单位保持「元」不动（改动会破坏前端渲染）；**新写后端实体一律用「分」**。
- **分类**：`cat` / `categoryId` / `navScene` 统一指向 `categories.id`；后台**显示分类名**，不显示 id。
- **枚举**：订单状态用 `OrderState`（英文大写，与状态机一致）；其余枚举存英文、**后台显示映射中文**。
- **布尔**：后台统一渲染中文徽章（上架/下架、启用/停用、封禁/正常…）。
- **表头**：后台全部用中文标签（见各表「中文标签」列）。

---

## 1. products 商品（来源：V3 data.js + 后台可增改）

| 字段 | 中文标签 | 类型 | 单位/取值 | 说明 |
|---|---|---|---|---|
| `id` | 商品ID | string | `e1` `p70`… | 主键，后台新增自动生成 `p{n}` |
| `title` | 商品名称 | string | — | **这就是产品名**（搜索/详情依据） |
| `cat` | 分类 | enum | →`categories.id` | energy/care/eat/trip/gear/sos/select |
| `img` | 主图 | string | URL 或 `data:image` | 后台新增缺图时自动补占位 SVG |
| `price` | 现价 | number | **元** | V3 历史单位；如 `97.0` = ¥97 |
| `ori` | 原价 | number | **元** | 划线价；`0` 表示不显示 |
| `tag` | 角标文案 | string | 车主直降3%/秒杀/新品… | 可空 |
| `tagKind` | 角标配色 | enum | mint/red/gold/cyan | 控制角标颜色 |
| `sold` | 销量 | number | **万** | `3.4` = 3.4万件已售 |
| `star` | 评分 | number | 0–5 | 如 `4.8` |
| `stock` | 库存 | number | 件 | 后台可改 |
| `onShelf` | 上架状态 | bool | true/false | 前台只展示 `true` |

## 2. categories 分类（7 大用车场景，ADR-0009）

| 字段 | 中文标签 | 类型 | 取值 |
|---|---|---|---|
| `id` | 分类ID | string | energy/care/eat/trip/gear/sos/select |
| `name` | 分类名 | string | 能量补给/爱车养护/一路吃喝/远行出差/车内好物/24h救援/严选好物 |
| `icon` | 图标 | enum | bolt/wrench/cookie/luggage/car/phone/sparkles |
| `sort` | 排序 | number | 1–7 |

## 3. banners 首页横幅

| 字段 | 中文标签 | 类型 | 取值 |
|---|---|---|---|
| `id` | ID | string | — |
| `title` | 主标题 | string | 车主权益日… |
| `sub` | 副标题 | string | — |
| `tone` | 配色 | enum | blue/emerald |
| `img` | 图 | string(URL) | — |
| `active` | 启用 | bool | — |

## 4. heroRecs 时空推荐位

| 字段 | 中文标签 | 类型 | 取值/说明 |
|---|---|---|---|
| `id` | ID | string | — |
| `kind` | 触发类型 | enum | location 位置 / time 时段 / consumption 消耗规律 |
| `tag` | 角标 | string | 前方3km·服务区… |
| `title` | 标题 | string | — |
| `sub` | 副文 | string | — |
| `items` | 关联商品 | string[] | →`products.id` 数组 |
| `navScene` | 跳转场景 | enum | →`categories.id` |
| `cta` | 按钮文案 | string | — |
| `tone` | 配色 | enum | mint/gold/cyan/blue |
| `active` | 启用 | bool | — |

## 5. orders 订单

| 字段 | 中文标签 | 类型 | 单位/取值 |
|---|---|---|---|
| `id` | 订单号 | string | `o-20001` `o-5` |
| `userId` | 下单用户 | string | →`users.id` |
| `status` | 状态 | enum(OrderState) | DRAFT/PENDING_PAYMENT/PAID/SHIPPING/COMPLETED/CANCELED/EXPIRED/REFUNDING/REFUNDED |
| `totalAmount` | 订单金额 | number | **分**（`9700`=¥97） |
| `itemTitles` | 商品清单 | string[] | 商品名数组 |
| `channel` | 入口渠道 | enum | car 车机 / phone 手机（PRD US-39） |
| `createdAt` | 下单时间 | string | — |

**状态中文映射**：待提交/待支付/已支付/配送中/已完成/已取消/已过期/退款中/已退款

## 6. users 用户

| 字段 | 中文标签 | 类型 | 单位 |
|---|---|---|---|
| `id` | 用户ID | string | — |
| `phone` | 手机号 | string | 脱敏 `138****0001` |
| `name` | 昵称 | string | — |
| `points` | 积分 | number | 分值 |
| `balance` | 钱包余额 | number | **分** |
| `banned` | 封禁 | bool | — |
| `createdAt` | 注册时间 | string | — |

## 7. coupons 优惠券

| 字段 | 中文标签 | 类型 | 单位/取值 |
|---|---|---|---|
| `id` | ID | string | — |
| `name` | 券名 | string | — |
| `type` | 类型 | enum | fixed 满减 / discount 折扣 |
| `amount` | 面额 | number | fixed→**分**；discount→折数*10（`95`=9.5折）|
| `threshold` | 使用门槛 | number | **分** |
| `stock` | 剩余 | number | 张 |
| `active` | 启用 | bool | — |

## 8. reviews 评价

| 字段 | 中文标签 | 类型 | 取值 |
|---|---|---|---|
| `id` | ID | string | — |
| `productId` | 商品 | string | →`products.id` |
| `userId` | 用户 | string | →`users.id` |
| `star` | 评分 | number | 1–5 |
| `text` | 内容 | string | — |
| `hidden` | 隐藏 | bool | — |
| `createdAt` | 时间 | string | — |

## 9. pickupPoints 自提点

| 字段 | 中文标签 | 类型 |
|---|---|---|
| `id` | ID | string |
| `name` | 名称 | string |
| `address` | 地址 | string |
| `lat`/`lng` | 经纬度 | number |
| `hours` | 营业时间 | string |
| `open` | 营业中 | bool |

## 10. aftersale 售后单

| 字段 | 中文标签 | 类型 | 取值 |
|---|---|---|---|
| `id` | 售后单号 | string | — |
| `orderId` | 关联订单 | string | →`orders.id` |
| `reason` | 原因 | string | — |
| `status` | 状态 | enum | pending 待审/approved 通过/rejected 拒绝 |
| `createdAt` | 时间 | string | — |

## 11. shipping 物流

| 字段 | 中文标签 | 类型 |
|---|---|---|
| `id` | ID(=订单号) | string |
| `trackingNo` | 运单号 | string |
| `status` | 状态 | string |
| `nodes` | 轨迹节点 | string[] |

## 12. adminUsers 后台账号

| 字段 | 中文标签 | 类型 | 取值 |
|---|---|---|---|
| `id` | ID | string | — |
| `account` | 账号 | string | — |
| `role` | 角色 | enum | 超管/运营/客服/财务（ADR-0011）|

## 13. config 系统配置（单例）

| 字段 | 中文标签 | 类型 | 单位 |
|---|---|---|---|
| `drivingSpeedThreshold` | 行车态车速阈值 | number | km/h |
| `drivingExitSeconds` | 停车退出秒数 | number | 秒 |
| `degradeBannerInDriving` | 行车态降级Banner | bool | — |

---

## 枚举字典（后台显示用的中文映射）

| 枚举 | 值 → 中文 |
|---|---|
| OrderState | DRAFT 待提交 · PENDING_PAYMENT 待支付 · PAID 已支付 · SHIPPING 配送中 · COMPLETED 已完成 · CANCELED 已取消 · EXPIRED 已过期 · REFUNDING 退款中 · REFUNDED 已退款 |
| channel | car 车机 · phone 手机 |
| tagKind | mint 薄荷 · red 红 · gold 金 · cyan 青 |
| coupon.type | fixed 满减 · discount 折扣 |
| aftersale.status | pending 待审 · approved 通过 · rejected 拒绝 |
| category.icon | bolt 闪电 · wrench 扳手 · cookie 饼干 · luggage 行李 · car 车 · phone 电话 · sparkles 星 |

> 后台 SPA 的列/表单按本字典的「中文标签」「类型」渲染：money→`¥`、bool→中文徽章、cat→分类名、enum→中文。实现见 `services/api/src/app.ts`（RESOURCE_LIST 列定义）+ `admin-spa.ts`（格式化）。
