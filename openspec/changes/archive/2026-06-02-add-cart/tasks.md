> **回填 change（2026-06-02）**：spec 描述行为已实现并经回归。映射：读取=`store.cartView`（join 现价 + onShelf）；加购合并=`store.cartAdd`；增改删=`cartUpdate`/`cartRemove`（qty 钳制 ≥1）；结算=`app.ts` `/cart/checkout` 调 `cartCheckout` + `transition`。数据=内存 cart，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 购物车读取按商品现价 join（含 onShelf）
  - Files: `services/api/src/store.ts` `cartView`、`app.ts`
- [x] 1.2 加购合并同款同规格 + 201
  - Files: `services/api/src/store.ts` `cartAdd`、`app.ts`
- [x] 1.3 数量/选中更新（下限1）+ 删除（404）
  - Files: `services/api/src/store.ts`、`app.ts`
- [x] 1.4 结算走状态机 + 移出已选 + 空选 400
  - Files: `services/api/src/app.ts`、`packages/order-state-machine`
  - Verification: `app.test.ts` 结算/支付契约用例绿

## Done When

- [x] `openspec validate add-cart --strict` 通过
- [ ] `openspec archive add-cart --yes` 合并 delta
- [ ] INDEX 同步
