# 经过验证的开工模式 Battle-Tested Patterns

本参考汇总了"文档先行"项目实际运行后被验证有效的模式。原始案例是一个车机端 H5 电商平台（代号 JDOTEST / studio），已经包含 PRD、ADR、调研、设计系统、功能规格、架构图和多轮高保真原型，并经过多 agent 并行推进多个会话。

下面的模式都可直接套用到新项目，不依赖原案例的领域。

---

## 文档先行项目做得好的地方

- 在 `CLAUDE.md` / `AGENTS.md` 定义项目协作公约，并要求 agent 编辑前先读 `CLAUDE.md` 和 `docs/INDEX.md`
- 把 `docs/` 作为结论唯一来源；没有落文档的结论不算结论（3 天测试法则）
- 用 `docs/INDEX.md` 维护 Active Workstreams、Ownership Zones、Recent Activity 和文档索引
- 用 ADR 记录关键决策，并保留 Superseded 的历史决策
- 明确区分：
  - **产品意图** `docs/PRD.md`
  - **工程细节** `docs/feature-spec.md`
  - **设计规则** `docs/design/*`
  - **研究材料** `docs/research/*`
  - **图示与原型** `diagrams/` / `mockups/`
- 保留多轮原型版本，用最新稳定版本作为实现基准，旧版本归档但不删
- 用领域硬约束驱动设计 token（例如车机场景的触控尺寸、字号、对比度、行车态行为、目标分辨率）
- 在代码落地前先规划目录边界：`apps/`、`services/`、`packages/`、`tools/`、`infra/`
- 在实现前先命名深模块：catalog、cart、order、payment、account、fulfillment、driving-context、IVI shell、bridge

---

## 可复用模式

### 1. 文档主干

最小可工作的目录结构：

```text
CLAUDE.md（或 AGENTS.md）
docs/
  INDEX.md
  project-brief.md
  scope.md
  constraints.md
  architecture.md
  PRD.md                    # 产品型项目
  feature-spec.md           # 路由 / 接口 / 状态机权威源
  backend-spec.md           # 有后端
  api-contracts.md          # 有 API
  testing-strategy.md
  ai-coding-workflow.md
  task-plan.md
  open-questions.md
  decisions/                # ADR-NNNN-*.md
  design/                   # 有 UI
    design-system.md
    page-spec.md
    interaction-patterns.md
  research/                 # 调研材料
  specs/<feature>/          # 复杂功能 spec-driven
diagrams/                   # 架构 / IA / 流程图源文件
mockups/                    # 高保真原型
.claude/
  settings.json             # 强制规则 hooks
.env.example
```

### 2. 多 Agent 协作公约（即使单 agent 项目也建议保留）

建议包含：

- 开工前必读文件清单
- Active Workstreams 登记机制
- 按路径定义 Ownership Zones
- append-only 协作区
- 冲突处理 SOP
- 调研、决策、范围变化必须落到 docs
- commit 自报家门
- harness 强制规则索引（指向 `.claude/settings.json` hooks）

### 3. ADR 依赖链

一个典型产品型 web 项目的 ADR 顺序：

1. **仓库结构与包管理** — monorepo / 单仓库、pnpm / npm / yarn、workspace 工具
2. **前端框架** — React / Vue / Svelte / SolidJS + 构建工具
3. **后端运行时** — Node / Python / Go / Rust + 框架
4. **数据库与 ORM** — PostgreSQL / MySQL / SQLite / MongoDB + Prisma / Drizzle / SQLAlchemy
5. **UI 库与设计系统** — 自研 / Radix / Mantine / Ant Design + tokens 来源
6. **领域特有运行约束** — 例如车机的行车态、IoT 的协议、移动的离线策略
7. **部署策略** — Vercel / Railway / 自建、CI/CD 工具

依赖关系：1 → 2/3/4 → 5 → 6 → 7。**每条 ADR 顶部声明 `依赖：ADR-XXXX`**，便于追溯改 A 会牵动哪些 B。

### 4. Feature Spec 结构

进入可开发状态前，最好映射出：

