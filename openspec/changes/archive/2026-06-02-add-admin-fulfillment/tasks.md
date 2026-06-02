> **回填 change（2026-06-02）**：spec 描述行为已实现（pickupPoints/shipping 通用 CRUD）。RBAC 权限点分离：`pickupPoints:write`（运营）/ `shipping:write`（客服），均落审计。缺口：消费端履约读取接口未实现（forward `add-fulfillment`）。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 自提点 CRUD（含 open 启停）
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 物流轨迹录入（shipping，以 orderId 为主键）
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.3 分角色权限点守卫（pickupPoints:write / shipping:write）+ 审计
  - Files: `services/api/src/admin-auth.ts`、`app.ts`

## 2. 缺口（⏭ forward add-fulfillment）

- [ ] 2.1 消费端 `/api/v1/fulfillment/*` 读取接口

## Done When

- [x] `openspec validate add-admin-fulfillment --strict` 通过
- [ ] `openspec archive add-admin-fulfillment --yes` 合并 delta
- [ ] INDEX 同步
