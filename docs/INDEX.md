# 文档索引 INDEX

> 本仓库所有结论性文档的目录。每次新增 / 修改 / 废弃文档都必须同步更新这里。
> 协作铁律见根目录 [`CLAUDE.md`](../CLAUDE.md)。
>
> 🤝 **多 agent 协作仪表盘**：以下 Active Workstreams 与 Ownership Zones 两张表是
> **append-only 协作区**（详见 [CLAUDE.md §多 agent 协作公约](../CLAUDE.md)）。
> 任何 agent 开工前必须在 Active Workstreams append 一行登记自己的工作。

---

## 🚦 Active Workstreams（实时态 · append-only）

> 任何 agent **开工前**必须在此 append 一行登记。完工后把行移到 Recent Activity。
> 格式：`agent-id | 工作范围 | 起始 | 涉及文件（glob）`

| Agent | 工作范围 | 起始 | 涉及文件 | 状态 |
|---|---|---|---|---|
| claude-harness-reconcile | Q12 车主登录：propose→apply→archive `add-qr-login`（车机扫码登录会话 + 手机确认下发车主 JWT + Demo mock-login，复用鉴权基建）| 2026-06-01 | `openspec/changes/add-qr-login/**`, `services/api/src/consumer-auth.ts`, `services/api/src/app.ts`, `services/api/src/app.test.ts`, `openspec/specs/auth-qr/**` | 🔵 in-progress |

## 🗺 Ownership Zones（目录分工建议）

> 不强制锁定，但改文件前先看是否在别人 zone 里。
> 别人 zone → coordinate；自己 zone → 直接干；无人 zone → 直接干。

| Zone (路径) | 默认所有者 | 说明 |
|---|---|---|
| `docs/decisions/ADR-*.md` | 提案 agent | ADR 一旦 Accepted 不再随便改，要改用 Superseded 流程 |
| `docs/design/design-system.md` | UI agent | 设计 token 单一真相 |
| `docs/design/page-spec.md` | UI agent | 视觉布局权威源 |
| `docs/design/interaction-patterns.md` | UX agent | 交互模式 / 状态矩阵 / 决策树 |
| `docs/feature-spec.md` | 工程 agent | 路由 / 接口 / 状态机权威源，**改前必须在 Active Workstreams 登记** |
| `docs/architecture.md` | 架构 agent | 系统形态 / 模块边界 / 目录结构 / 流程合约单一真相 |
| `docs/backend-spec.md` | 后端 agent | 数据模型 / 鉴权 / 端口 / 环境变量单一真相，**改 schema 先改这里** |
| `docs/api-contracts.md` | 后端+前端 agent | API 契约单一真相，**改字段先改这里，前后端同步** |
| `docs/PRD.md` | 产品 agent | 升版本前必须在 Active Workstreams 登记；只放产品意图，技术细节链到 architecture/backend-spec/api-contracts |
| `docs/research/` | 调研 agent | 调研先来这里检索，避免重复 |
| `mockups/jdo-pencil-v3/**` | UI agent | **项目主前端**（2026-05-27 确立），后续迭代 / 部署均基于此 |
| `mockups/jdo-pencil/` `mockups/jdo-pencil-v2/` | — | **已归档**，不再维护，仅供参考 |
| `mockups/*.html`（根目录） | — | **已归档**，V3 替代，不再维护 |
| `mockups/styles/tokens.css`（根目录） | — | **已归档**，以 V3 的 `styles/tokens.css` 为准 |
| **`docs/INDEX.md`** | **全员 append-only** | 任何 agent 都可在 Workstreams / Activity 加行，不可改/删别人的 |
| **`CLAUDE.md`** | **全员协商** | 改公约前必须在 Active Workstreams 登记并征询其它在线 agent |
| `apps/h5/**` `services/api/**` `packages/**` | 实施 agent | 待落地，按 ADR-0006 monorepo 结构 |
| `apps/admin/**` | admin 实施 agent | **后台管理前端**（桌面 Web，per ADR-0010）· 待落地 |
| `services/api/**/admin*` `/api/v1/admin/*` | admin 实施 agent | 后台后端命名空间，复用同一 monolith |
| `openspec/specs/**` | 全员（只读）| **不直接编辑**，改 spec 走 change → archive |
| `openspec/changes/<id>/**` | 该 change 的 propose agent | 一个 change 一个 owner，4 件套填满后 apply |
| `_templates/**` | — | bootstrapper 模板，只读参考，不改 |

## 📋 Recent Activity（最近完成 · 倒序）

