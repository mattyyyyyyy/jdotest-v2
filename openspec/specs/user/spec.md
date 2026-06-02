# user Specification

## Purpose
消费端个人中心：个人资料读取与修改（仅昵称，手机号为登录标识不可改）、地址簿 CRUD（首个自动默认 + 默认互斥 + 按 userId 隔离）、积分与余额只读（由后台 admin-user 维护）。所有接口需车主 token 且仅限本人。
## Requirements
### Requirement: 个人资料读取与修改

The system MUST let a logged-in consumer read and update their own profile via `GET/PATCH /api/v1/me`（需车主 token，`typ='user'`）：昵称 / 头像 等可改字段；手机号为登录标识不可由此接口改。无 token MUST 返回 401。一个车主 MUST 只能读写自己的资料，不能访问他人 user 记录。

#### Scenario: 车主读取自己的资料
- **GIVEN** 一个已登录车主
- **WHEN** `GET /api/v1/me`
- **THEN** 返回该车主资料（id / name / phone / points / balance）

#### Scenario: 未登录访问资料被拒
- **WHEN** 不带车主 token 调用 `GET /api/v1/me`
- **THEN** 系统返回 401

### Requirement: 地址簿 CRUD

The system MUST provide an address book for the logged-in consumer via `GET/POST/PATCH/DELETE /api/v1/me/addresses[/:id]`：收件人 / 电话 / 地址 / 是否默认。设为默认 MUST 互斥（同一时刻仅一个默认地址）。地址 MUST scoped to 当前车主，不可读写他人地址。

#### Scenario: 新增并设为默认地址
- **GIVEN** 车主已有一个默认地址 A
- **WHEN** 新增地址 B 并设为默认
- **THEN** B 成为默认，A 不再是默认（默认互斥）

#### Scenario: 删除地址
- **WHEN** `DELETE /api/v1/me/addresses/:id`
- **THEN** 该地址被移除；不存在返回 404

### Requirement: 积分与余额展示

The system MUST expose the consumer's 积分（points）与余额（balance，分）只读视图（经 `GET /api/v1/me` 或 `GET /api/v1/me/wallet`）。这两个字段由后台 `admin-user` 维护，消费端只读。

#### Scenario: 展示积分余额
- **GIVEN** 后台为车主设置了积分与余额
- **WHEN** 车主读取钱包/资料
- **THEN** 返回的 points / balance 与后台数据一致（balance 单位分）

