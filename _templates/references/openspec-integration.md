# OpenSpec 集成指南

本 skill 把 feature 级 spec 管理交给 [OpenSpec](https://openspec.dev/)（Fission-AI 出品的轻量 SDD 框架）。项目级 bootstrap 文档（CLAUDE.md / INDEX / PRD / ADR / brief / scope / constraints / architecture / design-system）保留在 `docs/`；feature / change 级 spec 走 `openspec/` 目录，遵循 OpenSpec 的 propose → apply → archive 生命周期。

本文件回答：为什么用 OpenSpec、怎么用、和我们既有结构怎么对齐、完整示例。

---

## 为什么是 OpenSpec

| 维度 | 我们原来的 `docs/specs/<feature>/` | OpenSpec |
|---|---|---|
| 适用场景 | 0→1 + 单次实现 | 0→1 **以及** N→N+1（brownfield 优先）|
| 当前事实 vs 提案 | 混在同一文件里，靠 git 历史区分 | `specs/`（当前真相）+ `changes/`（提案）**显式分离** |
| 变更追溯 | 全文 diff | **Delta spec**（ADDED / MODIFIED / REMOVED / RENAMED 标记）|
| 并行变更 | 多 feature 互相冲突 | 多 change 各自独立文件夹，archive 时合并 |
| 验收语法 | 自由 EARS | RFC 2119（MUST/SHOULD/MAY）+ GIVEN/WHEN/THEN（Gherkin 风）|
| 工具支持 | 纯手写 | 25+ AI 工具原生集成 + CLI 命令 |
| 生命周期 | 写完一次就停 | 三阶段状态机自动驱动 |

**核心结论**：OpenSpec 把"当前系统是什么"和"我们要改成什么"显式分开，让 brownfield 迭代不再靠记忆和 git log。这正是我们原方案最弱的一环。

---

## 两文件夹模型

```text
<repo-root>/
├── openspec/
│   ├── specs/                       # 当前事实：系统现在长什么样
│   │   ├── auth-login/
│   │   │   └── spec.md
│   │   ├── auth-session/
│   │   │   └── spec.md
│   │   ├── cart/
│   │   │   └── spec.md
│   │   ├── order/
│   │   │   └── spec.md
│   │   └── driving-mode/
│   │       └── spec.md
│   ├── changes/                     # 提议变更：每个 change 一个文件夹
│   │   ├── add-qr-login/
│   │   │   ├── proposal.md
│   │   │   ├── design.md
│   │   │   ├── tasks.md
│   │   │   └── specs/               # delta specs
│   │   │       └── auth-login/
│   │   │           └── spec.md
│   │   └── tighten-driving-mode-detection/
│   │       ├── proposal.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       └── specs/
│   │           └── driving-mode/
│   │               └── spec.md
│   ├── changes/archive/             # 已归档（archive 命令后自动移入）
│   │   ├── 2026-05-15-add-cart-quick-buy/
│   │   ├── 2026-05-20-add-recommendation-rail/
│   │   └── 2026-05-25-ia-7-scenes-v3/
│   └── config.yaml                  # 可选
├── docs/                            # 项目级文档（本 skill 生成）
└── CLAUDE.md
```

**域（domain）划分原则**：

- 按业务边界，不按技术层。`auth-login` / `cart` / `order` 是域，`api` / `frontend` / `database` 不是
- 一个域一个 `spec.md`，太大就拆子域（`auth-login` / `auth-session` / `auth-qr` 分开）
- 域命名 kebab-case，全小写

---

## 三阶段生命周期

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  PROPOSE    │──→ │   APPLY     │──→ │   ARCHIVE   │
│             │    │             │    │             │
│ 写 proposal │    │ 实施 tasks  │    │ delta 合并  │
│ 写 delta    │    │ 跑 tests    │    │ 进 specs    │
│ 写 design   │    │ 完成 PR     │    │ 移到        │
│ 写 tasks    │    │             │    │ archive/    │
└─────────────┘    └─────────────┘    └─────────────┘
   `/openspec:        实际开发        `openspec
    propose <id>`                      archive <id>`
```

### Propose（提议）

触发：用户想加新功能 / 改既有行为 / 修缺陷。

产出在 `openspec/changes/<change-id>/`：

- `proposal.md` — **意图 / 范围 / 高层方案**（why & what，不是 how）
- `specs/<domain>/spec.md` — **delta spec**，用 ADDED / MODIFIED / REMOVED / RENAMED 标记本次要动什么
- `design.md` — **技术方案 / 架构决策 / 数据流 / 影响文件**（how）
- `tasks.md` — **任务清单**，带 checkbox + 编号 + 单 session 粒度

**change-id 命名**：`<动作>-<对象>`，kebab-case。例：

- `add-qr-login`
- `tighten-driving-mode-detection`
- `migrate-cart-to-redis-cluster`
- `remove-deprecated-payment-method`
- `rename-products-to-skus`

### Apply（实施）

触发：proposal 经过 review。

做什么：

- 按 `tasks.md` 逐条实施
- 每条 task 完成勾 checkbox
- design 在实施中发现需调整 → 直接改 `design.md`
- spec 在实施中发现需调整 → 改 `changes/<id>/specs/`（仍是 delta）
- **不要**直接动 `openspec/specs/`，那是 archive 阶段的事

### Archive（归档）

触发：所有 tasks done + tests pass + PR merged。

做什么（OpenSpec CLI 自动）：

- `ADDED Requirements` 节内容追加到 `openspec/specs/<domain>/spec.md`
- `MODIFIED Requirements` 节内容替换 `openspec/specs/<domain>/spec.md` 中对应条目
- `REMOVED Requirements` 节列出的条目从 `openspec/specs/<domain>/spec.md` 删除
- `changes/<id>/` 整个文件夹移到 `changes/archive/YYYY-MM-DD-<id>/`，保留供审计

---

## Propose 的两条路径

OpenSpec **没有** `openspec propose <id>` 这个 CLI 命令。社区最大的踩坑点。propose 实际有两条路径：

| 维度 | 路径 A · AI Slash Command | 路径 B · CLI |
|---|---|---|
| 命令 | `/opsx:propose <change-id>` | `openspec new change <change-id>` |
| 触发位置 | Claude Code / Cursor / Windsurf 等 AI 工具的对话框 | 任意终端 |
| AI 介入程度 | 全程——AI 读上下文、写 proposal/delta/design/tasks、跑 validate | 只创建空骨架，4 件套内容靠人 / 后续 AI 填 |
| 适合场景 | 开发者日常迭代、bootstrapper skill 推荐的下一步 | 脚本化、CI、批量初始化、纯命令行环境 |
| 产出 | 完整可 review 的 change（直接进 Apply 阶段）| 占位文件，需后续编辑 |
| 失败模式 | AI 可能漏掉上下文 → 跑 `openspec validate --all --strict` 兜底 | 容易留半成品 → INDEX / task-plan 标 "needs filling" |

**两条路径的产物不同**（实测 v1.3.1）：`/opsx:propose` 一次性写满 4 件套；`openspec new change` 只创建 `.openspec.yaml` 标记文件，4 件套靠 `openspec instructions <artifact> --change <id>` 拿指令后逐个写。可以混用——CI 里 `openspec new change` 起骨架，开发者再用 `/opsx:propose <id>` 让 AI 补满内容。

### bootstrapper skill 的选择

- skill **不直接调** `/opsx:propose`（slash command 只能用户从交互界面发起）
- skill **可以**直接调 `openspec new change`（脚本可触发）
- 推荐做法：skill 在 task-plan.md 第一条任务里写 `T-1: 在 Claude Code 里跑 /opsx:propose add-<feature-1>`，把控制权交给用户

---

## Spec 文件格式

### Requirement + Scenario（OpenSpec 强制结构）

```markdown
### Requirement: <一句话名字>

[正文用 RFC 2119 keywords：MUST / SHALL / SHOULD / MAY / MUST NOT / SHALL NOT]

The system MUST <expected behavior>，<additional context>。

#### Scenario: <场景名>
- GIVEN <初始状态>
- WHEN <动作 / 事件>
- THEN <可观测结果>
- AND <额外断言>

#### Scenario: <另一个场景>
- ...
```

**RFC 2119 关键字**（参考 [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119)）：

| 关键字 | 含义 |
|---|---|
| `MUST` / `SHALL` | 绝对强制，无例外 |
| `MUST NOT` / `SHALL NOT` | 绝对禁止 |
| `SHOULD` | 推荐，例外需在 spec 中说明 |
| `SHOULD NOT` | 不推荐，例外需说明 |
| `MAY` / `OPTIONAL` | 可选 |

**GIVEN/WHEN/THEN 写法**（来自 BDD / Gherkin）：

- `GIVEN` 写初始状态，不要写动作
- `WHEN` 写**一个**触发动作 / 事件
- `THEN` 写**可观测**结果（用户能看到 / 系统能验证）
- `AND` 串联额外断言，不要塞太多

### Delta Spec 四种标记

仅在 `openspec/changes/<id>/specs/<domain>/spec.md` 出现。`openspec validate --all --strict` 实测认可 4 种 delta header：`## ADDED / MODIFIED / REMOVED / RENAMED Requirements`，且**每个 requirement 必须至少有一个 `#### Scenario:` 块**，否则 validate 报错。

```markdown
# Delta for <domain>

## ADDED Requirements

### Requirement: 新增的需求名
[完整 requirement 内容 + 至少一个 scenario]

## MODIFIED Requirements

### Requirement: 已存在的需求名
[修改后的完整内容，archive 时替换原条目]

变更说明（可选）：
- 原来：<旧行为>
- 现在：<新行为>
- 原因：<为什么改>

## REMOVED Requirements

### Requirement: 要删除的需求名
（archive 时从主 spec 删除，不需要保留正文）

废弃原因：<为什么删>

## RENAMED Requirements

### Requirement: 旧需求名 → 新需求名
（只改名、行为不变时用这个，archive 时改主 spec 里的标题，正文保留）
```

---

## proposal.md 字段

**用 OpenSpec v1.3.1 原生模板的章节名**（实测来自 `openspec instructions proposal`）。不要自创 Intent/Scope/Approach 章节——那样会和 `/opsx:propose` 生成的 proposal 风格分叉，在同一项目里产生两种格式。

```markdown
## Why

<!-- 1-2 句讲问题或机会。这个变更解决什么问题？为什么是现在？ -->

## What Changes

<!-- bullet 列出会变什么。新能力 / 修改 / 删除都要具体。breaking change 标 **BREAKING**。 -->
- <变更 1>
- <变更 2>

## Capabilities

<!-- 关键节：建立 proposal 与 specs 阶段之间的契约。填之前先 research openspec/specs/ 现有 spec 名。 -->

### New Capabilities
<!-- 新引入的能力，每个 → 一个新 specs/<name>/spec.md。kebab-case 命名。 -->
- `<name>`: <这个能力覆盖什么>

### Modified Capabilities
<!-- 既有能力中 REQUIREMENTS 变化的（不只是实现变化）。每个需要一个 delta spec 文件。无则留空。 -->
- `<existing-name>`: <哪条 requirement 在变>

## Impact

<!-- 受影响的代码、API、依赖、系统。可在此引用 ADR-NNNN / PRD US-xx / 上游 scope 条目。 -->
```

> **字段映射**（从旧 skill 格式迁移）：旧 `Intent` → `Why`；旧 `Scope` → `What Changes`（in-scope）+ 在 design.md 的 Non-Goals 写 out-of-scope；旧 `Affected Specs` → `Capabilities`（New/Modified 分开）；旧 `Approach` → 移到 design.md `Decisions`；旧 `Related` → 并入 `Impact` 或 design.md。
>
> **聚焦 why 不写 how**——实现细节属于 design.md。Capabilities 一节决定会创建 / 修改哪些 spec 文件，是 proposal 最关键的部分。

---

## design.md 字段

**用 OpenSpec v1.3.1 原生 4 章节**（`openspec instructions design` 实测）：`Context` / `Goals / Non-Goals` / `Decisions` / `Risks / Trade-offs`。skill 原来的丰富字段（Data Flow / File Changes / Error Handling / Perf / Rollback）**折叠进 `Decisions` 和 `Risks / Trade-offs`** 作为子内容，不另起顶级章节——保持与 `/opsx:propose` 生成的 design 同构。

```markdown
## Context

[背景与当前状态。实施方案的高层思路，模块级不到文件级。可放数据流 ASCII 图。]

## Goals / Non-Goals

**Goals:**
- <这个 design 要达成什么>

**Non-Goals:**
- <明确不在本次做的（从 proposal 的 out-of-scope 搬过来）>

## Decisions

[关键设计决策 + 理由。可用表格或列表，把 skill 原有的 Architecture Decisions / File Changes / Error Handling 都放这里：]

**决策表**

| 决策 | 选择 | 理由 | 替代方案 |
|---|---|---|---|

（不可逆 / 重大决策单独写 ADR，本节只列变更内局部决策）

**File Changes**

| Path | Change |
|---|---|
| `services/api/src/...` | new |
| `packages/api-contracts/openapi.yaml` | modified |

**Error Handling**

| 场景 | 行为 |
|---|---|

## Risks / Trade-offs

[已知风险 + 缓解 + 取舍。把 skill 原有的 Performance / Security / Rollback 放这里：]

| Risk | Mitigation |
|---|---|

- 性能 / 安全 / 限流 / 审计：<逐项>
- Rollback：<如何安全回滚>
```

---

## tasks.md 字段

```markdown
# Tasks: <change-id>

> 状态用 checkbox 表达。每条任务一次 session 能做完。

## 1. <分组名 - 例如 Backend>

- [ ] 1.1 <具体任务，含验证命令>
  - Files: `services/api/src/...`
  - Verification: `pnpm test --grep <scope>`
- [ ] 1.2 ...

## 2. <分组名 - 例如 Frontend>

- [ ] 2.1 ...

## 3. <分组名 - 例如 Tests / Docs>

- [ ] 3.1 ...

## Implementation Order

1.1 → 1.2 → 2.1 (并行 1.3) → 2.2 → 3.x

## Done When

- [ ] 所有 task checkbox 勾上
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全绿
- [ ] PR 已 review + merged
- [ ] `openspec archive <change-id> --yes` 执行成功
- [ ] `docs/INDEX.md` Recent Activity 记录归档
```

---

## 完整工作流示例：车机电商 add-qr-login

### 阶段 1：Propose

用户说"加个车机扫码登录"。skill / agent 跑：

```bash
# Claude Code 里推荐路径（AI 一站式生成）：
/opsx:propose add-qr-login

# 或 CLI 路径（只建骨架，内容手填）：
openspec new change add-qr-login
```

生成 `openspec/changes/add-qr-login/`：

#### proposal.md（OpenSpec 原生格式）

```markdown
## Why

车主在车机大屏输入手机号 + 短信验证码体验差：行车态键盘被禁用无法登录、停车态触屏输数字慢且易误触、副驾乘客已习惯手机扫码登录其它应用。需要"车机扫码 → 手机授权"的登录方式。

## What Changes

- 新增车机端扫码登录 UI（停车态）
- 行车态首页内嵌登录二维码（不弹常规 modal）
- 新增手机端 H5 授权页（同源应用）
- 后端 session 状态机（PENDING → SCANNED → CONFIRMED / REJECTED / EXPIRED / SUPERSEDED）
- 限流 + CSRF 保护
- **BREAKING**：`GET /auth/methods` 行车态返回值收窄为仅 `["qr-login"]`

## Capabilities

### New Capabilities
- `auth-qr-login`: 车机扫码 + 手机授权的完整登录流程与 session 状态机

### Modified Capabilities
- `auth-session`: session 来源新增 `qr-confirmed`
- `driving-mode`: 行车态登录路径新增二维码内嵌

## Impact

- 代码：`services/api` 新增 user/qr-login 模块、`apps/h5` 新增登录面板与授权页、`packages/api-contracts` 加 3 endpoint
- 依赖：Redis（短寿命 session 存储）
- 关联：PRD US-21、ADR-0010（鉴权方案）、Q-102（已登录设备扫码是否 confirm，default 不 confirm）

非目标（out-of-scope，详见 design.md Non-Goals）：手机反向扫车机、自动登录历史车机、跨车机会话同步
```

#### specs/auth-login/spec.md（delta）

```markdown
# Delta for auth-login

## ADDED Requirements

### Requirement: QR Code Login Session

The system MUST support QR code based login by generating a short-lived session that links a vehicle terminal (consumer) and a mobile device (authorizer).

The system MUST issue a session ID using ULID format and store it in Redis with a 60-second TTL.

The system MUST expose the session state via short polling at 1 Hz from the vehicle side.

#### Scenario: 用户在车机点扫码登录
- GIVEN 用户在 `/login` 页面，未登录态
- WHEN 用户点击 "扫码登录" tab
- THEN 系统调用 `POST /auth/qr-login/start`
- AND 系统在 Redis 创建 `qr-session:{sessionId}`，state=`PENDING`，TTL=60s
- AND 系统返回 `{ qrCode, sessionId, expiresAt }`
- AND 车机端展示二维码 + 60 秒倒计时

#### Scenario: 手机扫码后用户授权
- GIVEN 车机端 session 在 PENDING 状态
- WHEN 手机扫描二维码并跳到 `/qr-auth/:sessionId`
- AND 用户在手机端 H5 授权页点击 "允许"
- THEN 手机端调用 `POST /auth/qr-login/confirm`（带手机端 phone JWT）
- AND 系统验证 phone JWT 有效
- AND 系统将 session state 转为 `CONFIRMED`，写入 accessToken / refreshToken
- AND 车机端下一次轮询拿到 token，写 localStorage，关闭登录面板

#### Scenario: 二维码过期
- GIVEN 车机端 session 在 PENDING 状态超过 60 秒
- WHEN 车机端调用 `GET /auth/qr-login/poll`
- THEN 系统返回 `{ state: "EXPIRED" }`
- AND 车机端显示 "二维码已失效，点击刷新"

#### Scenario: 同手机号新 session 覆盖旧 session
- GIVEN 同一手机号已有一个 PENDING / SCANNED session A
- WHEN 同一手机号触发新 session B 的 start 接口
- THEN session A 的 state 转为 `SUPERSEDED`
- AND session A 对应的车机端轮询拿到 `SUPERSEDED` 终态
- AND session B 正常进入 PENDING

## MODIFIED Requirements

### Requirement: Login Method Discovery

The system MUST surface the available login methods to the client based on platform context.

变更说明：
- 原来：手机号 + 验证码（短信） · OAuth（车厂账号）
- 现在：手机号 + 验证码 · OAuth · **QR Code Login**（新增）
- 行车态：仅 QR Code Login + 已登录会话续期

#### Scenario: 行车态返回的登录方式列表
- GIVEN 车机端处于行车态（车速 > 5 km/h）
- WHEN 客户端调用 `GET /auth/methods`
- THEN 系统返回 `{ methods: ["qr-login"] }`
- AND 其它方式（手机号、OAuth）被隐藏
```

#### design.md（OpenSpec 原生 4 章节）

```markdown
## Context

短轮询 + Redis session 状态机。state 在 `qr-login.machine.ts` 中实现为纯函数 `transition(state, event) → newState | InvalidTransition`，service 层用 Redis WATCH/MULTI 包装并发安全。

数据流：车机 start → Redis 建 PENDING session → 车机 1Hz 轮询 → 手机扫码跳 H5 授权页 → confirm 写 token → 车机下次轮询拿到 CONFIRMED + token。

## Goals / Non-Goals

**Goals:**
- 行车态可登录（键盘禁用下仍可扫码）
- 弱网稳定（HTTP 短轮询，不依赖长连接）

**Non-Goals:**
- 手机反向扫车机
- 自动登录历史车机（不引入长会话）
- 跨车机会话同步

## Decisions

**决策表**

| 决策 | 选择 | 理由 | 替代方案 |
|---|---|---|---|
| 推送机制 | HTTP 短轮询 1Hz | 车机网络弱、HTTP 最稳；60s 寿命短开销可控 | SSE（车机 WebView 兼容性参差）、WebSocket（弱网易断）|
| Session 存储 | Redis（无 DB 持久化）| 短寿命数据；archive 后不需保留过期 session | Postgres（多余开销）|
| 手机端 H5 域名 | 复用主 H5 域名 `/qr-auth/:sessionId` | 不引入额外应用；CSRF 校验 Origin 即可 | 独立子域名（部署复杂）|
| ID 生成 | ULID | 不可猜 + 可排序 + URL safe | UUID（不可排序）、自增（可猜）|

**File Changes**

| Path | Change |
|---|---|
| `services/api/src/modules/user/qr-login.{machine,service,controller,schema}.ts` | new |
| `packages/api-contracts/openapi.yaml` | modified (3 新 endpoint + 3 新错误码) |
| `apps/h5/src/pages/login/{QrLoginPanel,QrAuthPage}.tsx` | new |
| `apps/h5/src/hooks/useQrLoginPolling.ts` | new |
| `apps/h5/src/pages/driving/DrivingHome.tsx` | modified (内嵌二维码) |
| `tools/mock-server/handlers/qr-login.ts` | new |

**Error Handling**：session 不存在 → 404；已 confirm 再 confirm → 409；过期 → 返回 `{state:"EXPIRED"}` 不报错。

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Redis 不可用 → 登录全挂 | Redis Sentinel + fallback 到手机号 + 验证码登录 |
| 微信扫码无法自动跳浏览器 | 二维码下方加文案"如未跳转请手动复制链接" |

- 性能：轮询接口必须命中 Redis，P99 ≤ 50ms
- 限流：start 5/min/IP，poll 60/min/IP，confirm 3/min/user
- 安全：confirm 校验 Origin = `app.example.com`；sessionId 用 ULID 不可猜；同 sessionId 只能 confirm 一次
- Rollback：无 schema 变更，部署上一版即可；Redis 残留 session 60s 自动过期
```

#### tasks.md

```markdown
# Tasks: add-qr-login

## 1. Backend

- [ ] 1.1 qr-login state machine 纯函数 + 14 个单元测试
  - Files: `services/api/src/modules/user/qr-login.machine.ts` + `.test.ts`
  - Verification: `pnpm --filter @jdo/api test --grep qr-login.machine`

- [ ] 1.2 qr-login.service.ts：Redis CRUD + 状态转换包装
  - Files: `services/api/src/modules/user/qr-login.service.ts` + `.test.ts`
  - Verification: route test mock Redis 全绿

- [ ] 1.3 3 个 controller endpoint + zod schemas + 错误码
  - Files: `qr-login.controller.ts`, `qr-login.schema.ts`
  - Verification: `pnpm --filter @jdo/api test --grep qr-login.controller` 全绿 + Swagger UI 可见

- [ ] 1.4 OpenAPI 添加 3 个 endpoint
  - Files: `packages/api-contracts/openapi.yaml`
  - Verification: `pnpm test:contract` 全绿

- [ ] 1.5 限流配置（start/poll/confirm 三档）
  - Files: `services/api/src/modules/gateway/rate-limit.ts`
  - Verification: integration test 超限断言 429

## 2. Frontend

- [ ] 2.1 `useQrLoginPolling` hook
  - Files: `apps/h5/src/hooks/useQrLoginPolling.ts` + `.test.ts`
  - Verification: hook 单元测试覆盖 5 状态切换

- [ ] 2.2 QrLoginPanel 组件
  - Files: `apps/h5/src/pages/login/QrLoginPanel.tsx`
  - Verification: Storybook 5 状态截图 + a11y 测试

- [ ] 2.3 QrAuthPage 手机授权页
  - Files: `apps/h5/src/pages/login/QrAuthPage.tsx`
  - Verification: 在手机 viewport 跑通"允许 / 拒绝 / 取消"

- [ ] 2.4 集成到 P-12 登录页
  - Files: `apps/h5/src/pages/login/index.tsx`
  - Verification: mockups/jdo-pencil-v3 对比一致

- [ ] 2.5 行车态内嵌二维码
  - Files: `apps/h5/src/pages/driving/DrivingHome.tsx`
  - Verification: URL `?speed=30` 进行车态后能看到二维码

## 3. Tests / Docs / Mock

- [ ] 3.1 MSW handlers 5 场景
  - Files: `tools/mock-server/handlers/qr-login.ts`
  - Verification: tweaks panel 切换覆盖 happy / expired / rejected

- [ ] 3.2 integration test：完整登录流程
  - Files: `services/api/test/integration/qr-login.spec.ts`
  - Verification: Testcontainers Redis + 完整流程断言

- [ ] 3.3 e2e test：三条路径
  - Files: `tools/e2e/specs/qr-login.spec.ts`
  - Verification: Playwright 跑 happy / expired / rejected 全绿

- [ ] 3.4 文档同步：`docs/INDEX.md` Recent Activity + `docs/feature-spec.md` P-12 派活看板
  - Files: `docs/INDEX.md`, `docs/feature-spec.md`

## Implementation Order

1.1 → 1.2 → 1.4 (并行) → 1.3 → 1.5 → 3.1 → 2.1 → 2.2, 2.3 (并行) → 2.4, 2.5 → 3.2 → 3.3 → 3.4

## Done When

- [ ] 所有 task 勾上
- [ ] CI 全绿
- [ ] PR review + merge
- [ ] `openspec archive add-qr-login --yes` 成功
- [ ] `docs/INDEX.md` Recent Activity 写入
```

### 阶段 2：Apply

按 `tasks.md` 顺序实施。每条 task 完成勾 checkbox。

实施中若发现 design 漏算或 spec 不完整：

- 改 design.md / 改 delta spec（**不要直接动 `openspec/specs/`，那是 archive 阶段**）
- 在 PR 描述说明 design 变更原因

### 阶段 3：Archive

所有 task done + tests pass + PR merged → 跑：

```bash
openspec archive add-qr-login --yes
# --yes 跳过交互确认；不带会停下来等用户 ack，自动化场景必加
```

CLI 自动：

1. 把 `changes/add-qr-login/specs/auth-login/spec.md` 中 `## ADDED Requirements` 内容追加到 `openspec/specs/auth-login/spec.md`
2. 把 `## MODIFIED Requirements` 内容替换 `openspec/specs/auth-login/spec.md` 中对应条目
3. 把 `## REMOVED Requirements` 列出的条目从 `openspec/specs/auth-login/spec.md` 删除
4. `changes/add-qr-login/` 整体移到 `changes/archive/2026-05-28-add-qr-login/`

最终结果：`openspec/specs/auth-login/spec.md` 变成"已经包含 QR Login"的版本，下一个 change 来时基于这个新当前态推进。

---

## 与本 skill 既有结构的对齐

| 概念 | 在 docs/ | 在 openspec/ |
|---|---|---|
| 项目目标 / 用户 | `docs/project-brief.md` | — |
| MVP 边界 | `docs/scope.md` | — |
| 全局约束 | `docs/constraints.md` | — |
| 系统架构 | `docs/architecture.md` | — |
| 关键决策 | `docs/decisions/ADR-*.md` | — |
| 设计 token | `docs/design/design-system.md` | — |
| **当前 feature 的真相** | ~~原 `docs/feature-spec.md`~~ → 见 `openspec/specs/` | `openspec/specs/<domain>/spec.md` |
| **本次要做的 feature change** | ~~原 `docs/specs/<feature>/`~~ | `openspec/changes/<id>/` |
| 跨页面交互 | `docs/design/interaction-patterns.md` | — |
| API 契约 | `docs/api-contracts.md` + `packages/api-contracts/openapi.yaml` | （change 影响契约时在 design.md 引用）|
| AI 协作公约 | `CLAUDE.md` | — |
| 文档索引 | `docs/INDEX.md` | — |

**`docs/feature-spec.md` 的角色变了**：从"路由 + 接口 + 状态机权威源"降级为**"派活看板 + 路由 → openspec/specs 的映射表"**。详细 spec 全部去 `openspec/specs/<domain>/spec.md` 看。

### 派活看板映射示例

```markdown
# Feature Spec · 派活看板

| Domain | 当前 spec | 进行中的 change |
|---|---|---|
| auth-login | [openspec/specs/auth-login](../openspec/specs/auth-login/spec.md) · 含手机号 + 验证码、OAuth | 🔵 [add-qr-login](../openspec/changes/add-qr-login/) |
| cart | [openspec/specs/cart](../openspec/specs/cart/spec.md) | 🔵 [migrate-cart-to-redis-cluster](../openspec/changes/migrate-cart-to-redis-cluster/) |
| driving-mode | [openspec/specs/driving-mode](../openspec/specs/driving-mode/spec.md) | 🔴 [tighten-detection](../openspec/changes/tighten-driving-mode-detection/) blocked |

## 路由 → Domain 映射

| 路由 | Domain |
|---|---|
| `/login` | auth-login, auth-qr |
| `/cart` | cart |
| `/orders/:id` | order |
| `/driving` | driving-mode |
```

---

## bootstrapper skill 阶段 4 怎么跑

在 [SKILL.md §执行流程 阶段 4](../SKILL.md) 落地生成时：

```bash
# 1. 装 OpenSpec CLI（如未装）
npm install -g @fission-ai/openspec@latest

# 2. 在仓库根目录 init（非交互模式，--tools 必填）
openspec init --tools claude --force
# 实测产物（v1.3.1）：
#   openspec/specs/
#   openspec/changes/
#   openspec/changes/archive/
#   openspec/config.yaml                          (schema + 项目 context + per-artifact rules)
#   .claude/commands/opsx/{propose,explore,apply,archive}.md
#   .claude/skills/openspec-{propose,explore,apply-change,archive-change}/SKILL.md
```

**第 3 步分两条路径**（选其一，OpenSpec 没有 `openspec propose` CLI）：

### 路径 A · Claude Code 用户（推荐）

```text
在 Claude Code 里逐个跑：
  /opsx:propose add-<feature-1>
  /opsx:propose add-<feature-2>
```

`/opsx:propose` 是 OpenSpec 安装到 Claude Code 的 slash command，AI 会一站式：
- 创建 `openspec/changes/<id>/` 骨架
- 读上下文（PRD / scope / constraints / 现有 specs）
- 填好 proposal.md / delta spec / design.md / tasks.md
- 跑 `openspec validate --all --strict` 自检

skill 在阶段 4 把这一步**作为指令输出给用户**，让用户在新会话里跑（或本会话里继续）。

### 路径 B · 无 AI 工具 / 脚本化场景

```bash
# 只创建空骨架
openspec new change add-<feature-1>
openspec new change add-<feature-2>

# 手填 4 件套（参考本文件前面各节模板）
$EDITOR openspec/changes/add-<feature-1>/proposal.md
$EDITOR openspec/changes/add-<feature-1>/design.md
$EDITOR openspec/changes/add-<feature-1>/tasks.md
$EDITOR openspec/changes/add-<feature-1>/specs/<domain>/spec.md

# 跑校验
openspec validate add-<feature-1> --strict
```

### skill 阶段 4 实际会做的

- 跑 `openspec init --tools claude --force`
- 把用户访谈中识别的 MVP 功能映射成 N 个 change-id（每个对应一个 domain）
- **不直接调 `/opsx:propose`**（slash command 只能用户从交互界面发起），但会：
  - 在 INDEX 加 `## OpenSpec` 节，列出待 propose 的 change-id 清单
  - 在 task-plan.md 第一条任务写 `T-1: 跑 /opsx:propose add-<feature-1>`
  - 在 README 启动指引里加 "下一步：在 Claude Code 里跑 `/opsx:propose <first-feature>`"
- 把约束 / ADR / scope 中相关条目反向引用准备好，等 propose 时填进 `## Related`

---

## 与 OpenSpec CLI 的集成（可选）

OpenSpec 提供 CLI 命令，可以接入到 `.claude/settings.json` hooks。下表是 2026 当前真实命令（不含 deprecated 的 `openspec change`）：

| 命令 | 用途 | 建议用法 |
|---|---|---|
| `openspec init --tools <list> [--force]` | 初始化项目结构（非交互必填 `--tools`，否则 exit 1）| 一次性，在 bootstrap 阶段跑 |
| `openspec new change <id>` | **创建 change 空骨架（CLI 路径的 propose 入口）** | manual / 脚本 |
| `openspec list` | 列当前所有 changes 状态 | manual |
| `openspec view` | 交互式 dashboard | manual |
| `openspec show <id>` | 显示某 change 的完整内容 | manual |
| `openspec status` | 查询 artifact 完成度 | manual |
| `openspec validate [<id>] [--strict]` | 校验 spec 格式 / RFC 2119 / scenario | `PreToolUse(Bash, git commit)` |
| `openspec archive <id> --yes` | 归档 + 合并 delta（`--yes` 跳交互）| manual（不应该自动跑）|
| `openspec update` | 刷新 AI tool skills 和命令文件 | OpenSpec 升级后跑 |

**重要提醒**：

- ❌ **没有 `openspec propose` 命令** —— propose 走 `/opsx:propose` (AI slash command) 或 `openspec new change` (CLI 骨架)
- ⚠️ **`openspec change` 是有效命令组**（子命令 `show` / `validate`），但它的 `change list` 子命令已 deprecated —— 列变更用顶层 `openspec list`
- ✅ **AI 一站式 propose** —— 在 Claude Code 里 `/opsx:propose <id>` 是 OpenSpec 官方推荐路径

hook 示例：

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "description": "git commit 前跑 openspec validate，确保 spec 格式合法",
      "command": ".claude/hooks/run-openspec-validate.sh"
    }
  ]
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/run-openspec-validate.sh
# PreToolUse hook 拦截必须 exit 2（不是 exit 1）才能真正阻塞 git commit
# --strict 拒绝缺字段，与本 skill 的自检规则保持一致
if [[ "$CLAUDE_TOOL_INPUT" == *"git commit"* ]]; then
  npx @fission-ai/openspec validate --all --strict || {
    echo "ERROR: OpenSpec validation failed (--strict). Fix spec format before commit." >&2
    exit 2
  }
fi
```

---

## 反模式

- **直接动 `openspec/specs/<domain>/spec.md`**：那是 archive 阶段的事，平时只能通过 change → delta spec 改
- **一个 change 里塞多个无关 feature**：每个 change 应该是一个独立的、可独立 review / archive 的工作单元
- **proposal.md 写实现细节**：那是 design.md 的事；proposal 只写意图、范围、高层方案
- **delta spec 写 "..."**：要把改后的完整内容写出来（archive 时整段替换）
- **tasks.md 没有 verification 命令**：任务做完 = 命令跑过 + 输出符合预期，不是"我觉得做完了"
- **跳过 archive 直接动 specs/**：会让"当前真相"与"已 review 的 change"脱节
- **change-id 重名**：archive 后旧 ID 不能复用，要么改名要么基于旧 archive 续做

---

## 来源

- [OpenSpec 官网](https://openspec.dev/)
- [Fission-AI/OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec)
- [Concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md)
- [Getting Started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md)
- [RFC 2119 关键字](https://www.rfc-editor.org/rfc/rfc2119)
- [BDD / Gherkin GIVEN/WHEN/THEN](https://cucumber.io/docs/gherkin/)
