## Why

消费端 mock 屏接 API（consistency-plan P0#2）：个人中心的「我的收藏 / 优惠券 / 售后」此前是静态写死、未接后台数据。本 change 补这三块的消费端读取/操作接口，扩展 `user` 域。

## What Changes

- **ADDED `user`**：我的收藏（favorites CRUD，按 userId 隔离 + 幂等 + join 商品）、可领优惠券列表（`active && stock>0` 公开读）、我的售后单（经订单 userId 归属）

## Capabilities

### Modified Capabilities
- `user`: 新增 收藏 / 可领优惠券 / 我的售后 三项消费端能力

## Impact

- 代码：`services/api/src/store.ts`（新增 favorites 结构 + 持久化快照 + `favoritesByUser`/`favoriteAdd`/`favoriteRemove`/`activeCoupons`/`aftersaleByUser`）、`app.ts`（`/api/v1/coupons`、`/me/favorites`、`/me/aftersale`）
- 数据：favorites 新内存结构（随 ADR-0014 落盘）；aftersale 经订单 userId join
- 关联：consistency-plan P0#2、feature-spec（个人中心多屏）、`openspec/specs/user`
