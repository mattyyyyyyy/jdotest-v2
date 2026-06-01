## Why

消费端（车主）目前没有真实登录——车机扫码 / 手机验证码都是 mock（见 open-questions Q12）。车机场景的核心登录方式是「车机出二维码 → 手机扫码授权 → 车机拿 token」，避免在车机上输手机号/密码（行车安全 + 体验）。后台 admin-auth 已落地（archive），其 token/scrypt 基建可复用。

## What Changes

- 新增消费端扫码登录会话：`POST /api/v1/auth/qr-code` 出二维码会话（pending + TTL 过期）
- 新增手机确认：`POST /api/v1/auth/qr-confirm` 手机授权 → 会话 confirmed，绑定车主
- 新增车机轮询：`GET /api/v1/auth/qr-status` → pending / expired / confirmed（confirmed 时下发车主 JWT）
- 新增 Demo 免扫码快捷登录：`POST /api/v1/auth/mock-login` 直接拿 demo 车主 token
- 新增 `GET /api/v1/auth/me`：校验车主 token → 返回车主
- 车主 JWT 与 admin JWT **物理隔离**（不同 secret / 不同 typ）；车主 token 不能访问 `/api/v1/admin/*`

## Capabilities

### New Capabilities
- `auth-qr`: 车机扫码登录会话生命周期 + 手机确认下发车主 JWT + Demo 免扫码

### Modified Capabilities
（无——auth-qr 为全新域，不改既有 spec）

## Impact

- 代码：`services/api/src/consumer-auth.ts`（new，会话 + 车主 token）、`app.ts` 加 `/api/v1/auth/*` 路由
- 数据：复用 store `users` 资源（无新表）；会话为内存 Map（短生命周期）
- 配置：`.env.example` 已有 `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`（车主 token 用）
- 关联：PRD US-20/21（手机号 / 扫码登录）、backend-spec §三 鉴权、ADR-0010、open-questions Q12
