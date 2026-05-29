# 完全 AI Coding 工作流

本参考来自 Claude Code、OpenAI Codex、GitHub Spec Kit、Kiro、GitHub Copilot、Continue、Cline 等工具的官方实践。共同结论是：AI Coding 的关键不是“提示词更长”，而是把上下文分层、把规格变成任务、把验证证据留存。

## 关键调研结论

- Claude Code 建议先探索、再计划、再编码，并强调让 AI 有办法验证自己的工作，例如测试、截图、命令输出。
- OpenAI Codex 的团队实践建议大改动先 Ask/Plan，再 Code；任务最好有清晰边界，像 GitHub issue 一样描述。
- GitHub Spec Kit 将 AI 辅助开发组织为 `Spec -> Plan -> Tasks -> Implement`，每个阶段产出 Markdown，供下一阶段作为结构化上下文。
- Kiro 的 Feature Specs 将复杂功能拆成 requirements、design、tasks；需求可以用 EARS 形式写成可测试语句。
- GitHub Copilot、Continue、Cline 都强调 rules/custom instructions 应该短、明确、长期适用，并且不要把大量临时细节塞进常驻规则。

## 上下文四层

### 1. 常驻规则

文件：

```text
CLAUDE.md
AGENTS.md
.github/copilot-instructions.md
.continue/rules/*
.clinerules/*
.cursor/rules/*
```

职责：告诉 AI 在这个仓库里怎么行动。

只放：

- 开工前必读。
- 文档落地规则。
- 测试命令。
- 禁止事项。
- 项目特有架构约束。
- 高风险路径规则。

不要放：

- 长篇 API 文档。
- 变化频繁的任务状态。
- 文件逐个介绍。
- AI 本来能从代码读出来的常识。

### 2. 项目事实

文件：

```text
docs/project-brief.md
docs/scope.md
docs/constraints.md
docs/architecture.md
docs/backend-spec.md
docs/api-contracts.md
```

职责：记录项目事实，供 AI 按需读取。

这些文件不一定每次都进上下文，但必须稳定、可链接、可追溯。

### 3. 功能规格

文件：

```text
docs/specs/<feature>/requirements.md
docs/specs/<feature>/design.md
docs/specs/<feature>/tasks.md
```

职责：把一个功能从需求变成可实现任务。

推荐顺序：

1. `requirements.md`：行为和验收。
2. `design.md`：技术设计和文件影响。
3. `tasks.md`：逐项实现任务和验证方式。

每个 task 必须引用 requirement，避免 AI 在实现阶段改变需求。

### 4. 证据和交接

文件：

```text
docs/verification-log.md
PR description
docs/INDEX.md Recent Activity
```

职责：记录 AI 实际做了什么、验证了什么、没验证什么。

必须包含：

- 命令。
- 结果。
- 失败原因。
- 未验证原因。
- 截图或浏览器检查结果，如果是 UI。

## 完整 AI Coding 循环

```text
需求背景
  -> AI 访谈澄清
  -> requirements.md
  -> gap / contradiction analysis
  -> design.md
  -> tasks.md
  -> one task implementation
  -> verification
  -> fix failures
  -> adversarial review
  -> docs update
  -> handoff / PR
```

## AI 访谈阶段

当需求模糊时，先让 AI 访谈用户。问题应该聚焦：

- 用户和场景。
- 成功标准。
- 不做什么。
- 数据来源。
- 权限和安全。
- 前后端边界。
- 性能和部署。
- 是否有现有设计、接口、数据库。

访谈结束后，AI 应写 `requirements.md`，不要直接写代码。

## Requirements 写法

优先用可测试的句式：

```text
WHEN 用户提交无效邮箱
THE SYSTEM SHALL 在对应字段旁显示错误信息
```

好处：

- 行为清楚。
- 容易转测试。
- 容易追踪实现。
- 容易发现遗漏状态。

## Design 写法

必须回答：

- 会改哪些文件？
- 新增哪些模块？
- 数据怎么流？
- API 契约是否变化？
- 有哪些风险？
- 如何回滚？

