# 车机端电商平台 v2 · 协作公约（含后台管理）

> 本项目用 [ai-project-bootstrapper](./_templates/BOOTSTRAPPER-SKILL.md) 模板重做 JDOTEST，**新增后台管理（admin）端**，消费端 UI 沿用既有 `mockups/jdo-pencil-v3`（不重画）。
> 任何 agent 编辑任何文件前 MUST 完成 **§开工三件套**。
> 修订：v3 (2026-05-29) — 引入 Harness 5 层强制 + OpenSpec 原生流程 + admin 域。

---

## 🔒 第一原则

**任何调研、对比、讨论、对齐结论必须以文档形式落到 `docs/`（或 `openspec/`），未落文件不算结论。**

下一轮会话不接受"上次说过"，只认仓库。判断口诀：**3 天后还有人需要知道的，就必须写下来**。

---

## 🚦 开工三件套（任何编辑前 MUST 按顺序）

```
① Read CLAUDE.md            ← 本文，公约
② Read docs/INDEX.md         ← 看 Active Workstreams + Ownership Zones
③ Append docs/INDEX.md       ← 在 §Active Workstreams 加一行登记
   格式：agent-id | 工作范围 | 起始 | 涉及文件
```

完工后把行从 Active Workstreams 移到 Recent Activity，附 commit。

---

## 🧱 Harness 5 层强制（must 级规则不靠提示词）

`CLAUDE.md` / memory / 提示词都是**软约束**，agent 可忽略。`must` 级规则必须由 harness 强制：

| 层 | 载体 | 管什么 | 可绕过 |
|---|---|---|---|
| ① Memory | 本文 / `docs/` | 项目事实与规则 | ✅ |
| ② Tools/MCP | `.claude/settings.json` | 能调什么 | — |
| ③ Permissions | `.claude/settings.json` allow/deny | 工具授权 | ❌ |
| ④ Hooks | `.claude/settings.json` hooks | 工具调用拦截 | ❌ **唯一不可绕过** |
| ⑤ Observability | PR 模板 / verification 命令 | 验证证据 | — |

**铁律**：`must` 级规则不落 hook 就不算强制。Hook 拦截用 **`exit 2`**（不是 `exit 1`，`exit 1` 只告警不拦截）。

本项目**已配置**的 hook（见 [`.claude/settings.json`](./.claude/settings.json) + [`.claude/hooks/`](./.claude/hooks/)，均 `exit 2` 拦截）：

| Hook | 事件 | 强制规则 |
|---|---|---|
| `check-workstream-registered.sh` | PreToolUse(Edit/Write) | 开工三件套：未在 INDEX §Active Workstreams 登记 → 拒绝编辑（豁免 INDEX/CLAUDE/.claude）|
| `scan-secrets.sh` | PreToolUse(Edit/Write) | 密钥扫描：写入高置信度密钥/私钥 → 拒绝 |
| `check-agent-tag.sh` | PreToolUse(Bash) | commit 自报家门：`git commit` 缺 `agent:` 尾标 → 拒绝 |
| `check-index-updated.sh` | PostToolUse(Write/Edit) | 防孤儿：新增 `docs/**/*.md` 未登记 INDEX → 反馈提醒 |
| `openspec-validate.sh` | PostToolUse(Write/Edit) | 改 `openspec/**` 后跑 `validate --all --strict`（注意必须带 `--all`，否则空跑；hook 自动补 `~/.local/node20/bin` 到 PATH，CLI 缺失则跳过）|

> 暂以 `should`（软约束）保留、未配 hook 的：**文档同步**（源码↔spec/ADR 联动）、**测试 gate**（Stop 前跑 lint/test）——这两条误报率高，待规则收敛后再升为 hook，避免噪音削弱护栏可信度。

---

## 📝 何时必须写文档