- 页面和路由（`P-NN` 命名）
- 跨页面模块（`M-XX` 命名）
- 后端模块（`BE-<name>` 命名）
- API 接口（完整 `METHOD /api/v1/...` 路径）
- 状态机（`STATE-A → event → STATE-B`）
- 特定场景下的降级行为（例如行车 / 离线 / 未登录），用统一图标标注 `✅ / ⚠️ / 🚫`
- 验收 checklist（含 happy path + 异常路径 + 边界）
- User Story 到实现项的反向映射
- 带 owner 和状态的开放问题
- **派活看板**：固定 4 个状态值 `🟡 unclaimed / 🔵 in-progress / 🟢 done / 🔴 blocked`，不允许自定义

### 5. Design System 结构

让设计可实现，必须明确记录：

- 设计原则（每条带"行为后果"）
- 颜色 token（含对比度数值，便于校验 WCAG）
- 字号 token（基础值 + 节奏）
- 间距 / 圆角 / 阴影
- 触控目标规则（含设备特殊约束）
- 动效规则（含降级条件）
- 栅格与断点
- 组件契约（变体 / 尺寸 / 状态）
- 跨场景降级（如果有，例如行车态 / 暗色 / 高对比）

`packages/design-tokens/tokens.css` 是单一真相，TS 字面量类型从 CSS variables 推导。

### 6. 文档分工与唯一真相

防止两份不一致的真相，每条事实指派到唯一文档：

| 事实 | 唯一真相 |
|---|---|
| 项目目标 | `project-brief.md` |
| MVP 边界 | `scope.md` |
| 约束 | `constraints.md` |
| 关键决策 | `decisions/ADR-*.md` |
| 路由 / 接口 | `feature-spec.md` |
| 视觉布局 | `design/page-spec.md` |
| 设计 token | `design/design-system.md` |
| 跨页面交互 | `design/interaction-patterns.md` |
| 数据模型 | `backend-spec.md` |
| API 契约 | `api-contracts.md` / `openapi.yaml` |
| 测试与 CI | `testing-strategy.md` |
| 文档索引 | `INDEX.md` |
| AI 协作规则 | `CLAUDE.md` |
| 强制规则 | `.claude/settings.json` |

---

## 给后续项目的经验

### 防漂移

- **不要让 mockup 悄悄漂移出 ADR**。如果原型改变了决策，写新 ADR 并 supersede 旧 ADR，不允许长期分叉。
- **生成式原型很有价值**，但必须指定哪个版本是 canonical。新版本上线后旧版归档不删，标"已归档，以 VX 为准"。
- **维护 docs index** 可以避免重复调研和聊天上下文丢失。

### 多 agent 协作

- 路径所有权和代码所有权一样重要
- `must` 级规则用 hooks 强制，软约束写进 CLAUDE.md 仅作为补充
- 一个项目即使还没写正式代码，只要约束和决策清楚，也已经是成熟项目

### 决策与历史

- ADR 一旦 Accepted 不再随便改，要改用 Superseded 流程
- 旧 ADR 保留历史，新 ADR 顶部写 `Supersedes ADR-XXXX`
- 触发的下游改动在 ADR 末尾"后续需要做的事"列出 checklist，下游 sync 完之前这条 ADR 视为"已 Accepted 但未落地"

### 调研

- 调研先到 `docs/research/` 检索是否已有同主题结论
- 已有 → 直接引用；没有 → 开新调研
- research 是过程，可以多份；结论必须收敛到 ADR，不允许两条相互矛盾的 research 同时 Accepted

### 文档状态

- 文档顶部声明 Draft / Accepted / Superseded / Pending
- 状态变化时同步更新 INDEX 的状态列
- 不删除 Superseded 文档，保留历史指针

---

## 反模式（实际踩过的坑）

- 把所有项目知识塞进 `CLAUDE.md`，导致常驻上下文过大 → 拆到 `docs/`
- requirements、design、tasks 之间没有可追踪关系 → 用 EARS 和 R-NN / T-NN 编号
- AI 只说"已测试"但不记录命令和结果 → 用 verification log 强制留证
- mock API 和真实 API 没有共同契约 → 用 OpenAPI 作为单一真相
- 每次新会话都重新解释项目背景 → 写进 `docs/`，下次 agent 自己读
- mockup 改了但 ADR 没改 → drift 在 INDEX 显式记录，下一轮必须收敛
- 多 agent 并行但没有 workstream 登记 → 撞车、覆盖、孤儿文件
- 用"删除文档"撤销决策 → 历史信息丢，下次同问题被重新讨论。改用 Superseded 流程
