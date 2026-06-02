## Why

后台「内容 - 评价审核」（feature-spec A-11，BE-admin-content）已实现（通用 CRUD + `hidden` 隐藏机制），但 `openspec/specs/admin-content/` 缺位、无 change 骨架。本 change 以**回填**方式沉淀已实现行为，并诚实暴露消费端评价读取接口尚缺的缺口。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/admin-content/`。

## What Changes

- 新增 `admin-content` 域 spec：评价审核（隐藏/删除）+ 写守卫
- 沉淀 `hidden` 为**非破坏性审核标记**（区别于物理删除）
- 暴露缺口：消费端目前无评价读取 API，`hidden` 仅后台生效；未来补接口须过滤 `hidden`
- 沉淀 `reviews:write` 权限点（运营持有）+ 审计

## Capabilities

### New Capabilities
- `admin-content`: 评价审核（隐藏/删除）、写操作 RBAC + 审计、消费端展示遵守 hidden（待补接口）

### Modified Capabilities
（无——推荐位 heroRecs 的 CRUD 归 `admin-marketing`，本域聚焦评价内容治理）

## Impact

- 代码（现状）：`services/api/src/app.ts`（reviews 通用 CRUD）、`store.ts`、`admin-spa.ts`（A-11）
- 缺口：消费端 `/api/v1/reviews` 读取接口未实现（未来补时过滤 hidden）
- 关联：ADR-0010 / ADR-0011、PRD US-54、feature-spec A-11 + BE-admin-content、依赖 `admin-auth`