| 触发场景 | 落到 |
|---|---|
| 需求确认 / 范围变化 | `docs/PRD.md` 升版本 + `docs/scope.md` + INDEX 同步 |
| 技术选型对比 | `docs/research/<topic>.md` → 结论收敛到 ADR |
| 架构 / 产品决策确认 | `docs/decisions/ADR-NNNN-*.md` 标 Accepted |
| 图被生成/改 | `diagrams/` 保留 .excalidraw 源 + INDEX 引用 |
| **新增 / 改 feature 行为** | `/opsx:propose <change-id>`（Claude Code）或 `openspec new change <id>`（CLI）→ 4 件套 |
| **feature 实施完成** | `openspec archive <change-id> --yes` 合并 delta 到 `openspec/specs/` |
| 设计 token 变化 | 先改 `docs/design/design-system.md` 再改下游 |

> **没有 `openspec propose` CLI 命令**。propose 走 `/opsx:propose` 或 `openspec new change`。

---

## 📐 Feature 级 spec 走 OpenSpec

项目级文档（本文 / PRD / scope / constraints / architecture / ADR / design）留在 `docs/`；**feature / change 级 spec 走 `openspec/`**：

- `openspec/specs/<domain>/spec.md` — 当前真相（RFC 2119 + GIVEN/WHEN/THEN）
- `openspec/changes/<id>/` — 提议变更（proposal/design/tasks/delta spec）
- delta spec 用 `## ADDED / MODIFIED / REMOVED / RENAMED Requirements`，每条 requirement 至少一个 `#### Scenario:`
- 生命周期：propose → apply → archive
- `docs/feature-spec.md` 降级为**派活看板 + 路由→domain 映射**，spec 主体在 `openspec/specs/`

域划分按业务边界（kebab-case）：消费端 `catalog` `cart` `order` `payment` `auth-login` `auth-qr` `fulfillment` `driving-mode`；**后台端 `admin-auth` `admin-catalog` `admin-order` `admin-user` `admin-marketing` `admin-fulfillment` `admin-content` `admin-analytics`**。

---

## 🗺 Ownership Zones

完整表见 [`docs/INDEX.md` §Ownership Zones](./docs/INDEX.md)。别人 zone → 协调；自己/无人 zone → 直接干；append-only 协作区 → 只增不改删别人内容（`docs/INDEX.md` §Active Workstreams / §Recent Activity）。

---

## 🔀 冲突处理 SOP

发现 untracked / 非本 agent 新文件：① 不要直接 commit，先查 INDEX §Active Workstreams；② 别人在做 → 协调；③ 历史遗留 → 登记 + `docs(reconcile):`；④ 冲突 → reconcile 明示"以谁为准"。结论变更：旧 ADR 标 `Superseded by X`，不删除。

---

## ✍ Commit 自报家门

commit message 末尾加：`agent: claude-<short-context>`

---

## 📌 锁定结论（不要再问）

- **消费端运行形态**：~~车机内嵌 H5 / WebView~~ → **原生安卓 App（Kotlin + Jetpack Compose，普通安卓车机/平板）**，横屏 + 行车态降级（**2026-06-02 改，见 [ADR-0013](./docs/decisions/ADR-0013-consumer-native-android.md)**；H5 原型 `mockups/jdo-pencil-v3` 降级为视觉/交互参照基准）
- **后台端运行形态**：标准桌面 Web（PC 浏览器，非车机；不受 88px 触控 / 行车态约束）
- **UI 基准**：消费端 = `mockups/jdo-pencil-v3`（**不重画**）；后台端 = 复用 `design-system.md` 的 token / 色板，桌面布局，**不另造设计语言**
- **业务范围**：通用全品类车机电商 + 后台运营管理
- **技术栈**：沿用 9 个 Accepted ADR；admin 端新增 ADR-0010~0012
- **沟通语言**：中文

---

## 📎 模板出处

本项目的文档模板与流程来自 [`_templates/`](./_templates/)（ai-project-bootstrapper skill 的 references）。需要新建某类文档时，先看 `_templates/references/kickoff-templates.md` 的对应模板。OpenSpec 用法见 `_templates/references/openspec-integration.md`。
