# auth-qr Specification

## Purpose
TBD - created by archiving change add-qr-login. Update Purpose after archive.
## Requirements
### Requirement: 车机扫码登录会话

The system MUST issue a QR login session via `POST /api/v1/auth/qr-code`, returning `{ sessionId, qrUrl, expiresAt, status }` with initial status `pending`. A session MUST expire after a TTL and be queryable via `GET /api/v1/auth/qr-status?sessionId=`. The system MUST NOT reveal whether an unknown sessionId ever existed (unknown → treated as expired).

#### Scenario: 车机请求二维码得到 pending 会话
- **GIVEN** 车机端
- **WHEN** 调用 `POST /api/v1/auth/qr-code`
- **THEN** 返回 `sessionId` + `qrUrl` + `expiresAt`
- **AND** 初始 `status` 为 `pending`

#### Scenario: 未确认超时或未知会话返回 expired
- **GIVEN** 一个已超时的会话（或不存在的 sessionId）
- **WHEN** 车机轮询 `GET /api/v1/auth/qr-status?sessionId=`
- **THEN** `status` 为 `expired`
- **AND** 不下发任何 token

### Requirement: 手机确认授权下发车主 JWT

After the phone authorizes via `POST /api/v1/auth/qr-confirm`, the session status MUST become `confirmed` and bind to a 车主 user. Subsequent `GET /api/v1/auth/qr-status` MUST return `confirmed` plus a consumer access token (15min) + refresh token (7d). The system MUST reject confirmation for a banned user. Consumer JWT MUST NOT be accepted by any `/api/v1/admin/*` endpoint.

#### Scenario: 手机确认后车机轮询拿到 token
- **GIVEN** 一个 pending 会话
- **WHEN** 手机端 `POST /api/v1/auth/qr-confirm` 携带 sessionId 授权
- **AND** 车机随后 `GET /api/v1/auth/qr-status?sessionId=`
- **THEN** `status` 为 `confirmed`
- **AND** 返回车主 access token + refresh token + user

#### Scenario: 已封禁车主不能确认登录
- **GIVEN** 一个 banned 的车主
- **WHEN** 用其身份 `POST /api/v1/auth/qr-confirm`
- **THEN** 系统返回 403
- **AND** 会话不进入 confirmed

#### Scenario: 车主 token 不能访问后台
- **GIVEN** 一个有效的车主 JWT
- **WHEN** 用该 token 调用任意 `/api/v1/admin/*`
- **THEN** 系统返回 401

### Requirement: Demo 免扫码快捷登录

The system MUST provide `POST /api/v1/auth/mock-login` that issues a consumer JWT for a demo 车主, to streamline the Demo without the QR roundtrip. The system MUST provide `GET /api/v1/auth/me` returning the authenticated 车主 for a valid consumer token.

#### Scenario: mock-login 直接拿车主 token
- **WHEN** 调用 `POST /api/v1/auth/mock-login`
- **THEN** 返回车主 access token + refresh token + user
- **AND** 用该 token 调 `GET /api/v1/auth/me` 返回同一车主

