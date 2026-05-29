# ADR-0003: 数据库 + ORM 选型

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0002 后端运行时](./ADR-0002-backend-runtime.md)

## 背景 Context

后端需要持久化层，约束如下：

- 电商主数据（商品、订单、支付、用户、履约）需要**强一致性 + 事务**
- 购物车、会话、二维码登录态需要**高频读写 + TTL**
- TypeScript 后端，需要良好的类型推导（schema → 类型自动生成）
- Demo 阶段单实例够用，但要预留**未来横向扩展**的路径
- 数据库迁移要可控（CI 中跑 migration、回滚要明确）
- 需要 `JSONB`/数组支持（商品规格 `attrs{}`、订单 `items[]` 快照）

## 决策 Decision

**采用 PostgreSQL 16 + Prisma 5（主数据） + Redis 7（缓存/会话）**

- **PostgreSQL**：业务主数据（User / Product / Sku / Order / Payment / Fulfillment 等）
- **Redis**：购物车、登录会话、二维码登录态、限流计数、热点商品缓存
- **Prisma**：schema 单一真相、类型自动生成、迁移工具自带、查询 API 直观
- **本地开发**：通过 `infra/docker-compose.yml` 一键起 PG + Redis
- **生产**：托管服务（云厂商 RDS / Upstash Redis 等）

## 理由 Rationale

1. **PostgreSQL 是当前关系型数据库的事实标准**：
   - ACID 完备，事务可靠
   - JSONB 原生支持，商品规格/订单快照写起来很方便
   - 数组、全文搜索、地理位置等扩展开箱即用
   - 开源生态最厚，托管服务遍地都是
2. **Prisma 在 Node.js + TS 项目中体验最佳**：
   - schema.prisma 单一真相，所有 model + 关系定义在一处
   - `prisma generate` 自动产出强类型 client，IDE 自动补全
   - `prisma migrate` 体验远超 TypeORM / Sequelize 的 CLI
   - 与 Fastify + zod 配合，从 DB 到 API 全程类型贯通
3. **Redis 不可替代**：
   - 购物车 TTL（弃购清理）、二维码登录 TTL（15s 过期）、限流 sliding window —— 都是 KV + TTL 经典场景
   - 不要拿 PG 做这些事，会污染主库
4. **PG + Redis 是电商最经典的存储组合**，未来扩展路径清晰

## 替代方案 Alternatives Considered

### 关系型数据库

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **MySQL 8** | 部署广、生态成熟 | JSON 字段索引弱、复杂查询性能不如 PG | PG 在所有维度都不逊于 MySQL |
| **SQLite** | 零部署、嵌入式 | 单文件、并发差 | 不适合多实例后端 |
| **MariaDB** | MySQL 兼容 | 同 MySQL 的局限 | 同上 |

### ORM / Query Builder

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **TypeORM** | 装饰器风格、与 NestJS 配合好 | 迁移工具弱、类型推导差、社区维护质量参差 | Prisma 完胜 |
| **Drizzle ORM** | SQL-like、bundle 小、edge 友好 | 生态新、迁移工具不如 Prisma 成熟 | 是后备方案，但 Prisma 更稳 |
| **Sequelize** | 老牌 | 类型支持差、API 啰嗦 | Prisma/Drizzle 完胜 |
| **Knex + 手写类型** | 自由度高 | 类型维护负担大 | 工程化效率差 |
| **MikroORM** | UoW 模式、装饰器 | 学习成本、社区小 | Prisma 路线更主流 |

### 缓存 / KV

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Memcached** | 简单 | 无持久化、无丰富数据结构 | Redis 完胜 |
| **DragonflyDB / KeyDB** | 性能更强 | 生态、托管服务少 | Redis 是默认选择 |
| **直接用 PG 做缓存** | 少一种依赖 | 污染主库、性能差 | 不可接受 |

### 数据库方向上的替代

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **MongoDB** | 灵活 schema | 电商交易需要强事务，MongoDB 的事务比 PG 弱 | 电商不应选文档数据库 |
| **PlanetScale (MySQL-based)** | branching 工作流酷 | 不支持 FK | 电商需要 FK |
| **Supabase (PG-based PaaS)** | 自带 Auth/Realtime | 锁定到 Supabase 平台 | Demo 阶段可考虑，但作为通用方案过于绑定 |

## 后果 Consequences

### 正面影响
- ✅ 强一致 + 高性能 + 类型贯通三件事一次搞定
- ✅ schema.prisma 一次写，前端通过 `packages/shared-types` 重新导出 Prisma 类型，复用率高
- ✅ 本地开发只需要 `docker compose up`，团队 onboarding 顺
- ✅ 未来要拆微服务，Prisma 多 schema / 多 client 也支持

### 负面影响 / 代价
- ⚠️ Prisma 在大数据量下的 N+1 查询陷阱需要注意（用 `include` / `select` 严格控制）
- ⚠️ Prisma 5+ binary 模式启动时需要加载 query engine，serverless 冷启动稍长
- ⚠️ Redis 增加一个依赖，本地需要 Docker（已纳入 docker-compose）

### 后续需要做的事
- [ ] 写 `infra/docker-compose.yml`：PG 16-alpine + Redis 7-alpine
- [ ] `services/api` 初始化 Prisma：`pnpm dlx prisma init`
- [ ] 写 `prisma/schema.prisma`，按 PRD 数据模型 preview 落初版
- [ ] 写 `tools/seed/seed.ts`：注入种子商品、用户、地址
- [ ] 配 `pnpm db:migrate` / `pnpm db:reset` / `pnpm seed` 命令
- [ ] 引入 `ioredis`（Redis 客户端），写连接封装
- [ ] CI 增加：起 PG + Redis container → 跑 migration → 跑测试
- [ ] 写 README 标注数据库版本与连接字符串
