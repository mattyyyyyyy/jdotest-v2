## Why

后台「营销 - banner/推荐位 / 优惠券」（feature-spec A-09/10，BE-admin-marketing）已实现（通用 CRUD + 启用位门控前台），但 `openspec/specs/admin-marketing/` 缺位、无 change 骨架。本 change 以**回填**方式沉淀已实现行为为当前真相。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/admin-marketing/`。

## What Changes

- 新增 `admin-marketing` 域 spec：banners / heroRecs / coupons 后台 CRUD
- 沉淀 **`active` 启用位门控消费端可见性**（停用即从 bootstrap/首页隐藏）
- 沉淀 `banners:write` / `heroRecs:write` / `coupons:write` 权限点（运营持有）+ 审计

## Capabilities

### New Capabilities
- `admin-marketing`: banner/推荐位/优惠券后台 CRUD、启用位门控前台可见、写操作 RBAC + 审计

### Modified Capabilities
（无）

## Impact

- 代码（现状）：`services/api/src/app.ts`（通用 CRUD + `/bootstrap` 的 `activeBanners`/`activeHeroRecs` 过滤）、`store.ts`、`admin-spa.ts`（A-09/10）
- 数据：内存 store `banners` / `heroRecs` / `coupons`，持久化待 Q2
- 关联：ADR-0010 / ADR-0011、PRD US-52~53、feature-spec A-09/10 + BE-admin-marketing、依赖 `admin-auth`
