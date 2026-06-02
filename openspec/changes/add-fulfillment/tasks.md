> **前向 change（2026-06-02）· 未实现**：待落地工作；实现并测试通过后再 `openspec archive add-fulfillment`。数据源复用后台 `admin-fulfillment` 维护的 `pickupPoints`/`shipping`。

## 1. 后端

- [ ] 1.1 `GET /api/v1/fulfillment/pickup-points`（就近 + 仅营业 + 限 N）
  - Files: `services/api/src/app.ts`、`store.ts`
- [ ] 1.2 `GET /api/v1/orders/:id/shipping`（车主 token，仅本人，轨迹倒序）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [ ] 1.3 越权测试：他人订单物流 403/404
  - Files: `services/api/src/app.test.ts`

## Done When

- [ ] 上述 task 全勾 + 测试绿
- [ ] `openspec validate add-fulfillment --strict` 通过
- [ ] `openspec archive add-fulfillment --yes`
- [ ] INDEX 同步
