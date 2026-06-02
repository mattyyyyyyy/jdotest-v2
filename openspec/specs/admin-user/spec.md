# admin-user Specification

## Purpose
后台用户管理：用户查询、封禁（banned）与登录联动（封禁用户扫码确认 403），用户写操作受 `users:write` 权限点守卫与审计。与消费端登录共享同一 `users` 数据源。
## Requirements
### Requirement: 用户列表与查询

The system MUST let admin list and read consumer users via `GET /api/v1/admin/users[/:id]`（通用资源读取），exposing 手机号 / 昵称 / 积分（points）/ 余额（balance，分）/ 账号状态（banned）。This is the same `users` store the consumer auth domains read（与 `auth-qr` 下发车主 token 同源）。

#### Scenario: 后台查看用户列表
- **GIVEN** 后台已登录
- **WHEN** `GET /api/v1/admin/users`
- **THEN** 返回用户列表（含 phone/name/points/balance/banned）

### Requirement: 用户封禁与封禁联动登录

The system MUST let admin toggle a user's `banned` flag via `PATCH /api/v1/admin/users/:id`。封禁 MUST take effect on consumer login：a banned user attempting 车机扫码登录确认（`POST /api/v1/auth/qr-confirm`）MUST 收到 403 `USER_BANNED` and MUST NOT receive a 车主 token。

#### Scenario: 封禁用户后无法扫码登录
- **GIVEN** 后台将用户 `u-1001` 的 `banned` 置为 true
- **WHEN** 该用户尝试 `POST /api/v1/auth/qr-confirm`
- **THEN** 系统返回 403 `USER_BANNED`
- **AND** 不下发车主 token

#### Scenario: 解封后可正常登录
- **GIVEN** 后台将该用户 `banned` 改回 false
- **WHEN** 该用户重新走扫码确认
- **THEN** 流程不因封禁被拒

### Requirement: 用户写操作受 RBAC 权限点守卫与审计

Writes to users under `/api/v1/admin/*` MUST be guarded by the `users:write` permission point per `admin-auth` RBAC，and MUST be recorded to `auditLogs`。客服角色持有 `users:write`（负责封禁/客服处理）；缺权限角色 MUST 收到 403；无 token / 消费端 token MUST 收到 401。

#### Scenario: 缺权限角色改用户被拒
- **GIVEN** 财务角色 admin（仅 `*:read`，无 `users:write`）
- **WHEN** 调用 `PATCH /api/v1/admin/users/:id` 封禁用户
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`
- **AND** 用户状态不变