> Workstreams 完工后移到这里。最近 10 条保留，更早按月归档。

| 日期 | Agent | 完成项 | 关键 commit |
|---|---|---|---|
| 2026-06-01 | claude-harness-reconcile | **实现后台登录功能 + 跑通首个 OpenSpec 生命周期**：apply `add-admin-auth`（admin 账号密码登录 + RBAC 4 角色权限点守卫 + 操作审计 + 5/min 限流；scrypt/HS256/内存 store 适配）→ 38 route 测试（401 越权 / 403 客服改价 / 审计落库 / 429 / refresh）→ 修 5 处 typecheck 严格错 → `openspec archive` 合并 delta 到 `specs/admin-auth/`（propose→apply→archive 首次走完，解 Q10 核心）。更正误诊的 Q1 | `7409a35` + archive |
| 2026-06-01 | claude-harness-reconcile | **Harness 强制层 + 文档唯一真相整改**（用 ai-project-bootstrapper skill 反向优化 v2）：① 落地 `.claude` 5 个 hook（开工三件套 / 密钥扫描 / commit 自报家门 / 防孤儿 / openspec 校验，`exit 2` 实测通过，会话中真实拦截过 Write）② INDEX 同步（孤儿 6→0、回填真实 commit、补登 admin/demo 两条遗漏）③ 拆 PRD §Implementation Decisions → architecture/backend-spec/api-contracts（566→352 行，留指针）④ 补 constraints / open-questions / task-plan ⑤ 补 Observability 层（.env.example / PR 模板 / CONTRIBUTING / CODEOWNERS）⑥ P2：核实 ADR-0009 七类 sync 一致（关 Q4）+ 如实登记 OpenSpec 生命周期阻塞（Q10）；反向修 bootstrapper-skill 3 项（hook schema 错 / docs｜openspec 双轨 / dogfooding 诚实化，skill repo `ba58c69`）⑦ 本机装 Node20 + openspec CLI（`~/.local/node20`）跑通 `validate --all --strict`（3/3 绿）；真跑又抓出 hook 与文档的 `validate --strict` **空跑 bug**（缺 `--all`），修 hook（+PATH 自定位）+ CLAUDE/constraints + skill（`bf78049`）；登记 Q11（_templates 副本待重新 vendoring）| `9aa6772` `bc3ef7e` `8443224` `949d6ef` `0c0279a` `+本次` |
| 2026-05-29 | claude-admin-impl | **后台管理整站 + 前后台闭环 + 口径统一 + QA**：完整 admin SPA（登录占位 / 商品 / 订单 / 用户 / 营销 / 履约 / 内容 / 看板）· V3↔后台双向数据同步 · 货币统一为「分」· 字段中文化 + 数据字典 · 新增商品默认上架并进电商 · 购物车接真实数据全链路 · 商品图片上传（data URI/URL）· Claude Design 深色后台设计稿落地 + 内容区铺满宽屏 · QA 修复（立即购买 / 删除级联 / 分类占用拦截）· 配套 `consistency-plan` + `admin-benchmark` 调研 | `7a5b41c`→`3c29141` |
| 2026-05-29 | claude-demo-sync | 前后台数据同步可视化演示（首个连通 demo）| `6f28441` |
| 2026-05-29 | claude-impl-slice1 | **首个可运行纵向切片落地**：pnpm monorepo 脚手架（package.json/pnpm-workspace/tsconfig.base/turbo/.npmrc）+ `packages/order-state-machine`（纯函数状态机，对应 openspec/specs/order，**20 单测全绿**）+ `services/api` 薄切片（Fastify + 7 场景分类 + 商品接口 + 复用状态机的 /orders/transition，**8 route 测试全绿** + 服务器实启 curl 通过）。typecheck 3/3 绿。**符合 PRD「首个 PR = 测试脚手架 + OrderStateMachine 示范」** | `c6608ee` |
| 2026-05-29 | claude-bootstrap-v2 | **JDOTEST v2 重做开工**：用 ai-project-bootstrapper 模板重组（`_templates/`）；新增后台管理整端（PRD v0.5 §I US-40~58 + `scope.md` + ADR-0010~0012）；消费端 UI 沿用 v3（不重画）；引入 OpenSpec 原生流程（`openspec/specs/{driving-mode,order}` 当前真相 + `changes/add-admin-*` 首批 proposal，`add-admin-auth` 4 件套完整且 `validate --strict` 通过） | `8f12c04` |
| 2026-05-27 | claude-main | **V3 确立为项目主前端**：`mockups/jdo-pencil-v3/` 为后续迭代/部署唯一版本；V1/V2 及根目录 `mockups/*.html` 标记为已归档；后续计划迁移到 `apps/h5`（Vite+TS） | 随 `8f12c04` 导入 |
| 2026-05-27 | claude-adr-0009 | **ADR-0009 Accepted** 锁定 7 类场景（能量补给 / 爱车养护 / 一路吃喝 / 远行出差 / 车内好物 / 24h 救援 / 严选好物），以 V3 mockup 为准。**ADR-0008 → Superseded**。同步 [research/ia-scene-vs-category.md](./research/ia-scene-vs-category.md) §附录 + [research/competitor-analysis.md](./research/competitor-analysis.md) 引用 | 随 `8f12c04` 导入 |
| 2026-05-27 | claude-pencil-import-v3 | **导入 v3 原型**：21 屏（与 v2 同骨架），mall-home 大改版（顶部 banner + 下方 rail+产品分栏 / 去掉"查看全部"按钮）· 同步 wallpaper-path fix · 落到 `mockups/jdo-pencil-v3/`（**保留 v1/v2**） | 随 `8f12c04` 导入 |
| 2026-05-27 | claude-pencil-import-v2 | **导入 v2 原型**：21 屏全功能 React 原型（IVI + 商城 20 屏，含 ADR-0008 场景型 IA 落地 + 暗夜极光车型壁纸 + 行车态降级演示）· 落到 `mockups/jdo-pencil-v2/`（**保留 v1**）· 修复 bundle 的 wallpaper 相对路径 bug | 随 `8f12c04` 导入 |
| 2026-05-27 | claude-ia-scene-first | **场景型 IA 三件套**：①竞品报告追加车机商店 v0.2.0 观察 ②`research/ia-scene-vs-category.md` 新增 ③`ADR-0008-ia-scene-first` 决议为场景型 IA（Accepted） | 随 `8f12c04` 导入 |
| 2026-05-27 | claude-pencil-import | 从 Claude Design 导出包导入 `JDO 车机电商.html` 原型（IVI 首页 + 商城 6 屏 React + 2560×1600 画布） · 落到 `mockups/jdo-pencil/` | 随 `8f12c04` 导入 |

