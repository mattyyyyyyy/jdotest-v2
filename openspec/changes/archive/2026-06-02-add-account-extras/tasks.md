## 1. 实现（✅）

- [x] 1.1 store favorites（结构 + 持久化快照 + add/remove/byUser，幂等）
  - Files: `services/api/src/store.ts`
- [x] 1.2 store activeCoupons + aftersaleByUser（经订单 userId join）
  - Files: `services/api/src/store.ts`
- [x] 1.3 路由：`/api/v1/coupons`、`/me/favorites` GET/POST/DELETE、`/me/aftersale`
  - Files: `services/api/src/app.ts`
- [x] 1.4 测试：收藏幂等/隔离/404、可领券过滤、售后按 userId 隔离
  - Files: `services/api/src/app.test.ts`

## Done When

- [x] `openspec validate add-account-extras --strict` 通过
- [x] 测试全绿 + typecheck 净
- [ ] `openspec archive add-account-extras --yes`
- [ ] INDEX / consistency-plan 同步
