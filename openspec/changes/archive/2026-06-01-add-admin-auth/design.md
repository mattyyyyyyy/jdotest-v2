## Context

admin 复用同一 `services/api` modular monolith（ADR-0010），新增 `admin-auth` 模块 + gateway 层的 admin 鉴权分流。RBAC 用 Role→Permission 两级（ADR-0011）。admin JWT 与消费端 JWT 用不同 secret、不同 cookie 名、不同校验中间件，物理隔离。

数据流：admin 登录 → 校验 bcrypt → 签 admin JWT（含 roleId）→ 后续请求经 gateway admin 守卫：①验 admin JWT ②查 role 的 permission 集 ③比对 endpoint 所需权限点 → 放行/403 → 写操作经审计中间件落 AdminAuditLog。

## Goals / Non-Goals

**Goals:**
- admin 账号与消费端完全隔离，杜绝越权
- 权限点级守卫，加角色不改 endpoint
- 所有写操作可审计

**Non-Goals:**
- 自定义角色 UI（第一阶段角色固定）
- 第三方 IAM（Casbin/OPA）接入（预留，不做）
- SSO / OAuth 登录后台（账号密码即可）

## Decisions

**决策表**

| 决策 | 选择 | 理由 | 替代方案 |
|---|---|---|---|
| admin 账号存储 | 独立 AdminUser 表 | 与车主账号隔离，越权面最小 | User 表加 isAdmin（否，混淆）|
| 鉴权 | 独立 admin JWT（不同 secret/cookie）| 与消费端互不串 | 共用 JWT（否，越权风险）|
| 授权 | Role→Permission 权限点守卫 | endpoint 细粒度，加角色不改码 | 仅角色硬编码（否）|
| 密码 | bcrypt | 业界标准 | 明文/弱 hash（否）|

**File Changes**

| Path | Change |
|---|---|
| `services/api/src/modules/admin-auth/{controller,service,guard,audit.middleware}.ts` | new |
| `services/api/src/gateway/admin-auth.guard.ts` | new |
| `services/api/prisma/schema.prisma` | modified（+AdminUser/Role/Permission/AdminAuditLog）|
| `services/api/prisma/seed-admin.ts` | new（预设 4 角色 + 超管）|
| `packages/api-contracts/openapi.yaml` | modified（+/admin/auth/*）|
| `apps/admin/src/pages/login/*` | new |

**Error Handling**：无 token → 401；权限点不足 → 403；登录失败 → 401 + 限流（5/min/IP）防爆破。

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| 超管账号泄漏 → 全后台沦陷 | 超管账号种子只在 .env 注入、强制首登改密、登录限流 |
| admin/consumer JWT 混用 | 不同 secret + 不同 cookie 名 + 独立中间件，集成测试覆盖越权用例 |

- 安全：admin 登录限流 5/min/IP；审计日志不可被非超管删除；admin JWT secret 走 secret manager
- Rollback：admin-auth 是新增模块，回滚即移除 `/api/v1/admin/*` 路由挂载，不影响消费端