---

## 📌 入口文档（必读）

- [CLAUDE.md](../CLAUDE.md) — 项目协作公约 v3（Harness 5 层 + OpenSpec 原生 + admin 域）· Accepted · 2026-05-29
- [docs/PRD.md](./PRD.md) — 产品需求文档 **v0.6（§Implementation Decisions 按唯一真相拆分到 architecture/backend-spec/api-contracts）** · Draft · 2026-06-01
- [docs/architecture.md](./architecture.md) · [docs/backend-spec.md](./backend-spec.md) · [docs/api-contracts.md](./api-contracts.md) — **实现细节三件套（唯一真相）** · Draft · 2026-06-01
- [docs/scope.md](./scope.md) — **MVP 范围（admin 已入范围）** · Draft · 2026-05-29
- [docs/constraints.md](./constraints.md) — **约束唯一真相**（must/should/optional/out × 驾驶安全 / 车机适配 / 业务 / 性能 / 工程协作）· Draft · 2026-06-01
- [docs/task-plan.md](./task-plan.md) — **第一阶段任务总索引**（当前落地状态 + 指向 consistency-plan / openspec changes）· Draft · 2026-06-01
- [docs/open-questions.md](./open-questions.md) — **开放问题**（RBAC 未实施 / 持久化 / ADR-0009 sync 等 drift + 业务待拍板 + 已解决指针）· Draft · 2026-06-01
- [mockups/jdo-pencil-v3/JDO 车机电商.html](../mockups/jdo-pencil-v3/JDO%20%E8%BD%A6%E6%9C%BA%E7%94%B5%E5%95%86.html) — **消费端主前端 · 21 屏 React 原型（V3，不重画）**· 需 HTTP server（`npx serve mockups/jdo-pencil-v3 -p 3000`）
- [docs/feature-spec.md](./feature-spec.md) — **派活看板 + 路由→domain 映射**（消费端 P-01~13 + **后台 A-01~14**）· Draft · 2026-05-29
- [openspec/](../openspec/) — **Feature 级 spec（OpenSpec 原生）**：`specs/` 当前真相 + `changes/` 提议变更
- [_templates/](../_templates/) — 本项目用的 ai-project-bootstrapper 模板（references + SKILL 方法论）

## 📐 架构设计 architecture/

