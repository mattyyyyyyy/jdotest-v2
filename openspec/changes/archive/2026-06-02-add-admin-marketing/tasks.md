> **回填 change（2026-06-02）**：spec 描述行为已实现。映射：CRUD=`app.ts` 通用资源；门控=`store.ts` `activeBanners`/`activeHeroRecs`（`active!==false`）经 `/bootstrap` 暴露；RBAC=`banners/heroRecs/coupons:write`（运营）+ 审计。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 banners/heroRecs/coupons 通用 CRUD
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 active 启用位门控前台（bootstrap 只返回启用项）
  - Files: `services/api/src/store.ts`、`app.ts`
  - Verification: 停用后 `GET /api/v1/bootstrap` 不含该项
- [x] 1.3 写权限点守卫 + 审计
  - Files: `services/api/src/admin-auth.ts`、`app.ts`

## Done When

- [x] `openspec validate add-admin-marketing --strict` 通过
- [ ] `openspec archive add-admin-marketing --yes` 合并 delta
- [ ] INDEX 同步
