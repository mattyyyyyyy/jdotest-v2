> **回填 change（2026-06-02）**：本 change 的 spec 描述的行为**已全部实现并测试**（`services/api`），propose 即完工，archive 前补此记录。
> 实现要点与 spec 的映射：
> - 通用 CRUD：`store.ts` `list/get/create/update/remove` + `app.ts` `/api/v1/admin/:resource` 系列
> - 商品归一化：`store.ts` `normalizeProduct`（占位图 / 数字化 / 默认值）
> - 分类删除校验：`store.ts` `categoryInUse` + `app.ts` DELETE 分类 409 分支
> - RBAC + 审计：`admin-auth.ts` `parseAdminRoute`/`ROLE_PERMS` + `app.ts` preHandler/onSend 钩子（复用 `admin-auth` 域能力）
> - 数据：内存 store（种子来自 V3 `data.js`），持久化待 Q2 接 PG。
> 勾选口径：✅=已达成；⏭=因架构适配顺延（不阻塞 spec）。

## 1. 后端通用 CRUD（✅ 已实现）

- [x] 1.1 products/categories 经 `/api/v1/admin/:resource` 增删改查
  - Files: `services/api/src/app.ts`、`services/api/src/store.ts`
  - Verification: `app.test.ts` 后台 CRUD 用例绿
- [x] 1.2 商品归一化（占位图 / 价格数字化 / 默认上架）
  - Files: `services/api/src/store.ts` `normalizeProduct`
  - Verification: 新增缺图缺价商品后前台不渲染黑块

## 2. 业务校验与守卫（✅ 已实现）

- [x] 2.1 分类删除引用校验（被引用 409 `CATEGORY_IN_USE`）
  - Files: `services/api/src/app.ts`、`store.ts` `categoryInUse`
  - Verification: 删除被占用分类断言 409
- [x] 2.2 写操作受 `products:write`/`categories:write` 权限点守卫 + 审计落库
  - Files: `services/api/src/admin-auth.ts`、`app.ts` preHandler/onSend
  - Verification: 客服改商品断言 403；运营改价后查到 auditLogs

## 3. 文档对齐（⏭ 修注释 drift，随收尾提交）

- [ ] 3.1 修 `app.ts:263` 旧注释「Demo 未挂 RBAC」为实际已强制权限点
  - Files: `services/api/src/app.ts`
  - Verification: 注释与 preHandler 实际行为一致

## Done When

- [x] delta spec 通过 `openspec validate add-admin-catalog --strict`
- [ ] `openspec archive add-admin-catalog --yes` 成功，delta 并入 `specs/admin-catalog/`
- [ ] `docs/INDEX.md` §OpenSpec 表更新 + Recent Activity 记录
