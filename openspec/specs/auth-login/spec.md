# auth-login Specification

## Purpose
消费端手机号 + 短信验证码登录：下发与 auth-qr 等价的车主 JWT（typ=user），验证码 TTL 5min + 同号 60s 频控 + 一次性消费，首次登录自动建号，封禁用户 403，与后台账号物理隔离。当前为 Demo（验证码直出，无真实短信渠道）。
## Requirements
### Requirement: 手机号 + 验证码登录

The system MUST allow a consumer to log in by mobile number + SMS one-time code via `POST /api/v1/auth/sms-code`（请求验证码）+ `POST /api/v1/auth/sms-login`（提交手机号 + 验证码）。验证通过后 MUST 下发车主 JWT（access + refresh，`typ='user'`），与 `auth-qr` 扫码登录下发的 token 等价、共用 `users` store。首次登录的手机号 MUST 自动创建消费端 User。

#### Scenario: 验证码登录成功下发车主 token
- **GIVEN** 一个手机号已请求并收到有效验证码
- **WHEN** `POST /api/v1/auth/sms-login` 提交正确手机号 + 验证码
- **THEN** 系统下发车主 access + refresh token（`typ='user'`）
- **AND** 返回用户信息（id / name / phone）

#### Scenario: 验证码错误或过期被拒
- **WHEN** 提交错误或已过期的验证码
- **THEN** 系统返回 401（不下发 token）

### Requirement: 封禁用户禁止登录

A banned user（`banned=true`）MUST NOT complete SMS login，与 `auth-qr` 的封禁拦截一致，返回 403 `USER_BANNED`。

#### Scenario: 封禁用户验证码登录被拒
- **GIVEN** 一个 `banned=true` 的用户手机号
- **WHEN** 提交正确验证码登录
- **THEN** 系统返回 403 `USER_BANNED`，不下发 token

### Requirement: 与后台账号物理隔离

SMS-login MUST issue only consumer tokens（`typ='user'`），and such a token MUST NOT access any `/api/v1/admin/*` endpoint（沿用 `admin-auth` 的隔离铁律）。

#### Scenario: 车主 token 越权访问后台被拒
- **GIVEN** 经手机号登录得到的车主 token
- **WHEN** 用该 token 调用任意 `/api/v1/admin/*`
- **THEN** 系统返回 401

