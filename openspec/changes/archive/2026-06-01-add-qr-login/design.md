## Context

消费端复用同一 `services/api` modular monolith。车主鉴权与 admin **物理隔离**：不同 secret、不同 token typ（`user`/`user-refresh` vs `admin`/`admin-refresh`）、不同中间件。扫码登录是一个三方时序（车机出码 → 手机确认 → 车机轮询），用内存会话表承载（短生命周期，Demo 足够；生产换 Redis 带 TTL）。

数据流：车机 `POST /auth/qr-code` → 建 pending 会话（TTL 120s）→ 手机 `POST /auth/qr-confirm` 绑定车主并置 confirmed（banned 拒绝）→ 车机 `GET /auth/qr-status` 轮询，confirmed 时签发车主 JWT 并下发。

## Goals / Non-Goals

**Goals:**
- 车机不输手机号/密码即可登录（出码 + 手机确认）
- 车主 token 与 admin token 不可互串
- Demo 提供 mock-login 一步登录

**Non-Goals:**
- 真实手机扫码 App 对接（Demo 用 qr-confirm 模拟手机端）
- 手机号 + 短信验证码登录（auth-login 域，另开 change）
- 车厂账号 SSO（预留，不做）

## Decisions

| 决策 | 选择 | 理由 | 替代方案 |
|---|---|---|---|
| 会话存储 | 内存 Map + TTL | 短生命周期，Demo 够用 | Redis（生产再换，接口不变）|
| 车主 token | 独立 secret（`JWT_ACCESS_SECRET`）+ typ `user` | 与 admin 物理隔离 | 共用 secret（否，越权）|
| 实现复用 | 仿 admin-auth 的 HMAC 紧凑 token | 一致、零依赖 | jsonwebtoken 库（否，免依赖）|
| 手机端 | `qr-confirm` 带 userId 模拟授权 | Demo 无真手机 App | 真扫码（阶段二）|

**File Changes**

| Path | Change |
|---|---|
| `services/api/src/consumer-auth.ts` | new（车主 token 签发/校验 + 扫码会话表）|
| `services/api/src/app.ts` | modified（+ `/api/v1/auth/{qr-code,qr-confirm,qr-status,mock-login,me}`）|
| `services/api/src/app.test.ts` | modified（+ 扫码登录链路 + 隔离用例）|

**Error Handling**：未知/超时会话 → status `expired`（不泄漏存在性）；banned 车主确认 → 403；无效车主 token 调 `/auth/me` → 401；车主 token 调 `/admin/*` → 401（admin 守卫 typ 不匹配）。

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| 会话固定/重放 | sessionId 用 crypto 随机；confirmed 一次性消费可选；TTL 短 |
| 车主/admin token 混用 | 不同 secret + 不同 typ + 集成测试覆盖越权用例 |
| 内存会话重启丢失 | Demo 接受；生产换 Redis（接口不变）|

- Rollback：auth-qr 为新增路由，回滚即移除 `/api/v1/auth/*` 挂载，不影响其它。
