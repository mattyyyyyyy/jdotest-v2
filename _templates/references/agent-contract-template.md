# AI 协作公约模板（CLAUDE.md / AGENTS.md）

从 0 项目开始时，优先创建 `CLAUDE.md` 或 `AGENTS.md` 作为 AI agent 在仓库内的工作说明书。

- 主要使用 Claude 系列 → 文件名用 `CLAUDE.md`
- 希望同时兼容 Codex / Copilot / Cline → 同时创建 `AGENTS.md`，两者互相引用，避免规则冲突
- 大段共用规则写在 `CLAUDE.md`，`AGENTS.md` 用 `> 详见 CLAUDE.md` 链回，避免双份维护

公约本身要**短、硬、长期有效**——所有具体细节（API 字段、当前任务、临时备忘）放对应专题文档，本文件只放规则和指针。

---

## CLAUDE.md 模板

```markdown
# <项目名> · AI 协作公约

> 版本：v1 · 日期：YYYY-MM-DD · 状态：Accepted
> 本项目允许 <一个 / 多个> agent 推进。任何 agent 在编辑任何文件前 MUST 完成 **§开工三件套**。

---

## 🔒 第一原则

**文档不落地不算结论。** 任何调研、对比、讨论、对齐过的结论必须落到 `docs/`，未落文件不算结论。

下一轮会话不接受"上次说过"，只认仓库。这是防止反复调研、结论漂移、上下文丢失的唯一手段。

**判断口诀**：如果这段对话在 3 天后还有人需要知道，就必须写下来。

**唯一真相**：同一事实只在一个文档维护（见 [`docs/INDEX.md`](./docs/INDEX.md) 的文档分工），其它文档引用而不复制。

---

## 🚦 开工三件套（任何编辑前 MUST 按顺序完成）

```
① Read CLAUDE.md            ← 本文，公约
② Read docs/INDEX.md         ← 看 Active Workstreams + Ownership Zones
③ Append docs/INDEX.md       ← 在 §Active Workstreams 加一行登记本次工作
   §Active Workstreams         格式：agent-id | 工作范围 | 起始 | 涉及文件