Design 不应该写成散文。它要足够具体，让 AI 可以从中生成 tasks。

## Tasks 写法

每个 task 应该：

- 小到一次 AI pass 能完成。
- 有清楚文件范围。
- 引用 requirement。
- 有验证方式。
- 避免“实现整个系统”这类大任务。

示例：

```markdown
| ID | Task | Requirement | Files | Verification |
|---|---|---|---|---|
| T-1 | Add order state transition function | R-3 | packages/order-state-machine/* | pnpm test order-state-machine |
```

## 验证证据

AI 完成任务后必须留下证据：

```markdown
## 2026-05-28 T-1

- Command: `pnpm test order-state-machine`
- Result: pass
- Notes: covered illegal transition from CANCELED to PAID
```

如果无法验证：

```markdown
- Not run: `pnpm e2e`
- Reason: browser dependencies not installed in current environment
- Risk: checkout flow not visually verified
```

## Adversarial Review

高风险变更增加反向审查：

- Security reviewer：鉴权、输入校验、密钥、越权。
- Contract reviewer：OpenAPI、DTO、错误格式、版本。
- Test reviewer：测试是否覆盖需求和边界。
- Performance reviewer：热路径、N+1、bundle、缓存。
- Migration reviewer：数据库迁移、回滚、数据兼容。

这一步可以由同一个 agent 换成 review mindset，也可以交给 subagent。

## 推荐目录

```text
docs/
  ai-coding-workflow.md
  verification-log.md
  specs/
    checkout-flow/
      requirements.md
      design.md
      tasks.md
```

大型项目可以进一步拆：

```text
.github/
  prompts/
    security-review.prompt.md
    api-contract-review.prompt.md
    test-generation.prompt.md
```

## 反模式

- 让 AI 一次性”根据需求实现完整项目”。
- 把所有项目知识塞进 `CLAUDE.md`，导致常驻上下文过大。
- requirements、design、tasks 之间没有可追踪关系。
- AI 只说”已测试”，但不记录命令和结果。
- mock API 和真实 API 没有共同契约。
- 每次聊天都重新解释项目背景，而不是写进 docs。

---

## Feature 级 spec 走 OpenSpec

