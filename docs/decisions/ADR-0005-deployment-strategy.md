# ADR-0005: 部署方案

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0001 前端框架](./ADR-0001-frontend-framework.md)、[ADR-0002 后端运行时](./ADR-0002-backend-runtime.md)、[ADR-0003 数据库 + ORM](./ADR-0003-database-and-orm.md)

## 背景 Context

Demo 阶段需要一个**能给业务方/车厂方演示的可访问环境**，约束：

- 团队规模小，**运维成本必须最低**
- 演示对象在国内/海外都有可能，**域名访问性能要稳**
- Demo 期间不需要扛大流量，但需要 **HTTPS、自定义域名、环境变量管理、回滚机制**
- 阶段二（中期）要接车厂应用市场，可能需要换部署形态（私有部署 / 离线包），所以**部署形态不要锁定**
- 后端依赖 PostgreSQL + Redis，需要可靠的托管服务

## 决策 Decision

### Demo 阶段（当前）

| 组件 | 平台 | 理由 |
|---|---|---|
| **前端 `apps/h5`** | **Vercel** | Vite 项目部署最丝滑、自动 CDN、PR Preview |
| **后端 `services/api`** | **Railway** 或 **Render** | Node 容器一键部署、内置 PG/Redis 选项、按量计费 |
| **PostgreSQL** | Railway/Render 内置 / Supabase / Neon | 与后端同平台减少网络延迟 |
| **Redis** | Railway/Render 内置 / Upstash | 全球 edge Redis，免费额度够 Demo |
| **域名** | Vercel 提供 `*.vercel.app`，需要自定义域名时由用户准备 | 演示阶段子域名够用 |
| **CI/CD** | GitHub Actions | 与 Vercel/Railway 都有官方集成 |

### 多环境策略

- `main` 分支 → 自动部署到 **production**（demo.jdo.app 或 Vercel 默认域名）
- 任何 PR → 自动 **Preview deployment**（Vercel 原生，Railway 也支持 PR env）
- 本地 dev → docker-compose 起依赖、`pnpm dev` 起服务

### 环境变量

- 前端：`VITE_PUBLIC_API_BASE_URL`、`VITE_PUBLIC_ENV`
- 后端：`DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`PAYMENT_MOCK_MODE`、`NODE_ENV`
- 通过 Vercel / Railway dashboard 注入，**.env 文件不入仓**（仅 `.env.example` 入仓）

### 阶段二（中期）保留可选项

- 国内访问需求强 → 后端切换到阿里云容器服务 / 火山引擎
- 接车厂应用市场私有部署 → 输出 Docker 镜像（`infra/Dockerfile.api`）
- 离线包形态 → 前端 `vite build` 产物可独立打包成静态资源包

## 理由 Rationale

1. **Vercel 是 Vite + React 项目的最佳搭档**：
   - 零配置接入，git push 即部署
   - 全球 CDN，边缘缓存能力天然解决"首屏 FCP ≤ 1.5s"目标
   - PR Preview 让产品/业务方在合并前就能点开链接体验
   - 免费额度对 Demo 完全够用
2. **Railway / Render 替代了重型云厂商**：
   - 容器化部署 + 内置 PG/Redis + secret 管理 + 域名 + HTTPS，开箱即用
   - 比 AWS/GCP 简单 10 倍，不需要懂 VPC、IAM、负载均衡
   - 价格透明（按用量），Demo 月成本 < $20
3. **不上 Kubernetes / 微服务编排**：modular monolith + 单容器够用，等真需要再升级
4. **GitHub Actions 是 monorepo CI 的默认选择**：与 Vercel/Railway 都有官方触发器，无需额外服务
5. **保留 Docker 镜像产出能力**：阶段二接车厂私有部署时直接用，不返工

## 替代方案 Alternatives Considered

### 部署平台（前端）

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Netlify** | 与 Vercel 类似 | Vite 集成不如 Vercel 顺 | Vercel 是 Vite 母公司，更原生 |
| **Cloudflare Pages** | CDN 强、免费额度大 | SSR/Functions 路径与 Vercel 略不同 | 演示阶段 Vercel 更熟 |
| **GitHub Pages** | 极简免费 | 仅静态、无 PR Preview | 缺关键能力 |
| **阿里云 OSS + CDN** | 国内访问快 | 配置繁琐、CI 集成弱 | Demo 阶段不必要 |

### 部署平台（后端）

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **AWS Fargate / ECS** | 工业级 | 配置极重、需要 IAM/VPC 知识 | Demo 杀鸡用牛刀 |
| **Google Cloud Run** | 按请求计费、容器友好 | 冷启动延迟、PG 需另选 | Railway/Render 更简单 |
| **Fly.io** | 全球边缘部署 | 学习曲线、复杂场景文档少 | Railway 更顺 |
| **Vercel Functions（后端也跑 Vercel）** | 同平台运维 | serverless 长连接/SSE/状态管理弱、PG 连接池麻烦 | Fastify 是长进程，不适合 serverless |
| **DigitalOcean App Platform** | 简单、价格友好 | 没有 Railway 那么丝滑 | 备选项 |
| **自建 VPS（阿里云 ECS / Linode）** | 完全控制、便宜 | 运维成本高（更新系统/HTTPS/防火墙都要管） | Demo 阶段不值得 |

### 数据库托管

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Supabase** | PG + Auth + Storage 一站式 | 服务绑定深、跨平台不友好 | 与 Prisma 直接配合时不如纯 PG 灵活 |
| **Neon** | PG serverless、branching | branching 对 Demo 价值不大 | 是后备选项 |
| **PlanetScale** | branching 工作流 | 不支持 FK | 已排除（见 ADR-0003）|

## 后果 Consequences

### 正面影响
- ✅ 一键部署、零运维、有 PR Preview
- ✅ Demo 月成本极低（< $20）
- ✅ HTTPS / 域名 / secret 都开箱即用
- ✅ 阶段二要换平台时，Docker 镜像 + 12-factor 配置已经准备好

### 负面影响 / 代价
- ⚠️ Vercel / Railway 默认不在国内有节点，国内车厂演示时可能首屏稍慢，需要时换阿里云
- ⚠️ Railway / Render 都有免费额度上限，超出后需要付费（Demo 不会触及）
- ⚠️ 部署形态多样化（Vercel + Railway + 各家 DB）意味着环境变量分布在多平台，需要 README 集中记录

### 后续需要做的事
- [ ] 在 Vercel 创建 project，绑定 GitHub 仓库 main 分支
- [ ] 在 Railway 创建 project，部署 `services/api` + PG + Redis（或选 Render）
- [ ] 在 GitHub Settings → Secrets 配置 deploy token（Vercel/Railway）
- [ ] 写 `.github/workflows/ci.yml`：push main 时跑 lint + test + build，触发部署
- [ ] 写 `.env.example` 标注所有环境变量与示例值
- [ ] 写 `infra/Dockerfile.api`（即使 Demo 阶段没用到，阶段二要立刻能用）
- [ ] 在 README 总结部署链接 + 各平台 dashboard 入口
- [ ] 阶段二决定接哪家车厂时新建 ADR，决定是否切换到国内云厂商
