> **回填 change（2026-06-02）**：spec 描述行为已实现。映射：用户 CRUD=`app.ts` 通用资源；封禁联动=`app.ts` `qr-confirm` 的 `user.banned===true → 403`；RBAC=`users:write`（客服）+ 审计。数据=内存 store `users`，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 用户查询（通用 CRUD）
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 封禁联动扫码登录（banned → 403 USER_BANNED）
  - Files: `services/api/src/app.ts`（`/api/v1/auth/qr-confirm`）
  - Verification: `app.test.ts` 封禁车主登录隔离用例绿
- [x] 1.3 `users:write` 守卫 + 审计
  - Files: `services/api/src/admin-auth.ts`、`app.ts`

## Done When

- [x] `openspec validate add-admin-user --strict` 通过
- [ ] `openspec archive add-admin-user --yes` 合并 delta
- [ ] INDEX 同步
