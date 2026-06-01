> **实施记录（2026-06-01 · apply 完成）**：3 条 requirement 全部实现并测试——`consumer-auth.ts`（车主 token typ=`user` + 扫码会话表 TTL/banned）+ app.ts 5 路由（qr-code/qr-confirm/qr-status/mock-login/me）+ app.test.ts **9 个用例**（pending/expired/confirmed 拿 token/banned 403/TTL 超时/mock-login+me/无 token 401/车主 token 访后台 401/admin token 当车主用 401）。typecheck 绿，api 测试 47/47。`openspec validate add-qr-login --strict` 通过。

## 1. 车主鉴权模块

- [ ] 1.1 `consumer-auth.ts`：车主 token 签发/校验（HMAC，独立 secret，typ `user`/`user-refresh`）
  - Files: `services/api/src/consumer-auth.ts`
  - Verification: 单测覆盖 sign/verify + typ 不匹配拒绝
- [ ] 1.2 扫码会话表：createSession / confirmSession / getStatus（TTL 过期、banned 拒绝）
  - Files: `services/api/src/consumer-auth.ts`
  - Verification: 过期/未知 → expired；confirm → confirmed

## 2. 路由

- [ ] 2.1 `POST /api/v1/auth/qr-code` 出码会话
  - Files: `services/api/src/app.ts`
  - Verification: 返回 sessionId + qrUrl + expiresAt + status=pending
- [ ] 2.2 `POST /api/v1/auth/qr-confirm` 手机确认（banned→403）
  - Files: `services/api/src/app.ts`
- [ ] 2.3 `GET /api/v1/auth/qr-status` 轮询（confirmed 下发车主 JWT）
  - Files: `services/api/src/app.ts`
- [ ] 2.4 `POST /api/v1/auth/mock-login` + `GET /api/v1/auth/me`
  - Files: `services/api/src/app.ts`

## 3. 测试与隔离

- [ ] 3.1 扫码登录链路集成测试（qr-code → confirm → status 拿 token）
  - Files: `services/api/src/app.test.ts`
- [ ] 3.2 隔离用例：车主 token 调 `/api/v1/admin/*` → 401；banned 车主 confirm → 403
  - Files: `services/api/src/app.test.ts`
  - Verification: `vitest run` 全绿 + typecheck 绿

## Implementation Order

1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 3.2

## Done When

- [ ] `tsc --noEmit` 绿 + `vitest run` 全绿（含隔离用例）
- [ ] `openspec validate add-qr-login --strict` 通过
- [ ] `openspec archive add-qr-login --yes` 成功
- [ ] `docs/INDEX.md` Recent Activity 记录
