## Why

后台「订单管理 / 订单详情」（feature-spec A-06/07，BE-admin-order）已实现并上线（`/api/v1/admin/orders/:id/status` 走共享订单状态机 + 通用 CRUD 读取），但 `openspec/specs/admin-order/` 缺位。本 change 以**回填**方式沉淀已实现的后台订单行为为当前真相。

> **回填（backfill）change**：spec 贴合 `app.ts` 现状，不引入新需求；propose 即完工，archive 合并 delta 到 `specs/admin-order/`。

## What Changes

- 新增 `admin-order` 域 spec：后台订单状态流转 + 查询 + 写守卫
- 沉淀**状态流转走共享状态机**（与消费端 `order` 域同一套；不允许任意 set 状态；非法流转 409）
- 沉淀**前→后单一数据源**（消费端下单/结算创建的订单后台立即可见）
- 沉淀 `orders:write` 权限点（客服持有）+ 审计

## Capabilities

### New Capabilities
- `admin-order`: 后台订单状态流转（发货/取消/退款）、订单查询、写操作 RBAC + 审计

### Modified Capabilities
（无——复用 `order` 状态机与 `admin-auth` RBAC，不改其 spec）

## Impact

- 代码（现状）：`services/api/src/app.ts`（`PATCH /api/v1/admin/orders/:id/status` + 通用 CRUD）、`packages/order-state-machine`（共享状态机）、`admin-spa.ts`（A-06/07）
- 数据：内存 store `orders` 集合，持久化待 Q2
- 关联：ADR-0010 / ADR-0011、`openspec/specs/order`、PRD US-47~49、feature-spec A-06/07 + BE-admin-order、依赖 `admin-auth`
