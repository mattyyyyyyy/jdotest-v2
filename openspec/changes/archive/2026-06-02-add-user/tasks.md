> **已实现（2026-06-02）**：spec 行为全部落地并测试。映射：资料=`app.ts` `GET/PATCH /api/v1/me`（仅昵称可改）+ `store.userProfile`/`updateUserName`；钱包=`GET /api/v1/me/wallet`；地址簿=`/api/v1/me/addresses` CRUD + `store.address*`（首个自动默认 + 默认互斥 + 按 userId 隔离）。车主守卫=`requireUser`。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 `GET/PATCH /api/v1/me` 个人资料（车主 token 守卫，仅本人，仅昵称可改）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [x] 1.2 地址簿 CRUD `/api/v1/me/addresses`（默认互斥 + 按 userId 隔离 + 404）
  - Files: `services/api/src/app.ts`、`store.ts`（新增 addresses）
- [x] 1.3 积分/余额只读（`/api/v1/me` + `/api/v1/me/wallet`，来源 admin-user 维护）
  - Files: `services/api/src/app.ts`
- [x] 1.4 越权测试：B 车主看不到/改不动 A 的地址（404）
  - Files: `services/api/src/app.test.ts`（7 用例绿）

## Done When

- [x] 上述 task 全勾 + 测试绿（76/76）
- [x] `openspec validate add-user --strict` 通过
- [x] `openspec archive add-user --yes`
- [x] INDEX 同步
