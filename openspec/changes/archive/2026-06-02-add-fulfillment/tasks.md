> **已实现（2026-06-02）**：spec 行为全部落地并测试。映射：自提点=`app.ts` `GET /api/v1/fulfillment/pickup-points` + `store.nearbyPickupPoints`（仅 open + 含坐标按距离升序 + limit）；物流=`GET /api/v1/orders/:id/shipping` + `store.shippingByOrder`（节点倒序）。本人校验=`requireUser` + `order.userId` 比对，他人/不存在统一 404。数据源复用后台 `admin-fulfillment` 的 `pickupPoints`/`shipping`。

## 1. 后端（✅ 已实现）

- [x] 1.1 `GET /api/v1/fulfillment/pickup-points`（就近 + 仅营业 + 限 N，默认 5）
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 `GET /api/v1/orders/:id/shipping`（车主 token，仅本人，轨迹倒序，无记录空轨迹）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [x] 1.3 越权测试：他人订单物流 404（不泄漏）+ 无 token 401
  - Files: `services/api/src/app.test.ts`（6 用例绿）

## Done When

- [x] 上述 task 全勾 + 测试绿（76/76）
- [x] `openspec validate add-fulfillment --strict` 通过
- [x] `openspec archive add-fulfillment --yes`
- [x] INDEX 同步
