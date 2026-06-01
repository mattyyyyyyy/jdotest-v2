# 开放问题 Open Questions

> 状态：Draft · 日期：2026-06-01 · 维护者：全员（append）
> 上游：[PRD.md §关键风险](./PRD.md) · 本轮 harness 审查发现
> 规则：每条含 **问题 / 当前假设 / 影响 / 谁回答 / 何时**。解决后**不删**，改标"已解决 → 见 ADR-XXXX / spec"。

---

## 🔴 待决（影响实现正确性）

| # | 问题 | 当前假设 / 现状 | 影响 | Owner / 期限 |
|---|---|---|---|---|
| Q2 | **数据全内存、重启丢失**：`services/api/src/store.ts` 未接库 | 内存 store，接口语义同 Prisma | 演示数据不持久；多人协作易丢 | 后端 agent（consistency-plan P2#10 / ADR-0003）|
| Q11 | **`_templates/` 是 skill 的 vendored 副本，已与上游分叉**：本轮修了 `../ai-project-bootstrapper-skill` 的 hook schema / validate 命令 / 双轨措辞，但 `jdotest-v2/_templates/` 那份快照未同步（Ownership Zone 标只读不改）| 副本仍含旧错（扁平 hook schema、`validate --strict` 空跑命令）| 读 _templates 的人会拿到过期信息 | 维护者 · 从 skill repo 重新 vendoring（不手改）|
| Q10 | **OpenSpec 生命周期剩余**：✅ 首个完整环已走通（add-admin-auth propose→apply→archive，`changes/archive/2026-06-01-add-admin-auth/`）。剩：order 已实现但无 change→archive 痕迹（追溯性）；`add-admin-{catalog,order,analytics}` 仍骨架 | CLI 已装并 `validate --all --strict` 3/3 绿 | 其余域尚未走环 | 实施 agent · 逐个 `/opsx:propose` → apply → archive |
| Q12 | **消费端真实登录未做**：车主端（车机扫码 `auth-qr` / 手机验证码 `auth-login`）仍为 mock，无 `add-qr-login` change | 后端 admin-auth 的 token/scrypt 套路可复用 | 消费端登录链路缺真实实现 | 实施 agent · `/opsx:propose add-qr-login` → apply |

## 🟡 业务方需拍板（来自 PRD 关键风险）

| # | 问题 | 应对 / 当前假设 | Owner |
|---|---|---|---|
| Q5 | 支付合规：真实上线需电商 / 支付牌照 | Demo 全 mock，上线前业务方解决资质 | 业务方 |
| Q6 | 账号体系：是否接车厂账号 / 微信 / 支付宝 | 账号模块设计为可插拔登录器，方式待定 | 业务方 |
| Q7 | 物流模式：自营 vs 第三方 vs 车厂周边 | 履约模块抽象为多策略，策略后选 | 业务方 |
| Q8 | 车机适配：不同车厂 WebView 内核 / 字体 / 安全策略各异 | Demo 不解决，阶段二按目标车厂做专项 ADR | — |

## ⚪ 已知妥协（Demo 阶段接受）

| # | 问题 | 决定 |
|---|---|---|
| Q9 | 副驾 / 后排乘客无法识别身份 | Demo 统一按驾驶员降级（PRD US-30）；阶段二再议 |

## ✅ 已解决（保留指针，不删）

- 前端框架 / 后端运行时 / 数据库 / 行车态数据源 / 部署 / monorepo / UI 库 → 已收敛 **ADR-0001~0007**（Accepted）
- 信息架构（场景型 7 类）→ **ADR-0009**（Accepted，Supersedes ADR-0008）
- 后台形态 / 权限 / UI 基准 → **ADR-0010~0012**（Accepted）
- must 级规则是否强制 → 已落地 `.claude/settings.json` hooks（commit `9aa6772`）
- PRD 技术内容唯一真相归属 → 已拆分到 architecture/backend-spec/api-contracts（commit `bc3ef7e`）
- ~~Q3~~ `.env.example` 缺失 → **已补**（commit `949d6ef`，Phase B2），变量清单见 backend-spec §五
- ~~Q1~~ admin RBAC「未实施」→ **实为误诊 + 已 apply**：admin-auth（账号密码登录 + RBAC 4 角色权限点 + 操作审计 + 限流）其实已实现于 `services/api/src/admin-auth.ts` + app.ts 守卫/审计钩子，**38 route 测试**覆盖 401 越权 / 403 权限 / 审计落库 / 429 限流 / refresh。我此前 Q1 基于 consistency-plan 旧快照误判（未核代码），特此更正。2026-06-01 apply 完成 + `openspec archive`。
- ~~Q4~~ ADR-0009 七类场景 sync → **已核实一致**（2026-06-01）：v3 `data.js` 7 场景 `energy 能量补给 / care 爱车养护 / eat 一路吃喝 / trip 远行出差 / gear 车内好物 / sos 24h 救援 / select 严选好物` = ADR-0009 锁定 7 类；后端 `load-v3.ts` 同源；feature-spec / interaction-patterns 无残留 6 类老命名；ADR-0008 已 Superseded。无 drift。