```

完工后把这行从 Active Workstreams 移到 Recent Activity，附上对应 commit。

**违反后果**：撞车 / 覆盖别人工作 / 产生孤儿文件。harness 已通过 `PreToolUse` hook 强制此规则，未登记直接拒绝。

---

## 📝 何时必须写文档

| 触发场景 | 必落 |
|---|---|
| 用户讨论需求、范围被确认 | `docs/PRD.md` 升版本 + `docs/INDEX.md` 同步 |
| 任何技术选型对比 | `docs/research/<topic>.md`（过程）→ 结论收敛到 `docs/decisions/ADR-NNNN-*.md` |
| 任何架构 / 产品决策被确认 | `docs/decisions/ADR-NNNN-*.md` 标 Accepted |
| 架构 / 流程 / IA 图被生成或修改 | `diagrams/` 保留源文件 + INDEX 引用 |
| 新约束 / 偏好 / 业务规则被提出 | 追加 `docs/constraints.md` 或新 ADR + INDEX 同步 |
| **新增 feature / 修改既有 feature 行为** | `/opsx:propose <change-id>`（Claude Code 推荐）或 `openspec new change <change-id>`（CLI）→ 写 `openspec/changes/<id>/{proposal,design,tasks}.md + specs/<domain>/spec.md` (delta)。**OpenSpec 没有 `openspec propose` CLI 命令** |
| **feature 实施完成** | `openspec archive <change-id> --yes` 合并 delta 到 `openspec/specs/<domain>/spec.md` |
| 路由总览 / 派活看板变化 | 更新 `docs/feature-spec.md` 的派活看板 + 路由 → domain 映射 |
| 设计 token / 视觉规范变化 | 先改 `docs/design/design-system.md` 再改下游 mockups 与代码 |
| 旧结论被推翻 | 旧 ADR 标 `Superseded by ADR-XXXX`，新 ADR 写 `Supersedes ADR-XXXX`，不删除历史 |

**调研型任务额外步骤**：先到 `docs/research/` 检索是否已有结论，已有则直接引用，没有再开新调研。

**Feature 级 spec 走 OpenSpec**：spec 主体不写在 `CLAUDE.md` 或 `docs/feature-spec.md`，而是在 `openspec/specs/<domain>/spec.md`（当前真相）+ `openspec/changes/<id>/`（提议变更）。详见 [`references/openspec-integration.md`](./openspec-integration.md)。

---

## 🗺 Ownership Zones

完整表见 [`docs/INDEX.md` §Ownership Zones](./docs/INDEX.md)。改文件前先看路径所属：

- **别人 zone** → 在对应文档底部留 comment 协调
- **自己 zone / 无人 zone** → 直接干
- **append-only 协作区**（见下节）→ 永远只增不改 / 删别人内容

---

## 🔀 冲突处理 SOP

发现仓库里有 untracked / 非本 agent 写的新文件时：

1. **不要直接 commit**，先 `Read docs/INDEX.md §Active Workstreams` 查是否他人 in-progress
2. 别 agent 在做 → 等或 coordinate
3. 历史遗留 → 登记到 INDEX，commit 用 `docs(reconcile): integrate orphan ...`
4. 与本 agent 工作冲突 → reconcile commit，明示「以谁为准」+ 更新 INDEX

**结论变更**：旧 ADR / 旧文档不删，改为 `Superseded by X`；新文档写 `Supersedes Y`。

---

## 📎 Append-Only 协作区

以下文件由多 agent 共享维护，**只增加自己的行，不修改 / 删除别人的行**：

- `docs/INDEX.md` §Active Workstreams
- `docs/INDEX.md` §Recent Activity
- 任何 `docs/worklog/agent-*.md`（如启用）

其它文档允许覆写，但**大段重写前必须先在 §Active Workstreams 登记意图**，给其它 agent 看到的机会。

---

## ✍ Commit 自报家门

在 commit message 末尾加：

```
agent: claude-<short-context>
```

非强制规范，但便于 `git log` 排查冲突。已通过 `PreToolUse(Bash)` hook 在 `git commit` 命令上自动追加。

---

## 📁 仓库结构

```text
<repo-root>/
├── CLAUDE.md                     # 本文
├── docs/
│   ├── INDEX.md                  # 实时仪表盘 + 文档目录（必读）
│   ├── project-brief.md          # 项目目标与用户
│   ├── scope.md                  # MVP 边界
│   ├── constraints.md            # 所有约束
│   ├── architecture.md           # 系统视图
│   ├── PRD.md                    # 产品需求（产品型项目）
│   ├── feature-spec.md           # 派活看板 + 路由→domain 映射（spec 主体在 openspec/）
│   ├── backend-spec.md           # 后台模块（如有后端）
│   ├── api-contracts.md          # API 契约（如有 API）
│   ├── testing-strategy.md       # 测试层级 + CI gate
│   ├── ai-coding-workflow.md     # AI 编码闭环
│   ├── task-plan.md              # 任务总目录
│   ├── open-questions.md         # 未决问题
│   ├── design/
│   │   ├── design-system.md      # 设计 token 单一真相
│   │   ├── page-spec.md          # 视觉布局权威源
│   │   └── interaction-patterns.md  # 交互模式 / 状态矩阵
│   ├── decisions/                # ADR-NNNN-*.md
│   └── research/                 # 调研报告
├── openspec/                     # Feature 级 spec（OpenSpec 框架）
│   ├── specs/<domain>/spec.md    # 当前真相（RFC 2119 + GIVEN/WHEN/THEN）
│   ├── changes/<id>/             # 进行中变更：proposal/design/tasks + specs/<domain>/spec.md (delta)
│   ├── changes/archive/          # 已归档变更（按日期前缀）
│   └── config.yaml               # OpenSpec 配置
├── diagrams/                     # 架构 / IA / 流程图源文件
├── mockups/                      # 设计原型
├── apps/                         # 应用入口
├── services/                     # 后端服务
├── packages/                     # 共享包
├── tools/                        # 种子数据 / mock / e2e
├── infra/                        # docker-compose / 部署
├── .claude/
│   └── settings.json             # 强制规则 hooks
└── .env.example
```

---

## 📌 锁定结论（不要再问）

> 这些结论已在 ADR 或 PRD 锁定，会话中不要重新讨论。如需变更，走 Superseded 流程。

- **运行形态**：<例：Web / 移动 / 车机内嵌 H5>
- **业务范围**：<一句话>
- **阶段策略**：<Demo / MVP / 生产>
- **起手顺序**：<PRD → 架构 → UI → 前端 → 后端 → 部署>
- **沟通语言**：<中文 / English>
- **技术栈**：<前端 / 后端 / 数据库>。详见 [`docs/decisions/`](./docs/decisions/)

---

## 💻 代码修改原则

- 优先遵循已有项目结构和命名
- 不做与任务无关的重构
- 不删除用户或其他 agent 的改动
- 不把密钥写入仓库
- 新增目录必须能在文档里说明用途
- 新增依赖必须有 ADR 或 PR 描述说明理由

---

## ✅ 提交前检查

- [ ] 文档是否同步（spec / ADR / INDEX）？
- [ ] ADR 是否需要新增或更新？
- [ ] `docs/INDEX.md` 是否记录了活动？
- [ ] 是否运行了必要的 lint / typecheck / test / build？
- [ ] 是否有 open question 需要显式写出？
- [ ] commit message 是否带 `agent:` 尾标？

---

## 🚫 不该做什么

- 跳过开工三件套直接改文件
- 把"用户说"作为决策依据但不落到 ADR
- 用 `git reset --hard` / `git checkout --` 撤销别人的改动
- 大段重写共享文档不先在 Active Workstreams 登记
- 把临时备忘 / API 详情 / PRD 内容塞进本文件（属于 `docs/`）

---

## 附录 · ADR 模板

文件命名：`ADR-NNNN-<kebab-case-title>.md`（NNNN 四位递增）

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
| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|

## 后果 Consequences
- 正面影响：
- 负面影响 / 代价：
- 后续需要做的事（触发的下游改动清单）：
  - [ ] 下游文档 / 代码 sync 项
```
```

---

## AGENTS.md 模板（兼容 Codex / 其它 agent）

如果项目需要同时支持 Codex / Copilot / Cline 等其它 agent，创建 `AGENTS.md` 文件，主体内容指回 `CLAUDE.md`，避免规则双份维护：

```markdown
# AI Agents 公约

