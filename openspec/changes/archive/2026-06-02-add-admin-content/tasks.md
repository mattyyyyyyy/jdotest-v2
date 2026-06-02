> **回填 change（2026-06-02）**：spec 描述行为已实现（reviews 通用 CRUD + hidden）。RBAC=`reviews:write`（运营）+ 审计。缺口：消费端评价读取接口未实现（spec 已标注，未来补时过滤 hidden）。数据=内存 store `reviews`，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 评价审核（hidden 隐藏 / 删除）走通用 CRUD
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 `reviews:write` 守卫 + 审计
  - Files: `services/api/src/admin-auth.ts`、`app.ts`

## 2. 缺口（⏭ 未来 forward，不阻塞本 spec）

- [ ] 2.1 消费端评价读取接口 + 过滤 hidden
  - Files: `services/api/src/app.ts`（新增 `/api/v1/reviews`）

## Done When

- [x] `openspec validate add-admin-content --strict` 通过
- [ ] `openspec archive add-admin-content --yes` 合并 delta
- [ ] INDEX 同步
