# admin-auth Specification

## Purpose
TBD - created by archiving change add-admin-auth. Update Purpose after archive.
## Requirements
### Requirement: Admin 账号登录与隔离

The system MUST authenticate admin users against a dedicated `AdminUser` store, separate from consumer `User`. Admin login MUST use account + password (bcrypt-hashed) via `POST /api/v1/admin/auth/login` and issue an admin JWT (short-lived access + refresh).

The system MUST NOT allow a consumer JWT to access any `/api/v1/admin/*` endpoint, and MUST NOT allow an admin JWT to access consumer-only write endpoints.

#### Scenario: 运营账号密码登录成功
- **GIVEN** 一个已启用的 AdminUser（运营角色）
- **WHEN** 提交正确账号密码到 `POST /api/v1/admin/auth/login`
- **THEN** 系统校验 bcrypt 通过
- **AND** 下发 admin access token（15min）+ refresh token（7d）

#### Scenario: 消费端 token 越权访问后台被拒
- **GIVEN** 一个有效的消费端 User JWT
- **WHEN** 用该 token 调用任意 `/api/v1/admin/*` endpoint
- **THEN** 系统返回 401
- **AND** 不泄漏后台资源是否存在

### Requirement: RBAC 角色与权限点守卫

The system MUST model authorization as Role → Permission points, where each `/api/v1/admin/*` endpoint is guarded by a required permission point (e.g. `catalog:write`, `order:refund`, `user:ban`). The system MUST ship four preset roles: 超管 / 运营 / 客服 / 财务.

#### Scenario: 客服尝试改价格被拒
- **GIVEN** 一个客服角色的 admin（无 `catalog:write` 权限点）
- **WHEN** 调用商品改价 endpoint
- **THEN** 系统返回 403
- **AND** 不执行任何写操作

#### Scenario: 超管拥有全部权限点
- **GIVEN** 超管角色的 admin
- **WHEN** 调用任意受权限点守卫的 admin endpoint
- **THEN** 守卫放行

### Requirement: 操作审计日志

The system MUST record every admin write operation into `AdminAuditLog` capturing who / when / action / target / before-after / ip, via a unified middleware.

#### Scenario: 写操作落审计
- **GIVEN** 一个登录的运营 admin
- **WHEN** 执行任意写操作（如商品上架）
- **THEN** 系统写入一条 AdminAuditLog（含操作者、时间、动作、目标、前后值、IP）
- **AND** 审计记录不可被普通角色删除