> 本仓库由 Claude / Codex / 其它 agent 共同维护。
> **完整公约见 [CLAUDE.md](./CLAUDE.md)**。本文件只列出对其它 agent 的额外说明。

## 适用范围

- Codex / GPT 系列：本文件 + CLAUDE.md
- Claude 系列：直接读 CLAUDE.md
- GitHub Copilot：本文件 + `.github/copilot-instructions.md`
- Cline / Continue：本文件 + 各自 rules 文件

## 工具差异说明

| 能力 | Claude Code | Codex | 备注 |
|---|---|---|---|
| `.claude/settings.json` hooks | 支持 | 不支持 | 非 Claude agent 自觉遵守规则 |
| 长文档阅读 | 一次读全 | 分块 | 大文档先看 INDEX 再按需取 |
| Sub-agents | 支持 | 不支持 | 跨 agent 调用走 worklog |

## 命名规范

agent-id 在 INDEX / commit 中区分：

- `claude-<context>` — Claude
- `codex-<context>` — Codex / GPT
- `copilot-<context>` — Copilot
```

---

## 写作原则（写给生成 CLAUDE.md 的 skill）

- **短、硬、长期有效**：规则要么是 `must` 要么不写。"尽量" / "建议" / "原则上" 这种软词不进 CLAUDE.md。
- **指针不复制**：API 字段、PRD 内容、当前任务都不写进来，链接到对应文档即可。
- **超过 200 行 = 边界不清**：如果 CLAUDE.md 涨到 200 行以上，拆出来。
- **每条规则都要可验证**：能用 hook 检查的优先 hook，纯语义规则要写清触发条件和违反后果。
- **不写"为什么"**：CLAUDE.md 是规则书，不是论证文档。理由放对应 ADR。
- **锁定结论与开放问题分开**：`§锁定结论` 是不再讨论的；变化频繁的进 `open-questions.md` / `task-plan.md`。

---

## 完整示例：车机电商 Demo 的 CLAUDE.md

以下是按本模板生成的、可直接用的 `CLAUDE.md`，展示每节填好后是什么样。

```markdown
# 车机电商 Demo · AI 协作公约

