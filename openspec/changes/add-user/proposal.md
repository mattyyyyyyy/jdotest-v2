## Why

消费端个人中心 / 地址簿（feature-spec P-10/11 → `user` 域）**尚未实现** API——当前仅有 `GET /api/v1/auth/me`（返回 id/name/phone），无地址簿、无积分/余额读取接口（积分/余额仅后台 `admin-user` 可见）。本 change 是**前向提案**，沉淀目标行为为 spec，待实现后再 archive。

> **前向（forward）change**：未实现，propose 后留在 `openspec/changes/`，不 archive。

## What Changes

- 新增 `user` 域 spec：个人资料读写 + 地址簿 CRUD + 积分/余额只读
- 沉淀**默认地址互斥**、**资源按车主隔离**（不可读写他人）
- 积分/余额由后台 `admin-user` 维护，消费端只读

## Capabilities

### New Capabilities
- `user`: 消费端个人资料、地址簿 CRUD、积分余额展示

### Modified Capabilities
（无）

## Impact

- 代码（待实现）：`services/api/src/app.ts` 新增 `/api/v1/me`、`/api/v1/me/addresses`、`/api/v1/me/wallet`，复用 `consumer-auth` 守卫；`store.ts` 增 addresses 集合
- 数据：复用 `users` 集合（points/balance），新增 addresses（按 userId 归属）
- 关联：`openspec/specs/auth-qr`、`add-auth-login`（登录入口）、`admin-user`（积分余额来源）、PRD P-10/11、feature-spec P-10/11 + BE-user
