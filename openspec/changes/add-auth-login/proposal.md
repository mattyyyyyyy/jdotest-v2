## Why

消费端手机号 + 验证码登录（feature-spec P-12 路由 → `auth-login` 域，BE-user/JWT）**尚未实现**——当前只有车机扫码登录（`auth-qr`）与 Demo `mock-login`。本 change 是**前向提案**：先把目标行为沉淀为 spec，待实现后再 archive。

> **前向（forward）change**：未实现，propose 后**留在 `openspec/changes/`**，不 archive；实现并测试通过后再 `openspec archive`。

## What Changes

- 新增 `auth-login` 域 spec（手机号 + 验证码登录），下发与 `auth-qr` 等价的车主 token
- 复用 `users` store + 封禁拦截（与 `auth-qr`/`admin-user` 一致）
- 复用 `admin-auth` 的「车主 token 不得访问后台」隔离铁律

## Capabilities

### New Capabilities
- `auth-login`: 手机号 + 验证码登录、封禁拦截、与后台账号隔离

### Modified Capabilities
（无——与 `auth-qr` 并列为另一条车主登录入口，不改其 spec）

## Impact

- 代码（待实现）：`services/api/src/consumer-auth.ts`（复用 token 签发）+ `app.ts` 新增 `/api/v1/auth/sms-code`、`/api/v1/auth/sms-login`；验证码下发渠道（Demo 可 mock）
- 数据：复用内存 store `users`（首次登录自动建号）
- 关联：`openspec/specs/auth-qr`、`openspec/specs/admin-auth`（隔离）、PRD P-12、feature-spec P-12
- 依赖：可独立实现；建议在车主账号资料域（`add-user`）一并落地
