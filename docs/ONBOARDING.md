# 上手与开发流程 Onboarding & Dev Workflow

> 状态：Draft · 日期：2026-06-03 · 维护者：全员
> 用途：**新人 / 新 agent 第一份要读的导览**。回答三个问题——这项目怎么搭起来的（开发顺序）、要接手/介绍该读哪些文档、一条 feature 从想法到上线怎么走。
> 上游：协作铁律见 [`CLAUDE.md`](../CLAUDE.md)，文档总目录见 [`INDEX.md`](./INDEX.md)。本文只做"导览 + 流程"，不重复各文档主体。

---

## 0. 一句话项目

**车机端通用全品类电商平台**：三端共用一个后端。
- **消费端** = 原生安卓 App（Kotlin + Jetpack Compose，横屏车机/平板，行车态降级）— [ADR-0013](./decisions/ADR-0013-consumer-native-android.md)
- **后台端** = 桌面 Web 运营管理（商品/订单/用户/营销/履约/内容/看板）
- **后端** = 单体 Fastify + zod（TS），SQLite 持久化 — [ADR-0002](./decisions/ADR-0002-backend-runtime.md) / [ADR-0014](./decisions/ADR-0014-store-json-snapshot-persistence.md)

UI 基准：消费端沿用 `mockups/jdo-pencil-v3`（不重画）；后台复用同一套设计 token。

---

## 1. 仓库结构（30 秒地图）

```
jdotest-v2/
├── CLAUDE.md / AGENTS.md      # 协作公约（Claude 用 CLAUDE.md+.claude/，Codex 用 AGENTS.md+.codex/）
├── docs/                      # 项目级文档唯一真相（本文 / PRD / architecture / ADR / design …）
│   └── INDEX.md               # ⭐ 文档总目录 + Active Workstreams + Ownership Zones
├── openspec/                  # Feature 级 spec（specs/ 当前真相 + changes/ 提议变更）
├── services/api/              # @jdo/api — Fastify 后端（唯一后端，三端共用）
│   └── src/
│       ├── app.ts             #   路由总装 + 内嵌 admin-ui SPA
│       ├── store.ts           #   领域数据 + SQLite 持久化
│       └── *.test.ts          #   后端测试（路由 inject / 契约 / 持久化）
├── apps/
│   ├── admin/                 # @jdo/admin — 独立 React 后台（Vite，ADR-0010）
│   └── android-ivi/           # 消费端原生安卓（Kotlin + Compose）
├── packages/
│   ├── order-state-machine/   # @jdo/order-state-machine — 纯函数订单状态机（前后端共用）
│   └── api-contracts/         # @jdo/api-contracts — openapi.yaml 契约
├── mockups/jdo-pencil-v3/     # 消费端 UI 视觉基准（21 屏 React 原型，不重画）
├── tools/                     # CI 护栏脚本（check-dead-ui.sh …）
└── infra/                     # docker-compose（PG/Redis，本地可选）
```

技术栈细节见 [`architecture.md`](./architecture.md)；14 个 ADR 在 [`docs/decisions/`](./decisions/)。

---

## 2. 怎么跑起来（5 分钟）

前置：Node 20 + pnpm；安卓需 JDK 17+ + Android SDK + 一个 AVD。

```bash
# 一次性
pnpm install

# 后端（必跑，三端都依赖它，:3000）
pnpm --filter @jdo/api dev          # tsx watch 热更新

# 后台 · 二选一
#   A) 内嵌后台（功能最全，推荐演示）   → http://localhost:3000/admin-ui
#   B) 独立 React 后台（骨架，同步同一后端）
pnpm --filter @jdo/admin dev        # → http://localhost:5173（/api 代理到 3000）

# 消费端（原生安卓）
cd apps/android-ivi
JAVA_HOME=<jdk17> ANDROID_HOME=<sdk> ./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.jdo.ivi/.MainActivity
#   安卓经 10.0.2.2:3000 连宿主机后端；进 App 后点底部橙色「JD」进商城

# 看消费端视觉基准原型（纯静态）
npx serve mockups/jdo-pencil-v3 -p 8080
```

登录：后台 `admin` / `admin123`。后台改数据 → 写后端 store → 安卓退回上一级再进对应页即同步。

---

## 3. 开发顺序（这项目是怎么一步步搭起来的）

> 不是凭空的"应该怎么开发"，而是本仓库**真实走过的顺序**（详见 [INDEX.md §Recent Activity](./INDEX.md) 倒序全量）。给接手者看清楚每层依赖谁。

