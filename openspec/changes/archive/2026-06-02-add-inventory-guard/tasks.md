## 1. store 库存逻辑

- [x] 1.1 `productStock(id)` / `cartQty(productId, spec)` 读取辅助
  - Files: `services/api/src/store.ts`
- [x] 1.2 `cartCheckoutWithStock()`：校验全部选中项库存，不足返回明细（不动购物车），充足则扣减 + 结算
  - Files: `services/api/src/store.ts`

## 2. 路由守卫

- [x] 2.1 `POST /cart/items` 加购前校验（下架 409 PRODUCT_UNAVAILABLE / 超库存 409 INSUFFICIENT_STOCK）
  - Files: `services/api/src/app.ts`
- [x] 2.2 `POST /cart/checkout` 改用 `cartCheckoutWithStock`，不足 409
  - Files: `services/api/src/app.ts`

## 3. 测试

- [x] 3.1 下架加购 409 / 超库存加购 409 / 结算库存不足整单 409 不动车 / 结算成功扣减库存
  - Files: `services/api/src/app.test.ts`

## Done When

- [x] `openspec validate add-inventory-guard --strict` 通过
- [x] 测试全绿 + typecheck 净
- [ ] `openspec archive add-inventory-guard --yes`
- [ ] INDEX / consistency-plan 同步
