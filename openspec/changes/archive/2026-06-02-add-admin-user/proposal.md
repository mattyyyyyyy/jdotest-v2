## Why

后台「用户管理」（feature-spec A-08，BE-admin-user）已实现（通用 CRUD + 封禁联动登录），但 `openspec/specs/admin-user/` 缺位、连 change 骨架都没有。本 change 以**回填**方式沉淀已实现的后台用户管理行为为当前真相。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/admin-user/`。

## What Changes

- 新增 `admin-user` 域 spec：用户列表/查询 + 封禁 + 写守卫
- 沉淀**封禁联动登录**（`banned` 用户扫码确认 403 `USER_BANNED`，与 `auth-qr` 同源 `users` store）
- 沉淀 `users:write` 权限点（客服持有）+ 审计

## Capabilities

### New Capabilities
- `admin-user`: 用户查询、封禁与登录联动、写操作 RBAC + 审计

### Modified Capabilities
（无——封禁拦截逻辑在 `auth-qr` 已实现，本 spec 仅从 admin 视角描述触发；不改 `auth-qr` spec）

## Impact

- 代码（现状）：`services/api/src/app.ts`（通用 CRUD + `qr-confirm` 的 banned 拦截）、`store.ts`（`users` 集合）、`admin-spa.ts`（A-08）
- 数据：内存 store `users`，持久化待 Q2
- 关联：ADR-0010 / ADR-0011、`openspec/specs/auth-qr`、PRD US-51、feature-spec A-08 + BE-admin-user、依赖 `admin-auth`
