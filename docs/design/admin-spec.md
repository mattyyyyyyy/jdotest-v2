# 后台管理站设计 Admin Spec

> 状态：Draft · 日期：2026-05-29 · 维护者：admin 设计 agent
> 上游：[PRD §I](../PRD.md) · [scope §二](../scope.md) · [feature-spec Admin Pages](../feature-spec.md) · ADR-0010/0011/0012
> 依据：消费端 V3 原型 `mockups/jdo-pencil-v3`（21 屏）+ 其数据模型 `mockups/jdo-pencil-v3/data.js`

**原则**：消费端**每一个 V3 界面背后的数据**都要在后台有对应管理。下表把「V3 界面 → 背后数据实体 → 后台管理页 → 可做的操作」一一对齐。

---

## 一、V3 界面 → 数据实体 → 后台管理 映射

| V3 界面（消费端） | 背后数据实体 | 后台管理页 | 后台可做的操作 |
|---|---|---|---|
| 商城首页 `mall-home` | products / categories / banners / heroRecs | 商品·分类·Banner·推荐位 | 见下各项 |
| 分类页 `mall-category` | categories + products | 分类管理 / 商品管理 | 增删改分类、商品归类 |
| 搜索 `mall-search` | products | 商品管理 | （搜索是只读，无独立管理）|
| 商品详情 `mall-detail` | products（含 sku/价格/原价/标签/库存）| 商品管理 | 编辑全字段、上下架 |
| 购物车 `mall-cart` | cart（用户态，临时）| — | 购物车不需后台管理 |
| 结算 `mall-checkout` | addresses / pickupPoints / coupons | 自提点管理 / 优惠券管理 | CRUD |
| 支付 `mall-pay` | orders / payments | 订单管理 | 看支付状态 |
| 我的订单 `mall-orders` | orders | 订单管理 | 改状态/发货/取消/退款 |
| 物流轨迹 `mall-tracking` | shipping（物流轨迹）| 物流管理 | 录入/更新轨迹 |
| 售后 `mall-aftersale` | aftersale（售后单）| 售后管理 | 审核/处理退款 |
| 评价 `mall-reviews` | reviews | 评价管理 | 审核/隐藏/删除 |
| 收藏 `mall-favorites` | favorites（用户态）| 用户管理（只读查看）| — |
| 地址簿 `mall-addresses` | addresses（用户态）| 用户管理（只读查看）| — |
| 优惠券 `mall-coupons` | coupons | 优惠券管理 | 创建/发放/停用 |
| 积分 `mall-points` | pointsLedger | 用户管理（积分调整）| 调整/查流水 |
| 钱包 `mall-wallet` | wallet | 用户管理（余额查看）| 查看（不可凭空充值）|
| 设置 `mall-settings` | userPrefs（用户态）| — | 不需后台 |
| 个人中心 `mall-profile` | users | 用户管理 | 看详情/封禁 |
| 登录 `mall-login` | users / adminUsers | 用户管理 / 系统(账号权限) | 封禁 / RBAC |
| 行车态首页 `mall-driving` | products(frequent) + config | 系统配置（行车态阈值）| 改阈值/降级开关 |
| 车机桌面 `ivi-home` | — | — | 桌面壳，无数据管理 |

---

## 二、后台管理模块清单（最终落地的页面）

数据驱动：每个 resource 由「列定义 + 表单字段 + 操作」配置，统一表格+表单渲染。

| # | 后台模块 | resource key | 关键字段 | 操作 | 对应 openspec 域 |
|---|---|---|---|---|---|
| 1 | 商品管理 | `products` | title, cat, price, ori, stock, tag, sold, star, onShelf | 增/改/删/上下架 | admin-catalog |
| 2 | 分类管理 | `categories` | id, name, icon, sort | 增/改/删 | admin-catalog |
| 3 | Banner 管理 | `banners` | title, sub, tone, img, active | 增/改/删/启停 | admin-marketing |
| 4 | 推荐位（时空推荐）| `heroRecs` | tag, title, sub, kind, items, navScene, active | 增/改/删/启停 | admin-content |
| 5 | 订单管理 | `orders` | id, userId, status, totalAmount, items | 看/改状态/发货/取消/退款 | admin-order |
| 6 | 物流管理 | `shipping` | orderId, trackingNo, nodes[], status | 录入/更新轨迹 | admin-fulfillment |
| 7 | 售后管理 | `aftersale` | id, orderId, reason, status | 审核/通过/拒绝 | admin-order |
| 8 | 评价管理 | `reviews` | id, productId, userId, star, text, hidden | 隐藏/删除 | admin-content |
| 9 | 优惠券管理 | `coupons` | id, name, type, amount, threshold, stock, active | 增/改/停用 | admin-marketing |
| 10 | 自提点管理 | `pickupPoints` | id, name, lat, lng, address, hours, open | 增/改/删 | admin-fulfillment |
| 11 | 用户管理 | `users` | id, phone, name, points, balance, banned | 看/封禁/调积分 | admin-user |
| 12 | 系统(账号权限) | `adminUsers` / config | account, role / drivingThreshold | RBAC / 改配置 | admin-auth |
| 13 | 运营看板 | （聚合只读）| PV/UV、订单数、车机vs手机 | 看图 | admin-analytics |

---

## 三、后台页面布局（per ADR-0012，桌面布局复用 design token）

```
┌────────────────────────────────────────────────────────────┐
│ 顶栏：JDO 后台管理   |  当前角色   |  退出                      │
├──────────┬─────────────────────────────────────────────────┤
│ 侧栏导航  │  主区                                            │
│ ─ 看板    │  ┌ 工具条：搜索 + [+ 新增] ─────────────────┐    │
│ ─ 商品    │  │ 数据表格（列由 resource 配置驱动）          │    │
│ ─ 分类    │  │  行操作：编辑 / 删除 / 上下架 / 启停        │    │
│ ─ Banner  │  └────────────────────────────────────────┘    │
│ ─ 推荐位  │  编辑：右侧抽屉 / 弹层表单（字段由配置驱动）       │
│ ─ 订单    │                                                  │
│ ─ 物流    │                                                  │
│ ─ 售后    │                                                  │
│ ─ 评价    │                                                  │
│ ─ 优惠券  │                                                  │
│ ─ 自提点  │                                                  │
│ ─ 用户    │                                                  │
│ ─ 系统    │                                                  │
└──────────┴─────────────────────────────────────────────────┘
```

---

## 四、前后台连通方式（关键）

- **同一份数据**：后台写、前台读，都走 `services/api` 的同一内存 store（Demo；后续换 Prisma+PG 接口不变）
- **前台读接口**（V3 消费端用）：返回 V3 `data.js` 同款 shape，V3 只把 `data.js` 改成「从 API 拉」，**界面与样式一律不动**
- **后台写接口**：`/api/v1/admin/:resource` 通用 CRUD
- **效果**：后台改商品/分类/banner/推荐位 → V3 商城首页刷新即同步；后台改订单状态 → 用户订单页同步

> 实现见 `services/api/src/store.ts`（数据）、`admin.routes.ts`（通用 CRUD）、`apps/admin`（管理站）、V3 `data.js`（改为 fetch）。
