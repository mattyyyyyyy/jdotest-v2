# 一致性统一计划 Consistency Plan

> 状态：Draft · 日期：2026-05-29 · 维护者：数据/架构 agent
> 目的：盘点前后台「还没统一」的业务点，按优先级排一个分阶段计划。
> 配套：字段口径见 [data-dictionary.md](./data-dictionary.md)；后台映射见 [admin-spec.md](./admin-spec.md)

## ✅ 已统一（已完成）

| 项 | 现状 |
|---|---|
| 货币单位 | 数据层/全 API 统一「分」(整数)；显示层换算元；表单 money 输入元存分 |
| 错误格式 | 全 API 统一 `{ code, message, details, traceId }` |
| 分类口径 | `cat`/`navScene` 统一指向 `categories.id`；后台显示分类名 |
| 后台字段标签 | 全部中文表头 + 类型化格式（图/¥/徽章/枚举中文） |
| 新增商品同步 | 默认上架、列表置顶、前台 bootstrap 可见 |
| 详情商品 | 点击透传 productId，详情显示正确商品 |

## 🔴 待统一（按优先级）

### P0 · 影响"前后台数据一致"的硬伤

| # | 业务点 | 现状（不统一） | 统一方案 |
|---|---|---|---|
| 1 | **购物车未接真实数据** | V3 购物车/结算用写死的 3 件；下单只提交这 3 件 | 新增 `cart` 实体 + API（加购/改量/删/清空）；V3 加购→购物车→结算全走 API |
| 2 | **消费端多屏纯 mock** | favorites/points/wallet/coupons/orders/tracking/aftersale/reviews/addresses 这些 V3 屏是静态，没接后台数据 | 逐屏接 API（后台对应实体已存在）：先 orders（已可接）→ coupons → addresses → 其余 |
| 3 | **登录/鉴权未统一** | admin 无 RBAC（Demo 未挂）、消费端无真实登录 | 落地 `openspec/changes/add-admin-auth`（已写好 spec）：admin 登录+RBAC+审计；消费端接扫码登录 |

### P1 · 字段/格式口径

| # | 业务点 | 现状 | 统一方案 |
|---|---|---|---|
| 4 | **时间格式** | orders.createdAt 混用 `2026-05-20` 与 `刚刚`；其它实体缺统一时间字段 | 统一存 ISO 8601 字符串；显示层格式化为"相对时间/年月日"。所有实体补 `createdAt/updatedAt` |
| 5 | **ID 规范** | `e1`/`p68`(无连字符) vs `o-20001`/`u-1001`/`cp-1`(带连字符) | 统一 `<entity>-<n>`（如 `product-70`）或文档锁定现状前缀表，新增一律按规范 |
| 6 | **状态枚举大小写** | order status 大写(`PAID`)，aftersale/coupon.type 小写(`pending`/`fixed`) | 统一：存储用一种风格（建议小写下划线），后台/前台用中文映射表显示（映射已建） |
| 7 | **计量后缀** | `sold` 单位是"万"，前端显示成 `{sold}k+`（k 与万歧义） | 统一：sold 存"件"整数；显示层按 1万/1k 规则格式化 |

### P2 · 资源/体验

| # | 业务点 | 现状 | 统一方案 |
|---|---|---|---|
| 8 | **图片来源** | V3 用 Unsplash 远程图 + 油卡用内联 SVG；后台新增用占位 SVG | 统一图片策略：后台支持图片 URL/上传；缺图统一占位（已做占位） |
| 9 | **库存与上架联动** | 库存为 0 仍可上架/下单 | 统一规则：stock=0 自动判定不可购；下单前服务端校验库存（对接 order-state-machine 的 STOCK_CHANGED） |
| 10 | **数据持久化** | 全内存 store，重启丢数据 | 统一接 Prisma + PostgreSQL（ADR-0003），store 接口语义不变 |

## 📅 分阶段计划

```
阶段 1（数据一致性，P0）
  1.1 cart 实体 + API + V3 加购/购物车/结算接真实数据
  1.2 mall-orders 接 /api/v1/orders（消费端看自己的真实订单）
  1.3 落地 add-admin-auth（RBAC + 审计）

阶段 2（口径统一，P1）
  2.1 时间字段统一 ISO + 显示格式化
  2.2 ID 规范统一（或锁定前缀表）
  2.3 枚举大小写统一 + 计量后缀统一

阶段 3（资源/持久化，P2）
  3.1 库存-上架-下单 联动校验
  3.2 图片策略统一（URL/上传）
  3.3 内存 store → Prisma + PostgreSQL（重启不丢）
```

> 每阶段一个 OpenSpec change（`/opsx:propose`），实施完 `openspec archive`。本计划本身随完成项更新「✅ 已统一」表。
