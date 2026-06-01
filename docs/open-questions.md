# 开放问题 Open Questions

> 状态：Draft · 日期：2026-06-01 · 维护者：全员（append）
> 上游：[PRD.md §关键风险](./PRD.md) · 本轮 harness 审查发现
> 规则：每条含 **问题 / 当前假设 / 影响 / 谁回答 / 何时**。解决后**不删**，改标"已解决 → 见 ADR-XXXX / spec"。

---

## 🔴 待决（影响实现正确性）

| # | 问题 | 当前假设 / 现状 | 影响 | Owner / 期限 |
|---|---|---|---|---|
| Q1 | **admin RBAC 未实施**：`add-admin-auth` 4 件套已写，但代码里 admin 无登录 / 无角色 / 无审计 | 暂以无鉴权 Demo 运行 | spec↔代码 drift；安全演示打折 | 实施 agent · 下个迭代（consistency-plan P0#3）|
| Q2 | **数据全内存、重启丢失**：`services/api/src/store.ts` 未接库 | 内存 store，接口语义同 Prisma | 演示数据不持久；多人协作易丢 | 后端 agent（consistency-plan P2#10 / ADR-0003）|
| Q10 | **OpenSpec 生命周期未跑通**：`changes/archive/` 空；order 已实现但无 change→archive 痕迹；`add-admin-{catalog,order,analytics}` 仍骨架（仅 README + .openspec.yaml）| 阻塞于①本机无 node/npm 装不了 openspec CLI ②feature 未实施 | propose→apply→archive 形同虚设 | 实施 agent · 装 CLI 后逐个 `/opsx:propose` → apply → `openspec archive` |

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
- ~~Q4~~ ADR-0009 七类场景 sync → **已核实一致**（2026-06-01）：v3 `data.js` 7 场景 `energy 能量补给 / care 爱车养护 / eat 一路吃喝 / trip 远行出差 / gear 车内好物 / sos 24h 救援 / select 严选好物` = ADR-0009 锁定 7 类；后端 `load-v3.ts` 同源；feature-spec / interaction-patterns 无残留 6 类老命名；ADR-0008 已 Superseded。无 drift。
