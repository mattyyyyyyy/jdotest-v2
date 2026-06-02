## Why

消费端购物车（feature-spec P-05 + BE-cart）已实现并经 `close-android-commerce-loop` 回归（`/cart` 读取、增删改、`/cart/checkout` 结算），但 `openspec/specs/cart/` 缺位。本 change 以**回填**方式沉淀购物车行为为当前真相。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/cart/`。

## What Changes

- 新增 `cart` 域 spec：读取（价格按现价 join）+ 加购合并 + 增改删 + 结算
- 沉淀**价格取商品现价**（非加购快照，后台改价/下架即时反映）
- 沉淀**加购同款同规格合并**、数量下限 1
- 沉淀**结算走共享订单状态机**（`DRAFT→PENDING_PAYMENT`，移出已选，空选 400）

## Capabilities

### New Capabilities
- `cart`: 购物车读取（现价 join）、加购合并、数量/选中更新与删除、从购物车结算走状态机

### Modified Capabilities
（无——复用 `order` 状态机，不改其 spec）

## Impact

- 代码（现状）：`services/api/src/app.ts`（`/cart` 系列 + `/cart/checkout`）、`store.ts`（`cartView`/`cartAdd`/`cartUpdate`/`cartRemove`/`cartCheckout`）、消费端 V3 + Android `ShoppingState`
- 数据：内存 cart（Demo 单用户），持久化待 Q2；删商品级联清出购物车（见 `store.remove`）
- 关联：`openspec/specs/order`、`openspec/specs/consumer-commerce-loop`、PRD P-05、feature-spec P-05 + BE-cart
