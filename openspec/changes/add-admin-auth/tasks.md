## 1. 数据与种子

- [ ] 1.1 Prisma schema 增 AdminUser / Role / Permission / RolePermission / AdminAuditLog
  - Files: `services/api/prisma/schema.prisma`
  - Verification: `pnpm --filter @jdo/api db:migrate` 成功
- [ ] 1.2 seed 预设 4 角色 + 权限点 + 初始超管账号
  - Files: `services/api/prisma/seed-admin.ts`
  - Verification: `pnpm --filter @jdo/api seed:admin` 后 DB 有 4 role + 超管

## 2. 后端鉴权与授权

- [ ] 2.1 admin-auth service：bcrypt 校验 + 签 admin JWT（独立 secret）
  - Files: `services/api/src/modules/admin-auth/service.ts` + `.test.ts`
  - Verification: `pnpm --filter @jdo/api test --grep admin-auth.service`
- [ ] 2.2 gateway admin 守卫：验 admin JWT + 权限点比对
  - Files: `services/api/src/gateway/admin-auth.guard.ts` + `.test.ts`
  - Verification: 越权用例（消费 token / 权限不足）断言 401/403
- [ ] 2.3 审计中间件：写操作落 AdminAuditLog
  - Files: `services/api/src/modules/admin-auth/audit.middleware.ts` + `.test.ts`
  - Verification: 写操作后查到审计记录含 before-after
- [ ] 2.4 login / refresh controller + 登录限流 5/min/IP
  - Files: `services/api/src/modules/admin-auth/controller.ts`
  - Verification: Swagger 可见 `/admin/auth/login`；超限断言 429

## 3. 契约与前端

- [ ] 3.1 OpenAPI 增 `/admin/auth/*` 分组
  - Files: `packages/api-contracts/openapi.yaml`
  - Verification: `pnpm test:contract` 全绿
- [ ] 3.2 apps/admin 登录页（复用 design token，桌面布局）
  - Files: `apps/admin/src/pages/login/*`
  - Verification: 本地登录跑通拿到 admin token，错误密码提示

## Implementation Order

1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 3.2

## Done When

- [ ] 所有 task 勾上
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全绿
- [ ] 越权集成测试（消费 token 访问 admin）断言 401
- [ ] `openspec validate add-admin-auth --strict` 通过
- [ ] `openspec archive add-admin-auth --yes` 成功
- [ ] `docs/INDEX.md` Recent Activity 记录
