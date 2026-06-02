> **回填 change（2026-06-02）**：spec 描述行为已实现（`app.ts` `GET /api/v1/admin/analytics`）。
> 订单类指标真实聚合自内存 store `orders`；流量类（pv/uv/drivingSwitches）为 Demo 固定值，待接埋点（spec 已标注）。RBAC=`analytics:read`（四角色 `*:read`）。

## 1. 后端（✅ 已实现）

- [x] 1.1 看板聚合 endpoint（orderTotal/channel/gmv 实时聚合）
  - Files: `services/api/src/app.ts`
  - Verification: 新建订单后 orderTotal/gmv/channel 变化
- [x] 1.2 `analytics:read` 守卫（四角色可读，无 token 401）
  - Files: `services/api/src/admin-auth.ts`、`app.ts`
  - Verification: 无 token 请求断言 401

## 2. 后续（⏭ 不阻塞 spec）

- [ ] 2.1 接入真实埋点替换 pv/uv/drivingSwitches 固定值
  - Files: 待埋点方案

## Done When

- [x] `openspec validate add-admin-analytics --strict` 通过
- [ ] `openspec archive add-admin-analytics --yes` 合并 delta
- [ ] INDEX 同步
