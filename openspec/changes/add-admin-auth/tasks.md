> **实施记录（2026-06-01 · apply 完成，archive 前补）**
> 本 change 的 spec（3 条 requirement + scenario）**已全部实现并测试**，但**架构按项目实况适配**，与原 tasks 假设的技术栈有出入（spec 行为不变）：
> - 数据：用**内存 store**（`services/api/src/store.ts` 的 `adminUsers`/`auditLogs`），**非 Prisma**——持久化待 Q2 接 PG 时迁移；故 task 1.1/1.2 的 Prisma migration 不适用。
> - 密码：用 Node 内置 **scrypt** 加盐哈希，**非 bcrypt**（零依赖、等价安全；spec requirement 仅要求"hashed"）。
> - token：用 **HS256 紧凑 token**（`admin-auth.ts`），**非 jsonwebtoken 库**；独立 `ADMIN_JWT_SECRET`。
> - 前端：登录走**内嵌 admin-spa**（`admin-spa.ts`），**非独立 `apps/admin`**（与项目当前形态一致）。
> - 契约：OpenAPI yaml 尚未建（全项目层面待办），task 3.1 顺延。
>
> **实现满足 spec**：login(access+refresh) / 消费 token→401 / 客服改价→403 / 审计落库 / 限流 429 / refresh，共 **38 route 测试全绿**（`services/api/src/app.test.ts`）。`openspec validate add-admin-auth --strict` 通过。
> 勾选口径：✅=本架构下已达成；⏭=因架构适配顺延（不阻塞 spec）。

## 1. 数据与种子（⏭ 适配为内存 store，Prisma 顺延至 Q2）

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
