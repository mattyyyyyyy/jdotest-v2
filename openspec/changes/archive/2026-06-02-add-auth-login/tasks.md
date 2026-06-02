> **已实现（2026-06-02）**：spec 行为全部落地并测试。映射：验证码=`consumer-auth.ts` `issueSmsCode`/`verifySmsCode`（TTL 5min + 同号 60s 频控 + 一次性消费）；路由=`app.ts` `/api/v1/auth/sms-code`、`/api/v1/auth/sms-login`（复用 `issueUserToken`）；建号/封禁=`store.userByPhone`/`createUser` + banned 403。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 `POST /api/v1/auth/sms-code` 下发验证码（TTL 5min + 60s 频控 429）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [x] 1.2 `POST /api/v1/auth/sms-login` 校验验证码 → 下发车主 token（typ=user，一次性消费）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
- [x] 1.3 首次登录自动建号 + 封禁拦截（banned → 403 USER_BANNED）
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.4 隔离测试：验证码登录 token 访问 `/api/v1/admin/*` → 401
  - Files: `services/api/src/app.test.ts`（7 用例绿）

## Done When

- [x] 上述 task 全勾 + 测试绿（76/76）
- [x] `openspec validate add-auth-login --strict` 通过
- [x] `openspec archive add-auth-login --yes`
- [x] INDEX 同步 + 关 open-questions Q12
