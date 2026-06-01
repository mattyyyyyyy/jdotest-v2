## Why

JDOTEST v2 新增后台管理端，运营 / 客服 / 财务需要登录后台并按角色操作。后台账号必须与车主账号隔离，且所有写操作要留痕以满足合规。这是其它所有 admin 域（catalog/order/user...）的前置——没有 admin-auth，其它后台功能无法挂鉴权。

## What Changes

- 新增 admin 独立账号体系（AdminUser，账号密码登录，与消费端 User 隔离）
- 新增 RBAC：Role（超管/运营/客服/财务）+ Permission（权限点）+ endpoint 守卫
- 新增 admin JWT（短 access + refresh），命名空间 `/api/v1/admin/auth/*`
- 新增操作审计日志 AdminAuditLog，所有 admin 写操作经统一中间件落库
- **BREAKING**：`/api/v1/admin/*` 全部 endpoint 默认要求 admin JWT + 权限点，无 token 一律 401

## Capabilities

### New Capabilities
- `admin-auth`: admin 登录、RBAC 角色与权限点守卫、操作审计日志

### Modified Capabilities
（无——admin-auth 是全新域，不改既有消费端 spec）

## Impact

- 代码：`services/api/src/modules/admin-auth/*`（new）、`gateway` 加 admin JWT + 权限守卫中间件、`apps/admin/src/pages/login`（new）
- 数据：Prisma 新增 AdminUser / Role / Permission / AdminAuditLog 4 表 + seed 预设角色与超管
- 契约：`packages/api-contracts/openapi.yaml` 新增 `/admin/auth/*` 分组
- 配置：`.env.example` 加 `ADMIN_JWT_SECRET`、初始超管账号种子变量
- 关联：ADR-0010（admin 形态）、ADR-0011（RBAC）、PRD US-40~42、scope.md §二 I-1
