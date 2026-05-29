# ADR-0006: monorepo 工具选型

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude

## 背景 Context

车机电商平台仓库需要同时管理：

- 1 个前端 H5 应用（`apps/h5`）
- 1 个后端单体（`services/api`，按 domain 模块化）
- 多个共享包（`packages/shared-types`、`order-state-machine`、`design-tokens`、`api-contracts`、`eslint-config`、`ui-components`）
- 工具脚本（`tools/seed`、`tools/e2e`）
- 基础设施 + 文档

需要一个 monorepo 工具来解决：

- **依赖管理**：避免每个子项目独立 `npm install` 的重复下载与版本漂移
- **任务编排**：`build` / `test` / `lint` 在多包间按拓扑顺序并行执行
- **增量构建**：只构建变更影响的包，CI 与本地都受益
- **类型直连**：包之间 TS 引用走 source code，热更新友好

本 ADR 作为 7 个 ADR 中的第一个落地，**阻塞所有后续工作**（前端骨架、后端骨架、CI 配置都依赖它先定）。

## 决策 Decision

**采用 pnpm workspaces + Turborepo 组合。**

- 包管理 / workspace 管理：`pnpm` ≥ 9
- 任务编排 / 缓存：`turbo` ≥ 2

## 理由 Rationale

1. **pnpm 性能与磁盘占用最优**：基于 symlink + content-addressable store，安装速度快、磁盘占用比 npm/yarn 低 60%+
2. **pnpm workspaces 已是事实标准**：Vite、Vue、Astro、Nuxt 等主流框架的官方仓库都用 pnpm workspaces
3. **Turborepo 提供远程缓存能力**：本地构建产物可缓存复用，CI 可对接 Vercel/自建远程缓存，显著缩短构建时间
4. **零中心化服务依赖**：开箱即用，不像 Nx Cloud / Rush 那样需要额外服务
5. **生态契合**：与 TypeScript / React / Vite / Node.js 完美兼容，遇到问题易于在 GitHub Issues 找到答案
6. **学习曲线低**：核心命令 `pnpm install` / `turbo run build` 简单直接，团队上手快

## 替代方案 Alternatives Considered

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **npm workspaces** | 零额外依赖，Node 自带 | 安装慢、无并行执行、无缓存 | 性能瓶颈，无法支持中等规模 monorepo |
| **yarn workspaces (v1)** | 成熟 | 已停止维护 | 不推荐用于新项目 |
| **yarn workspaces (v2/3/4 Berry)** | PnP 性能好 | 生态分裂、与部分工具不兼容 | 兼容性风险 |
| **Nx** | 功能强大、有图形化依赖图、插件丰富 | 学习曲线陡、配置量大、强生态绑定 | Demo 阶段过度设计，团队规模不需要 |
| **Lerna** | 老牌 | 2022 后被 Nx 接管，独立活跃度下降 | 与其用 Lerna 不如直接上 Nx |
| **Rush** | 微软出品、企业级 | 配置极重、学习成本高 | 杀鸡用牛刀 |
| **Bazel** | Google 出品、跨语言 | 配置非常重、JS 生态非主流 | 不适合纯 JS/TS 项目 |
| **裸 pnpm workspaces（不加 turbo）** | 更简单 | 无缓存、无任务编排，CI 慢 | 缺增量构建能力，长期不可持续 |

## 后果 Consequences

### 正面影响

- ✅ 依赖安装 30s 内完成（vs npm 可能 3–5 分钟）
- ✅ `turbo run build` 增量构建，未变更的包跳过
- ✅ CI 可对接远程缓存，PR 验证时间稳定可控
- ✅ 共享包 hot reload 友好，开发体验顺畅
- ✅ 升级路径清晰：若未来要拆 polyrepo，pnpm 包可直接发布到私有 registry

### 负面影响 / 代价

- ⚠️ 开发者必须装 pnpm，不能用 npm 混用（混用会破坏 lock 文件）
- ⚠️ 部分老旧工具（如某些 webpack 插件）对 symlink 不友好，需要 `node-linker=hoisted` 兜底
- ⚠️ Turborepo 配置文件 `turbo.json` 需要团队理解 pipeline 概念

### 后续需要做的事

- [ ] 创建 `pnpm-workspace.yaml`，声明 `apps/*`、`services/*`、`packages/*`、`tools/*`
- [ ] 创建 `turbo.json`，定义 `build` / `test` / `lint` / `typecheck` 四条 pipeline
- [ ] 创建根 `package.json`，声明 `packageManager: "pnpm@9.x.x"`（pnpm 会强制版本一致）
- [ ] 在 `README.md` 标注 pnpm 版本要求与 `corepack enable` 启用方式
- [ ] CI 使用 `pnpm install --frozen-lockfile` 保证 lock 文件不漂移
- [ ] 后续 ADR-0001（前端框架）落地时，按本决策的目录结构创建 `apps/h5`
- [ ] 添加 `.npmrc`（可选）锁定 registry、配置 `auto-install-peers=true`

## 关联文档

- 上游：[docs/PRD.md](../PRD.md) §Implementation Decisions / 仓库与目录规划
- 下游（被本 ADR 解锁）：
  - ADR-0001 前端框架选型（pending）
  - ADR-0002 后端运行时与框架（pending）
  - ADR-0003 数据库 + ORM（pending）
  - ADR-0007 UI 库 / 设计系统起点（pending）
