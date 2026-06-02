## Why

后台「工作台 / 看板」（feature-spec A-02，BE-admin-analytics）已实现（`GET /api/v1/admin/analytics` 聚合查询），但 `openspec/specs/admin-analytics/` 缺位。本 change 以**回填**方式沉淀已实现的看板聚合行为为当前真相，并诚实标注流量类指标当前为 Demo 固定值（埋点未接入）。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/admin-analytics/`。

## What Changes

- 新增 `admin-analytics` 域 spec：看板聚合指标 + 访问守卫
- 沉淀订单类指标（`orderTotal`/`channel`/`gmv`）**从 live orders 实时聚合**
- 诚实标注流量类（`pv`/`uv`/`drivingSwitches`）当前为 Demo 固定值，待接埋点
- 沉淀 `analytics:read` 权限点（四角色均持 `*:read`）

## Capabilities

### New Capabilities
- `admin-analytics`: 运营看板聚合指标、看板访问 RBAC 守卫

### Modified Capabilities
（无）

## Impact

- 代码（现状）：`services/api/src/app.ts`（`GET /api/v1/admin/analytics`）、`admin-spa.ts`（A-02 KPI 卡 + GMV 趋势）
- 数据：聚合自内存 store `orders`；埋点流量待接入
- 关联：ADR-0010 / ADR-0011、PRD US-50、feature-spec A-02 + BE-admin-analytics、依赖 `admin-auth`
