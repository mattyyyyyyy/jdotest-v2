## Why

后台「自提点管理 / 物流轨迹录入」（feature-spec A-12/13，BE-admin-fulfillment）已实现（通用 CRUD），但 `openspec/specs/admin-fulfillment/` 缺位、无 change 骨架。本 change 以**回填**方式沉淀已实现行为，并暴露消费端履约展示接口尚缺的缺口。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/admin-fulfillment/`。

## What Changes

- 新增 `admin-fulfillment` 域 spec：自提点 CRUD + 物流轨迹录入 + 分角色写守卫
- 沉淀**权限点分离**：自提点 `pickupPoints:write`（运营）vs 物流 `shipping:write`（客服）
- 暴露缺口：消费端履约读取接口未实现（由 forward change `add-fulfillment` 跟进）

## Capabilities

### New Capabilities
- `admin-fulfillment`: 自提点后台 CRUD、物流轨迹录入、分角色 RBAC + 审计

### Modified Capabilities
（无）

## Impact

- 代码（现状）：`services/api/src/app.ts`（pickupPoints/shipping 通用 CRUD）、`store.ts`（shipping 以 orderId 为主键）、`admin-spa.ts`（A-12/13）
- 缺口：消费端 `/api/v1/fulfillment/*` 未实现 → forward `add-fulfillment`
- 关联：ADR-0010 / ADR-0011、PRD US-55~56、feature-spec A-12/13 + BE-admin-fulfillment、依赖 `admin-auth`