本 skill 把 feature / change 级 spec 管理交给 [OpenSpec](https://openspec.dev/)：

- **当前真相**：`openspec/specs/<domain>/spec.md`（已 archive 的状态）
- **提议变更**：`openspec/changes/<change-id>/{proposal,design,tasks}.md + specs/<domain>/spec.md` (delta)
- **生命周期**：propose → apply → archive 三阶段，CLI 自动合并 delta
- **格式约束**：requirement 用 RFC 2119（MUST/SHALL/SHOULD/MAY），scenario 用 GIVEN/WHEN/THEN

详细映射、字段、完整 brownfield 工作流见 [openspec-integration.md](./openspec-integration.md)。

下面保留一份**旧版 docs/specs/<feature>/ 的写法示例**，作为对比参考，让你看清楚为什么换到 OpenSpec：

- **旧版**：requirements / design / tasks / verification 四文件，一次性写完就停，靠 git history 追变更
- **OpenSpec 版**：specs/（持续维护的当前真相）+ changes/（迭代的提议）+ delta（显式 ADDED/MODIFIED/REMOVED/RENAMED），可在 brownfield 多轮迭代而不漂移

---

## 旧版示例（仅作对比参考）：车机扫码登录 docs/specs/qr-login/

> ⚠️ **新项目不要用本格式**，请用 OpenSpec。这里保留作历史参考。

下面是旧版 spec 包的样子。背景：车机电商需要”车机扫码 → 手机授权”的登录方式（User Story US-21）。

### docs/specs/qr-login/requirements.md

```markdown
# Requirements: 车机扫码登录

> 状态：Accepted · 日期：2026-05-28
> 上游：[PRD.md US-21](../../PRD.md) · [feature-spec.md P-12](../../feature-spec.md)
> 平级：[design.md](./design.md) · [tasks.md](./tasks.md)

## User Need

作为车主，我想用”车机扫码 → 手机授权”的方式登录，以便不用在车机大屏上输入手机号和验证码——尤其在车机键盘体验差或在行车态键盘被禁用时。

## Requirements（EARS 形式）

- R-1：WHEN 用户进入登录页且选择”扫码登录”
       THE SYSTEM SHALL 生成一个 60s 有效的二维码并显示在屏幕中央。

- R-2：WHEN 二维码生成成功
       THE SYSTEM SHALL 同时返回一个 `sessionId`，前端开始每秒轮询 `/auth/qr-login/poll`。

- R-3：WHEN 用户用手机微信扫描二维码
       THE SYSTEM SHALL 跳转到 H5 授权页（基于 `sessionId`），显示”是否允许在车机上登录”按钮。

- R-4：WHEN 用户在手机 H5 授权页点击”允许”
       THE SYSTEM SHALL 在车机端轮询接口返回 `state: confirmed`，并附带 `accessToken / refreshToken / user`。

- R-5：WHEN 用户在手机 H5 点击”拒绝”
       THE SYSTEM SHALL 在车机端轮询接口返回 `state: rejected`，车机显示”已取消”并允许重新生成二维码。

- R-6：WHEN 二维码生成后 60s 内无任何操作
       THE SYSTEM SHALL 把 sessionId 标记为 expired，车机端轮询返回 `state: expired`，显示”二维码已失效，点击刷新”。

- R-7：WHEN 用户在行车态（车速 > 5 km/h）进入需要登录的操作
       THE SYSTEM SHALL 自动跳到 `/driving` 行车态首页并内嵌登录二维码，**不弹常规登录 modal**。

- R-8：WHILE 用户处于扫码流程
       THE SYSTEM SHALL 不允许同一手机号同时存在两个 active sessionId（后开的覆盖前一个）。

## Acceptance Criteria

- [ ] AC-1：在 1920×1080 车机分辨率下，二维码尺寸 ≥ 320×320 px，居中显示
- [ ] AC-2：二维码 60s 倒计时显示在二维码下方，最后 10s 变红色提醒
- [ ] AC-3：手机扫码后，车机端**轮询响应延迟 ≤ 1.5s**
- [ ] AC-4：登录成功后自动恢复扫码前被拦截的操作（例如加购）
- [ ] AC-5：行车态下不显示登录 modal，统一走 `/driving` 内嵌二维码
- [ ] AC-6：单元测试覆盖 state machine 所有 6 个状态 + 9 条转换
- [ ] AC-7：integration test 覆盖完整登录流程（生成 → 轮询 → 授权 → token 返回）
- [ ] AC-8：e2e test 覆盖 happy path + expired + rejected 三条路径

## Non-Goals

- 不做手机端 native App 的”反向扫码”（车机扫手机）
- 不做”自动登录历史车机”（每次都要扫）
- 不做手机端的免密登录跳过
- 不做扫码后的”留在车机”长会话（仍受 access token 1h / refresh 30d 限制）

## Open Questions

| ID | 问题 | 当前假设 | Owner | 状态 |
|---|---|---|---|---|
| Q-101 | 手机端 H5 授权页是单独应用还是合并到主 H5？ | 单独路径 `/qr-auth/:sessionId`，复用主 H5 域名 | 工程 | assumed |
| Q-102 | 用户已登录其他设备时扫码，是否要 confirm？ | 不 confirm，直接接受新会话覆盖旧会话 | 产品 | assumed |
| Q-103 | 扫码次数是否限频？ | 单 IP 每分钟最多生成 5 个 sessionId | 工程 | assumed |
```

### docs/specs/qr-login/design.md

```markdown
# Design: 车机扫码登录

> 状态：Accepted · 日期：2026-05-28
> 上游：[requirements.md](./requirements.md) · 下游：[tasks.md](./tasks.md)

## Summary

整体走”短轮询 + Redis session”方案。后端用 `qr-session:{sessionId}` 在 Redis 维护扫码状态，车机端每秒轮询直到拿到 `confirmed | rejected | expired` 终态。手机授权页用同源 H5 实现，不引入额外 App。

不用 WebSocket / SSE 的理由：车机网络环境弱，HTTP 短轮询更稳；60s 寿命短，轮询开销可控（最多 60 次）。

## Files / Modules

| Path | Change |
|---|---|
| `services/api/src/modules/user/qr-login.controller.ts` | 新增 3 个 endpoint：start / poll / confirm |
| `services/api/src/modules/user/qr-login.service.ts` | 新增 session 状态机 |
| `services/api/src/modules/user/qr-login.schema.ts` | 新增 zod schemas |
| `packages/api-contracts/openapi.yaml` | 加 3 个新 endpoint |
| `apps/h5/src/pages/login/QrLoginPanel.tsx` | 新组件：二维码 + 倒计时 + 轮询 hook |
| `apps/h5/src/pages/login/QrAuthPage.tsx` | 新页面：手机授权页 `/qr-auth/:sessionId` |
| `apps/h5/src/hooks/useQrLoginPolling.ts` | 自定义 hook 封装轮询逻辑 |
| `apps/h5/src/pages/driving/DrivingHome.tsx` | 行车态下内嵌 QrLoginPanel |
| `tools/mock-server/handlers/qr-login.ts` | MSW handler 覆盖 5 个场景 |

## State Machine

```text
PENDING ──user_scan──→ SCANNED ──confirm──→ CONFIRMED  (终态)
   │                      │
   │                      └──reject──→ REJECTED       (终态)
   │
   ├──timeout(60s)───→ EXPIRED                        (终态)
   └──new_session────→ SUPERSEDED                     (被同手机号新 session 覆盖)
```

实现：`packages/qr-login-state-machine/` 或内联在 `qr-login.service.ts`（评估后选择内联，状态机简单不值得拆包）。

## Data Flow

1. 车机端点”扫码登录”
   → `POST /auth/qr-login/start`
   → 后端生成 `sessionId = ulid()`
   → 写 Redis：`SET qr-session:{sessionId} {state:'PENDING', createdAt, expiresAt} EX 60`
   → 返回 `{ qrCode: 'data:image/png;base64,...', sessionId }`
   → 车机端展示二维码 + 启动轮询

2. 车机端轮询
   → `GET /auth/qr-login/poll?sessionId=xxx` 每秒一次
   → 后端 `GET qr-session:{sessionId}` 返回当前 state
   → 终态（CONFIRMED / REJECTED / EXPIRED / SUPERSEDED）→ 车机停止轮询

3. 手机扫码
   → 二维码内容 = `https://app.example.com/qr-auth/{sessionId}?phone=auto`
   → 微信扫一扫识别 URL → 跳手机浏览器
   → 用户进 `QrAuthPage`
   → 自动检测已登录态：未登录 → 走手机号 + 验证码登录 → 完成
   → 显示”是否允许在车机上登录”

4. 手机授权
   → `POST /auth/qr-login/confirm { sessionId }` (带手机的 JWT)
   → 后端验证 phoneJWT.userId 有效
   → 写 Redis：`SET qr-session:{sessionId} {state:'CONFIRMED', accessToken, refreshToken, user}`
   → 车机端下一次轮询拿到 token

5. 车机端拿到 token
   → 写 localStorage
   → 关闭登录面板
   → 恢复被拦截操作（IP-02 登录拦截统一规则）

## API / Data Changes

新增 endpoints（按 [api-contracts.md](../../api-contracts.md) 风格补充到 §Auth 表）：

| Method | Path | Request | Response | Errors |
|---|---|---|---|---|
| POST | `/auth/qr-login/start` | — | `{ data: { qrCode, sessionId, expiresAt } }` | RATE_LIMITED |
| GET | `/auth/qr-login/poll?sessionId` | — | `{ data: { state, ...optional token } }` | VALIDATION_FAILED |
| POST | `/auth/qr-login/confirm` | `{ sessionId }` | `{ data: { ok: true } }` | AUTH_REQUIRED (phone token), VALIDATION_FAILED |

新错误码：

| code | HTTP | 说明 |
|---|---|---|
| `QR_SESSION_EXPIRED` | 410 | 二维码超时 |
| `QR_SESSION_NOT_FOUND` | 404 | sessionId 不存在 |
| `QR_SESSION_SUPERSEDED` | 409 | 被同手机号新 session 覆盖 |

数据库：**无变化**。所有 session 走 Redis（短寿命数据）。confirmed 状态下生成的 token 写 Postgres `sessions` 表（已有）。

## 错误处理

| 场景 | 行为 |
|---|---|
| 二维码生成失败（Redis 不可用） | 车机端显示”暂时无法生成，请重试” + 上报 Sentry |
| 轮询时网络断开 | useQrLoginPolling 内部重试，每 3s 一次直到恢复或超 60s |
| 手机授权页打不开（弱网） | 显示”加载中...”骨架，30s 超时显示重试 |
| 同手机号新 session 覆盖旧 session | 旧 session 的车机端轮询拿到 SUPERSEDED → 显示”已在其他车机登录，是否继续？” |

## 性能 / 安全考量

- **性能**：轮询接口必须命中 Redis，不查 DB（已设计）。预期 P99 ≤ 50ms
- **限流**：
  - `POST /auth/qr-login/start` 单 IP 5/min
  - `GET /auth/qr-login/poll` 单 IP 60/min（应对每秒轮询）
  - `POST /auth/qr-login/confirm` 单用户 3/min
- **安全**：
  - sessionId 用 ulid（不可猜测）
  - 二维码 URL 不带敏感信息
  - confirm 必须带 phone JWT 验证身份
  - CSRF：confirm 接口检查 Origin header 必须是 `app.example.com`
  - 防扫码劫持：同一 sessionId 只能 confirm 一次，第二次返回 SUPERSEDED

## Risks

| Risk | Mitigation |
|---|---|
| Redis 不可用导致登录全挂 | 配置 Redis Sentinel + 健康检查；fallback：手机号 + 验证码登录仍可用 |
| 手机端 H5 授权页域名变化 | 域名通过环境变量注入，二维码生成时动态拼 |
| 同手机号多车机并发场景未充分测试 | integration test 加并发场景；e2e test 跑两个 session 覆盖 |
| 微信扫码无法直接跳浏览器（部分版本） | 在二维码下方加文案”如未自动跳转，请手动复制链接” |

## Rollback

无 schema migration，**回滚 = 部署上一版后端 + 前端**。Redis 中残留 session 60s 自动过期，无清理成本。
```

### docs/specs/qr-login/tasks.md

```markdown
# Tasks: 车机扫码登录

> 状态：Accepted · 日期：2026-05-28
> 上游：[requirements.md](./requirements.md) · [design.md](./design.md)
> 状态值：🟡 unclaimed / 🔵 in-progress / 🟢 done / 🔴 blocked

| ID | Task | Requirement | Files | Verification | 状态 |
|---|---|---|---|---|---|
| T-1 | 后端 qr-login state machine（纯函数）+ 单元测试 | R-1, R-2, R-6, R-8, AC-6 | `services/api/src/modules/user/qr-login.machine.ts` + `.test.ts` | `pnpm --filter @jdo/api test --grep qr-login.machine` 覆盖 9 条转换全绿 | 🟢 |
| T-2 | qr-login.service.ts：Redis CRUD + 状态转换包装 | R-1, R-2, R-6, R-8 | `services/api/src/modules/user/qr-login.service.ts` + `.test.ts` | route test mock Redis 全绿 | 🟢 |
| T-3 | 3 个 controller endpoint + zod schemas | R-2, R-3, R-4, R-5 | `qr-login.controller.ts`, `qr-login.schema.ts` | `pnpm --filter @jdo/api test --grep qr-login.controller` 全绿 + Swagger UI 可见 | 🟢 |
| T-4 | OpenAPI 添加 3 个 endpoint + 错误码 | api-contracts | `packages/api-contracts/openapi.yaml` | `pnpm test:contract` 全绿 | 🟢 |
| T-5 | 限流配置（start/poll/confirm 三档） | design §性能 | `services/api/src/modules/gateway/rate-limit.ts` | integration test 超限断言 429 | 🔵 |
| T-6 | `useQrLoginPolling` hook | R-2, design §Data Flow | `apps/h5/src/hooks/useQrLoginPolling.ts` + `.test.ts` | hook 单元测试覆盖 5 个状态切换 | 🔵 |
| T-7 | `QrLoginPanel` 组件（二维码 + 倒计时 + 状态展示） | R-1, AC-1, AC-2 | `apps/h5/src/pages/login/QrLoginPanel.tsx` + `.stories.tsx` | Storybook 覆盖 5 个状态截图 + a11y 测试 | 🟡 |
| T-8 | `QrAuthPage` 手机授权页 | R-3, R-4, R-5 | `apps/h5/src/pages/login/QrAuthPage.tsx` | 在手机 viewport 跑通三按钮（允许 / 拒绝 / 取消） | 🟡 |
| T-9 | 集成到 P-12 登录页（扫码 / 手机号 tab 切换） | feature-spec P-12 | `apps/h5/src/pages/login/index.tsx` | mockups/jdo-pencil-v3 对比一致 | 🟡 |
| T-10 | 行车态内嵌 QrLoginPanel | R-7, AC-5 | `apps/h5/src/pages/driving/DrivingHome.tsx` | URL `?speed=30` 进行车态后能看到二维码 | 🟡 |
| T-11 | MSW handlers 覆盖 5 个场景 | integration-plan Phase A | `tools/mock-server/handlers/qr-login.ts` | Phase A 在 mock 下跑通 happy + expired + rejected | 🟢 |
| T-12 | integration test：完整登录流程 | AC-7 | `services/api/test/integration/qr-login.spec.ts` | Testcontainers Redis + 完整流程断言 | 🟡 |
| T-13 | e2e test：扫码登录三条路径 | AC-8 | `tools/e2e/specs/qr-login.spec.ts` | Playwright 跑 happy / expired / rejected 全绿 | 🟡 |
| T-14 | 文档：feature-spec P-12 派活看板状态更新 + INDEX Recent Activity | — | `docs/feature-spec.md`, `docs/INDEX.md` | grep 出现 `QrLogin` 和 `T-1..14` 完整链 | 🟡 |

## Implementation Order

```
T-1 (state machine 单测)
  → T-2, T-4 (service + OpenAPI 并行)
  → T-3 (controller，依赖 T-2 + T-4)
  → T-5 (限流)
  → T-11 (mock，让前端能并行)
  → T-6 (hook)
  → T-7, T-8 (UI 组件)
  → T-9, T-10 (集成到页面)
  → T-12, T-13 (integration + e2e)
  → T-14 (文档同步)
```

## Done When

- [ ] T-1 ~ T-14 全部 🟢
- [ ] verification.md 记录所有命令 + 结果
- [ ] feature-spec.md P-12 状态从 🟡 → 🟢
- [ ] INDEX.md Recent Activity 写入完工记录
- [ ] PR 描述含本 spec 的链接和验收 checklist
```

### docs/specs/qr-login/verification.md

```markdown
# Verification: 车机扫码登录

> 状态：持续追加 · 日期：2026-05-28

## 2026-05-28 T-1 State machine 单元测试

- Command: `pnpm --filter @jdo/api test --grep qr-login.machine`
- Result: ✅ pass (9 转换 + 5 非法转换抛错都覆盖)
- Output:
```
PASS  src/modules/user/qr-login.machine.test.ts
  qr-login state machine
    ✓ PENDING → user_scan → SCANNED (3ms)
    ✓ SCANNED → confirm → CONFIRMED (1ms)
    ✓ SCANNED → reject → REJECTED (1ms)
    ✓ PENDING → timeout → EXPIRED (1ms)
    ✓ PENDING → new_session → SUPERSEDED (1ms)
    ✓ CONFIRMED → anything → throws (2ms)
    ...
Tests:       14 passed, 14 total
```
- Notes: 覆盖了 design.md 中的所有 9 条合法转换 + 5 条非法转换抛错

## 2026-05-28 T-3 Controller + Swagger UI 检查

- Command: `pnpm --filter @jdo/api dev` + 浏览器打开 http://localhost:3000/docs
- Result: ✅ 3 个 endpoint 可见，schema 与 openapi.yaml 一致
- Evidence: screenshots/qr-login-swagger.png（commit a1b2c3d）
- Notes: 用 Postman 试了一遍 happy path，sessionId 在 60s 后正确返回 EXPIRED

## 2026-05-28 T-4 OpenAPI 契约校验

- Command: `pnpm test:contract`
- Result: ✅ pass
- Notes: 包括 3 个新 endpoint 和 3 个新错误码

## 2026-05-28 T-11 MSW mock

- Command: 浏览器跑 `pnpm --filter @jdo/h5 dev` + 切到 mock 模式
- Result: ✅ happy / expired / rejected 三个 tweak 都正常切换
- Notes: pending → 50% 跳 SCANNED, 30% 跳 EXPIRED, 20% 跳 REJECTED（可在 tweaks panel 调）

## 2026-05-28 T-12 Integration test（部分）

- Command: `pnpm --filter @jdo/api test:integration --grep qr-login`
- Result: ⚠️ 8/10 pass, 2 failures
- Failures:
  1. `concurrent sessions for same phone` — 偶发失败，怀疑 Redis SETNX 在测试环境有时延
  2. `confirm with expired session returns 410` — fixture 时间设置有问题，已修
- Action: T-12 改回 🔵，先修这 2 个再合并

## 未运行 / 已知缺口

- Not run yet: T-13 e2e（依赖 T-9 / T-10 UI 完成）
- Risk: 手机授权页 (T-8) 在小屏 (< 360px) 还未测试，可能换行问题
- TODO: T-12 修完两个 flaky 后重跑
```

---

## 这个示例展示了什么

1. **requirements 用 EARS**：每条 `WHEN ... THE SYSTEM SHALL ...`，可以直接转测试用例
2. **acceptance criteria 是验收 checkbox**，可贴到 PR 描述
3. **non-goals 明确排除**，防止范围爆炸
4. **design 不写”原则上”**，写具体文件、状态机、错误码、风险
5. **tasks 每条都有验证命令**——不能”做完了”，必须”跑通了”
6. **verification 真实记录**——pass/fail 都记，flaky 也记，未跑的标 risk
7. **整个 spec 是闭环的**——requirements → design → tasks → verification 反向可追溯

---

## 推荐做法：迁移到 OpenSpec

把上面的旧版 spec 改写为 OpenSpec 格式后会变成：

```text
openspec/
├── specs/
│   └── auth-login/
│       └── spec.md          # 当前真相（archive 后）
└── changes/
    └── add-qr-login/
        ├── proposal.md      # Why / What Changes / Capabilities / Impact
        ├── design.md        # Context / Goals-Non-Goals / Decisions / Risks-Trade-offs
        ├── tasks.md         # 1.x Backend / 2.x Frontend / 3.x Tests
        └── specs/
            └── auth-login/
                └── spec.md  # delta: ## ADDED / MODIFIED / REMOVED / RENAMED Requirements
```

完整 OpenSpec 版的 add-qr-login 例子（含 RFC 2119 + GIVEN/WHEN/THEN 完整 spec、proposal / design / tasks 四件套、archive 后的 `openspec/specs/auth-login/spec.md` 终态）见 [openspec-integration.md §完整工作流示例：车机电商 add-qr-login](./openspec-integration.md)。

迁移要点：

- requirements.md → 拆成 `specs/<domain>/spec.md`（当前真相）+ `changes/<id>/specs/<domain>/spec.md`（delta）
- design.md → `changes/<id>/design.md`（基本一致，加强 Architecture Decisions 表）
- tasks.md → `changes/<id>/tasks.md`（用 checkbox 而不是 status 列）
- verification.md → 改为在 PR description 和 commit message 中记录，archive 之后自动归档
