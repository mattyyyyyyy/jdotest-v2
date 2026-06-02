## 1. 实现（✅）

- [x] 1.1 store `reviewsByProduct(productId?)`（过滤 hidden）
  - Files: `services/api/src/store.ts`
- [x] 1.2 `GET /api/v1/reviews?productId=`
  - Files: `services/api/src/app.ts`
- [x] 1.3 测试：过滤 hidden + 后台隐藏后消费端不可见
  - Files: `services/api/src/app.test.ts`

## Done When

- [x] `openspec validate add-consumer-reviews --strict` 通过
- [x] 测试全绿 + typecheck 净
- [ ] `openspec archive add-consumer-reviews --yes`
- [ ] INDEX / consistency-plan 同步
