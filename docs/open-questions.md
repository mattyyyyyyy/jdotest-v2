# 开放问题 Open Questions

> 状态：Draft · 日期：2026-06-01 · 维护者：全员（append）
> 上游：[PRD.md §关键风险](./PRD.md) · 本轮 harness 审查发现
> 规则：每条含 **问题 / 当前假设 / 影响 / 谁回答 / 何时**。解决后**不删**，改标"已解决 → 见 ADR-XXXX / spec"。

---

## 🔴 待决（影响实现正确性）

| # | 问题 | 当前假设 / 现状 | 影响 | Owner / 期限 |
|---|---|---|---|---|
| Q2 | ✅ **基本解决（2026-06-03）· 数据持久化接 SQLite 实库**：ADR-0014 由 JSON 快照升级为 **SQLite**（better-sqlite3 同步驱动，`STORE_PERSIST_PATH` 指 `.db`，事务/WAL/按行存储，重启不丢，4 持久化测试 + 95 总测试全绿）。生产 PostgreSQL（ADR-0003）仍是目标，但已是真正的数据库、切 PG 仅换数据源 | SQLite 文件即库、零服务依赖、同步接口零改动 | 演示重启不丢；高并发仍建议 PG | 切 PG 待有 DB 环境时 |
| Q11 | **`_templates/` 是 skill 的 vendored 副本，已与上游分叉**：本轮修了 `../ai-project-bootstrapper-skill` 的 hook schema / validate 命令 / 双轨措辞，但 `jdotest-v2/_templates/` 那份快照未同步（Ownership Zone 标只读不改）| 副本仍含旧错（扁平 hook schema、`validate --strict` 空跑命令）| 读 _templates 的人会拿到过期信息 | 维护者 · 从 skill repo 重新 vendoring（不手改）|
| Q10 | ✅ **已解决（2026-06-02）· OpenSpec 全域补齐**：所有已实现域均沉淀 spec——本轮回填 7 后台域（admin-catalog/order/analytics/user/marketing/content/fulfillment）+ 3 消费端域（catalog/cart/payment）共 10 个 change→archive；未实现域（auth-login/user/fulfillment）写成 forward change 留 `changes/`。`validate --all --strict` 18/18 绿 | 15 specs + 3 forward changes | spec 覆盖率达成 | — |
| Q12 | ✅ **已解决（2026-06-02）· 消费端登录两条入口齐备**：车机扫码 `auth-qr`（archive，9 测试）+ 手机号验证码 `auth-login`（**已实现 + archive**：`consumer-auth.ts` issueSmsCode/verifySmsCode + `/api/v1/auth/sms-code`/`sms-login`，TTL/频控/一次性 + 封禁拦截 + 首登建号 + 与 admin 隔离，7 测试）| 复用 auth-qr token 套路 + issueUserToken | 登录链路完整 | — |

## ⚪ 业务方待拍板（Demo 已 mock，上线前需解决）

| # | 问题 | 应对 / 当前实现 | 状态 |
|---|---|---|---|
| Q5 | 支付合规：真实上线需电商 / 支付牌照 | Demo 全 mock（`/payments/:id/confirm` 回调 + 状态机），上线前业务方解决资质 | ✅ Demo 就绪 |
| Q6 | 账号体系：是否接车厂账号 / 微信 / 支付宝 | 已实现可插拔登录器：车机扫码 `auth-qr`（propose→apply→archive，9 测试）+ admin 账号密码；方式可扩展 | ✅ Demo 就绪 |
| Q7 | 物流模式：自营 vs 第三方 vs 车厂周边 | 履约模块已实现：shipping CRUD + 轨迹节点 + 自提点管理；策略可替换 | ✅ Demo 就绪 |
| ~~Q8~~ | ~~车机适配：不同车厂 WebView 内核~~ | **已不适用**：消费端已改为原生安卓（ADR-0013），不存在 WebView 适配问题。原生端适配走 ADR-0004 Car API | ✅ 已解决（ADR-0013） |

## ⚪ 已知妥协（Demo 阶段接受）

| # | 问题 | 决定 |
|---|---|---|
| Q9 | 副驾 / 后排乘客无法识别身份 | Demo 统一按驾驶员降级（PRD US-30）；阶段二再议 |
| Q13 | **`apps/admin` 未独立建**（ADR-0010 定的独立后台前端）：现为后端内嵌 vanilla JS SPA（`admin-spa.ts`），可用但不可单测/难维护 | Demo 阶段**接受内嵌 SPA**，ADR-0010 的独立 `apps/admin` 推迟到需要独立部署/前端测试时再抽离；届时复用现有 API + design token |
| ~~Q14~~ | ✅ **基本解决（2026-06-03）· Android 测试入库**：本机 Android SDK 实际可用（之前误判）。已加 JVM 单测（`LogicUnitTest`：fmtPrice/Catalog.byScene/byId，4 例，`testDebugUnitTest` 绿）+ Compose UI 仪器测试（`PrimaryButtonTest`：渲染+点击，`connectedDebugAndroidTest` 在 emulator 通过）。修了缺失的 `testInstrumentationRunner`（原致仪器测试跑 0 个）。CI 加 `android-unit` job 跑单测；仪器测试需 emulator（CI 暂不跑） | SDK 在 `~/Library/Android/sdk`，JDK 用 AS JBR | 单测进 CI；仪器测试本地/emulator 跑 | — |
| ~~Q15~~ | ✅ **已解决（2026-06-03）· analytics 接真实埋点**：新增 `POST /api/v1/events`（pageview/driving-switch + visitorId 去重 uv），看板 pv/uv/drivingSwitches 在种子基线上真实累加并持久化（SQLite）。change `add-analytics-events` archive，spec 已更新，3 测试 | 种子基线 + 真实累加 | 已接埋点 | — |

## ✅ 已解决（保留指针，不删）

- 前端框架 / 后端运行时 / 数据库 / 行车态数据源 / 部署 / monorepo / UI 库 → 已收敛 **ADR-0001~0007**（Accepted）
- 信息架构（场景型 7 类）→ **ADR-0009**（Accepted，Supersedes ADR-0008）
- 后台形态 / 权限 / UI 基准 → **ADR-0010~0012**（Accepted）
- must 级规则是否强制 → 已落地 `.claude/settings.json` hooks（commit `9aa6772`）
- PRD 技术内容唯一真相归属 → 已拆分到 architecture/backend-spec/api-contracts（commit `bc3ef7e`）
- ~~Q3~~ `.env.example` 缺失 → **已补**（commit `949d6ef`，Phase B2），变量清单见 backend-spec §五
- ~~Q1~~ admin RBAC「未实施」→ **实为误诊 + 已 apply**：admin-auth（账号密码登录 + RBAC 4 角色权限点 + 操作审计 + 限流）其实已实现于 `services/api/src/admin-auth.ts` + app.ts 守卫/审计钩子，**38 route 测试**覆盖 401 越权 / 403 权限 / 审计落库 / 429 限流 / refresh。我此前 Q1 基于 consistency-plan 旧快照误判（未核代码），特此更正。2026-06-01 apply 完成 + `openspec archive`。
- ~~Q4~~ ADR-0009 七类场景 sync → **已核实一致**（2026-06-01）：v3 `data.js` 7 场景 `energy 能量补给 / care 爱车养护 / eat 一路吃喝 / trip 远行出差 / gear 车内好物 / sos 24h 救援 / select 严选好物` = ADR-0009 锁定 7 类；后端 `load-v3.ts` 同源；feature-spec / interaction-patterns 无残留 6 类老命名；ADR-0008 已 Superseded。无 drift。
