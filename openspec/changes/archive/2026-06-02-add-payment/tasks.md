> **回填 change（2026-06-02）**：spec 描述行为已实现并经回归。映射：`app.ts` `POST /api/v1/payments/:orderId/confirm`——404 不存在 / 已 PAID 幂等 / `transition(from,'paid')` 非法 409 带 allowed / 合法更新。Demo mock 支付，真实渠道接入时入口语义不变。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 支付确认走共享状态机（PENDING_PAYMENT→PAID）
  - Files: `services/api/src/app.ts`、`packages/order-state-machine`
- [x] 1.2 重复回调幂等（已 PAID 返回 idempotent）
  - Files: `services/api/src/app.ts`
- [x] 1.3 不可支付状态 409 带 allowed；订单不存在 404
  - Files: `services/api/src/app.ts`
  - Verification: `app.test.ts` Web 支付契约用例绿

## 2. 后续（⏭ 不阻塞 spec）

- [ ] 2.1 对接真实支付渠道替换 mock 回调

## Done When

- [x] `openspec validate add-payment --strict` 通过
- [ ] `openspec archive add-payment --yes` 合并 delta
- [ ] INDEX 同步
