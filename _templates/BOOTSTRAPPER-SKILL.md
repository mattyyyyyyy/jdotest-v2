---
name: ai-project-bootstrapper
description: 将产品想法、需求背景、PRD 草稿或空仓库转成规范的 AI Coding 开工方案。用于 Codex 需要在写业务代码前先确定项目目标、范围、约束、ADR、目录结构、协作规则、环境变量模板和第一阶段实现切片的场景，尤其适合从 0 开始的新项目、monorepo、原型转正式项目、多 agent 协作项目。
---

# AI Project Bootstrapper

使用本 skill 将一段需求背景转成可开工的项目仓库方案。目标是让 AI Coding 可复用、可交接、可追溯：决策写进文档，约束明确可执行，目录结构来自业务边界，后续 agent 不依赖聊天记录也能继续工作。

## 总原则

先文档，再结构，再代码。除非用户明确要求跳过，否则不要在关键开工文档缺失时直接生成生产代码。

如果仓库已经存在，先阅读现有文档和目录结构。尊重已有约定，只补齐缺失的开工材料。

**文档不落地不算结论。** 任何调研、对比、讨论、对齐过的结论必须落到 `docs/` 下成文。下一轮会话不接受"上次说过"，只认仓库——这是防止反复调研、结论漂移、上下文丢失的唯一手段。

判断口诀：**如果这段对话在 3 天后还有人需要知道，就必须写下来。**

**唯一真相原则。** 同一事实只在一个文档维护，其它地方引用而不复制。两份不一致的真相迟早漂移，出现"代码里是 7 类，ADR 里是 6 类"这种 drift。哪个文档拥有哪条事实，在"文档分工与唯一真相"一节明确。