| # | 阶段 | 做了什么 | 产物 |
|---|---|---|---|
| 1 | **脚手架 + 流程奠基** | pnpm monorepo + turbo + tsconfig；引入 OpenSpec 原生流程 | `claude-bootstrap-v2` |
| 2 | **UI 基准确立** | 导入 v1→v2→v3 原型，定 V3 为消费端主前端（不重画）；场景型 IA（7 类）定案 | ADR-0008/0009，`mockups/jdo-pencil-v3` |
| 3 | **首个纵向切片** | 先做最小可运行链路：订单状态机（纯函数 + 20 单测）+ Fastify 薄后端 | `@jdo/order-state-machine`、`@jdo/api` |
| 4 | **后台整站 + 前后台闭环** | admin SPA 全模块 + 双向数据同步 + 货币统一为「分」+ 数据字典 | `admin-spa.ts` |
| 5 | **Harness 强制层 + 文档唯一真相** | 落 5 个 `.claude` hook（exit 2）；PRD 拆 architecture/backend-spec/api-contracts；INDEX 去孤儿 | `.claude/`、三件套文档 |
| 6 | **鉴权 + OpenSpec 生命周期跑通** | 后台账密登录 + RBAC + 审计；车机扫码登录；首次 propose→apply→archive | `admin-auth`/`auth-qr` spec |
| 7 | **OpenSpec 全域补齐** | 把"代码先行、spec 缺失"的反向漂移补回——18 域全覆盖 | `openspec/specs/*`（18） |
| 8 | **消费端原生安卓落地** | 从 WebView 方案改纯 Compose 逐屏还原 + 接真实后端 | ADR-0013，`apps/android-ivi` |
| 9 | **系统性补欠缺（硬伤+工程）** | 持久化（SQLite 实库）+ 库存校验 + 消费端砍 mock 接 API；CI 四件套 + docker-compose + openapi 契约守卫 | ADR-0014，`.github/workflows/ci.yml` |
| 10 | **全站 QA + 护栏** | 6 域前后台打通脚本化验证；逐按钮点测；落 3 道 CI 护栏（死按钮 / 打通契约 / 同步测试） | `tools/check-dead-ui.sh`、`testing-strategy.md` |
| 11 | **视觉/交互打磨**（持续） | 页面比例、按钮尺寸、布局溢出等逐项实测修 | `claude-ui-aesthetic` 系列 |

**依赖主线**：流程/UI 基准（1-2）→ 后端核心（3）→ 后台闭环（4）→ 护栏与规范（5）→ 鉴权与 spec 完整（6-7）→ 消费端（8）→ 工程化与质量（9-11）。

---

## 4. 标准 feature 开发流程（从今往后每条都这么走）

> 这是**单条 feature/change 的闭环**，区别于上面的"项目历史顺序"。must 级规则由 hook 强制，绕不过。

```
① 开工三件套（编辑任何文件前 MUST）
   Read CLAUDE.md → Read docs/INDEX.md → 在 INDEX §Active Workstreams append 一行登记
   （未登记 → check-workstream-registered.sh 用 exit 2 拒绝编辑）

② 改 feature 行为？→ 先走 OpenSpec
   /opsx:propose <change-id>（或 openspec new change <id>）
   产出 4 件套：proposal / design / tasks / delta spec（GIVEN-WHEN-THEN 场景）

③ 实现（apply）= TDD 红-绿-重构（测试先行，见 CLAUDE.md §测试驱动开发）
   🔴 RED      把第②步的每个 #### Scenario 翻成失败测试 → 跑，确认它红
              （后端路由 inject / 状态机单测 / 安卓仪器测试 / admin 组件测试）
   🟢 GREEN    写最小实现让测试变绿（不多写）
   ♻️ REFACTOR 在绿的保护下重构，保持全绿
   ⚠️ 禁止"先写完代码再补测试"；修 bug 也先写复现失败测试再修

④ 本地验证（"全绿"的准确含义见 testing-strategy.md，别只跑后端就说没问题）
   pnpm typecheck && pnpm test && pnpm build
   bash tools/check-dead-ui.sh                 # 消费端死按钮护栏
   openspec validate --all --strict            # spec 校验（必须带 --all）
   ./gradlew :app:assembleDebug                # 动了安卓就编 + emulator 实测

⑤ 提交（commit message 末尾 MUST 带 agent 尾标）
   git commit -m "... \n\n agent: claude-<short-context>"
   （缺尾标 → check-agent-tag.sh exit 2 拒绝）

⑥ 归档 + 收尾
   openspec archive <change-id> --yes          # delta 合并进 specs/
   把 INDEX 那行从 Active Workstreams 移到 Recent Activity（附 commit）

⑦ 推送
   git push
```