> 系统级架构说明、技术栈总览。**唯一真相分工**：产品意图在 PRD，实现细节在下表三文档。

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [architecture.md](./architecture.md) | **系统架构唯一真相** · 系统形态 + 前端深模块 + 后端模块 + 横切 + 模块间流程合约 + 仓库目录结构 + 技术决策→ADR 映射（迁移自 PRD §Implementation Decisions）| Draft | 2026-06-01 |
| [backend-spec.md](./backend-spec.md) | **后端规格唯一真相** · 数据模型核心实体 + 鉴权（JWT / 车机扫码 / admin RBAC）+ 端口约定 + 环境变量分层 + 持久化现状（改 schema 先改这里）| Draft | 2026-06-01 |
| [api-contracts.md](./api-contracts.md) | **API 契约唯一真相** · REST 协议 + 错误格式 + 版本 + 分页 + 共享代码契约 + 联调三阶段（改 API 字段先改这里）| Draft | 2026-06-01 |

## 🎨 设计 design/

> UI / UX 设计规范、页面视觉布局、设计 token、设计系统。

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [design-system.md](./design/design-system.md) | **设计系统 v1.0 · 系统级 token 与组件契约的单一真相**（颜色 / 字号 / 间距 / 动效 / 行车态降级 / 横屏适配） | Draft | 2026-05-26 |
| [interaction-patterns.md](./design/interaction-patterns.md) | **跨页面交互中间层** · 9 套交互模式（再买/登录拦截/地址/支付/购物车同步/搜索/通知/错误恢复/行车态切换）+ 8 维状态矩阵（页面×行车×在线×登录）+ 6 棵决策树 | Draft | 2026-05-26 |
| [page-spec.md](./design/page-spec.md) | **UI 视觉层权威源** · 设计调性 + 12 页区块布局（含行车态首页 + 地址簿）+ mock 字段 + 首批 5 页建议 · 路由已与 feature-spec 对齐 | Draft | 2026-05-26 |
| [admin-spec.md](./design/admin-spec.md) | **后台管理站设计** · admin IA / 页面 / 字段映射（依据消费端 V3 数据模型 + ADR-0010~0012）| Draft | 2026-05-29 |
| [admin-design-brief.md](./design/admin-design-brief.md) | **后台 UI 设计 Brief（自包含任务书）** · 内联模块/页面/字段/布局/视觉/组件，汇总 admin-spec + admin-benchmark + data-dictionary + ADR-0010~12 + design-system，供 Claude Design 生成界面 | Draft | 2026-05-29 |
| [data-dictionary.md](./design/data-dictionary.md) | **数据字典** · 前端界面字段 ↔ 后台数据字段对齐（命名 / 类型 / 单位 / 取值），前后台字段单一真相 | Draft | 2026-05-29 |
| [consistency-plan.md](./design/consistency-plan.md) | **前后台一致性统一计划** · 已统一项 + P0~P2 待统一清单（购物车真实数据 / 鉴权 / 时间 ID 枚举口径 / 持久化）+ 分阶段计划（每阶段一个 OpenSpec change）| Draft | 2026-05-29 |
| [claude-design-jdo-admin/](./design/claude-design-jdo-admin/_BUNDLE-README.md) | Claude Design 后台设计稿**导出包**（HTML/CSS/JS handoff bundle）· 已被 `services/api/src/admin-spa.ts` 落地实现 | Reference | 2026-05-29 |

## 🖥 项目主前端 mockups/jdo-pencil-v3/（⭐ 当前）

> **2026-05-27 确立为项目主前端**，后续迭代与部署均基于此。根目录 `mockups/*.html` 和 V1/V2 已归档。

### 已归档原型 mockups/（根目录，2026-05-27 归档）

> 以下静态 HTML 原型已被 V3 替代，不再维护，仅供参考。

| 文件 | 用途 | 归档前最后更新 |
|---|---|---|
| [index.html](../mockups/index.html) | 总览导航 · 11 屏缩略图 + 跳文档 | 2026-05-26 |
| [home.html](../mockups/home.html) | 首页（停车态） | 2026-05-26 |
| [category.html](../mockups/category.html) | 分类页 | 2026-05-26 |
| [search.html](../mockups/search.html) | 搜索 | 2026-05-26 |
| [product-detail.html](../mockups/product-detail.html) | 商品详情 | 2026-05-26 |
| [cart.html](../mockups/cart.html) | 购物车 | 2026-05-26 |
| [checkout.html](../mockups/checkout.html) | 结算 | 2026-05-26 |
| [payment.html](../mockups/payment.html) | 支付 | 2026-05-26 |
| [order-detail.html](../mockups/order-detail.html) | 订单详情 | 2026-05-26 |
| [profile.html](../mockups/profile.html) | 个人中心 | 2026-05-26 |
| [login.html](../mockups/login.html) | 车机扫码登录 | 2026-05-26 |
| [driving-home.html](../mockups/driving-home.html) | 行车态首页 | 2026-05-26 |

