> **前向 change（2026-06-02）· 未实现**：待落地工作；实现并测试通过后再 `openspec archive add-user`。

## 1. 后端

- [ ] 1.1 `GET/PATCH /api/v1/me` 个人资料（车主 token 守卫，仅本人）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [ ] 1.2 地址簿 CRUD `/api/v1/me/addresses`（默认互斥 + 按 userId 隔离）
  - Files: `services/api/src/app.ts`、`store.ts`（新增 addresses）
- [ ] 1.3 积分/余额只读（`/api/v1/me` 或 `/api/v1/me/wallet`，来源 admin-user）
  - Files: `services/api/src/app.ts`
- [ ] 1.4 越权测试：A 车主不能读写 B 的资料/地址
  - Files: `services/api/src/app.test.ts`

## Done When

- [ ] 上述 task 全勾 + 测试绿
- [ ] `openspec validate add-user --strict` 通过
- [ ] `openspec archive add-user --yes`
- [ ] INDEX 同步
