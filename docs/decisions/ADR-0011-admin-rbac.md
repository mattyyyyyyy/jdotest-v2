# ADR-0011: 后台权限模型（RBAC + 审计）

- 状态：Accepted
- 日期：2026-05-29
- 决策者：架构 agent
- 依赖：ADR-0010（admin 应用形态）、ADR-0003（PostgreSQL + Prisma）

## 背景 Context

admin 端多角色操作（运营改商品、客服处理售后、财务看订单金额），需要权限控制 + 操作留痕。消费端用 JWT（手机号 / 扫码），但 admin 是内部账号体系，登录方式与权限粒度都不同。

## 决策 Decision

- **admin 独立账号体系**：`AdminUser`（账号密码 + bcrypt，与消费端 `User` 表隔离），登录走 `POST /api/v1/admin/auth/login` 下发独立 admin JWT（短 access + refresh）
- **RBAC 三层**：`Role`（超管 / 运营 / 客服 / 财务）→ `Permission`（权限点，如 `catalog:write` `order:refund` `user:ban`）→ 中间件按权限点守卫每个 admin endpoint
- **角色预设**（第一阶段固定，不做自定义角色 UI）：
  - 超管：全部权限
  - 运营：catalog / marketing / content / analytics（读写）
  - 客服：order（读 + 改状态 + 售后）/ user（读 + 封禁）
  - 财务：order（只读）/ analytics（只读）
- **操作审计**：所有 admin 写操作经统一中间件落 `AdminAuditLog`（who / when / action / target / before-after / ip）

## 理由 Rationale

- admin 与消费端账号隔离：避免"车主账号能进后台"的越权风险
- 权限点（而非只到角色）让 endpoint 守卫细粒度，未来加角色不用改 endpoint
- 审计日志是后台合规底线，写操作必留痕

## 替代方案 Alternatives Considered

- **复用消费端 User 表加 isAdmin 标记**：否。账号体系混淆，越权面大
- **只做角色不做权限点**：否。endpoint 守卫会硬编码角色，加角色即改代码
- **接第三方 IAM（如 Casbin / OPA）**：Demo 阶段过重，自研够用；预留接口

## 后果 Consequences

- 正面：权限清晰、操作可审计、角色可扩展
- 负面 / 代价：多 4 张表（AdminUser / Role / Permission / AdminAuditLog）+ 守卫中间件
- 后续需要做的事：
  - Prisma schema 增 admin RBAC 4 表 + seed 预设角色与超管账号
  - `services/api/gateway` 加 admin JWT 校验 + 权限点守卫中间件
  - openspec 域 `admin-auth` 写 RBAC + 审计的 requirement
  - `.env.example` 加 `ADMIN_JWT_SECRET` / 初始超管账号种子变量