**Feature 级 spec 走 OpenSpec。** 项目级文档（CLAUDE.md / PRD / ADR / brief / scope / constraints / architecture / design-system）保留在 `docs/`；feature / change 级 spec 用 [OpenSpec](https://openspec.dev/) 的 `openspec/specs/`（当前真相）+ `openspec/changes/<id>/`（提议变更）双文件夹模型，走 **propose → apply → archive** 三阶段生命周期，用 delta spec（ADDED / MODIFIED / REMOVED）追踪变更。详见 [references/openspec-integration.md](references/openspec-integration.md)。

## 开工前提

从 0 到 1 的项目，写任何业务代码之前，下列前提必须就位。缺一项就停下来补齐，不要靠"边写边定"绕过：

- 产品意图：目标用户、要解决的问题、价值主张、明确不做什么。落地在 `docs/project-brief.md`。
- 范围：MVP 边界、第一阶段切片、可演示的最小路径。落地在 `docs/scope.md`。
- 关键约束：技术栈、运行环境、合规/安全/性能红线，按 must/should/optional/out 分级。落地在 `docs/constraints.md`。
- 关键决策：技术选型、仓库结构、鉴权、数据模型、部署方式，每条都有 Accepted ADR。落地在 `docs/decisions/`。
- AI 协作公约：开工前必读、路径所有权、提交前检查写清楚。落地在 `CLAUDE.md` 或 `AGENTS.md`。
- 强制执行机制：`must` 级规则在 `.claude/settings.json` 配好 hooks，而不是只靠文档提示。详见"强制执行机制"。
- 环境与密钥：`.env.example` 完整，密钥来源明确，本地运行依赖（数据库、缓存、第三方 mock）启动方式有文档。
- 任务切片：第一阶段任务在 `docs/task-plan.md`（总索引）或 `openspec/changes/<id>/tasks.md`（feature 级）里足够小、可回溯、可验证。
- **验证证据落点**：每个 task 跑完后"命令 + 结果 + 失败原因"写哪里要事先定好——PR 描述模板的 `## Verification` 段、或 `docs/verification-log.md`、或 task 描述里直接附 verification 命令。没有落点的"我做完了"不算做完。这是 harness 5 层中的 observability 层。

某项前提暂时无法定，就把它显式写进 `docs/open-questions.md`，标明谁回答、什么时候回答、空档期使用什么假设。不要让缺失隐式存在。

## 开工三件套

任何 agent 在编辑任何文件前 MUST 按顺序完成下面三步，否则会撞车、覆盖别人工作、产生孤儿文件：

```text
① Read CLAUDE.md / AGENTS.md   ← 协作公约，强制规则与锁定结论
② Read docs/INDEX.md            ← 看 Active Workstreams 是否他人在做、Ownership Zones 路径归属
③ Append docs/INDEX.md          ← 在 §Active Workstreams 加一行登记本次工作
   格式：agent-id | 工作范围 | 起始时间 | 涉及文件
```

完工后把这行从 Active Workstreams 移到 Recent Activity，附上对应 commit。

这套机制即使在单 agent 项目里也有价值——它把"上一轮做了什么、做到哪了"留在仓库里，避免每次新会话从零拼凑上下文。多 agent 项目里更是不可绕过，建议用 `PreToolUse(Edit|Write)` hook 检查是否完成了登记，未登记直接拒绝。

## 执行流程（Bootstrap Workflow）

skill 被触发后按以下 5 阶段推进。每阶段有明确产出，可被中断、续接或跳过。**这是用户视角下"一段需求 → 可开工项目"的标准路径**。

### 阶段 1 · 接收 brief

用户给一段需求即可启动，可以是：

- 一句话想法："我想做一个车机端电商 demo"
- 一段需求背景，含目标用户和场景
- 一份 PRD 草稿或会议纪要文件
- 一个已有仓库的路径（"读 `D:\projects\xxx` 然后帮我规范化"）
- 一个 GitHub repo 链接

**前置 skill 衔接**——本 skill 专注"PRD/brief → 可开工仓库"。如果用户的输入还在更上游，先建议跑对应 skill，避免在本 skill 内重复访谈：

| 用户当前状态 | 建议先跑 | 产物 |
|---|---|---|
| 只有模糊想法，连一句话定位都说不清 | `superpowers/brainstorming` | design.md（已对齐的需求与方案）|
| 有对话沉淀但还没成文 PRD | `mattpocock/skills/to-prd` | GitHub issue（带 `ready-for-agent` 标签）|
| 已有 PRD / brief / 旧仓库 | 直接进本 skill 阶段 2 | — |

skill 先识别**项目类型**（产品型 / 工具型 / 基础设施型 / 数据型 / 库型），决定后续要生成哪些文档。例如纯库项目不生成 `backend-spec.md`，纯前端 demo 不生成完整 backend ADR。

### 阶段 2 · 结构化访谈

按优先级用 4 轮问答补全信息。每轮用 `AskUserQuestion` 工具**批量提问**（1-4 个问题一组），不要一问一答消耗用户耐心。完整问题清单见 [references/interview-script.md](references/interview-script.md)。

| 轮次 | 主题 | 决定什么 |
|---|---|---|
| 轮 1 · 关键 | 产品定位、用户、MVP 范围、技术栈倾向、时间表 | `project-brief.md` / `scope.md` 主干 |
| 轮 2 · 架构 | 后端 / 数据库 / 鉴权 / 部署 / 集成 / monorepo | 前 5 个 ADR |
| 轮 3 · 约束 | 合规、性能、设备 / 浏览器、安全红线 | `constraints.md` 主体 |
| 轮 4 · 协作 | 单 / 多 agent、团队规模、review、hook 强度 | `CLAUDE.md` + `.claude/settings.json` |

每轮结束后简短回放理解，让用户确认或修正。用户答"待定"或不答的项 → 写入 `docs/open-questions.md`，附 skill 推荐的假设默认值，标 `[假设·待确认]`。**不要因为某项未定就卡住流程**。

### 阶段 3 · 生成计划

基于答案，列出 skill 将生成的文件清单（按项目类型筛选）和将创建的 ADR 列表，请求用户确认或调整。典型清单：

```text
核心文档：
  CLAUDE.md
  docs/INDEX.md
  docs/project-brief.md
  docs/scope.md
  docs/constraints.md
  docs/architecture.md
  docs/task-plan.md
  docs/open-questions.md

ADR（按项目类型筛选）：
  ADR-0001 monorepo 工具          [如果是 monorepo]
  ADR-0002 前端框架               [如果有前端]
  ADR-0003 后端运行时             [如果有后端]
  ADR-0004 数据库 / ORM           [如果有数据库]
  ADR-0005 部署策略
  ADR-0006 UI 库 / 设计系统       [如果有 UI]
  ADR-0007 鉴权方案               [如果需要登录]
  ADR-0008 领域特有运行约束       [按需，例如行车态、IoT 协议]

配套：
  .env.example
  .claude/settings.json           [含 hook 模板]
  README.md
  .github/PULL_REQUEST_TEMPLATE.md
  .gitignore

可选（按项目类型）：
  docs/PRD.md                     [产品型]
  docs/feature-spec.md            [有功能拆解需求]
  docs/backend-spec.md            [有后台]
  docs/api-contracts.md           [有前后端 / 服务间通信]
  docs/testing-strategy.md
  docs/integration-plan.md        [前后端分离]
  docs/ai-coding-workflow.md
  docs/design/design-system.md    [有 UI]
  docs/design/page-spec.md        [有页面]
  docs/design/interaction-patterns.md  [跨页面交互复杂]
  openspec/specs/<domain>/        [feature 当前真相，走 OpenSpec]
  openspec/changes/<id>/          [进行中变更：proposal/design/tasks/delta spec]
```

用户可以勾减或追加。skill 把最终清单写入待生成队列。

### 阶段 4 · 落地生成

按 [references/kickoff-templates.md](references/kickoff-templates.md) 的模板生成所有文件。每个文件遵守：

- 顶部声明：状态（Draft / Accepted）、日期、上游、下游、维护者
- 用户答案直接填入；推荐假设标 `[假设·待确认]` 并在 `open-questions.md` 留对应条目
- 互相用相对路径链接，禁止内容复制
- `docs/INDEX.md` 同步登记每个文件，标状态和日期
- ADR 链按 [references/jdotest-patterns.md](references/jdotest-patterns.md) 的依赖顺序：仓库结构 → 前端 → 后端 → 数据库 → UI → 领域约束 → 部署

**OpenSpec 初始化**（详见 [references/openspec-integration.md](references/openspec-integration.md)）：

```bash
npm install -g @fission-ai/openspec@latest

# 非交互模式（推荐，hook / 脚本里也能跑）。--tools 必填，不带会 exit 1
openspec init --tools claude --force
# 实测产物（OpenSpec v1.3.1）：
#   openspec/{specs/, changes/, changes/archive/, config.yaml}
#   .claude/commands/opsx/{propose,explore,apply,archive}.md
#   .claude/skills/openspec-{propose,explore,apply-change,archive-change}/SKILL.md
```

把 scope §第一条切片中的 feature 拆成 N 个 change proposal。**OpenSpec 没有 `openspec propose` CLI 命令**，要走以下两条路径之一：

```bash
# 路径 A（推荐 · Claude Code 用户）：在 Claude Code 里跑 slash command
#   /opsx:propose add-cart
#   /opsx:propose add-checkout
#   /opsx:propose add-driving-mode
# AI 会一站式生成 proposal + delta spec + design + tasks 并填好内容

# 路径 B（CLI · 无 AI 工具或脚本化场景）：只建空骨架，内容自己填
openspec new change add-cart
openspec new change add-checkout
openspec new change add-driving-mode
# 然后按本节"生成 OpenSpec change"小节的格式手填 4 件套
```

两条路径的差异（实测 v1.3.1）：路径 A 的 `/opsx:propose` 会**一次性写满** `openspec/changes/<id>/{proposal.md, design.md, tasks.md, specs/<domain>/spec.md}`；路径 B 的 `openspec new change` **只创建 `.openspec.yaml` 标记文件**，4 件套要靠 `openspec instructions <artifact> --change <id>` 拿到指令后逐个手写。最终目标结构一致，但 B 需要更多手工填充。

生成完毕后跑一遍自检：
- 每个 `docs/*.md` 都在 INDEX 里
- 每条 `must` 约束都有执行机制（hook / CI gate / ADR 兜底）
- 每个 `openspec/changes/<id>/` 都有完整的 4 件套（proposal / design / tasks / delta spec）
- 第一阶段 task 都能回溯到 requirement / scope
- `.env.example` 覆盖所有外部依赖
- 跑 `openspec validate --all --strict` 确保 spec 格式合法（RFC 2119 + scenario 结构，`--strict` 拒绝缺字段）

### 阶段 5 · 交接

最终输出给用户：

1. **文件清单和路径**——总数、按类别分组、附 `docs/INDEX.md` 链接。
2. **下一步建议**——"在新会话里说 `读 CLAUDE.md 和 docs/INDEX.md,然后从 task-plan.md 拾起 T-1`"。
3. **待确认项**——`open-questions.md` 里的高优先级问题，需要用户在多少时间内回答。
4. **启动命令**——如已生成脚手架，给出 `pnpm install && pnpm dev` 这类。
5. **续期方式**——再次调用 skill 时说"继续 bootstrap"，skill 会读 INDEX 看进度补齐缺失文档。

### 中断与续期

任一阶段都可以中断（用户说"先到这里"）。续期时 skill：
- 读 `docs/INDEX.md` 看已经生成了哪些
- 读 `open-questions.md` 看未决项
- 从上次中断处继续访谈或生成
- 不重复生成已有文件，只补齐或细化

## 访谈通用规则

> 4 轮大纲在阶段 2 的表已经列出，完整 19 题清单见 [references/interview-script.md](references/interview-script.md)。本节只补充贯穿 4 轮的**通用规则**，避免与阶段 2 重复。

- **每轮批量提问**：1-4 题用 `AskUserQuestion` 一次提，不一问一答消耗耐心
- **每轮结束做理解回放**：2-3 句复述用户的关键决定，请确认或修正
- **"待定"不卡流程**：写入 `docs/open-questions.md`，附 skill 推荐的保守默认值，标 `[假设·待确认]`
- **轮 3、轮 4 按需触发**：约束 / 协作题如果对当前项目类型不适用，跳过不强答

## 阶段 4 落地的具体动作

> 阶段 4「落地生成」（在前面 5 阶段流程里）只说"按模板生成所有文件"。本节展开**生成顺序与每类文件要做什么**——是阶段 4 的实现说明书，不重复阶段 4 已说的内容。

**Step 1 · 盘点已有材料（阶段 1 已开始，此处确保完整）**
- 读 `README.md` / `CLAUDE.md` / `AGENTS.md` / `docs/` / `.github/` / 包管理文件 / 已有原型
- Accepted ADR 优先级高于聊天记录和零散备注

**Step 2 · 先写 AI 协作公约（其它一切的前置）**
- 多 agent 项目优先 `CLAUDE.md`，需要兼容 Codex 再补 `AGENTS.md`，内容不重复
- `must` 级规则（文档同步、测试 gate、路径越界、密钥扫描）走 hook，不进 `CLAUDE.md`——见"强制执行机制 Harness 5 层"

**Step 3 · 文档主干**（按"开工前提"清单，按项目类型筛）
- 必有：`project-brief.md` / `scope.md` / `constraints.md` / `architecture.md` / `task-plan.md` / `open-questions.md`
- 按需：`backend-spec.md`（有后端）/ `api-contracts.md`（有跨边界）/ `testing-strategy.md` / `integration-plan.md` / `ai-coding-workflow.md`

**Step 4 · ADR 记录关键决策**
- 命名 `docs/decisions/ADR-NNNN-*.md`，编号递增不复用
- 技术栈 / 仓库结构 / 部署 / 数据模型 / 鉴权 / 不可逆产品决策必写
- 旧决策被替代时标 `Superseded by ADR-XXXX`，不删历史

**Step 5 · 人类协作护栏**
- `CONTRIBUTING.md` / `.github/PULL_REQUEST_TEMPLATE.md` / `CODEOWNERS` 按需
- `CONTRIBUTING.md` 给人，`CLAUDE.md` 给 agent，互相引用不重复

**Step 6 · 配置与环境**
- `.env.example` 完整、密钥不入库
- 部署相关用环境变量不硬编码
- 后台依赖（DB / 缓存 / 队列）有本地运行说明（Docker Compose / Testcontainers）

**Step 7 · 从边界反推目录结构**（不要先套模板）
- 目录来自产品域 / 路由 / 包边界 / 部署单元
- 避免无职责的 `utils/` / `common/` / `misc/`
- 详细决策规则见后文「目录决策规则」

**Step 8 · 最小脚手架**（决策明确之后才动）
- 提供 install / dev / lint / test / typecheck / build 脚本
- 先实现一条薄的纵向切片，再铺开

**Step 9 · AI 执行闭环**
- 复杂功能拆到 `openspec/changes/<id>/`（proposal + design + tasks + delta spec）
- 每个 task 回溯到 requirement + 明确验证方式 + verification 命令
- 高风险变更补 adversarial review：安全 / 契约 / 性能 / 迁移 / 边界

**Step 10 · 自检**（阶段 4 末尾，对应原阶段 4 的自检项）
- 每个 `docs/*.md` 都在 INDEX 里
- 每条 `must` 都有 hook / CI gate 兜底
- 每个 `openspec/changes/<id>/` 4 件套完整
- 每个第一阶段 task 可回溯到 requirement / scope
- `.env.example` 覆盖所有外部依赖
- 跑 `openspec validate --all --strict` 确保 spec 格式合法

## 何时必须写文档

下表把"触发场景 → 文档落点"显式化。任何条目触发时，落地动作必须在同一轮会话内完成，不能拖到下一轮：

| 触发场景 | 必落 |
|---|---|
| 用户讨论需求、范围被确认 | `docs/PRD.md` 升版本 + `docs/INDEX.md` 同步 |
| 任何技术选型对比 | `docs/research/<topic>.md`（过程）→ 结论收敛到 `docs/decisions/ADR-NNNN-*.md` |
| 任何架构 / 产品决策被确认 | `docs/decisions/ADR-NNNN-*.md` 标 Accepted |
| 架构 / 流程 / IA 图被生成或修改 | `diagrams/` 保留源文件（.excalidraw / .drawio 等）+ INDEX 引用 |
| 新约束 / 偏好 / 业务规则被提出 | 追加 `constraints.md` 或新 ADR + INDEX 同步 |
| **新增 feature / 修改既有 feature 行为** | Claude Code 里 `/opsx:propose <change-id>`（推荐）或 CLI `openspec new change <change-id>`，生成 `openspec/changes/<id>/{proposal, design, tasks}.md + specs/<domain>/spec.md` (delta) |
| **feature 实施完成** | 跑 `openspec archive <change-id> --yes` 合并 delta 到 `openspec/specs/<domain>/spec.md` |
| 设计 token / 视觉规范变化 | 先改 `design-system.md`（唯一真相）再改下游 mockups 与代码 |
| 路由总览 / 派活看板变化 | 更新 `feature-spec.md` 的派活看板与"路由 → domain"映射表（spec 主体在 `openspec/specs/`）|
| 旧结论被推翻 | 旧 ADR 标 `Superseded by ADR-XXXX`，新 ADR 写 `Supersedes ADR-XXXX`，不删除历史 |

**调研型任务额外约束**：执行前先到 `docs/research/` 检索是否已有同主题结论，有则直接引用，没有再开新调研。研究是过程，ADR 是结论；过程文档可以多份，结论必须收敛到 ADR。

## 推荐产物

新项目优先从这组文件开始：

```text
CLAUDE.md 或 AGENTS.md
.claude/
  settings.json
docs/
  INDEX.md
  project-brief.md
  scope.md
  constraints.md
  architecture.md
  backend-spec.md
  api-contracts.md
  testing-strategy.md
  integration-plan.md
  ai-coding-workflow.md
  task-plan.md
  open-questions.md
  decisions/
    ADR-0001-tech-stack.md
    ADR-0002-repository-structure.md
  research/
  specs/
.github/
  ISSUE_TEMPLATE/
  PULL_REQUEST_TEMPLATE.md
  CODEOWNERS
CONTRIBUTING.md
.env.example
README.md
```

如果是产品型应用，再补：

```text
docs/
  PRD.md
  feature-spec.md
  design/
    design-system.md
    interaction-patterns.md
```

如果是 monorepo，推荐：

```text
apps/
services/
packages/
tools/
infra/
docs/
```

## 文档分工与唯一真相

防止"两份不一致的真相"的核心办法是把每条事实指派到唯一文档，其它地方只引用。下表是典型分工，项目可按需扩展：

| 唯一真相主题 | 文档 |
|---|---|
| 项目目标、用户、价值主张 | `docs/project-brief.md` |
| MVP 边界、第一阶段切片 | `docs/scope.md` |
| 所有约束（must/should/optional/out） | `docs/constraints.md` |
| 关键架构 / 产品决策 | `docs/decisions/ADR-*.md` |
| **当前 feature 行为（已实现，requirements + scenarios）** | `openspec/specs/<domain>/spec.md` |
| **进行中的 change（proposal + delta + design + tasks）** | `openspec/changes/<change-id>/` |
| 路由总览 + 派活看板 + 路由→domain 映射 | `docs/feature-spec.md` |
| 视觉布局、页面区块 | `docs/design/page-spec.md` |
| 设计 token、组件契约 | `docs/design/design-system.md` |
| 跨页面交互规则、状态矩阵、决策树 | `docs/design/interaction-patterns.md` |
| 数据模型、后台模块、迁移 | `docs/backend-spec.md` |
| API 契约 | `docs/api-contracts.md` 或 `packages/api-contracts/openapi.yaml` |
| 测试层级、CI gate | `docs/testing-strategy.md` |
| 文档目录、协作状态、ownership | `docs/INDEX.md` |
| AI 协作规则、路径所有权 | `CLAUDE.md` / `AGENTS.md` |
| harness 强制规则 | `.claude/settings.json` |

每个文档顶部都要声明上游（依赖什么）和下游（基于本文档生成什么）。引用用相对路径互链，便于工具跳转。冲突时以"唯一真相"为准，下游必须同步。

## 文件职责与写法

每个开工文档都要回答三个问题：它存在的理由、谁来读、改什么会触发更新。下面给出各类文件的职责、写作要点和反模式。

### CLAUDE.md / AGENTS.md

职责：agent 进入项目时第一份必读，是给 AI 的"项目工作说明书"。

何时创建：项目第一次被 AI 协作之前。多 agent 协作时优先 `CLAUDE.md`，需要兼容 Codex 等其他 agent 再补 `AGENTS.md`，两者可以互相引用，但内容不重复。

必含章节：
- 项目一句话定位、当前阶段。
- 开工前必读文档清单（带相对路径链接）。
- 路径所有权与改动边界。
- 提交前检查（lint、typecheck、test、文档同步）。
- harness 强制规则索引（指向 `.claude/settings.json` hooks）。
- 不该做什么（破坏性操作、跨域改动、跳过文档等）。

写作原则：
- 短、硬、长期有效。规则要么是 `must` 要么不写。
- 凡是会变的细节（API 字段、数据模型、当前任务）放进对应专题文档，`CLAUDE.md` 只放规则和指针。
- 用祈使句和清单，不写散文。

反模式：
- 把 PRD 内容、架构图、API 详情塞进来——这些应该在 `docs/` 下。
- 写"尽量"、"建议"、"原则上"——软约束放 `should`，硬约束用 hook 兜底。
- 文件超过 200 行——说明边界没切清楚，拆到 `docs/` 下。

### docs/INDEX.md

职责：`docs/` 目录的**导航 + 多 agent 实时仪表盘**。让 agent 不用 `ls` 就知道项目有什么文档、各自什么状态、谁在改什么、按什么顺序读。

何时创建：`docs/` 出现第二个文件时。

必含三块仪表盘（append-only 协作区）：

1. **Active Workstreams**——正在进行的工作登记表。开工三件套的第 ③ 步落地点。
   ```
   | Agent | 工作范围 | 起始 | 涉及文件（glob） | 状态 |
   ```
2. **Ownership Zones**——路径所有权表，决定改文件前是直接干还是先协调。
   ```
   | Zone（路径 glob） | 默认所有者 | 说明 |
   ```
3. **Recent Activity**——倒序保留最近 10 条完成项，更早按月归档。
   ```
   | 日期 | Agent | 完成项 | 关键 commit |
   ```

必含文档目录（按类别分组）：
- 入口必读、架构设计、设计、ADR、调研、规格、图示。
- 每个文档一行：标题链接、一句话摘要、状态、最近日期。

写作原则：
- 三块仪表盘是 **append-only**：每个 agent 只增加自己的行，不修改/删除别人的行。
- 一行一个文件，链接到相对路径，状态标签清晰可见。
- 不复制其他文档的内容，只做指针。
- 新增 `docs/*.md` 时同步更新 `INDEX.md`，用 `PostToolUse(Write)` hook 强制。
- 文档孤儿检测：定期跑脚本对比 `docs/**/*.md` 与 INDEX 引用，差集就是孤儿。

反模式：
- 写成长篇综述——那属于 `project-brief.md`。
- Active Workstreams 长期不更新——出现"5 行 in-progress 但其实早就完成"，要么把它移到 Recent Activity，要么 hook 检查 in-progress 超过 X 天就告警。
- 跨 agent 直接覆盖别人的 workstream 行——违反 append-only，必须用 hook 兜底。

### docs/project-brief.md

职责：项目事实的单一来源。目标用户、要解决的问题、价值主张、当前阶段。

写法：3 段以内能讲清楚，不写实现细节。其他文档需要引用项目事实时，链回这里而不是复制。

### docs/scope.md

职责：MVP 边界。明确做什么、不做什么、第一阶段的可演示路径。

写法：清单形式。每条范围条目应能被勾掉。"明确不做"和"明确做"一样重要，分开列。

### docs/constraints.md

职责：所有硬约束、推荐约束、可选项、明确不做。按"约束分类"中的级别和类型组织。

写法：每条注明级别（must/should/optional/out）、类型（产品/技术/工程/...）和负责人或执行机制。`must` 级约束必须有 hook 或 CI gate 兜底，否则降级为 `should`。

### docs/architecture.md

职责：系统级视图。模块边界、数据流、关键依赖、部署形态。

写法：先一张图或一段文字讲整体形状，再分模块讲职责。不展开到字段级——字段细节在 `backend-spec.md` 或 `api-contracts.md`。

### docs/backend-spec.md

职责：后台模块、数据模型、任务队列、第三方集成、本地依赖的细节。

写法：按模块划分，每个模块写实体、关键字段、关系、迁移策略、错误格式、鉴权。改动 schema 必须先改这里再改实现。

### docs/api-contracts.md

职责：前后端、服务间、对外 API 的契约。

写法：复杂 API 用 OpenAPI 文件作为机器可读契约，本文件做导航和说明。简单接口可以直接写在本文件，包含请求、响应、错误格式、分页、鉴权、版本。改动 API 字段必须先改这里再改实现，前后端同时对齐。

### docs/testing-strategy.md

职责：测试层级、命令、CI gate、覆盖目标。

写法：列出 Unit / Backend route / Integration / Contract / Frontend integration / E2E 各层的覆盖范围、运行命令、依赖服务。CI gate 与发布 gate 分开列。

### docs/integration-plan.md

职责：mock、联调、契约锁定、E2E 的阶段路径。

写法：从前端 mock 到上线分多阶段，每阶段说明前置条件、产出、退出条件。

### docs/ai-coding-workflow.md

职责：AI 从需求到实现、验证、review、交接的闭环。

写法：列出每个环节的输入、产出、所用文档、验证证据落点。包含 verification log 的位置和模板。

### docs/task-plan.md

职责：第一阶段任务总目录。任务粒度足够小、能回溯到 scope/constraint/ADR、有明确验证方式。

写法：每个任务包含 ID、目标、对应 requirement、验证步骤、依赖任务。复杂功能拆到 `openspec/changes/<id>/tasks.md`，本文件保留指针。

### docs/open-questions.md

职责：所有显式未决的问题，包含当前假设、负责人、回答期限。

写法：每条包含问题、当前假设、影响范围、谁回答、何时回答。问题解决后归档到对应 ADR 或 spec，不要悄悄删除——留个"已解决，参见 ADR-XXXX"指针。

### docs/PRD.md

职责：产品需求文档。用户场景、用例、成功指标。产品型项目才需要。

写法：写"为什么"和"用户要什么"，不写"怎么实现"。实现细节属于 feature-spec 或 design。

### docs/feature-spec.md（派活看板 + 路由 → domain 映射）

职责：**全局派活看板** + **路由 / 模块 ↔ OpenSpec domain 的映射索引**。spec 主体（requirements / scenarios / acceptance）放在 `openspec/specs/<domain>/spec.md`，本文件只做导航。

包含：

- **派活看板**：跨 agent 共享的工作认领表（页面 / 跨页面模块 / 后端模块），固定 4 状态值 `🟡 unclaimed` / `🔵 in-progress` / `🟢 done` / `🔴 blocked`。
- **路由 → domain 映射**：`/cart` → `openspec/specs/cart/spec.md` 这种对照表。
- **进行中的 changes**：每个 domain 列出当前 in-progress 的 change-id 与链接。

派活流程：认领前先在 [`docs/INDEX.md`](#docsindex-md) §Active Workstreams append 一行，再回本文件把对应行的状态徽改成自己的 agent-id。**状态变更直接覆写自己之前的行**，不要复制多行；不要动别人认领的行。

详见 [references/openspec-integration.md §派活看板映射示例](references/openspec-integration.md)。

### openspec/specs/&lt;domain&gt;/spec.md

职责：**单个 domain 当前真相的 requirements + scenarios**。这是已经实现并 archive 过的状态。

格式：

- 用 `### Requirement: <名字>` 列每条 requirement
- 正文用 **RFC 2119** 关键字：`MUST` / `SHALL` / `SHOULD` / `MAY` / `MUST NOT` / `SHALL NOT`
- 每条 requirement 至少跟一个 `#### Scenario:`，用 **GIVEN / WHEN / THEN / AND** 写可观测行为
- domain 命名 kebab-case，按业务边界划分（`auth-login` / `cart` / `order` / `driving-mode`），不按技术层

**不能直接编辑**：只能通过新建 change → delta spec → archive 流程来改。详见 [references/openspec-integration.md §三阶段生命周期](references/openspec-integration.md)。

### openspec/changes/&lt;change-id&gt;/

职责：**单个进行中变更的完整 4 件套**。`change-id` 命名 `<动作>-<对象>` kebab-case（`add-qr-login` / `tighten-driving-mode-detection`）。

四件套：

| 文件 | 写什么（OpenSpec v1.3.1 原生章节）|
|---|---|
| `proposal.md` | `## Why` / `## What Changes` / `## Capabilities`（New + Modified）/ `## Impact` |
| `design.md` | `## Context` / `## Goals / Non-Goals` / `## Decisions` / `## Risks / Trade-offs`（File Changes、Error、Perf 折叠进 Decisions / Risks）|
| `tasks.md` | 带 checkbox 的分组任务清单，每条带文件 + verification 命令 |
| `specs/<domain>/spec.md` | **delta spec**，用 `## ADDED` / `## MODIFIED` / `## REMOVED` / `## RENAMED Requirements` 标记本次要动什么，每条 requirement 至少一个 `#### Scenario:` |

写作原则：

- 顺序是 proposal → delta spec → design → tasks。proposal 定 why & what，spec 定可观测行为，design 定 how，tasks 定怎么验
- proposal 不写实现细节（那是 design 的事）
- delta spec 改既有 requirement 时写**完整新内容**，archive 时整段替换
- design 重大决策（不可逆）应该单独写 ADR，change 里只列局部决策
- tasks 粒度：每条单 session 能做完 + 有 verification 命令
- 完成 archive 后，change 文件夹移到 `openspec/changes/archive/YYYY-MM-DD-<id>/`，**永久保留供审计**

反模式：

- 直接动 `openspec/specs/<domain>/spec.md` → 那是 archive 的事，平时只能通过 change
- 一个 change 塞多个无关 feature → 拆成多个独立 change
- proposal 写代码细节 → 拆到 design.md
- delta spec 写 "..." 省略 → 必须写完整新内容，archive 时整段替换
- tasks 没 verification 命令 → "我觉得做完了"不算做完
- 状态徽用 4 个固定值以外的（"🟠 reviewing"）→ 破坏看板可读性

详细模板与完整示例（车机电商 add-qr-login）见 [references/openspec-integration.md](references/openspec-integration.md)。

### docs/decisions/ADR-XXXX-*.md

职责：记录一条不可轻易撤销的决策、当时的备选方案和被否的原因。Accepted ADR 的优先级高于聊天记录和零散备注。

文件命名：`ADR-NNNN-<kebab-case-title>.md`，NNNN 四位递增。编号一旦分配不重用（Superseded 也保留原编号）。

必含字段：
- 状态：`Proposed` / `Accepted` / `Superseded by ADR-XXXX`
- 日期：`YYYY-MM-DD`
- 决策者：谁拍的板
- 依赖：列出依赖的 ADR（如 `Depends on ADR-0006`），便于追溯改 A 会牵动哪些 B

ADR 模板：

```markdown
# ADR-NNNN: <决策标题>

- 状态：Proposed / Accepted / Superseded by ADR-XXXX
- 日期：YYYY-MM-DD
- 决策者：<who>
- 依赖：ADR-XXXX, ADR-YYYY

## 背景 Context
为什么要做这个决策，遇到了什么问题。

## 决策 Decision
最终选定的方案，一句话讲清。

## 理由 Rationale
为什么选它，关键判断依据。

## 替代方案 Alternatives Considered
对比过哪些方案，各自优劣，为什么没选。

## 后果 Consequences
- 正面影响：
- 负面影响 / 代价：
- 后续需要做的事（触发的下游改动清单）：
```

适用范围：技术栈、仓库结构、数据模型、鉴权、部署方式、关键第三方依赖、信息架构、不可逆产品决策。`should` 以下的决策不写 ADR，避免噪音。

Superseded 流程：
- 旧 ADR **不删除**，只改状态为 `Superseded by ADR-XXXX`，正文保留作为历史。
- 新 ADR 顶部写 `Supersedes ADR-YYYY`，背景里说明为什么之前的决策不再成立。
- 替代发生时，在 INDEX 的 ADR 表里把旧 ADR 标"Superseded"，更新日期。

触发的下游改动追踪：ADR Accepted 之后，在该 ADR 末尾"后续需要做的事"列出所有下游 sync 点（如"feature-spec.md §IA / mockups / 后端 seed 都要 sync 到新分类"），并在 INDEX 引用处加备注。下游改完之前，这条 ADR 视为"已 Accepted 但未落地"，新工作要意识到这种 drift。

研究 → ADR 收敛：技术选型对比、可行性分析这类**过程文档**放 `docs/research/<topic>.md`，可以多份；最终**结论**必须收敛到一个 ADR。research 文件在结论收敛后改为 `Accepted（作为 ADR-NNNN 的输入依据）` 状态，不删除。

### .env.example

职责：列出所有运行所需环境变量的名字和示例值（不是真值）。

写法：每条一行注释说明用途和取值来源。本地、测试、生产差异在注释中说明。真密钥不进仓库。

### README.md

职责：人类读者的入口。项目是什么、怎么本地跑起来、怎么贡献、文档在哪。

写法：顶部 5 行讲清楚是什么、给谁用。然后 quick start、常用命令、链接到 `docs/INDEX.md` 和 `CLAUDE.md`。不重复 PRD 或 architecture 的内容。

### .claude/settings.json

职责：harness 强制规则的载体。hooks、permissions、env 都在这里。

写法：每条 hook 配一行注释说明它强制的是哪条约束（指回 `constraints.md` 或 `CLAUDE.md` 的条目）。提交版本控制；个人临时配置放 `.claude/settings.local.json` 并 gitignore。

### CONTRIBUTING.md

职责：给人类贡献者看的协作规则——分支策略、commit 规范、review 流程。和 `CLAUDE.md` 职责分开，互相引用但不重复内容。

### .github/PULL_REQUEST_TEMPLATE.md

职责：PR 必填项的模板。摘要、动机、测试证据、关联 issue、是否更新文档。

### .github/CODEOWNERS

职责：路径到 owner 的映射，触发 GitHub 自动指派 review。和 `CLAUDE.md` 中的路径所有权对应，两边不一致时以 `CODEOWNERS` 为准。

### diagrams/

职责：架构图、IA 图、流程图、状态机图的**源文件**仓库。

写法：
- 保留源文件（`.excalidraw` / `.drawio` / `.fig` / `.mermaid` 等），不只放导出的 png/svg。源文件可二次编辑，png 不行。
- 同主题图更新后导出 png/svg 与源文件并存；代码或 markdown 里嵌入 png/svg。
- 在 `docs/INDEX.md` 引用处一行写清楚：文件、用途、最后更新日期。
- 命名能体现内容：`information-architecture.excalidraw`、`order-state-machine.drawio`，不要 `untitled-3.png`。

### mockups/

职责：高保真静态原型或可点击交互原型，是 React/Vue 实装的视觉对照基准。

写法：
- 多版本并存时**命名带版本号**：`mockups/jdo-pencil-v3/`。新版本上线后旧版**归档不删**，在 INDEX 标"已归档，以 VX 为准"。
- 当前主原型在 `docs/INDEX.md` 顶部"项目主前端"模块明确标注，后续迭代均基于此。
- token / 布局 / 文案的最终值以 mockup 为准；下游代码与 `design-system.md` 必须同步它。
- 当 mockup 与 ADR 出现 drift（例如实际 7 类但 ADR 锁 6 类），要么改 mockup 与 ADR 对齐，要么用 Superseded 流程升 ADR——**不允许长期分叉**。这类 drift 在 INDEX 显式记录，下一轮必须收敛。

### 文档状态约定

所有文档在顶部声明状态，便于 agent 判断是否可信：

- **Draft** — 初稿，仍在打磨，可读可参考但可能变更。
- **Accepted** — 已对齐确认，可作为后续工作依据。
- **Superseded by X** — 已被新文档取代，保留供追溯，不删除。
- **Pending** — 占位中，尚未撰写。

状态变化时，文档顶部和 `docs/INDEX.md` 状态列同步更新。状态变更本身用 commit 记录，便于追溯"什么时候 Draft 转 Accepted"。

## 目录决策规则

- `apps/`：可独立运行的前端、客户端或应用入口。
- `services/`：可部署的后端服务。
- `packages/`：共享类型、API 契约、UI 组件、设计 token、状态机、配置包。
- `tools/`：种子数据、生成器、mock、e2e 辅助脚本。
- `infra/`：Docker、部署、本地依赖服务。
- 前端应用中，业务逻辑明显时优先按 feature/domain 组织。
- 路由文件保持薄，把业务逻辑放到 feature/domain 模块。
- 共享代码至少有两个真实消费者，或者本身是契约包时，再提升到 `packages/`。

## 后台和联调规则

如果项目有后台，必须在写代码前确定：

- 后台模块：认证、用户、业务域、支付、通知、任务队列、文件、搜索等。
- 数据模型：实体、关键字段、关系、索引、迁移策略、种子数据。
- API 契约：请求、响应、错误格式、分页、鉴权、版本管理。
- 本地依赖：数据库、缓存、消息队列、对象存储、第三方服务 mock。
- 运行端口：前端、后端、API docs、数据库、缓存。
- 联调阶段：前端 mock、后端接口、契约锁定、E2E。

优先使用契约先行：先写 `docs/api-contracts.md` 或 `packages/api-contracts/openapi.yaml`，再让前端 mock 和后端实现同时对齐它。对复杂 API，使用 OpenAPI 作为机器可读契约；对多个消费者或服务间调用，补充 Pact 这类 consumer-driven contract tests。

## 测试规则

测试策略必须覆盖：

- Unit：纯函数、状态机、格式化、权限判断。
- Backend route/service：后台路由、service、repository、错误格式和鉴权。
- Integration：真实数据库、缓存、队列或第三方 mock；优先使用 Docker Compose 或 Testcontainers。
- Contract：OpenAPI schema 校验或 Pact consumer/provider 校验。
- Frontend integration：用 MSW 拦截浏览器和 Node 请求，按 API 契约模拟成功、错误、延迟、空状态。
- E2E：用 Playwright 验证至少一条 happy path 和一条关键降级/错误路径。

CI gate 至少包括 lint、typecheck、unit/integration tests、build。发布前再跑 E2E 和必要的 contract verification。

## 完全 AI Coding 规则

完全 AI Coding 不等于让 AI 直接从一句话写完整项目。它需要清楚区分四类上下文：

- Always-on instructions：`CLAUDE.md`、`AGENTS.md`、`.github/copilot-instructions.md`、工具 rules，只放短、硬、长期有效的规则。
- Project facts：`docs/project-brief.md`、`scope.md`、`constraints.md`、`architecture.md`，记录项目事实。
- Feature specs：`openspec/specs/<domain>/spec.md`（当前真相）+ `openspec/changes/<id>/{proposal,design,tasks}.md` + delta spec，驱动具体实现（走 OpenSpec，不另用 `docs/specs/`）。
- Evidence logs：`docs/verification-log.md` 或 PR 描述，记录 AI 实际运行过什么、结果是什么。

推荐 AI 编码循环：

```text
Interview / clarify
  -> Specify requirements
  -> Analyze gaps and contradictions
  -> Design implementation
  -> Break into tasks
  -> Implement one task
  -> Run verification
  -> Fix failures
  -> Adversarial review
  -> Update docs and handoff
```

复杂功能使用 spec-driven 流程：Spec -> Plan/Design -> Tasks -> Implement。需求可用 EARS 形式写成 `WHEN [condition] THE SYSTEM SHALL [behavior]`，这样更容易转成测试。

## 约束分类

所有约束都按强度区分：

- `must`：不可妥协，代码或流程必须执行。
- `should`：推荐默认值，例外需要说明理由。
- `optional`：可选增强，不阻塞 MVP。
- `out of scope`：明确不做，防止范围膨胀。

同时按类型组织：

- 产品约束：用户、MVP、非目标、成功指标。
- 业务约束：状态流转、金额、权限、法律或行业规则。
- 技术约束：技术栈、运行时、数据库、集成、浏览器/设备支持。
- 工程约束：包管理、测试、lint、CI、发布规则。
- 架构约束：模块边界、API 契约、代码所有权。
- 配置约束：环境变量、密钥、配置来源。
- 协作约束：评审、CODEOWNERS、多 agent 协作方式。

## 强制执行机制（Harness 5 层）

`CLAUDE.md`、`AGENTS.md`、memory、提示词都是**软约束**，agent 可以忽略、忘记或自己判断是否执行。`must` 级规则必须由 harness 而不是 agent 自己执行，否则不算"强制"。

> **为什么 harness 比模型更值得投入**（2026 harness engineering 共识，见 [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering)）：**Agent = Model + Harness**——"模型是引擎，harness 是车"（Fowler）。LangChain 仅改 harness（结构化验证回路 + 上下文注入 + loop 检测）就把同一模型的 coding agent 从 Terminal Bench 2.0 第 30 名拉到前 5，**没换模型**。这就是本 skill 把精力花在文档/约束/hook 而不是 prompt 调教上的根据。
>
> harness 控制分两类（Böckeler 的 guides + sensors 模型），正好对应本 skill 的 hook 用法：**feedforward 护栏（guides）= `PreToolUse` 事前拦截**；**feedback 传感器（sensors）= `PostToolUse` / `Stop` 事后校验**。两者都该优先用确定性手段（lint / test / grep），LLM-as-judge 是补充。
>
> ⚙️ **棘轮原则（Ratchet Principle）——给"must 必落 hook"加的成熟度护栏**：*"每一个 harness 组件都假设模型当前做不到某件事；这些假设会过期。"* 所以 hook 是为**今天**的模型能力补位，不是永久资产。模型变强后，曾经必须拦截的（如"忘记登记 workstream"）可能不再需要——定期复审、该撤的撤，别让护栏越堆越厚反而拖慢协作。这也是本 skill 把"文档同步 / 测试 gate"暂留 `should`、不急于 hook 化的理由：误报的护栏比没有护栏更糟。

2026 业界把 Claude Code 这类 agent 的 harness 抽象成 5 层。下表是每层的物理载体、能管什么、是否可绕过：

| 层 | 载体 | 管什么 | agent 能绕过吗 |
|---|---|---|---|
| ① Memory | `CLAUDE.md` / `AGENTS.md` / `MEMORY.md` | 项目事实与协作规则 | ✅ 可忽略 |
| ② Tools / MCP | `.claude/settings.json` MCP 配置 | 能调什么外部能力 | — 配置层 |
| ③ Permissions | `.claude/settings.json` allow/deny | 工具调用授权 | ❌ 框架层强制 |
| ④ Hooks | `.claude/settings.json` hooks | 工具调用时的命令拦截 | ❌ **唯一不可绕过的强制层** |
| ⑤ Observability | PR 模板 / `verification-log.md` / session log | 验证证据、可追溯性 | — 事实层 |

**核心铁律**：只有 ④ Hooks 是 agent 完全无法绕过的强制层。任何 `must` 级规则**不落到 hook，就不算强制**。

### Hook 类型与典型用法

- `PreToolUse`：工具调用前拦截，**可以阻止本次调用**（唯一拦截能力来源）
- `PostToolUse`：工具调用后触发，适合改动后的自动校验、格式化、记录
- `Stop`：agent 想结束回合时拦截，可以打回让它继续工作
- `UserPromptSubmit`：用户消息提交时注入额外上下文

> Claude Code 已有数十种 hook 事件（官方持续新增），上面 4 类覆盖 95% 用例。完整事件以官方 hooks 文档为准。

典型规则：

- **文档同步**：`PostToolUse(Edit|Write)` 或 `Stop` 里用 `git diff` 比对代码 vs 文档改动，不匹配则阻塞
- **测试 gate**：`Stop` 钩子里跑 lint / typecheck / test，失败则不允许结束回合
- **开工三件套**：`PreToolUse(Edit|Write)` 检查是否已读 INDEX 且登记 Active Workstream，未登记拒绝
- **路径所有权**：`PreToolUse(Edit|Write)` 校验改动路径属于当前 agent 的 zone，越界则拒绝
- **密钥扫描**：`PreToolUse(Write|Edit)` 匹配密钥模式则拒绝
- **ADR 前置**：改核心架构路径时，`PreToolUse` 检查 `docs/decisions/` 是否有对应 Accepted ADR

### Hook 脚本书写原则

- **拦截必须 `exit 2`，不是 `exit 1`**。这是社区 #1 实现 bug——Unix 习惯用 `exit 1` 表失败，但 Claude Code **只有 `exit 2` 才会真正阻塞 PreToolUse / Stop**，`exit 1` 只是告警不拦截。stderr 内容会作为反馈喂回 agent。
- 失败时给**可执行反馈**，告诉 agent 缺什么、怎么补，而不是只甩一个非零退出码
- 每条 hook 在 `CLAUDE.md` 中留一行说明：告诉 agent "该规则由 harness 强制"，避免它反复试探
- `must` 用 hook 兜底；`should` 写进 `CLAUDE.md` 即可
- `.claude/settings.json` 提交版本控制，让协作者共享同一套护栏；本地临时配置放 `.claude/settings.local.json` 并 `.gitignore`

### 与软约束的分工

| 规则强度 | 落点 | 失败时谁兜底 |
|---|---|---|
| `must` | hook (Layer 4) | harness 直接拦截 |
| `should` | `CLAUDE.md` (Layer 1) | agent 自觉 + code review |
| `may` / 默认值 | `CLAUDE.md` / 文档说明 | 仅供参考 |

## 多 agent 协作协议

如果项目允许多个 Claude / Codex / 其它 agent 并行推进，光靠"祈使句规则"不够，需要这套协议托底。单 agent 项目可以略过本节，但保留 INDEX.md 仪表盘对跨会话连续性仍有帮助。

> **与会话内编排器的分层**：2026 已有内置/开源编排器——Claude Code 的 **Agent Teams**（team-lead 拆活 + teammates 经共享 task list 协作，实验特性，默认关）、**并行 subagent**（各自独立 context，用 **git worktree** 隔离避免分支冲突）、以及 Claude Flow 等。它们解决的是**单次会话内**的任务路由与并发隔离，生命周期随会话结束而消失。本节这套 `docs/INDEX.md` 仪表盘解决的是**跨会话、跨 agent、可审计的持久协作**——谁在历史上做过什么、路径归谁、孤儿在哪。两者**互补分层**：编排器管"这一轮怎么并发"，INDEX 管"任何新会话进来怎么不撞车、不重复"。并行写同一仓库时优先开 worktree（见 Agent 工具 / `EnterWorktree`）。

**Append-Only 协作区**

以下文件由多 agent 共享维护，**只增加自己的行，不修改 / 删除别人的行**：

- `docs/INDEX.md` §Active Workstreams
- `docs/INDEX.md` §Recent Activity
- 任何 `docs/worklog/agent-*.md`（如启用）

其它文档允许覆写，但**大段重写前必须先在 §Active Workstreams 登记意图**，给其它 agent 看到的机会。

**Ownership Zones**

在 `docs/INDEX.md` 维护一张 `路径 glob | 默认所有者 | 说明` 表。改文件前先看路径所属：

- 别人 zone → 在对应文档底部留 comment 协调，不直接改。
- 自己 zone / 无人 zone → 直接干。
- append-only 协作区 → 永远只增不改/删别人内容。

**冲突处理 SOP**

发现仓库里有 untracked / 非本 agent 写的新文件时：

1. **不要直接 commit**。先 `Read docs/INDEX.md §Active Workstreams` 查是否他人 in-progress。
2. 别 agent 在做 → 等或协调，不抢。
3. 历史遗留孤儿 → 登记到 INDEX，commit 用 `docs(reconcile): integrate orphan ...`。
4. 与本 agent 工作冲突 → reconcile commit，明示"以谁为准"+ 更新 INDEX。

**结论变更**

旧 ADR / 旧文档不删除，改为 `Superseded by X`；新文档中写 `Supersedes Y`。任何"删除文档以撤销决策"都是反模式——历史信息会丢，下次同问题会被重新讨论。

**Commit 自报家门**

commit message 末尾加：

```
agent: claude-<short-context>
```

便于 `git log` 追冲突。用 `PreToolUse(Bash)` hook 在匹配 `git commit` 命令时**校验是否带尾标，缺则拒绝**（`exit 2` + 反馈让 agent 自己补）——比 hook 改写命令"自动追加"更可靠（改写对引号 / 多 `-m` / heredoc 脆弱）。实现见 [references/hooks/check-agent-tag.sh](references/hooks/check-agent-tag.sh)。

**硬规则配 hooks**

以下规则不能只靠 `CLAUDE.md` 软约束，必须配进 `.claude/settings.json` hooks：

- 开工三件套检查：编辑前未读 INDEX / 未登记 Active Workstreams → 拒绝。
- append-only 越界：检测到删除/修改了别人 workstream 行 → 拒绝。
- 路径所有权越界：编辑别人 zone 的文件未协调 → 警告或拒绝。
- commit 自报家门：未带 `agent:` tail → 拒绝（反馈让 agent 自己补，不靠 hook 改写命令）。
- 文档同步：源码改了但对应 spec / ADR 未改 → 阻塞 Stop。

## 参考材料

**本 skill 内部**：

- 用户提到 JDOTEST、车机电商、多 agent 协作、ADR 前置规划，或需要一个成熟 AI Coding 项目样本时，读取 `references/jdotest-patterns.md`。
- 从 0 创建文档模板时，读取 `references/kickoff-templates.md`。
- 需要创建 AI agent 工作说明书时，读取 `references/agent-contract-template.md`。
- 需要后台、测试、契约、前后端联调或 CI 方案时，读取 `references/backend-testing-integration.md`。
- 需要完整 AI Coding 流程、spec-driven development、AI rules、验证证据或 review 闭环时，读取 `references/ai-coding-workflow.md`。
- 需要 OpenSpec 三阶段生命周期、delta spec、archive 流程时，读取 `references/openspec-integration.md`。
- 阶段 4 配置 harness 第④层 hooks 时，从 `references/hooks/` **逐字复制** 5 个实战脚本（`exit 2` 实跑验证）到目标项目 `.claude/hooks/`；说明见 `references/hooks/README.md`。

**上游 / 同赛道 skill**（按工作流先后衔接，避免重复访谈）：

| 时机 | 推荐 skill | 角色 |
|---|---|---|
| 想法发散阶段 | [`obra/superpowers`](https://github.com/obra/superpowers) 的 `brainstorming` | HARD-GATE：未出 design 不许任何实现动作。产 `docs/superpowers/specs/...-design.md`。 |
| 把对话沉淀成 PRD | [`mattpocock/skills`](https://github.com/mattpocock/skills) 的 `to-prd` | 不访谈，直接综合上下文 → PRD → GitHub issue（`ready-for-agent` 标签）。 |
| PRD 已有，要开工 | **本 skill** | PRD/brief → 完整仓库 + ADR + hooks + OpenSpec init。 |
| 进入实施 | `superpowers/writing-plans` + `executing-plans`，或 BMAD `/sprint-planning` + `/dev-story` | 把 task-plan 拆成可执行 plan 并跑。 |

**技术栈专属 skill（按目标平台委派，本 skill 不教平台细节）**——本 skill 负责"结构、文档、约束、harness"，**平台正确性交给平台 skill**（单一职责）。落地时识别目标平台，建议在目标仓库 `.claude/skills/` 装上对应 skill：

| 目标平台 | 推荐 skill / 工具 | 解决什么 |
|---|---|---|
| **原生安卓（Kotlin + Jetpack Compose）** | [`aldefy/compose-skill`](https://github.com/aldefy/compose-skill)（带 androidx 源码"凭证"，纠正 AI 编 Compose"能编过但细节错"：state 原语 / 重组 bug / 弃用导航 API / modifier 顺序）；[`new-silvermoon/awesome-android-agent-skills`](https://github.com/new-silvermoon/awesome-android-agent-skills) | Compose 实装正确性 |
| **原生安卓的 agent 工具链** | **Google Android CLI 1.0**（I/O '26）+ **Android Skills**（同样是 `SKILL.md` 格式）| 让 agent 不开 Android Studio GUI 就能语义符号解析 / 渲染 Compose 预览 / 跑 UI 测试；官方称比在 IDE 里跑 agent **省 70%+ token、快 3×**。直接对症"沙箱无 SDK、构建难"（jdotest-v2 ADR-0013 踩过的坑）|

> 经验（jdotest-v2 ADR-0013 验证）：消费端从 H5 改原生 Compose 后，逐像素还原既有网页 mockup 成本极高，最终务实回退到 **WebView 直载网页**复用界面。启示：**别为 demo 过度原生化**——先确认"原生"是真需求（性能 / 系统集成 / 离线）还是被"看起来更高级"带偏；纯展示型可 WebView/H5 起步，把原生留给真正需要的模块。这条决策本身要落 ADR（含被否的备选）。

**业界 harness / spec 框架对照**（设计参考）：

- [GitHub Spec Kit](https://github.com/github/spec-kit)：greenfield 友好，社区 star 最大（2026 约 93k★），支持 30+ agent
- [BMAD-METHOD](https://github.com/bmadcode/BMAD-METHOD)：模拟敏捷团队 9 角色 + 15 命令
- [Kiro](https://kiro.dev/)：agentic IDE，强制"先成文 intent 再写码"的 spec-first 流程
- [OpenSpec](https://openspec.dev/)：本 skill 已原生集成。**2026 选型共识**：spec 工具分 *living-spec*（随码同步，brownfield 迭代友好）与 *static-spec*（前期结构化、实现漂移后需手动对账）；OpenSpec 属前者、brownfield 首选，这正是本 skill 选它而非 Spec Kit 的理由
- [Claude Code 官方 hooks 文档](https://code.claude.com/docs/en/hooks)：Layer 4 完整事件清单
- [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering)：harness 生态权威清单（Agent=Model+Harness / 棘轮原则 / guides+sensors 的出处）

## 完成标准

一次合格的项目开工应该满足：

- 新 agent 不看原始聊天记录也知道要做什么。
- 每个主要决策都有理由和备选方案。
- 目录结构里没有无法解释的空泛目录。
- 第一阶段实现切片足够小，可以完成并验证。
- 风险和开放问题是显性的，不藏在默认假设里。
