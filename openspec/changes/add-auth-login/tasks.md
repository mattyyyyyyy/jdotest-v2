> **前向 change（2026-06-02）· 未实现**：以下任务为待落地工作；实现并测试通过后再 `openspec archive add-auth-login`。

## 1. 后端

- [ ] 1.1 `POST /api/v1/auth/sms-code` 下发验证码（Demo 可 mock，含 TTL + 频控）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
  - Verification: 请求返回 ok，验证码有 TTL
- [ ] 1.2 `POST /api/v1/auth/sms-login` 校验验证码 → 下发车主 token（typ=user）
  - Files: `services/api/src/app.ts`、`consumer-auth.ts`
  - Verification: 正确码下发 token；错误/过期 401
- [ ] 1.3 首次登录自动建号 + 封禁拦截（banned → 403 USER_BANNED）
  - Files: `services/api/src/app.ts`、`store.ts`
- [ ] 1.4 隔离测试：车主 token 访问 `/api/v1/admin/*` → 401
  - Files: `services/api/src/app.test.ts`

## Done When

- [ ] 上述 task 全勾 + 测试绿
- [ ] `openspec validate add-auth-login --strict` 通过
- [ ] `openspec archive add-auth-login --yes`
- [ ] INDEX 同步 + 关 open-questions 相关项