> 版本：v2 · 日期：2026-05-26 · 状态：Accepted
> 本项目允许多个 Claude 实例并行推进。任何 agent 在编辑任何文件前 MUST 完成 **§开工三件套**。
> 修订记录：v2 (2026-05-26) — 重写为多 agent 原生版本；v1 (2026-05-20) 单 agent 版本归档至 git 历史。

---

## 🔒 第一原则

**文档不落地不算结论。** 任何调研、对比、讨论、对齐过的结论必须落到 `docs/`，未落文件不算结论。

下一轮会话不接受"上次说过"，只认仓库。这是防止反复调研、结论漂移、上下文丢失的唯一手段。

**判断口诀**：如果这段对话在 3 天后还有人需要知道，就必须写下来。

**唯一真相**：同一事实只在一个文档维护（见 [`docs/INDEX.md` §文档分工](./docs/INDEX.md)），其它文档引用而不复制。典型：

- 路由 / 接口 / 状态机 → [`docs/feature-spec.md`](./docs/feature-spec.md)
- 设计 token → [`docs/design/design-system.md`](./docs/design/design-system.md)
- 数据模型 → [`docs/backend-spec.md`](./docs/backend-spec.md)
- API 契约 → [`docs/api-contracts.md`](./docs/api-contracts.md) + `packages/api-contracts/openapi.yaml`

---

## 🚦 开工三件套（任何编辑前 MUST 按顺序完成）

```
① Read CLAUDE.md            ← 本文
② Read docs/INDEX.md         ← 看 Active Workstreams + Ownership Zones
③ Append docs/INDEX.md       ← 在 §Active Workstreams 加一行登记本次工作
   格式：agent-id | 工作范围 | 起始 | 涉及文件
```

完工后把这行从 Active Workstreams 移到 Recent Activity，附上对应 commit。

**违反后果**：撞车 / 覆盖别人工作 / 产生孤儿文件。harness 已通过 `PreToolUse(Edit|Write)` hook 强制此规则，未登记直接拒绝（脚本：`.claude/hooks/check-workstream-registered.sh`）。

---

## 📝 何时必须写文档

| 触发场景 | 必落 |
|---|---|
| 用户讨论需求、范围被确认 | `docs/PRD.md` 升版本 + `docs/INDEX.md` 同步 |
| 任何技术选型对比 | `docs/research/<topic>.md`（过程）→ 结论收敛到 `docs/decisions/ADR-NNNN-*.md` |
| 任何架构 / 产品决策被确认 | `docs/decisions/ADR-NNNN-*.md` 标 Accepted |
| 架构 / 流程 / IA 图被生成或修改 | `diagrams/` 保留 `.excalidraw` 源文件 + INDEX 引用 |
| 新约束 / 偏好 / 业务规则被提出 | 追加 `docs/constraints.md` 或新 ADR + INDEX 同步 |
| 路由 / 接口 / 状态机变更 | 先改 `docs/feature-spec.md` 再改实现，顺序不能反 |
| 设计 token / 视觉规范变化 | 先改 `docs/design/design-system.md` 再改下游 mockups 与代码 |
| 旧结论被推翻 | 旧 ADR 标 `Superseded by ADR-XXXX`，新 ADR 写 `Supersedes ADR-XXXX`，不删历史 |

**调研型任务额外步骤**：先去 `docs/research/` 检索是否已有结论，已有则直接引用，没有再开新调研。

---

## 🗺 Ownership Zones

完整表见 [`docs/INDEX.md` §Ownership Zones](./docs/INDEX.md)。改文件前先看路径所属：

