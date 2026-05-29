# ADR-0002: 后端运行时与框架

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0006 monorepo 工具](./ADR-0006-monorepo-tool.md)

## 背景 Context

后端 `services/api` 需要选定运行时和框架。约束如下：

- **modular monolith**（PRD 已锁定），单进程内按 domain 拆模块
- 需要支持 **REST + JSON**，未来可能加 SSE（订单状态推送）
- **与前端同栈**（TypeScript），共享 `packages/shared-types`、`packages/order-state-machine`
- 团队规模小，框架不要太重；但 domain 模块边界要清晰，方便未来拆微服务
- Demo 阶段对吞吐要求不高，但**响应延迟 P95 ≤ 200ms**
- 需要良好的中间件生态（CORS、限流、鉴权、错误处理、日志、OpenAPI）

## 决策 Decision

**采用 Node.js 20 LTS + Fastify 4 + TypeScript**

辅助选择：
- **DTO 校验**：`zod`（与 TS 类型互推）
- **OpenAPI 集成**：`@fastify/swagger` + `fastify-type-provider-zod`
- **路由模块化**：每个 domain 一个 Fastify plugin
- **依赖注入**：轻量 IoC（手写 factory），不上 InversifyJS
- **日志**：`pino`（Fastify 默认）
- **测试**：`vitest`（与前端同套，monorepo 友好）
- **进程管理 (Dev)**：`tsx watch`
- **进程管理 (Prod)**：容器内单进程，由 PaaS 重启

## 理由 Rationale

1. **Node.js 与前端同栈**：团队不需要切换语言，共享类型直接 `import`，省双份维护
2. **Fastify 是 Node.js 当前最优的 HTTP 框架**：
   - 性能比 Express 高 2-3 倍（基准测试 ~76k req/s vs ~25k）
   - schema-driven（自带 JSON Schema 校验），与 zod 配合天生支持 OpenAPI
   - 插件系统强，模块化天然
   - 内置 pino 日志、graceful shutdown、生产级默认值
3. **NestJS 不适合 Demo 阶段**：装饰器 + DI 容器对小团队是负担，启动慢、学习成本高
4. **zod 在 TS 项目中已成事实标准**：类型互推、运行时校验、错误信息友好
5. **Vitest 与 monorepo 配合极好**：与 Vite 共享配置，跑得快

## 替代方案 Alternatives Considered

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Express + TS** | 历史悠久、文档多 | 性能差、TS 支持靠社区类型、错误处理弱 | Fastify 完胜，Express 已是老技术债 |
| **NestJS** | 结构化、企业级、装饰器优雅 | 启动慢、学习曲线陡、对小团队过重 | 杀鸡用牛刀；模块边界自己写也能做到 |
| **Hono** | 极致轻量、edge runtime 友好 | 生态较新，电商场景库少 | 风险/收益不平衡 |
| **Koa** | 中间件模型干净 | 生态萎缩 | Fastify 更现代 |
| **Bun + Elysia** | 性能极强、TS 一等公民 | runtime 稳定性、生态成熟度都还在路上 | 不适合生产 Demo |
| **Go + Gin/Echo** | 性能、部署简洁、类型强 | 与前端不同栈，无法共享类型 | 失去 monorepo 共享代码的最大优势 |
| **Java + Spring Boot** | 企业级 | 重、启动慢、与前端栈割裂 | Demo 阶段不合适 |
| **Python + FastAPI** | 上手快、async 友好 | 与前端不同栈、性能逊 Node | 不如 Node 路线干净 |

## 后果 Consequences

### 正面影响
- ✅ 启动快（< 1s），开发体验顺
- ✅ 共享 TS 类型/状态机/校验 schema，前后端真单一真相
- ✅ Fastify 插件生态可直接用（CORS、helmet、rate-limit、JWT）
- ✅ 测试栈与前端统一（vitest）

### 负面影响 / 代价
- ⚠️ Fastify 中文文档少于 Express，团队学习需要看英文
- ⚠️ Node.js 单进程能力有限，未来高并发需要 cluster / 横向扩展（Demo 阶段不会触及）
- ⚠️ DI 简陋（手写 factory），模块多了之后可能需要轻量 IoC

### 后续需要做的事
- [ ] `services/api` 初始化：`pnpm init` + 安装 Fastify、zod、pino、@fastify/swagger
- [ ] 写最小 `main.ts` 启动 + 健康检查 `/healthz`
- [ ] 配置 Fastify plugin 加载约定（每个 domain 一个 plugin）
- [ ] 接入 `@fastify/cors`、`@fastify/helmet`、`@fastify/rate-limit`
- [ ] 配 `@fastify/swagger` 输出 OpenAPI，挂载在 `/docs`
- [ ] 写 `services/api/README.md` 与启动脚本
- [ ] CI 加 typecheck + test + build
