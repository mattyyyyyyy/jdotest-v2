# 任务计划 Task Plan

> 状态：Draft · 日期：2026-06-01 · 维护者：工程 agent
> 上游：[scope.md](./scope.md) · [PRD.md §起手 Coding 计划](./PRD.md)
> 下游：[design/consistency-plan.md](./design/consistency-plan.md)（数据一致性分阶段）· `openspec/changes/`（feature 级）· [feature-spec.md](./feature-spec.md)（派活看板）
> 职责：**第一阶段任务总索引**。颗粒任务在 consistency-plan / openspec changes，本文做导航 + 回溯。

---

## 一、当前落地状态（截至 2026-06-01）

> **状态表更新 2026-06-02**（claude-gap-fix 轮）：多项已从 ❌/🚧 转 ✅，下表为最新。

| 单元 | 状态 |
|---|---|
| pnpm monorepo 脚手架 | ✅ 已落地（`8f12c04`）|
| `packages/order-state-machine` | ✅ 纯函数状态机 + 20 单测（`c6608ee`）|
| `services/api` | ✅ Fastify + 全消费端/后台端点（内存 store + JSON 快照持久化）· **95 route/单元测试**|
| `packages/api-contracts` | ✅ OpenAPI 契约 + 漂移守卫测试（2026-06-02）|
| 后台管理站 | ✅ `services/api/src/admin-spa.ts` 内嵌站点 + 前后台连通（`7a5b41c`→`3c29141`）|
| `apps/android-ivi`（消费端原生安卓前端）| ✅ 21 屏 Compose 已落地（ADR-0013）· ⚠️ 构建/instrumented 测试需 Android SDK（沙箱无）|
| `apps/admin`（独立后台前端）| ⏸ **暂不建**（现内嵌 SPA 可用）；ADR-0010「独立 apps/admin」推迟，见 open-questions Q13 |
| 数据持久化 | 🟢 JSON 文件快照（ADR-0014，重启不丢，4 测试）；🔴 生产 Prisma + PG（ADR-0003）待接 |
| admin RBAC + 审计 | ✅ 已实施（`admin-auth.ts`，apply+archive，38 测试）·（旧表误标未实施，已更正）|
| CI / docker-compose | ✅ `.github/workflows/ci.yml` + `infra/docker-compose.yml`（2026-06-02）|

## 二、第一阶段任务（按来源索引）

### A. 数据一致性 / 闭环（→ consistency-plan.md，每阶段一个 OpenSpec change）

- **P0** ✅ 购物车真实数据全链路 · 消费端多屏接 API（评价/收藏/券/售后/物流，2026-06-02）· admin-auth RBAC+审计已 apply+archive
- **P1** ✅ 安全子集已落（ISO 时间戳 + 口径锁定，见 consistency-plan / data-dictionary）；破坏性存储迁移推迟
- **P2** ✅ 库存校验（add-inventory-guard）· ✅ 图片占位策略 · 🟢 持久化 JSON 快照（ADR-0014），🔴 PG 待接

### B. Feature 级 spec（→ openspec/specs/，全部已 archive）

| 域 | 状态 |
|---|---|
| 全部 18 域 | ✅ **specs 当前真相**（消费端 10 + 后台 8）；本轮把所有已实现域走完 propose→archive，无 pending change |
| order / driving-mode / admin-auth / auth-qr | ✅ 已有实现 + spec |
| 后续新行为 | 一律走 `/opsx:propose` → apply → archive |

### C. 脚手架欠账（PRD Week 0/2 未尽项）

- [x] `.github/workflows/ci.yml`：typecheck + lint + test + build + openspec validate（2026-06-02）
- [x] `.env.example`（Q3，Phase B 即补）
- [x] `infra/docker-compose.yml`（PG + Redis）（2026-06-02）
- [x] `apps/android-ivi` 骨架：原生安卓消费端（Kotlin + Jetpack Compose）（已落地，见 ADR-0013）
- [x] CI 契约检查：`packages/api-contracts/openapi.yaml` + `contract.test.ts` 漂移守卫（每个文档 path 必为已注册路由；2026-06-02）

## 三、参考：PRD 原始 Week 计划（已部分完成）

- **Week 0 脚手架**：✅ pnpm workspace / tsconfig / 部分（CI、docker-compose 未做）
- **Week 1 关键路径**：后端 catalog ✅ · 前端骨架 ❌（原型代替）· 联调 ✅（admin 站）· 加购 ✅ · 下单+mock 支付 部分
- **Week 2 完善与演示**：行车态 / 横屏断点 / 埋点 / 部署 — 多数待做

> 颗粒验收标准见 PRD §起手 Coding 计划；本文随完成项更新"当前落地状态"表。
