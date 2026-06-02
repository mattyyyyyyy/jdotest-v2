# AI Project Bootstrapper Skill

A Claude Code / Codex skill that turns a brief product idea into a structured, document-first AI coding project — ready for multi-session, multi-agent work.

**目标**：给一段简短的需求 → skill 通过结构化问答补全信息 → 一次性生成所有开工文档、ADR、配置和强制规则 → 之后可以直接进入结构化开发。

## 它做什么

1. **接收 brief**：一句话想法 / PRD 草稿 / 已有仓库都行
2. **结构化访谈**：4 轮批量问答（关键 / 架构 / 约束 / 协作）
3. **生成计划**：列出将创建的文件清单，请用户确认
4. **落地生成**：所有文档、ADR、`.claude/settings.json` hooks、目录骨架一次写完
5. **交接**：下一步建议 + 启动命令 + 未决项

详见 [SKILL.md §执行流程](./SKILL.md)。

## 它产出什么

- **AI 协作公约** `CLAUDE.md` / `AGENTS.md`（开工三件套、Ownership Zones、冲突 SOP）
- **项目事实** `docs/project-brief.md` / `scope.md` / `constraints.md` / `architecture.md`
- **决策记录** `docs/decisions/ADR-NNNN-*.md`（带依赖链和 Superseded 流程）
- **文档索引** `docs/INDEX.md`（Active Workstreams + Ownership Zones + Recent Activity 三块仪表盘）
- **派活看板** `docs/feature-spec.md`（4 固定状态值 + 路由→domain 映射）
- **Feature 级 spec** `openspec/specs/<domain>/spec.md`（当前真相）+ `openspec/changes/<id>/`（提议变更），用 [OpenSpec](https://openspec.dev/) 框架管理：RFC 2119 + GIVEN/WHEN/THEN + propose/apply/archive 三阶段生命周期 + delta spec (ADDED/MODIFIED/REMOVED/RENAMED)
- **后端 / 联调 / 测试方案**（如有后端）
- **设计系统 / 页面规格 / 交互模式**（如有 UI）
- **强制规则 hooks** `.claude/settings.json`（开工三件套检查、密钥扫描、文档同步、`openspec validate` 等）
- **任务清单 + 未决问题**（每个未答项都有保守默认值）

## 怎么用

把整个目录放到 `~/.claude/skills/ai-project-bootstrapper/`，或在项目里放 `.claude/skills/ai-project-bootstrapper/`。详见 [SKILL.md](./SKILL.md) 顶部说明。

触发：

```
/ai-project-bootstrapper
```

或直接描述需求，描述里有"项目开工 / PRD / 空仓库 / 多 agent 协作"等关键词时 skill 会自动加载。

最小输入示例：

```
我要做一个 <一句话定位>。
当前 <阶段>。
第一阶段切片是 <演示路径>。
技术栈 <偏好或待推荐>。
```

skill 会自动用 4 轮访谈补全其它信息。详见 [references/interview-script.md](./references/interview-script.md)。

### 上游衔接（避免重复访谈）

本 skill 从 **PRD / brief / 旧仓库** 开始接力。如果用户输入更上游，先跑对应 skill：

```text
[想法发散]        →  obra/superpowers · brainstorming    →  design.md
[design 转 PRD]   →  mattpocock/skills · to-prd          →  GitHub issue
[PRD → 仓库]      →  本 skill                             →  CLAUDE.md + docs/ + openspec/ + hooks
[进入实施]        →  superpowers · writing-plans         →  可执行 plan
                     + executing-plans
```

## 目录结构

```text
ai-project-bootstrapper-skill/
├── SKILL.md                          # 主入口：原则、5 阶段流程、文件职责
├── agents/
│   └── openai.yaml                   # Codex / OpenAI agent 元数据
├── references/                       # 详细参考与模板
│   ├── interview-script.md           # 完整问题库（4 轮 19 题）
│   ├── kickoff-templates.md          # 所有文档模板 + 车机电商示例
│   ├── agent-contract-template.md    # CLAUDE.md / AGENTS.md 模板 + 完整示例
│   ├── openspec-integration.md       # OpenSpec 框架集成（feature 级 spec）
│   ├── jdotest-patterns.md           # 实战验证过的模式
│   ├── ai-coding-workflow.md         # AI 编码闭环 + 新旧 spec 对比
│   ├── backend-testing-integration.md  # 后端 / 测试 / 联调 + 代码片段
│   └── hooks/                        # 5 个实战 hook 脚本（exit 2 实跑验证，可逐字复制）
└── README.md                         # 本文
```

## 核心原则

- **文档不落地不算结论**——3 天测试法则：3 天后还有人需要知道的，必须写下来
- **唯一真相**——同一事实只在一个文档维护，其它地方引用而不复制
- **开工三件套**——任何编辑前 MUST 读 CLAUDE.md → 读 INDEX.md → 登记 Active Workstreams
- **Harness 5 层强制**——Memory / Tools / Permissions / **Hooks**（唯一不可绕过层）/ Observability。`must` 级规则必落 Hooks，且 PreToolUse 拦截要 `exit 2` 不是 `exit 1`
- **结论收敛**——research 是过程可以多份，ADR 是结论必须唯一；Superseded 流程保留历史
- **Feature spec 走 OpenSpec**——当前真相 `openspec/specs/` 与提议变更 `openspec/changes/` 显式分离；delta spec 追踪 ADDED/MODIFIED/REMOVED/RENAMED；archive 自动合并；适合 brownfield 多轮迭代

## 独家差异化

调研后发现以下机制目前在公开生态中没有对标实现，是本 skill 的独家差异化（保留并强化）：

- **`docs/INDEX.md` 的 append-only 实时仪表盘**：Active Workstreams / Ownership Zones / Recent Activity 三块协作面板，让多 agent 并行不撞车
- **开工三件套强制流程** + 配套 `PreToolUse` hook 拦截未登记的编辑
- **commit 自报家门 `agent: claude-<context>`** + hook 自动追加
- **结合 OpenSpec + docs/ 的混合分层**：项目级文档不动，feature 级走 OpenSpec，两者通过 `docs/feature-spec.md` 派活看板 + 路由 → domain 映射衔接

## 与其它工具的关系

| 工具 | 关系 |
|---|---|
| Claude Code / Claude API | 主目标平台 |
| Codex / OpenAI | 通过 `AGENTS.md` 兼容 |
| GitHub Copilot / Cline / Continue / Cursor / Windsurf | 通过 `AGENTS.md` 或各自 rules 文件 |
| **OpenSpec** | 集成为 feature 级 spec 框架（[openspec.dev](https://openspec.dev/) / [GitHub](https://github.com/Fission-AI/OpenSpec)）|
| **[obra/superpowers](https://github.com/obra/superpowers)** | 上游：`brainstorming` 出 design；下游：`writing-plans` + `executing-plans` 跑实施 |
| **[mattpocock/skills](https://github.com/mattpocock/skills)** | 上游：`to-prd` 把对话转 PRD 提到 GitHub issue |
| **[aldefy/compose-skill](https://github.com/aldefy/compose-skill)** · Google **Android CLI 1.0 / Android Skills** | 平台委派：目标是原生安卓（Compose）时，本 skill 搭结构，Compose 正确性 + agent 构建/预览/UI 测试交给它们 |
| GitHub Spec Kit | 设计思路参考（greenfield 友好） |
| BMAD-METHOD | 设计思路参考（模拟敏捷团队 9 角色）|
| Amazon Kiro | 设计思路参考（specs + steering + 双向同步）|

## 安装 OpenSpec CLI

skill 在阶段 4 落地生成时会调用 OpenSpec CLI。请先全局安装：

```bash
npm install -g @fission-ai/openspec@latest
```

然后在仓库根目录跑：

```bash
openspec init --tools claude --force
# 创建 openspec/{specs,changes,changes/archive,config.yaml} + .claude/{commands/opsx,skills/openspec-*}
# --tools 必填（非交互环境不带会 exit 1）；--force 跳过 legacy 文件清理交互
```

之后**不要**找 `openspec propose` 命令——它不存在。propose 走两条路径：
- Claude Code 里跑 `/opsx:propose <change-id>`（推荐，AI 一站式生成 4 件套）
- 或 CLI `openspec new change <change-id>` 建空骨架，内容手填

详细工作流见 [references/openspec-integration.md](./references/openspec-integration.md)。

## License

内部使用 / 按需开源。
