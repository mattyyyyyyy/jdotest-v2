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

### Requirement: 我的收藏

The system MUST let a logged-in consumer manage favorites via `GET/POST/DELETE /api/v1/me/favorites[/:productId]`（需车主 token）。收藏存 `productId`、按 userId 归属、同款幂等（重复收藏不产生重复行）。列表 MUST join 商品现状（标题/图/现价/是否上架），下架商品仍展示但标 `onShelf=false`。收藏不存在商品 MUST 返回 404；取消未收藏的商品 MUST 返回 404。收藏 MUST 按车主隔离，不可读写他人收藏。

#### Scenario: 收藏后出现在我的收藏
- **GIVEN** 一个已登录车主
- **WHEN** `POST /api/v1/me/favorites { productId }` 收藏一个在售商品
- **THEN** 返回 201
- **AND** `GET /api/v1/me/favorites` 含该商品（带 title/price/onShelf）

#### Scenario: 重复收藏幂等
- **GIVEN** 已收藏商品 A
- **WHEN** 再次收藏 A
- **THEN** 收藏列表中 A 仍只有一条

#### Scenario: 取消收藏
- **WHEN** `DELETE /api/v1/me/favorites/:productId`
- **THEN** 该商品移出收藏；未收藏过则返回 404

### Requirement: 可领优惠券列表

The system MUST expose `GET /api/v1/coupons` 返回**可领**优惠券（`active=true` 且 `stock>0`）。停用或库存为 0 的券 MUST NOT 出现。此接口为消费端公开读取（无需登录）。

#### Scenario: 只返回可领券
- **GIVEN** 券池含启用有库存、启用零库存、停用 三类
- **WHEN** `GET /api/v1/coupons`
- **THEN** 只返回 `active=true` 且 `stock>0` 的券

### Requirement: 我的售后单

The system MUST let a logged-in consumer list their own aftersale tickets via `GET /api/v1/me/aftersale`（需车主 token）。售后单经其关联订单的 `userId` 归属当前车主；MUST NOT 返回他人订单的售后单。

#### Scenario: 只看自己的售后单
- **GIVEN** 车主 A 有关联其订单的售后单，车主 B 也有
- **WHEN** A `GET /api/v1/me/aftersale`
- **THEN** 只返回 A 的订单对应的售后单