- **别人 zone** → 在对应文档底部留 comment 协调
- **自己 zone / 无人 zone** → 直接干
- **append-only 协作区**（见下节）→ 永远只增不改 / 删别人内容

车机电商的关键 zones：

- `docs/decisions/ADR-*.md` — 提案 agent 拥有，Accepted 后不动
- `docs/design/design-system.md` — UI agent 拥有，token 唯一真相
- `docs/feature-spec.md` — 工程 agent 拥有，改前必须登记
- `apps/h5/src/modules/driving/**` — claude-driving 拥有
- `services/api/src/modules/payment/**` — claude-payment 拥有（高敏感）

---

## 🔀 冲突处理 SOP

发现仓库里有 untracked / 非本 agent 写的新文件时：

1. **不要直接 commit**，先 `Read docs/INDEX.md §Active Workstreams` 查是否他人 in-progress
2. 别 agent 在做 → 等或 coordinate
3. 历史遗留 → 登记到 INDEX，commit 用 `docs(reconcile): integrate orphan ...`
4. 与本 agent 工作冲突 → reconcile commit，明示「以谁为准」+ 更新 INDEX

**结论变更**：旧 ADR / 旧文档不删，改为 `Superseded by X`；新文档写 `Supersedes Y`。

---

## 📎 Append-Only 协作区

以下文件由多 agent 共享维护，**只增加自己的行，不修改 / 删除别人的行**：

- `docs/INDEX.md` §Active Workstreams
- `docs/INDEX.md` §Recent Activity
- `docs/worklog/agent-*.md`（若启用）

其它文档允许覆写，但**大段重写前必须先在 §Active Workstreams 登记意图**。

---

## ✍ Commit 自报家门

在 commit message 末尾加：

```
agent: claude-<short-context>
```

已通过 `.claude/hooks/append-agent-tag.sh` 在 `git commit` 命令上自动追加。

---

## 📁 仓库结构

```text
车机电商 Demo/
├── CLAUDE.md                     # 本文
├── docs/
│   ├── INDEX.md                  # 实时仪表盘 + 文档目录
│   ├── project-brief.md
│   ├── scope.md
│   ├── constraints.md
│   ├── architecture.md
│   ├── PRD.md
│   ├── feature-spec.md           # 派活看板 + 路由→domain 映射
│   ├── backend-spec.md
│   ├── api-contracts.md
│   ├── testing-strategy.md
│   ├── integration-plan.md
│   ├── ai-coding-workflow.md
│   ├── task-plan.md
│   ├── open-questions.md
│   ├── design/
│   │   ├── design-system.md      # token 单一真相
│   │   ├── page-spec.md
│   │   └── interaction-patterns.md
│   ├── decisions/                # ADR-0001 ~ ADR-0009
│   └── research/                 # 竞品调研、IA 调研
├── openspec/                     # ⭐ Feature 级 spec（OpenSpec）
│   ├── specs/
│   │   ├── auth-login/spec.md
│   │   ├── auth-session/spec.md
│   │   ├── cart/spec.md
│   │   ├── catalog/spec.md
│   │   ├── catalog-home/spec.md
│   │   ├── order/spec.md
│   │   ├── payment/spec.md
│   │   ├── user-profile/spec.md
│   │   └── driving-mode/spec.md
│   ├── changes/
│   │   ├── add-qr-login/                # 进行中
│   │   ├── tighten-driving-mode-detection/  # blocked
│   │   └── archive/
│   │       ├── 2026-05-15-add-cart-quick-buy/
│   │       └── 2026-05-25-ia-7-scenes-v3/
│   └── config.yaml
├── diagrams/                     # system-architecture / IA
├── mockups/
│   └── jdo-pencil-v3/            # ⭐ 项目主前端
├── apps/
│   └── h5/                       # React 18 + Vite + TS
├── services/
│   └── api/                      # Node 20 + Fastify
├── packages/
│   ├── api-contracts/            # openapi.yaml
│   ├── design-tokens/
│   ├── order-state-machine/
│   └── shared-types/
├── tools/
│   ├── seed/
│   ├── mock-server/
│   └── e2e/
├── infra/
│   └── docker-compose.yml
├── .claude/
│   ├── settings.json
│   └── hooks/
└── .env.example
```

