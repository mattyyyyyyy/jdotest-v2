## Why

硬伤（consistency-plan P2#9）：`stock=0` 的商品仍可加购、下单——服务端不校验库存。order-state-machine 虽预留库存语义但未在购买路径接入。本 change 在购物车路径（加购 + 结算）加服务端库存校验并在结算成功后扣减库存。

> POST `/api/v1/orders` 的 items 只有 title/price/qty、无 productId，无法关联库存，故库存校验聚焦有 productId 的购物车路径（加购 + 结算）。直购入口未来补 productId 时再纳入。

## What Changes

- **MODIFIED `cart`**：
  - 加购前校验：商品不存在/下架 → 409 `PRODUCT_UNAVAILABLE`；累计数量超 `stock` → 409 `INSUFFICIENT_STOCK`
  - 结算前校验：任一选中项库存不足 → 409 `INSUFFICIENT_STOCK`，整单不创建、购物车不变（全有或全无）
  - 结算成功后按下单数量扣减 `stock`（售罄归 0 即不可再购）

## Capabilities

### Modified Capabilities
- `cart`: 加购与结算增加库存/上架校验 + 结算扣减库存

## Impact

- 代码：`services/api/src/store.ts`（`productStock`/`cartQty`/`cartCheckoutWithStock`）、`app.ts`（`/cart/items`、`/cart/checkout` 守卫）
- 数据：内存 store（持久化随 ADR-0014 落盘）
- 兼容：所有种子商品 `stock≥10`（`load-v3.ts`），既有加购/结算用例不受影响
- 关联：consistency-plan P2#9、`openspec/specs/order`、`openspec/specs/cart`
