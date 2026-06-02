## ADDED Requirements

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