---

## 📌 锁定结论（不要再问）

> 这些结论已在 ADR 或 PRD 锁定，会话中不要重新讨论。如需变更，走 Superseded 流程。

- **运行形态**：车机内嵌 H5 / WebView
- **业务范围**：通用全品类电商
- **阶段策略**：先做通用 Demo，不绑定具体车厂
- **起手顺序**：PRD → IA → 技术架构 → UI → 前端 → 后端 → 部署
- **沟通语言**：中文
- **目标分辨率**：1920×720 / 1920×1080 / 2560×1440 / 2560×1600
- **技术栈**：React 18 + Vite + TS / Node 20 + Fastify + zod / Postgres 16 + Prisma 5 + Redis 7。详见 [`docs/decisions/`](./docs/decisions/)
- **触控 ≥ 88px，字号 ≥ 18px，WCAG AA 对比度**
- **行车态触发**：车速 > 5 km/h；切回：< 5 km/h 持续 3s

---

## 💻 代码修改原则

- 优先遵循已有项目结构和命名（feature-based / pnpm workspaces / 模块 = 目录）
- 不做与任务无关的重构
- 不删除用户或其他 agent 的改动
- 不把密钥写入仓库（hook 已拦截）
- 新增目录必须能在文档里说明用途
- 新增依赖必须有 ADR 或 PR 描述说明理由
- 改动 design token 之前先改 `design-system.md`
- 改动 API 字段之前先改 `api-contracts.md` + `openapi.yaml`

---

## ✅ 提交前检查

- [ ] 文档是否同步（spec / ADR / INDEX）？
- [ ] ADR 是否需要新增或更新？
- [ ] `docs/INDEX.md` 是否记录了活动（workstream 已移到 Recent Activity）？
- [ ] 是否运行了 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`？
- [ ] 是否有 open question 需要显式写出？
- [ ] commit message 是否带 `agent:` 尾标？

---

## 🚫 不该做什么

- 跳过开工三件套直接改文件
- 把"用户说"作为决策依据但不落到 ADR
- 用 `git reset --hard` / `git checkout --` 撤销别人的改动（hook 已 deny）
- 大段重写共享文档不先在 Active Workstreams 登记
- 把 PRD 内容 / API 详情 / 当前任务塞进本文件（属于 `docs/`）
- 改 design token 不先改 `design-system.md`
- 改 API 字段不先改 `api-contracts.md`
- mockup 改了 ADR 没改（drift）

---

## 附录 · ADR 模板

文件命名：`ADR-NNNN-<kebab-case-title>.md`（NNNN 四位递增）

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
| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|

## 后果 Consequences
- 正面影响：
- 负面影响 / 代价：
- 后续需要做的事（触发的下游改动清单）：
  - [ ] 下游文档 / 代码 sync 项
```
```

完整 178 行 — 落入"短、硬、长期有效"的 200 行限度内。

---

## 反例：不好的 CLAUDE.md 长什么样

```markdown
# CLAUDE.md

## 项目介绍
我们做一个车机电商，技术栈是 React + Node...
（200 字介绍）

## API 设计
- /api/v1/products GET 拉商品列表，返回 ...
- /api/v1/cart POST 加入购物车...
（200 行 API 列表）

## 数据库设计
products 表有 id, title, price...
（数据 schema 全文）

## 当前任务
我们现在在做购物车页 P-05...
（一周后 stale）

## 一些建议
- 尽量用 TypeScript
- 建议加测试
- 原则上不写 any
（全是软规则）
```

问题：

1. 项目介绍 / API / schema 应该在 `project-brief.md` / `api-contracts.md` / `backend-spec.md`
2. 当前任务变化频繁，属于 `task-plan.md`
3. "尽量" / "建议" / "原则上" 是软规则，不是 must
4. 长度超过 500 行，agent 每次会话都读完成本太高

修复方法：**只留 must 规则 + 路径所有权 + 指针**，其它全拆出去。
