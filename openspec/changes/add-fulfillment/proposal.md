## Why

消费端履约展示（feature-spec：商品详情自提点查询 P-04、订单物流轨迹 P-09 → `fulfillment` 域）**尚未实现** API——后台 `admin-fulfillment` 已能维护自提点与物流，但 `app.ts` 未暴露消费端 `/api/v1/fulfillment/*` 读取接口。本 change 是**前向提案**，沉淀消费端履约读取目标行为为 spec，待实现后再 archive。

> **前向（forward）change**：未实现，propose 后留在 `openspec/changes/`，不 archive。

## What Changes

- 新增 `fulfillment` 域 spec：消费端附近自提点查询 + 订单物流轨迹展示
- 沉淀**与 `admin-fulfillment` 同源**（后台停用/录入即时反映到消费端）
- 沉淀**就近过滤营业中**、**物流按车主隔离**（不可看他人订单）

## Capabilities

### New Capabilities
- `fulfillment`: 消费端附近自提点查询、订单物流轨迹展示

### Modified Capabilities
（无——读取后台 `admin-fulfillment` 维护的同源数据，不改其 spec）

## Impact

- 代码（待实现）：`services/api/src/app.ts` 新增 `/api/v1/fulfillment/pickup-points`、`/api/v1/orders/:id/shipping`，复用 `consumer-auth` 守卫
- 数据：复用内存 store `pickupPoints` / `shipping`（admin 维护）
- 关联：`openspec/specs/admin-fulfillment`、`openspec/specs/auth-qr`、PRD P-04/09、feature-spec P-04/09 + BE-fulfillment