何时必须写文档、写到哪，见 [CLAUDE.md §何时必须写文档](../CLAUDE.md)。口诀：**3 天后还有人需要知道的，就必须落库**。

---

## 5. 介绍给别人 / 接手该读哪些文档（按角色）

> 不要让人从头读 88 行 INDEX。按下面**这条最短路径**走。

### 🟢 任何人（10 分钟，先建立全局观）
1. **本文 `ONBOARDING.md`** — 你正在读
2. [`CLAUDE.md`](../CLAUDE.md) — 协作铁律（hook / OpenSpec / commit 规范）
3. [`docs/INDEX.md`](./INDEX.md) §入口文档 — 文档总目录，知道有什么、在哪

### 🔵 产品 / 业务（想知道做什么）
4. [`PRD.md`](./PRD.md) — 产品需求（意图，不含实现细节）
5. [`scope.md`](./scope.md) — MVP 范围边界
6. [`feature-spec.md`](./feature-spec.md) — 派活看板 + 路由→domain 映射

### 🟠 工程 / 后端（想知道怎么实现）
7. [`architecture.md`](./architecture.md) — 系统架构唯一真相
8. [`backend-spec.md`](./backend-spec.md) — 数据模型 / 鉴权 / 端口 / 环境变量
9. [`api-contracts.md`](./api-contracts.md) + [`openapi.yaml`](../packages/api-contracts/openapi.yaml) — API 契约
10. [`openspec/specs/<domain>/spec.md`](../openspec/) — 具体某域的当前行为真相（18 域）
11. [`testing-strategy.md`](./testing-strategy.md) — 每层测什么、"全绿"边界、护栏

### 🟣 设计 / 前端（想知道长什么样）
12. [`design/design-system.md`](./design/design-system.md) — token / 组件单一真相
13. [`design/page-spec.md`](./design/page-spec.md) + [`design/data-dictionary.md`](./design/data-dictionary.md) — 视觉布局 + 字段对齐
14. `mockups/jdo-pencil-v3/` — 消费端视觉基准原型（跑起来看）

### ⚫ 决策背景（想知道为什么这么定）
15. [`docs/decisions/`](./decisions/) — 14 个 ADR（技术/产品决策，Accepted/Superseded 链）
16. [`open-questions.md`](./open-questions.md) — 仍未拍板 / 已知 drift

> **给一个完全的新人，就发这一句**：先读 `docs/ONBOARDING.md`，按里面 §5 的角色路径读，再按 §2 把三端跑起来。

---

## 6. 当前已知缺口（接手前先知道）

详见 [`testing-strategy.md`](./testing-strategy.md) §待补 与 [`open-questions.md`](./open-questions.md)。重点（AI-coding 角度）：
- **`pnpm lint` 是空壳**：无任何包定义 lint task，也无 ESLint/Prettier → CI 的 Lint 步骤当前空转。
- **无覆盖率度量**：vitest 没开 coverage，无门槛；`apps/admin` 零测试。
- **前端↔契约 漂移无护栏**：契约测试只守 openapi↔后端路由；安卓/admin 手写 fetch+解析那侧没护栏（banner 没接、假字段这类坑的根源）。
- **Android 仪器测试不进 CI**（需 emulator）：UI↔后端接缝靠人工 emulator 验证。
- **Android 无 detekt/ktlint**；TS 无 knip/ts-prune 死代码检测。

---

## 7. 速查

| 我想… | 去哪 |
|---|---|
| 知道现在谁在改什么 | [INDEX §Active Workstreams](./INDEX.md) |
| 知道某文件归谁管 | [INDEX §Ownership Zones](./INDEX.md) |
| 加/改一个 feature | 本文 §4 + `/opsx:propose` |
| 查某域当前行为 | `openspec/specs/<domain>/spec.md` |
| 查某 API 字段 | `api-contracts.md` → `openapi.yaml` → `app.ts` |
| 知道"测试全绿"覆盖了啥 | [testing-strategy.md](./testing-strategy.md) |
| 知道某决策为什么这么定 | `docs/decisions/ADR-*.md` |
