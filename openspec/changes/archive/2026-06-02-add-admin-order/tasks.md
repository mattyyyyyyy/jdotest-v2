> **回填 change（2026-06-02）**：spec 描述行为已全部实现并测试（`services/api`）。
> 映射：状态流转=`app.ts` `PATCH /api/v1/admin/orders/:id/status`（调 `transition`/`allowedEvents`）；查询=通用 CRUD；RBAC+审计=`admin-auth.ts` + preHandler/onSend。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 订单状态流转走共享状态机（非法 409 带 allowed，404 不存在）
  - Files: `services/api/src/app.ts`、`packages/order-state-machine`
  - Verification: `app.test.ts` 订单流转用例绿（合法/非法/404）
- [x] 1.2 订单查询（通用 CRUD）+ 消费端下单前→后可见
  - Files: `services/api/src/app.ts`、`store.ts`
  - Verification: 下单后 `GET /api/v1/admin/orders` 含该单
- [x] 1.3 `orders:write` 权限点守卫 + 审计
  - Files: `services/api/src/admin-auth.ts`、`app.ts`
  - Verification: 客服流转落审计；缺权限 403

## Done When

- [x] `openspec validate add-admin-order --strict` 通过
- [ ] `openspec archive add-admin-order --yes` 合并 delta
- [ ] INDEX 同步
