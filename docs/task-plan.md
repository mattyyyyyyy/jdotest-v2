# 任务计划 Task Plan

> 状态：Draft · 日期：2026-06-01 · 维护者：工程 agent
> 上游：[scope.md](./scope.md) · [PRD.md §起手 Coding 计划](./PRD.md)
> 下游：[design/consistency-plan.md](./design/consistency-plan.md)（数据一致性分阶段）· `openspec/changes/`（feature 级）· [feature-spec.md](./feature-spec.md)（派活看板）
> 职责：**第一阶段任务总索引**。颗粒任务在 consistency-plan / openspec changes，本文做导航 + 回溯。

---

## 一、当前落地状态（截至 2026-06-01）

| 单元 | 状态 |
|---|---|
| pnpm monorepo 脚手架 | ✅ 已落地（`8f12c04`）|
| `packages/order-state-machine` | ✅ 纯函数状态机 + 20 单测（`c6608ee`）|
| `services/api` 薄切片 | ✅ Fastify + 7 场景 + 商品/订单接口（内存 store）|
| 后台管理站 | ✅ `services/api/src/admin-spa.ts` 内嵌站点 + 前后台连通（`7a5b41c`→`3c29141`）|
| `apps/android-ivi`（消费端原生安卓前端）| 🚧 进行中（`apps/android-ivi`，Kotlin + Jetpack Compose）|
| `apps/admin`（独立后台前端）| ❌ 未建（现为后端内嵌 SPA）|
| 数据持久化（Prisma + PG）| ❌ 未接，内存态 |
| admin RBAC + 审计 | ❌ spec 已写，未实施 |

## 二、第一阶段任务（按来源索引）

### A. 数据一致性 / 闭环（→ consistency-plan.md，每阶段一个 OpenSpec change）

- **P0** 购物车真实数据全链路 ✅（`efc56e1`）· mall-orders 接 API（部分）· **落地 add-admin-auth（RBAC + 审计）← 未做（Q1）**
- **P1** 时间格式 ISO 统一 · ID 规范统一 · 枚举大小写统一 · 计量后缀统一
- **P2** 库存-上架-下单联动校验 · 图片策略统一 · **内存 store → Prisma + PostgreSQL（Q2）**

### B. Feature 级 spec（→ openspec/changes/，propose→apply→archive）

| change | 状态 |
|---|---|
| add-admin-auth | 🟡 4 件套完整，**待 apply**（实施 RBAC）|
| add-admin-catalog / add-admin-order / add-admin-analytics | 🟡 骨架，待 `/opsx:propose` 填充 |
| order / driving-mode | ✅ 已是 specs 当前真相（order 已有实现，但**无 change→archive 痕迹**，生命周期待补走一遍）|

### C. 脚手架欠账（PRD Week 0/2 未尽项）

- [ ] `.github/workflows/ci.yml`：lint + typecheck + test + build 四件套
- [ ] `.env.example`（Q3，Phase B 即补）
- [ ] `infra/docker-compose.yml`（PG + Redis）
- [ ] `apps/android-ivi` 骨架：原生安卓消费端（Kotlin + Jetpack Compose）
- [ ] CI 契约检查：controller 与 openapi.yaml 漂移报错

## 三、参考：PRD 原始 Week 计划（已部分完成）

- **Week 0 脚手架**：✅ pnpm workspace / tsconfig / 部分（CI、docker-compose 未做）
- **Week 1 关键路径**：后端 catalog ✅ · 前端骨架 ❌（原型代替）· 联调 ✅（admin 站）· 加购 ✅ · 下单+mock 支付 部分
- **Week 2 完善与演示**：行车态 / 横屏断点 / 埋点 / 部署 — 多数待做

> 颗粒验收标准见 PRD §起手 Coding 计划；本文随完成项更新"当前落地状态"表。