### 项目主前端 mockups/jdo-pencil-v3/

> **已归档（2026-05-27），不再维护。项目主前端已切换到 v3。**
> 原从 [api.anthropic.com/v1/design/h/LLdP3lnOvyk1SaotL2mf0g](https://api.anthropic.com/v1/design/h/LLdP3lnOvyk1SaotL2mf0g) 导入。6 屏雏形版本，仅供参考。

| 文件 | 用途 | 最后更新 |
|---|---|---|
| [JDO 车机电商.html](../mockups/jdo-pencil/JDO%20%E8%BD%A6%E6%9C%BA%E7%94%B5%E5%95%86.html) | 入口 HTML · 2560×1600 画布 · Babel 现编 JSX | 2026-05-27 |
| [app.jsx](../mockups/jdo-pencil/app.jsx) | 路由 + Tweaks panel（深 / 浅 + 3/4/5 列 + 6 屏切换） | 2026-05-27 |
| [components.jsx](../mockups/jdo-pencil/components.jsx) | Icon / StatusBar / Dock / ProductCard | 2026-05-27 |
| [data.js](../mockups/jdo-pencil/data.js) | 12 分类 + 30 商品 + 2 banner（Unsplash 真图） | 2026-05-27 |
| [tweaks-panel.jsx](../mockups/jdo-pencil/tweaks-panel.jsx) | 浮窗 tweaks 控件库（来自 Claude Design starter） | 2026-05-27 |
| [screens/ivi-home.jsx](../mockups/jdo-pencil/screens/ivi-home.jsx) | 01 · 车机首页（状态栏 + 车型占位 + 4 张玻璃卡 + Dock） | 2026-05-27 |
| [screens/mall-home.jsx](../mockups/jdo-pencil/screens/mall-home.jsx) | 02 · 商城首页（侧栏 12 类 + 秒杀 hero + 24 件推荐） | 2026-05-27 |
| [screens/mall-category.jsx](../mockups/jdo-pencil/screens/mall-category.jsx) | 03 · 分类 / 搜索（chips + 排序条 + 商品网格） | 2026-05-27 |
| [screens/mall-detail.jsx](../mockups/jdo-pencil/screens/mall-detail.jsx) | 04 · 商品详情（左图右规格 + 自提区 + 双 CTA） | 2026-05-27 |
| [screens/mall-cart.jsx](../mockups/jdo-pencil/screens/mall-cart.jsx) | 05 · 购物车（多选 + 数量 + sticky 合计） | 2026-05-27 |
| [screens/mall-checkout.jsx](../mockups/jdo-pencil/screens/mall-checkout.jsx) | 06 · 确认订单（地址 / 配送 / 支付 三段式） | 2026-05-27 |
| [styles/tokens.css](../mockups/jdo-pencil/styles/tokens.css) | tokens（Noto Sans SC + 暗色为主，与主 mockups 同源） | 2026-05-27 |
| [styles/base.css](../mockups/jdo-pencil/styles/base.css) | reset + 全局基础样式 | 2026-05-27 |
| [styles/components.css](../mockups/jdo-pencil/styles/components.css) | 通用组件样式 | 2026-05-27 |
| [styles/ivi.css](../mockups/jdo-pencil/styles/ivi.css) | 2560×1600 画布壳层 + IVI 卡片 + 商城 home/category | 2026-05-27 |
| [styles/mall.css](../mockups/jdo-pencil/styles/mall.css) | mall 后续屏样式（detail / cart / checkout） | 2026-05-27 |
| [styles/autofit.js](../mockups/jdo-pencil/styles/autofit.js) | 缩放工具栏（自适应 / 1:1 / +/-） | 2026-05-27 |

### `mockups/jdo-pencil-v2/` · ~~Claude Design 导出包 v2~~ 已归档

> **已归档（2026-05-27），不再维护。项目主前端已切换到 v3。**
> 原从 [api.anthropic.com/v1/design/h/8W1sjP0OsCxyOnXKMZf5Kw](https://api.anthropic.com/v1/design/h/8W1sjP0OsCxyOnXKMZf5Kw) 导入。21 屏基线版本，仅供参考。

| 类别 | 文件清单 |
|---|---|
| **入口** | `JDO 车机电商.html`（21 个 jsx + 9 个 css 全部 link） |
| **基础设施** | `app.jsx`（21 路由 + tweaks）· `components.jsx`（Icon/StatusBar/Dock/ProductCard）· `data.js`（场景 + 商品 + banner）· `tweaks-panel.jsx` |
| **IVI** | `screens/ivi-home.jsx`（液态玻璃 4 卡 + 真车型壁纸） |
| **商城主链路** | `screens/mall-home.jsx`（场景 rail · 6 类）· `mall-category.jsx` · `mall-search.jsx` · `mall-detail.jsx` · `mall-cart.jsx` · `mall-checkout.jsx` · `mall-pay.jsx`（扫码） |
| **个人中心** | `mall-profile.jsx` · `mall-login.jsx`（扫码） · `mall-orders.jsx` · `mall-tracking.jsx` · `mall-aftersale.jsx` · `mall-reviews.jsx` · `mall-favorites.jsx` · `mall-addresses.jsx` · `mall-coupons.jsx` · `mall-points.jsx` · `mall-wallet.jsx` · `mall-settings.jsx` |
| **行车态** | `screens/mall-driving.jsx`（再买一次 + 语音卡 · 大字号 + 高对比） |
| **样式** | `styles/tokens.css` · `base.css` · `components.css` · `ivi.css` · `mall.css` · `mall-extras.css` / `mall-extras2.css` / `mall-extras3.css`（按页面分文件，避免巨型样式表）· `mall-home-hero.css`（场景推荐 hero 专属） · `autofit.js` |
| **资源** | `assets/ivi-wallpaper-dark.png`（2.78 MB · 暗夜极光 + Porsche Cayenne） |

**已知 bundle bug 与本地修复：**
- `styles/ivi.css` L50 原写 `url("assets/ivi-wallpaper-dark.png")`，CSS 内相对路径会解析到 `styles/assets/`（404）。已在导入时改为 `url("../assets/ivi-wallpaper-dark.png")`。

**v2 vs v1 关键差异：**
- IA：v1 = 12 类品类型（推荐 / 秒杀 / 车品…）；**v2 = 6 类场景型（加油充电 / 洗车保养 / 餐饮服务 / 出行旅行 / 车品配件 / 应急救援）**，落地 ADR-0008
- 屏数：v1 = 6 屏；v2 = 21 屏（含登录 / 钱包 / 积分 / 优惠券 / 售后 / 物流 / 行车态 等）
- 视觉：v1 = 车型 SVG 占位；**v2 = 实际 2.78 MB 暗夜极光车型壁纸**
- 行车态：v1 无；**v2 有专屏 `mall-driving`**，单独大字号 + 再买一次 + 语音卡

### `mockups/jdo-pencil-v3/` · ⭐ 项目主前端（2026-05-27 确立）

> **项目主前端，后续迭代与部署均基于此版本。V1/V2 已归档，不再维护。**
>
> 从 [api.anthropic.com/v1/design/h/AYO7p9fjLJqHDflxHJ03wA](https://api.anthropic.com/v1/design/h/AYO7p9fjLJqHDflxHJ03wA) 导入。
> **21 屏全功能 React 原型 + ADR-0009 场景型 IA + 暗夜极光车型壁纸**。
> 入口：`mockups/jdo-pencil-v3/JDO 车机电商.html`。需 HTTP server（`npx serve mockups/jdo-pencil-v3 -p 3000`）。

**v3 vs v2 关键差异**（从 chat transcript 反推 · `screens/mall-home.jsx` + `styles/mall-home-hero.css` 重写）：
- **mall-home 布局重排**：v2 = 左 rail + 右上 banner + 右下产品；**v3 = 顶部 banner + 下方左 rail + 右产品**（chat L973 用户原话）
- **顶部 banner 3 块拆法**：1 个左侧官方广告 + 2 个右侧"车内场景触发"（正午到达 / 今晚出差），右侧自动滑动（chat L921）
- **删除冗余按钮**：去掉"查看全部" + 去掉收藏 / 浏览历史按钮（chat L973）
- **场景由 6 改 7**（chat L790 用户决定），名字与 ADR-0008 略有出入，需要后续 sync 回 ADR
- **修了"立即购买点击后是黑色"的 bug**（chat L989 最后一次反馈）

**bundle bug & 修复**：与 v2 同：`styles/ivi.css:50` 的 wallpaper URL `assets/...` 改成 `../assets/...`。

**与 ADR-0008 的 drift**：v3 的 7 类场景命名可能与 ADR-0008 锁定的 6 类不一致，**这是落地实施漂移**，下一轮要么改 mockup 与 ADR 对齐，要么用 Superseded 流程升级 ADR-0008。建议看 v3 实际 rail 内容后再定。

> 路由命名以 [feature-spec.md](./feature-spec.md) 为准，不一致时改 page-spec / mockups。
> 这些 mockups 是 React 实装的视觉对照基准。`packages/design-tokens` 落地时直接从 `mockups/styles/tokens.css` 迁移。

## 📋 架构决策记录 decisions/

> ADR 按 NNNN 递增编号。状态：Proposed → Accepted → Superseded。

| 编号 | 标题 | 状态 | 日期 |
|---|---|---|---|
| [ADR-0001](./decisions/ADR-0001-frontend-framework.md) | 前端框架（React 18 + Vite + TypeScript） | Accepted | 2026-05-25 |
| [ADR-0002](./decisions/ADR-0002-backend-runtime.md) | 后端运行时与框架（Node.js 20 + Fastify + zod） | Accepted | 2026-05-25 |
| [ADR-0003](./decisions/ADR-0003-database-and-orm.md) | 数据库 + ORM（PostgreSQL 16 + Prisma 5 + Redis 7） | Accepted | 2026-05-25 |
| [ADR-0004](./decisions/ADR-0004-driving-state-source.md) | 行车态车速数据源协议（URL 参数 mock + JS Bridge 抽象） | Accepted | 2026-05-25 |
| [ADR-0005](./decisions/ADR-0005-deployment-strategy.md) | 部署方案（Vercel 前端 + Railway/Render 后端） | Accepted | 2026-05-25 |
| [ADR-0006](./decisions/ADR-0006-monorepo-tool.md) | monorepo 工具选型（pnpm + Turborepo） | Accepted | 2026-05-25 |
| [ADR-0007](./decisions/ADR-0007-ui-library-and-design-system.md) | UI 库 / 设计系统起点（自研 tokens + Tailwind + Radix Primitives） | Accepted | 2026-05-25 |
| [ADR-0008](./decisions/ADR-0008-ia-scene-first.md) | 信息架构按"用车场景"组织（6 类场景型一级分类，取代 12 类品类型） | **Superseded by ADR-0009** | 2026-05-27 |
| [ADR-0009](./decisions/ADR-0009-ia-7-scenes-v3.md) | **信息架构 v2 · 7 类场景型分类（V3 mockup 定稿 · 能量补给 / 爱车养护 / 一路吃喝 / 远行出差 / 车内好物 / 24h 救援 / 严选好物）** | Accepted | 2026-05-27 |
| [ADR-0010](./decisions/ADR-0010-admin-app-shape.md) | **后台管理应用形态**（独立 `apps/admin` + 复用同一后端 `/api/v1/admin/*`）| Accepted | 2026-05-29 |
| [ADR-0011](./decisions/ADR-0011-admin-rbac.md) | **后台权限模型**（独立 AdminUser + RBAC 角色/权限点 + 审计日志）| Accepted | 2026-05-29 |
| [ADR-0012](./decisions/ADR-0012-admin-ui-baseline.md) | **后台 UI 基准**（复用 design token + 桌面布局，不重画）| Accepted | 2026-05-29 |

> **依赖顺序**：ADR-0006 → 0001 / 0002 / 0003 → 0007 → 0004 → 0005。
> 详见 PRD.md §起手 Coding 计划 / 开干前必须先定的 ADR。
> **ADR-0009 触发的下游改动**：feature-spec.md §IA、PRD.md §核心场景、interaction-patterns.md、mockups 的 rail 内容 + 后端 `categories` seed 都需要 sync 到 7 类版本，详见 ADR-0009 §后续需要做的事。

## 📦 OpenSpec（Feature 级 spec）

> 项目级文档在 `docs/`；feature / change 级 spec 走 `openspec/`。改 spec 用 `/opsx:propose <id>`（Claude Code）或 `openspec new change <id>`（CLI），**不直接编辑 `specs/`**。详见 [`_templates/references/openspec-integration.md`](../_templates/references/openspec-integration.md)。

### 当前真相 `openspec/specs/`（已写示范，其余待补）

| Domain | 状态 | 备注 |
|---|---|---|
| [driving-mode](../openspec/specs/driving-mode/spec.md) | ✅ 已写 | 行车态进入/退出 + 交互限制（签名功能示范）|
| [order](../openspec/specs/order/spec.md) | ✅ 已写 | 订单状态机 + 价格库存服务端为准 |
| [admin-auth](../openspec/specs/admin-auth/spec.md) | ✅ 已写（**首个走完 propose→apply→archive 的域**，2026-06-01）| 后台登录 + RBAC 4 角色权限点 + 操作审计（实现 `services/api/src/admin-auth.ts`，38 测试）|
| catalog / cart / payment / auth-login / auth-qr / user / fulfillment | 🟡 待补 | 用 `/opsx:propose` 或从 feature-spec 迁移 |

### 进行中变更 `openspec/changes/`（首批 admin）

| Change | 状态 | 备注 |
|---|---|---|
| ~~add-admin-auth~~ → **已 archive** | ✅ apply 完成 + `openspec archive`（`changes/archive/2026-06-01-add-admin-auth/`，delta 已并入 `specs/admin-auth/`）| **首个完整生命周期**；实现见 `admin-auth.ts`，38 测试，typecheck 绿 |
| add-admin-catalog | 🟡 骨架（待 `/opsx:propose` 填充）| 商品/SKU/分类后台 |
| add-admin-order | 🟡 骨架 | 订单管理/发货/退款 |
| add-admin-analytics | 🟡 骨架 | 运营看板 |

> 待填骨架只有 `.openspec.yaml`。下一步在 Claude Code 里跑 `/opsx:propose add-admin-catalog` 让 AI 按上下文补满 4 件套。

## 🔍 调研报告 research/

> 技术选型对比、竞品调研、可行性分析。

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [competitor-analysis.md](./research/competitor-analysis.md) | 7 家车厂竞品（NIO / 理想 / 问界 / Tesla / 小鹏 / 小米 / Polestar）+ AAOS / NHTSA / HarmonyOS HMI 规范 + 给我们 Demo 的设计建议 · **2026-05-27 追加车机商店 v0.2.0-foundation 实机观察** | Accepted | 2026-05-27 |
| [ia-scene-vs-category.md](./research/ia-scene-vs-category.md) | **场景型 vs 品类型 IA 调研** · 5 节论证 + 反方观点反驳 + 提议的 6 类场景一级分类 · 输入到 ADR-0008 | Draft | 2026-05-27 |
| [admin-benchmark.md](./research/admin-benchmark.md) | **主流电商后台调研** · 界面布局 / 分类逻辑 / 功能子项对标基线 + 与本项目 admin 差距分析 · 输入到 admin-spec | Accepted | 2026-05-29 |

## 🖼 图示 diagrams/（仓库根目录）

| 文件 | 用途 | 最后更新 |
|---|---|---|
| [information-architecture.excalidraw](../diagrams/information-architecture.excalidraw) | 信息架构图（IA） | 2026-05-25 |
| [system-architecture.excalidraw](../diagrams/system-architecture.excalidraw) | 系统技术架构图 | 2026-05-25 |

## 🔧 配置与协作护栏（仓库根 / .github / .claude）

> harness 第④层（hook 强制）+ 第⑤层（observability）的载体。

| 文件 | 用途 | 状态 | 日期 |
|---|---|---|---|
| [.claude/settings.json](../.claude/settings.json) + [hooks/](../.claude/hooks/) | **must 级规则强制层**（开工三件套 / 密钥扫描 / commit 自报家门 / 防孤儿 / openspec 校验，均 `exit 2`）| Active | 2026-06-01 |
| [.env.example](../.env.example) | 环境变量模板（占位值，真密钥不入仓）· 对应 backend-spec §五 | Active | 2026-06-01 |
| [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) | PR 必填项（测试证据 + 文档同步 checklist）| Active | 2026-06-01 |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | 人类贡献者协作规则（与 CLAUDE.md 分工）| Active | 2026-06-01 |
| [.github/CODEOWNERS](../.github/CODEOWNERS) | 路径 → owner，对应 §Ownership Zones | Active | 2026-06-01 |

---

## 文档状态约定

- **Draft** — 初稿，仍在打磨
- **Accepted** — 已对齐确认，可作为后续工作依据
- **Superseded by X** — 已被新文档取代，保留供追溯
- **Pending** — 占位中，尚未撰写

## 维护规则

1. 新增文档时，先在本文件登记，再写正文（防止文档孤儿）
2. 改动状态时，同步更新本文件的状态列与日期列
3. ADR 编号一旦分配不重复使用（Superseded 也保留原编号）
