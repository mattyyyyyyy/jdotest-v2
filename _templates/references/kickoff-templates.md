# 开工模板 Kickoff Templates

从 0 创建开工文档时使用这些模板。每个模板包含：

- **元数据**：拥有的事实、上游 / 下游、何时触发更新
- **模板**：可直接复制的骨架，含字段提示
- **填法要点**：每个字段应该写什么、写多深
- **反模式**：不要写什么
- **示例**：一份用"车机电商 Demo"贯穿示范的填好版本，让你看清"什么叫好内容"

约定：

- `<占位符>` 由 skill 在生成阶段替换
- `[假设·待确认]` 表示用户未答、采用默认值的项，必须在 `open-questions.md` 留对应条目
- 所有路径用相对路径，禁止 `../../` 跨层除非必要
- 示例项目背景：**车机电商 Demo** — 在车机大屏（10-17 寸）上跑的 H5 电商，给车主 + 副驾 + 后排提供"上车顺手买东西"的体验，支持停车态完整购物和行车态降级

---

## CLAUDE.md / AGENTS.md

> **拥有**：AI agent 在本仓库内的协作规则、开工三件套、强制约束指针
> **上游**：用户访谈轮 4 · `.claude/settings.json` 配置
> **下游**：所有 agent 每次会话开头读
> **何时更新**：新增强制规则 / 新路径所有权 / 锁定结论新增或推翻

模板与详细示例见 [agent-contract-template.md](./agent-contract-template.md)。本文件只给指针，避免双份维护。

---

## docs/INDEX.md

> **拥有**：所有结论性文档的目录 + 多 agent 实时仪表盘
> **上游**：所有 `docs/` 下文档
> **下游**：每个 agent 开工前必读（开工三件套第 ②③ 步）
> **何时更新**：新增 / 改名 / 废弃文档；开工三件套登记；workstream 完工

### 模板

```markdown
# 文档索引 INDEX

> 本仓库所有结论性文档的目录 + 多 agent 实时仪表盘。
> 协作铁律见根目录 [`CLAUDE.md`](../CLAUDE.md)。
>
> 三块 append-only 仪表盘任何 agent 都可加自己的行，**不可改 / 删别人的行**。

---

## 🚦 Active Workstreams（实时态 · append-only）

> 任何 agent 开工前必须在此 append 一行登记。完工后把行移到 Recent Activity。
> 格式：`agent-id | 工作范围 | 起始 | 涉及文件（glob）| 状态`

| Agent | 工作范围 | 起始 | 涉及文件 | 状态 |
|---|---|---|---|---|
| _暂无登记_ | | | | |

## 🗺 Ownership Zones（目录分工建议）

| Zone（路径） | 默认所有者 | 说明 |
|---|---|---|
| `docs/decisions/ADR-*.md` | 提案 agent | Accepted 后用 Superseded 流程 |
| `docs/PRD.md` | 产品 agent | 升版本前登记 |
| `docs/feature-spec.md` | 工程 agent | 路由 / 接口权威源 |
| `docs/design/*` | 设计 agent | UI 规则变化必须同步下游 |
| `docs/research/` | 调研 agent | 先检索是否已有同主题 |
| `apps/**` | 实施 agent | 前端实现 |
| `services/**` | 实施 agent | 后端实现 |
| `packages/**` | 包 owner | 共享代码 |
| **`docs/INDEX.md`** | **全员 append-only** | 在 Workstreams / Activity 加行 |
| **`CLAUDE.md`** | **全员协商** | 改公约前在 Active Workstreams 登记 |

## 📋 Recent Activity（最近完成 · 倒序）

> Workstreams 完工后移到这里。最近 10 条保留，更早按月归档到 `docs/worklog/YYYY-MM.md`。

| 日期 | Agent | 完成项 | 关键 commit |
|---|---|---|---|
| _暂无_ | | | |

---

## 📌 入口文档（必读）

- [CLAUDE.md](../CLAUDE.md) — AI 协作公约
- [docs/project-brief.md](./project-brief.md) — 项目目标与用户
- [docs/scope.md](./scope.md) — MVP 边界
- [docs/constraints.md](./constraints.md) — 所有约束

## 📐 架构设计

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [architecture.md](./architecture.md) | 系统级视图 | Draft | <YYYY-MM-DD> |

## 🎨 设计

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [design-system.md](./design/design-system.md) | 设计 token 与组件契约 | Draft | <YYYY-MM-DD> |

## 📋 架构决策记录

| 编号 | 标题 | 状态 | 日期 |
|---|---|---|---|

## 🔍 调研报告

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|

## 🖼 图示

| 文件 | 用途 | 最后更新 |
|---|---|---|

## 🖥 原型

| 版本 | 状态 | 说明 |
|---|---|---|

---

## 文档状态约定

- **Draft** — 初稿，仍在打磨
- **Accepted** — 已对齐确认，可作为后续工作依据
- **Superseded by X** — 已被新文档取代，保留供追溯
- **Pending** — 占位中，尚未撰写

## 维护规则

1. 新增文档时，先在本文件登记，再写正文
2. 改动状态时，同步更新本文件的状态列与日期列
3. ADR 编号一旦分配不重复使用（Superseded 也保留原编号）
4. Active Workstreams / Recent Activity 是 append-only
```

### 填法要点

- **Active Workstreams** 的 `工作范围` 写动作 + 对象，例如 `编写 ADR-0004 数据库选型`，不写"做点东西"
- **涉及文件** 用 glob：`docs/decisions/ADR-0004-*.md` 或 `apps/h5/src/modules/cart/**`
- **状态** 只用：`in-progress` / `blocked`。完工 → 移到 Recent Activity
- **Ownership Zones** 用 glob，越界要看的 → 越粗；要锁的 → 越细
- **Recent Activity** 的"完成项"一句话讲产出 + 关键决定，便于 `git log` 不展开也能看进度

### 反模式

- Workstream 长期"in-progress" → harness 检测超过 N 天告警
- INDEX 列了文件但文件没了，或反过来 → 文档孤儿，hook 兜底
- 把"项目简介"写在 INDEX 顶部 → 那属于 `project-brief.md`
- 在 Workstreams / Activity 改别人的行 → 违反 append-only，必须 hook 拦截

### 示例（车机电商 Demo · `docs/INDEX.md` 中段）

```markdown
## 🚦 Active Workstreams

| Agent | 工作范围 | 起始 | 涉及文件 | 状态 |
|---|---|---|---|---|
| claude-cart-impl | 实现 P-05 购物车页 + BE-cart 服务 | 2026-05-28 14:30 | `apps/h5/src/pages/cart/**`, `services/api/src/modules/cart/**` | in-progress |
| claude-adr-0008 | 起草 ADR-0008 行车态车速数据源 | 2026-05-28 15:10 | `docs/decisions/ADR-0008-driving-state-source.md` | in-progress |

## 🗺 Ownership Zones

| Zone | 默认所有者 | 说明 |
|---|---|---|
| `docs/decisions/ADR-*.md` | 提案 agent | Accepted 后用 Superseded 流程 |
| `docs/design/design-system.md` | UI agent | 设计 token 单一真相 |
| `docs/feature-spec.md` | 工程 agent | 路由 / 接口 / 状态机权威源 |
| `apps/h5/src/modules/driving/**` | claude-driving | DrivingContext 深模块 |
| `services/api/src/modules/payment/**` | claude-payment | 支付模块（高敏感） |
| `packages/order-state-machine/**` | claude-states | 状态机包，改前先看测试 |

## 📋 Recent Activity

| 日期 | Agent | 完成项 | 关键 commit |
|---|---|---|---|
| 2026-05-27 | claude-main | V3 mockup 确立为项目主前端，V1/V2 归档 | a1b2c3d |
| 2026-05-27 | claude-adr-0009 | ADR-0009 Accepted：IA 改为 7 类场景，ADR-0008 Superseded | e4f5g6h |
| 2026-05-26 | claude-design-system | design-system.md v1.0：颜色 / 字号 / 间距 / 触控 / 动效 全套 token | i7j8k9l |

## 📐 架构设计

| 文档 | 摘要 | 状态 | 日期 |
|---|---|---|---|
| [architecture.md](./architecture.md) | 车机 H5 + 后端 Fastify + Postgres + Redis；行车态降级 via DrivingContext | Draft | 2026-05-26 |

## 📋 架构决策记录

| 编号 | 标题 | 状态 | 日期 |
|---|---|---|---|
| [ADR-0001](./decisions/ADR-0001-frontend-framework.md) | 前端框架（React 18 + Vite + TS） | Accepted | 2026-05-25 |
| [ADR-0008](./decisions/ADR-0008-ia-scene-first.md) | IA 场景型 6 类 | **Superseded by ADR-0009** | 2026-05-27 |
| [ADR-0009](./decisions/ADR-0009-ia-7-scenes-v3.md) | IA v2 · 7 类场景型分类 | Accepted | 2026-05-27 |
```

---

## docs/project-brief.md

> **拥有**：项目目标、用户、价值主张、当前阶段
> **上游**：用户访谈轮 1
> **下游**：scope / constraints / architecture / PRD / 所有 ADR 的背景
> **何时更新**：产品定位有变（建议同时升 PRD 版本）

### 模板

```markdown
# Project Brief

> 状态：Draft · 日期：<YYYY-MM-DD>
> 上游：用户访谈 · 下游：所有项目文档

## 问题 Problem

[一段 100-200 字的问题陈述：谁在什么场景下、面对什么困境、用什么替代方案解决、为什么不够。具体到一个画面，避免泛泛而谈。]

## 用户 Users

- 主要用户：[一句话画像 + 关键场景]
- 次要用户：[一句话画像 + 与主用户的关系]
- 用户决策动机：[他们为什么会用这个产品]

## 方案 Solution

[一句话：我们要做的是 X，给 Y 用，解决 Z。]

## 关键解法 Key Approaches

- 解法 1：[一句话讲清楚 + 它解决问题的哪一面]
- 解法 2：
- 解法 3：

## 成功标准 Success Criteria

- Must：[阶段一就要满足的硬指标]
- Should：[最好满足的指标]
- 可衡量指标：[量化指标，例如完成率、响应时间、留存]

## 非目标 Non-Goals

- 不做：[明确排除的方向，每条带原因]

## 假设 Assumptions

- 假设：[本项目成立依赖的前提]
- 风险：[假设不成立会怎样]

## 当前阶段 Current Stage

- 阶段：Demo / MVP / 生产 / 持续演进
- 时间表：
- 第一阶段交付：
```

### 填法要点

- **问题**：写一个**具体画面**，让读者能闭眼想象出来。避免"用户体验不好" / "效率低" 这种空话
- **用户**：主要用户的"决策动机"比身份标签重要。例如不写"30 岁车主"，写"通勤等红灯时想顺手买东西的车主"
- **解法**：3 条以内。每条对应问题里的一个痛点
- **成功标准**：必须可衡量。"快速" / "流畅" 不是标准，"FCP ≤ 1.5s" 才是
- **非目标**：和 `scope.md §Out Of Scope` 互补——这里是产品方向上的不做，那里是 MVP 范围内的不做
- **当前阶段**：决定下游文档要不要写到生产级（监控、备份、灾备）

### 反模式

- 写成融资 BP：商业模式 / 市场规模这些不属于这里
- 用户写成"所有人" / "互联网用户" → 没意义
- 解法写技术方案 → 那属于 `architecture.md`
- 成功标准写定性词 → 没法验证，下游 task-plan 无法回溯

### 示例（车机电商 Demo）

```markdown
# Project Brief

> 状态：Draft · 日期：2026-05-25
> 上游：用户访谈 · 下游：所有项目文档

## 问题 Problem

我是一个车主。我在车里花了大量时间——通勤等红灯、充电桩前等待 30-60 分钟、网约车上送孩子的间隙、停车场里等家人。我面前是一块 10-17 寸的车机大屏，但它能干的商业化事情只有"加油、充电、导航"。

我想买点东西的时候，必须掏出手机；副驾乘客想买东西，也要掏手机；后排小孩闹腾想买零食的时候，整个家庭还是各自看各自的手机。**车机这块屏，在通用电商这件事上是空的。**

## 用户 Users

- 主要用户：车主，希望"上车这段时间也能像在客厅一样顺手买点东西"。决策动机：缩短"想到要买"到"已下单"的物理距离
- 次要用户：副驾乘客（购物自由度更高，不受行车态约束）、后排乘客（小孩 + 老人，需要简单操作）
- 用户决策动机：场景触发型购买（充电时买玻璃水 / 通勤时补给零食），不是手机端的"主动逛"

## 方案 Solution

我们做一个**车机内嵌 H5 电商平台**，以网页形态运行在主流车机浏览器 / WebView 中，为车主、副驾、后排乘客提供"车上一键购"的完整购物体验。

## 关键解法 Key Approaches

- **一套 H5，多端响应式**：横屏车机为主，手机 / PC 演示页同源，降低车厂适配成本
- **双形态自动切换**：检测车速 → 行车态降级（大按钮、少层级、禁键盘、禁视频）/ 停车态完整体验
- **驾驶安全优先**：所有交互按"≤ 3 步完成下单 + 88×88 px 触控区 + WCAG AA 对比度"约束
- **完整闭环**：商品 → 购物车 → 订单 → 支付 → 物流（履约）端到端 Demo，证明可行性而非只展示首页

## 成功标准 Success Criteria

- Must：
  - 在 1920×720 / 1920×1080 / 2560×1440 车机分辨率下主链路无横向溢出
  - 所有触控目标 ≥ 88×88 px
  - 行车态下"再买一次"全流程 ≤ 3 步、无键盘输入
  - 首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）
- Should：
  - 一条演示视频能让车厂方一眼看懂"和现有车机生态如何挂接"
  - 2560×1600 大屏自适应良好
- 可衡量指标：
  - 完成下单率（演示环境） ≥ 80%
  - 行车态完成"再买一次"中位耗时 ≤ 8s

## 非目标 Non-Goals

- 不做特定车厂账号 / 支付通道适配——Demo 阶段不绑定车厂
- 不做手机端原生 App——一套 H5 就够，车厂愿意接入时再说
- 不做商家端（B 端）——只做 C 端购物侧
- 不做实时商品库存对接——演示用 mock 库存

## 假设 Assumptions

- 假设：车机浏览器是 Chromium 79+，能跑 React 18 + Vite 默认产物（ES2020）。风险：旧车机可能不支持，需要后期降级方案
- 假设：车厂愿意把我们的 H5 作为车机预装入口或自家应用市场上架。风险：车厂自建商城竞争
- 假设：车速数据可以通过 URL 参数 mock 或 JS Bridge 拿到。风险：实际接入车厂时 bridge 协议不统一

## 当前阶段 Current Stage

- 阶段：Demo
- 时间表：4 周内做出可演示版本
- 第一阶段交付：21 屏 React 原型 + 后端 mock API + Vercel/Railway 部署，可在演示视频中演示完整购物链路
```

---

## docs/scope.md

> **拥有**：MVP 边界、Phase 2 计划、明确排除的范围、第一条纵向切片
> **上游**：project-brief.md
> **下游**：task-plan.md / feature-spec.md / 所有实施任务
> **何时更新**：范围被增删（必须同步升 PRD 版本）

### 模板

```markdown
# Scope

> 状态：Draft · 日期：<YYYY-MM-DD>
> 上游：[project-brief.md](./project-brief.md) · 下游：[task-plan.md](./task-plan.md) · [feature-spec.md](./feature-spec.md)

## MVP

[Must Have 功能清单。每条简短到能在一行内读完，但具体到能验收。]

- 功能 1：
- 功能 2：

## Phase 2

[Should Have，MVP 验收后做。]

- 功能：

## Out Of Scope

[明确不做的，每条带"为什么不做 / 什么时候才考虑"。]

- 不做：

## 第一条纵向切片 First Vertical Slice

[第一阶段先打通的最小演示路径。这是 task-plan 的起点。]

1. 步骤 1
2. 步骤 2
3. 步骤 3

完成标准：
- [ ] 验收点 1（量化）
- [ ] 验收点 2

## 时间表 Timeline

| 阶段 | 目标 | 时间 |
|---|---|---|
| 切片演示 | | |
| MVP | | |
| 生产就绪 | | |
```

### 填法要点

- MVP 条目要**可验收**——能放到 PR checklist 里
- Phase 2 不是"还没想好的全集"——是想清楚 will-do 的 Should
- Out Of Scope 写明原因：是"现在不做" / "永远不做" / "替代方案"
- 第一条切片是"端到端薄路径"——从用户进入到拿到结果的完整链条，不是"先做完整首页"

### 反模式

- MVP 列了 30 条 → 不是 MVP，是产品全集
- 第一条切片是"做完整后端"或"做完整前端" → 不是切片，是孤立的层
- Out Of Scope 留空 → 通常表示你还没想清楚边界

### 示例（车机电商 Demo）

```markdown
# Scope

> 状态：Draft · 日期：2026-05-25
> 上游：[project-brief.md](./project-brief.md) · 下游：[task-plan.md](./task-plan.md)

## MVP

- 商品浏览：首页、分类、搜索、商品详情（含主图、规格、价格）
- 购物车：加购、改数量、勾选、合计
- 下单 + 支付：结算页（地址 + 配送 + 支付方式）+ 二维码扫码支付（mock）
- 订单：订单列表 + 订单详情（含物流轨迹 mock）
- 账号：手机号登录 + 车机扫码登录 + 多收货地址管理
- 行车态降级：车速 > 5 km/h 自动进入，仅显示"再买一次 + 默认地址 + 默认支付"路径
- 设计基础：深色默认 + WCAG AA 对比度 + 88×88 触控 + 18px 起字号

## Phase 2

- 语音搜索（接车机原生 ASR）
- 车机推送（订单状态变更）
- 自提点选择（车主到附近自提）
- 个性化推荐（基于历史订单）
- 车厂账号绑定（OAuth 接入）

## Out Of Scope

- 特定车厂的支付通道（蔚来 / 理想 / 小鹏内置支付）——Demo 阶段不绑定具体车厂
- 移动端原生 App——一套 H5 已覆盖，车厂愿意接入时再说
- 商家后台（B 端）——只做 C 端购物侧
- 实时库存对接——演示用 mock 库存
- 视频直播购物——行车态明确禁视频，Demo 无需

## 第一条纵向切片 First Vertical Slice

打通一条完整购物链路：

1. 用户在车机首页看到 4 张商品玻璃卡
2. 点开商品详情，看到主图 + 规格 + 价格
3. "加入购物车" → 跳购物车页 → "去结算"
4. 结算页选默认地址 + 微信支付 → "提交订单"
5. 支付页显示二维码 → mock 扫码 → 跳订单详情
6. 订单详情显示"已支付 · 待发货"
7. 个人中心可以看到这条订单

完成标准：
- [ ] 7 步在 1920×1080 上完整跑通无报错
- [ ] 触控目标全部 ≥ 88px
- [ ] FCP ≤ 1.5s（Wi-Fi）
- [ ] 行车态可演示"再买一次"路径

## 时间表 Timeline

| 阶段 | 目标 | 时间 |
|---|---|---|
| 切片演示 | 7 步完整链路 + 行车态 demo | 2026-06-08 |
| MVP | 全部 MVP 功能（21 屏） | 2026-06-22 |
| 生产就绪 | 接车厂账号 / 支付 / 真实库存 | TBD（看车厂落地节奏） |
```

---

## docs/constraints.md

> **拥有**：所有约束（must / should / optional / out of scope），按类型组织
> **上游**：用户访谈轮 3 + ADR + 合规要求
> **下游**：所有实施决策、hook 配置、CI gate、review checklist
> **何时更新**：新增约束 / 约束级别变化 / 约束执行机制变化

### 模板

```markdown
# Constraints

> 状态：Draft · 日期：<YYYY-MM-DD>
> 上游：用户访谈 + 合规要求 · 下游：所有实现决策

约束分级：`must` 不可妥协 / `should` 推荐默认 / `optional` 可选增强 / `out of scope` 明确不做。
**`must` 级约束必须有 hook 或 CI gate 执行机制，否则降级为 `should`。**

## Must

| 约束 | 类型 | 执行机制 |
|---|---|---|

## Should

| 偏好 | 类型 | 例外规则 |
|---|---|---|

## Optional

| 增强 | 类型 |
|---|---|

## Out of Scope

- 不做：

---

## 按类型组织

### Product
### Business Rules
### Technical
### Engineering
### Architecture
### Configuration
### Collaboration
### Performance
### Security
### Compliance
```

### 填法要点

- **每条 must 都填执行机制**：是 hook 名 / CI 步骤 / lint 规则 / type check / PR template checklist。没有执行机制 → 不是 must
- **Should 的"例外规则"**：什么情况可以例外、谁批准、怎么记录
- **类型分组**：同一条约束可能跨多个类型（例如鉴权同时是 Security 和 Architecture），归到主类型
- **避免和 ADR 重复**：ADR 是"为什么选这个"，constraint 是"边界是什么"。ADR 决定"用 PostgreSQL"，constraint 写"数据库必须支持事务"
- **performance / security / compliance 是约束高发区**：单独成节

### 反模式

- Must 没有执行机制 → 形同虚设
- 把 ADR 决策抄进来 → 重复信息，ADR 改了 constraints 就 stale
- 全部约束都是 must → 没有优先级
- "尽量" / "建议" 出现在 must 列 → 不是 must

### 示例（车机电商 Demo）

```markdown
# Constraints

> 状态：Draft · 日期：2026-05-25

## Must

| 约束 | 类型 | 执行机制 |
|---|---|---|
| 所有触控目标 ≥ 88×88 px | Product / Accessibility | `pnpm lint:a11y` 自定义规则 + Playwright 测试断言 |
| 字号基础 ≥ 18px、主标题 ≥ 28px | Product / Accessibility | design-tokens 单元测试 + 视觉回归 |
| WCAG AA 对比度（≥ 4.5:1） | Product / Accessibility | `pnpm test:contrast` + design-system 文档断言 |
| 行车态下禁用键盘 / 密码 / 银行卡输入 | Business Rules / Safety | DrivingContext 拦截 + 集成测试断言 |
| 行车态自动降级（车速 > 5 km/h） | Business Rules / Safety | DrivingContext 状态机 + 单元测试 |
| 所有 API 请求 / 响应走 zod schema 校验 | Technical | Fastify schema 中间件，缺失 → 拒绝注册路由 |
| 密钥不进仓库 | Security | `PreToolUse(Write\|Edit)` hook 扫描 + pre-commit hook |
| 首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G） | Performance | Lighthouse CI 在每次 PR 跑 |
| Bundle ≤ 300KB gzipped | Performance | Vite build size check |
| 所有 commit 末尾带 `agent:` 尾标 | Collaboration | `PreToolUse(Bash)` hook 在 git commit 时自动追加 |

## Should

| 偏好 | 类型 | 例外规则 |
|---|---|---|
| 优先使用 TypeScript 严格模式 | Technical | 第三方未声明类型时可暂用 `any`，必须留 TODO |
| 组件函数命名 PascalCase，hook 命名 use- 前缀 | Engineering | 沿用旧库的可保留 |
| 任何 UI 变化都先改 mockup 再改代码 | Collaboration | 紧急修复可直接改代码，事后补 mockup |

## Optional

| 增强 | 类型 |
|---|---|
| 暗夜极光车型壁纸 | Product / Visual |
| 语音搜索（Web Speech API） | Product / Feature |

## Out of Scope

- 桌面浏览器适配（横屏车机为主，桌面只是同源演示页，不优化）
- IE / 老 Android WebView（< Chromium 79）
- 服务端渲染（CSR + CDN 缓存足够）

---

## 按类型组织

### Product / Accessibility（驾驶安全是硬约束）
- 触控 ≥ 88×88 px、字号 ≥ 18px、WCAG AA 对比度
- 主链路 ≤ 3 步完成下单
- 行车态全套降级

### Business Rules
- 车速 > 5 km/h 自动进入行车态，< 5 km/h 持续 3s 切回
- 行车态下统一按"驾驶员"降级，副驾损失体验是已知妥协（[假设·待确认]：未来接车内摄像头识别后再放开）

### Technical
- 前端：React 18 + Vite + TypeScript（ADR-0001）
- 后端：Node.js 20 + Fastify + zod（ADR-0002）
- 数据库：PostgreSQL 16 + Prisma 5 + Redis 7（ADR-0003）
- 浏览器目标：Chromium 79+（覆盖主流车机 WebView）
- 目标分辨率：1920×720 / 1920×1080 / 2560×1440 / 2560×1600

### Engineering
- 包管理：pnpm + Turborepo monorepo（ADR-0006）
- 测试：vitest + Playwright + MSW
- CI gate：lint / typecheck / unit / integration / build；release 加 e2e + contract

### Architecture
- 模块边界：feature-based 组织（catalog / cart / order / payment / driving）
- API 契约：OpenAPI 单一真相（`packages/api-contracts/openapi.yaml`）
- 共享代码：`packages/` 至少有两个真实消费者再提升

### Configuration
- 所有外部依赖走环境变量（见 `.env.example`）
- 密钥从平台 secret manager 注入（Vercel / Railway）

### Collaboration
- 单 agent / 多 agent 都按"开工三件套"走
- 路径所有权见 `docs/INDEX.md §Ownership Zones`
- review：PR 必走，self-review 至少一遍 + Playwright 主链路通过

### Performance
- FCP ≤ 1.5s / 2.5s · Bundle ≤ 300KB gzipped · 主交互响应 ≤ 100ms

### Security
- 鉴权：JWT，access token 1h，refresh token 30d
- 密钥：传输 HTTPS + 平台 secret + 不进代码
- 输入：所有路由 zod schema 校验
- 限流：登录 / 支付 / 写操作 都有 rate limit

### Compliance
- 用户数据：境内存储（[假设·待确认]：待定具体 region）
- 不收集驾驶员生物数据
```

---

## docs/architecture.md

> **拥有**：系统级视图、模块边界、数据流、可部署单元
> **上游**：constraints / 关键 ADR
> **下游**：backend-spec / api-contracts / feature-spec / 所有实施
> **何时更新**：模块边界变化、新增 / 删除可部署单元、数据流重组

### 模板

```markdown
# Architecture

> 状态：Draft · 日期：<YYYY-MM-DD>
> 上游：[project-brief.md](./project-brief.md) · [constraints.md](./constraints.md) · [decisions/](./decisions/)
> 下游：[backend-spec.md](./backend-spec.md) · [api-contracts.md](./api-contracts.md) · [feature-spec.md](./feature-spec.md)

## 系统概览

[一段话说明系统的形状：客户端 / 服务端 / 数据层 / 外部服务的关系。]

参见 [diagrams/system-architecture.excalidraw](../diagrams/system-architecture.excalidraw)

## 可部署单元

| 单元 | 类型 | 部署目标 | 端口 |
|---|---|---|---|

## 模块

| 模块 | 职责 | 对外接口 | 所在层 |
|---|---|---|---|

## 数据流

[列出几条典型用户路径，从触发到落库。]

## API 契约

- 单一真相：[api-contracts.md](./api-contracts.md) / `packages/api-contracts/openapi.yaml`
- 版本策略：

## 数据模型

| 实体 | 关键字段 | 关系 |
|---|---|---|

## 跨切面

- 日志：
- 监控：
- 错误处理：
- 限流：
- 缓存：

## 风险与权衡

| 风险 | 影响 | 应对 |
|---|---|---|
```

### 填法要点

- **系统概览**用 ASCII 或链接到图。如果链接到图，确保 `diagrams/` 下有源文件
- **模块**：列**深模块**（catalog / cart / order）和**横切模块**（auth / observability / driving-context），不列每个 util
- **数据流**：从用户动作开始，到 DB 落库结束。例如"加购 → 前端 CartStore → POST /api/v1/cart/items → cart 模块 → Postgres + Redis"
- **跨切面**统一处理：日志格式、metrics、错误格式都在这里说，而不是分散到各模块

### 反模式

- 把 backend-spec 内容抄一遍 → 重复
- 写成"代码目录介绍" → 那是 README 干的
- 模块列了 30 个 → 没抓到关键模块
- 数据流写"前端调后端、后端查库" → 没意义，写具体接口和模块名

### 示例（车机电商 Demo）

```markdown
# Architecture

> 状态：Draft · 日期：2026-05-26
> 上游：[project-brief.md](./project-brief.md) · [constraints.md](./constraints.md) · [decisions/](./decisions/)

## 系统概览

```text
┌──────────────────────────────────────────────────────────────────┐
│ 车机 WebView (Chromium 79+, 2560×1600 主)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ apps/h5 (React 18 + Vite + TS)                              │  │
│  │  • IVI Shell (顶栏 / Dock / 主题 / DrivingContext)           │  │
│  │  • 商城路由 (P-01 ~ P-13)                                    │  │
│  │  • 行车态降级 (M-12 DrivingContext + M-13 JS Bridge)         │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────┬──────────────────────┘
                                            │ HTTPS / /api/v1
                                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ services/api (Node 20 + Fastify + zod)                            │
│  ┌────────────┬────────────┬────────────┬────────────┬────────┐  │
│  │ catalog    │ cart       │ order      │ payment    │ user   │  │
│  ├────────────┼────────────┼────────────┴────────────┴────────┤  │
│  │ fulfillment│ gateway (鉴权 / 限流 / CORS / traceId)          │  │
│  └────────────┴──────────────────────────────────────────────┘  │
└──┬─────────────────────┬───────────────────────┬─────────────────┘
   │                     │                       │
   ▼                     ▼                       ▼
┌──────────┐      ┌─────────────┐         ┌──────────────┐
│ Postgres │      │ Redis       │         │ 第三方 mock   │
│ (业务态)  │      │ (购物车/    │         │ (支付/通知/   │
│          │      │  Session)   │         │  SMS)        │
└──────────┘      └─────────────┘         └──────────────┘
```

参见 [diagrams/system-architecture.excalidraw](../diagrams/system-architecture.excalidraw)

## 可部署单元

| 单元 | 类型 | 部署目标 | 端口 |
|---|---|---|---|
| frontend `apps/h5` | SPA | Vercel | 443 (CDN) |
| backend `services/api` | API server | Railway | 3000 |
| db | PostgreSQL 16 (managed) | Railway managed | 5432 |
| cache | Redis 7 (managed) | Railway managed | 6379 |

## 模块

### 前端深模块

| 模块 | 职责 | 对外接口 | 所在层 |
|---|---|---|---|
| `IVI Shell` | 顶栏 / Dock / 主题 / 全局布局 | `<AppShell>` | platform |
| `DrivingContext` | 车速侦测 + 行车 / 停车态切换 + 降级控制 | `useDrivingState()` | platform |
| `JS Bridge` | 抽象车厂 bridge（速度 / 推送 / 扫码） | `bridge.speed.subscribe()` | platform |
| `CartStore` | 本地 + 服务端购物车合并、登录态过渡 | Zustand store | feature |
| `OrderStateMachine` | 订单状态流转（10 个状态 + 20 个事件） | `transition(state, event)` | packages |

### 后端模块

| 模块 | 职责 | 对外接口 |
|---|---|---|
| `gateway` | 鉴权 / 限流 / CORS / traceId 注入 | middleware |
| `catalog` | 商品 / 分类 / 搜索 | `GET /api/v1/products/*` |
| `cart` | 购物车 CRUD + 合并 | `POST /api/v1/cart/items` |
| `order` | 订单创建 / 状态流转 / 列表 | `POST /api/v1/orders` |
| `payment` | 支付二维码生成 + mock 回调 | `POST /api/v1/payments` |
| `user` | 登录 / 个人中心 / 地址簿 | `POST /api/v1/auth/*` |
| `fulfillment` | 物流轨迹 mock + 自提点 | `GET /api/v1/orders/:id/tracking` |

## 数据流

**加购流程（停车态）**：

```
车主点"加入购物车"
  → 前端 CartStore.add(skuId, qty)
  → 乐观更新本地 state
  → POST /api/v1/cart/items { skuId, qty }
  → gateway 验证 JWT → cart 模块
  → 写 Redis (key: cart:{userId}) + 写 Postgres (审计日志)
  → 返回最新 cart snapshot
  → CartStore 同步服务端状态 + 红点角标更新
```

**下单流程**：

```
车主点"提交订单"
  → POST /api/v1/orders { addressId, paymentMethod, items }
  → order 模块：开事务
    → 锁库存（Redis SETNX）
    → 写 orders 表（state: CREATED）
    → 写 order_items 表
    → 调 payment 模块生成二维码
    → 释放库存锁
  → 返回 { orderId, paymentQrUrl }
  → 前端跳支付页 / 显示二维码
  → 用户手机扫码（mock）
  → payment 回调 → orders.state: PAID
  → SSE 推送给前端 → 跳订单详情
```

## API 契约

- 单一真相：[api-contracts.md](./api-contracts.md) + `packages/api-contracts/openapi.yaml`
- 版本：`/api/v1`，破坏性变更进 `/api/v2`

## 数据模型

| 实体 | 关键字段 | 关系 |
|---|---|---|
| User | id / phone / nickname / theme_preference | hasMany Address, Order |
| Address | id / userId / label / detail / isDefault | belongsTo User |
| Product | id / categoryId / title / images / priceCents | hasMany Sku |
| Sku | id / productId / specs(JSON) / priceCents / stock | belongsTo Product |
| CartItem | userId / skuId / qty | (Redis 主，PG 审计) |
| Order | id / userId / state / totalCents / addressSnapshot(JSON) | hasMany OrderItem |
| OrderItem | orderId / skuId / qty / priceSnapshotCents | belongsTo Order |
| Payment | id / orderId / method / qrUrl / state | belongsTo Order |

详见 [backend-spec.md](./backend-spec.md) §Data Model。

## 跨切面

- **日志**：JSON 格式，含 `traceId / userId / route / latencyMs / level`。生产用 Logflare
- **Metrics**：Prometheus 暴露 `http_requests_total / http_request_duration_seconds / business_orders_created_total`
- **Traces**：OpenTelemetry，每个 request 注入 traceId，前端通过 `X-Trace-Id` 透传
- **错误处理**：统一格式 `{ code, message, details, traceId }`，前端按 `code` 决定提示
- **限流**：登录 5/min/IP，支付 3/min/user，其余 60/min/user
- **缓存**：商品详情 5 min，分类列表 10 min，用户态走 Redis 不走 HTTP cache

## 风险与权衡

| 风险 | 影响 | 应对 |
|---|---|---|
| 车机浏览器 WebView 版本碎片化 | 旧车机可能跑不起来 | 限定 Chromium 79+；不达标提示降级 |
| 车速来源不统一（mock / bridge / OBD） | 行车态触发不准 | JS Bridge 抽象层 + URL 参数 mock 兜底（ADR-0004） |
| 副驾乘客被错误降级 | 副驾体验差 | Demo 阶段统一行车态，副驾问题列入 open-questions |
| 支付通道未接车厂 | 真实支付不通 | Demo 用扫码 mock，PRD 阶段不阻塞 |
| Redis 单点 | 购物车数据丢失 | 加 PG 审计写入 + 启用 Redis 持久化 |
```

---

## docs/PRD.md

> **拥有**：产品需求、用户场景、用例、成功指标、锁定结论
> **上游**：project-brief / 调研 / 利益相关者访谈
> **下游**：scope / feature-spec / design 系列
> **何时更新**：用户场景增删 / 成功指标调整 / 关键需求变化（必须升版本号）

### 模板

```markdown
# 产品需求文档 PRD

> 版本：v0.1 · 日期：<YYYY-MM-DD> · 状态：Draft
> 上游：[project-brief.md](./project-brief.md) · 下游：[feature-spec.md](./feature-spec.md) · [scope.md](./scope.md)

## 版本变更 Changelog

- v0.1 (<YYYY-MM-DD>)：初稿

## Problem Statement
## Solution

## User Stories

### A. <场景名>
1. 作为<角色>，我想<能力>，以便<结果>

## 设计原则 Design Principles
## 非功能需求 Non-Functional Requirements
## 关键场景 Key Scenarios
## 锁定结论 Locked Decisions
## Open Questions
```

### 填法要点

- **User Story 用 BDD 形式**：`作为 <角色>，我想 <能力>，以便 <结果>`。能直接转成 EARS / 测试用例
- **按场景分组**：A/B/C/D... 一组对应用户的一个心智阶段（浏览 → 加购 → 支付 → 履约）
- **每条 Story 编号**：US-1 / US-2，便于 feature-spec 反向映射
- **锁定结论**：从用户访谈和 ADR 抽出来的"不再讨论"项，写进来防止 agent 重新提问
- **PRD 改了一定升版本号**，旧版本保留在 git 历史

### 反模式

- User Story 写成需求列表：`实现登录` → 不是 story，是任务
- 角色全都是"用户" → 区分主用户 / 次要用户 / 系统
- 把技术方案写进来 → 那是 architecture / feature-spec
- 没有验收标准 → 不知道做完没做完

### 示例（车机电商 Demo · PRD v0.4 节选）

```markdown
# 车机端电商平台 PRD

> 版本：v0.4 · 日期：2026-05-26 · 状态：Draft
> v0.4 变更：新增 4 份配套文档（feature-spec / design-system / 竞品调研 / mockups），让"读完即可开干"升级为"读完即可派活 + 派设计"

## Problem Statement

我是一个车主。我在车里花了大量时间——通勤等红灯、充电桩前等待 30-60 分钟、网约车上送孩子的间隙、停车场里等家人。我面前是一块 10-17 寸的车机大屏，但它能干的商业化事情只有"加油、充电、导航"。

[完整内容见 docs/PRD.md 实际仓库]

## Solution

我们做一个**车机内嵌 H5 电商平台**...

成功标准（Demo 阶段）：
1. 在 1920×720 / 1920×1080 / 2560×1440 车机分辨率下，主链路无横向溢出、无小于 88×88 触控目标
2. 行车态下完成"再买一次"全流程 ≤ 3 步、无键盘输入
3. 首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）
4. 演示视频可让车厂方一眼看懂"和现有车机生态如何挂接"

## User Stories

### A. 浏览与发现

US-1. 作为车主，我想在车机首页看到分类入口、推荐商品和限时秒杀的横屏轮播，以便快速进入感兴趣的购物场景
US-2. 作为车主，我想按一级 / 二级分类逐层浏览商品，以便聚焦到我关心的品类
US-3. 作为车主，我想通过关键字搜索商品，并能看到热门搜索词和我的搜索历史，以便快速找到目标商品
US-4. 作为车主，我想用语音搜索商品（如"我要买玻璃水"），以便在不便触屏的时候也能找到商品
US-5. 作为车主，我想在商品详情页看到主图轮播、价格、规格选择和详细描述，以便决定是否购买
US-6. 作为车主，我想看到附近自提点的距离与营业时间，以便选择"车主到附近自提"

### B. 加购与下单

US-7. 作为车主，我想在商品详情页选择规格后加入购物车，以便后续合并下单
US-8. 作为车主，我想在购物车里增减商品数量、勾选 / 取消勾选、查看合计金额，以便核对订单内容
US-9. 作为车主，我想"立即购买"跳过购物车，以便快速完成单品下单
US-10. 作为车主，我想在结算页选择收货地址、配送方式、支付方式并添加备注，以便提交订单
US-11. 作为车主，我想能够把"车辆当前位置"自动作为收货 / 自提地址候选，以便不用手动输入
US-12. 作为车主，我想对常买的商品一键"再买一次"，以便补给周期性消耗品时少操作

### F. 驾驶安全（车机专属）

US-25. 作为系统，我想在车速 > 5 km/h 时自动进入"行车态"，以便对驾驶员降低分心风险
US-26. 作为系统，我想在行车态下隐藏视频、自动播放、闪烁动效，以便符合座舱安全规范
US-27. 作为系统，我想在行车态下禁用键盘输入、密码输入、银行卡号输入，以便防止驾驶员低头操作
US-28. 作为系统，我想在行车态下只暴露"再买一次 + 默认地址 + 默认支付"的简化路径，以便驾驶员一键完成补给
US-29. 作为系统，我想在车速回落到 0 km/h 持续 3 秒后切回停车态，以便恢复完整购物能力
US-30. 作为副驾乘客，我想即使在行车态也能正常完整购物（因为我不是驾驶员），以便我不被错误降级
       **注意：Demo 阶段无法识别操作者身份，统一按行车态降级；这是已知妥协**

[完整 39 条见仓库 docs/PRD.md]

## 设计原则

- **驾驶安全优先**：NHTSA 2/12 规则、AAOS 76dp 下限是硬约束
- **横屏即一等公民**：不是把竖屏拉宽，是从横屏视觉扫描重设计
- **可瞥不可读**：视线离开道路 ≤ 2s，必须"扫一眼能识别"
- **稳过艳**：禁渐变彩虹 / 3D，动效 ≤ 240ms，行车态全关
- **状态可见**：行车 / 停车、连接 / 离线、加载 / 失败一眼可见

## 非功能需求

- 性能：FCP ≤ 1.5s (Wi-Fi) / 2.5s (4G)，TTI ≤ 3s，Bundle ≤ 300KB gzipped
- 可访问性：WCAG AA 对比度 ≥ 4.5:1，触控 ≥ 88×88 px，字号 ≥ 18px
- 兼容性：Chromium 79+，主流分辨率全适配
- 合规：用户数据境内存储（待确认 region）

## 锁定结论（不要再问）

- 运行形态：车机内嵌 H5 / WebView
- 业务范围：通用全品类电商
- 阶段策略：先做通用 Demo，不绑定具体车厂
- 起手顺序：PRD → IA → 技术架构 → UI → 前端 → 后端 → 部署
- 沟通语言：中文
- 目标分辨率：1920×720 / 1920×1080 / 2560×1440 / 2560×1600
- 技术栈：见 docs/decisions/ADR-0001 ~ ADR-0009

## Open Questions

| ID | 问题 | 当前假设 | 影响 | Owner | 截止 |
|---|---|---|---|---|---|
| Q-001 | 车厂账号 / 支付通道集成方式 | Demo 不集成，PRD v2 再定 | feature-spec §B-支付 | 用户 | 2026-07-01 |
| Q-002 | 副驾身份识别 | Demo 不识别，统一按驾驶员降级 | DrivingContext, US-30 | 用户 | 待车厂接入后 |
| Q-003 | 用户数据存储 region | 默认境内 | constraints §Compliance | 用户 | 2026-06-15 |
```

---

## docs/feature-spec.md

> **拥有**：全局**派活看板** + **路由 / 模块 ↔ OpenSpec domain 的映射索引**
> **上游**：[scope.md](./scope.md) / [PRD.md](./PRD.md) / `openspec/specs/`
> **下游**：所有 agent 看板入口；从这里链到 `openspec/specs/<domain>/spec.md` 或 `openspec/changes/<id>/`
> **何时更新**：新认领 / 完成 task；新增 / 完成 change；新加路由
>
> ⚠️ **本文件不再持有 requirements / scenarios 等 spec 主体**——那些已经移到 `openspec/specs/<domain>/spec.md`。本文件只做派活和映射。

### 模板

```markdown
# Feature Spec · 派活看板 + 路由映射

> 版本：v1.0 · 日期：<YYYY-MM-DD> · 状态：Draft
> **本文件是派活看板 + 路由 → OpenSpec domain 的映射索引**。spec 主体在 `openspec/specs/<domain>/spec.md`。

## 阅读约定
- 页面编号 `P-NN` / 跨页面模块 `M-XX` / 后端模块 `BE-xxx`
- 状态固定 4 个值：`🟡 unclaimed` / `🔵 in-progress` / `🟢 done` / `🔴 blocked`
- 跨场景行为差异图标：`✅ 完整保留` / `⚠️ 降级` / `🚫 隐藏`

## 🚦 派活看板 Implementation Status

### 页面 Pages

| ID | 名称 | 路由 | 状态 | Owner | OpenSpec domain | 关联 mockup |
|---|---|---|---|---|---|---|

### 跨页面模块 Modules

| ID | 名称 | 状态 | Owner | OpenSpec domain |
|---|---|---|---|---|

### 后端模块 Backend Modules

| ID | 名称 | 状态 | Owner | OpenSpec domain |
|---|---|---|---|---|

## 路由 → Domain 映射

| 路由 | OpenSpec domain |
|---|---|

## 🔁 进行中的 Changes

| Change ID | 影响 domains | 状态 | Owner |
|---|---|---|---|

## User Story 反向映射

| Story ID | 关联 P / M / BE | OpenSpec domain |
|---|---|---|---|
```

### 填法要点

- **派活看板放顶部**：进来直接知道还有什么可认领
- **每个 P / M / BE 都关联一个 OpenSpec domain**：点链接能跳到 `openspec/specs/<domain>/spec.md`
- **路由 → domain 映射**：让 agent 看 URL 就知道去哪个 spec 文件
- **进行中的 changes 表**：让 agent 看 domain 就知道有没有 in-progress 工作可能冲突
- **User Story 反向映射**：每条 Story 必须对应至少一个 P / M / BE，并指向一个 domain
- **跨场景图标**全文统一：行车态 = 🚗 / 离线 = 📡 / 未登录 = 🔒，在阅读约定里声明

### 反模式

- 把 requirements / scenarios / 接口路径全文写在本文件 → 那是 `openspec/specs/<domain>/spec.md` 的工作
- 没有 domain 映射列 → agent 不知道去哪儿看 spec 主体
- 派活看板状态自定义（"reviewing" / "qa-ing"） → 破坏可读性
- "进行中的 changes" 表不更新 → 多 agent 撞车

### 示例（车机电商 Demo · feature-spec.md 完整）

```markdown
# 车机电商 · Feature Spec · 派活看板 + 路由映射

> 版本：v1.0 · 日期：2026-05-26 · 状态：Draft
> spec 主体在 [openspec/specs/](../openspec/specs/)；本文件只做派活和导航。

## 阅读约定

- **页面** `P-NN`、**模块** `M-XX`、**后端** `BE-xxx`
- 状态固定 4 个值：`🟡 unclaimed` / `🔵 in-progress` / `🟢 done` / `🔴 blocked`
- **行车态行为图标**：`✅ 完整保留` / `⚠️ 降级` / `🚫 隐藏`

## 🚦 派活看板

### 页面 Pages

| ID | 名称 | 路由 | 状态 | Owner | OpenSpec domain | 关联 mockup |
|---|---|---|---|---|---|---|
| P-01 | 首页 | `/` | 🔵 in-progress | claude-home | [catalog-home](../openspec/specs/catalog-home/spec.md) | mall-home.jsx |
| P-02 | 分类 | `/c/:cid` | 🟡 unclaimed | — | [catalog](../openspec/specs/catalog/spec.md) | mall-category.jsx |
| P-04 | 商品详情 | `/p/:pid` | 🟢 done | claude-detail | [catalog](../openspec/specs/catalog/spec.md) | mall-detail.jsx |
| P-05 | 购物车 | `/cart` | 🔵 in-progress | claude-cart-impl | [cart](../openspec/specs/cart/spec.md) | mall-cart.jsx |
| P-06 | 结算 | `/checkout` | 🟡 unclaimed | — | [order](../openspec/specs/order/spec.md) | mall-checkout.jsx |
| P-12 | 登录 | `/login` | 🔵 in-progress | claude-auth | [auth-login](../openspec/specs/auth-login/spec.md) | mall-login.jsx |
| P-13 | 行车态首页 | `/driving` | 🔴 blocked | claude-driving | [driving-mode](../openspec/specs/driving-mode/spec.md) | mall-driving.jsx |

### 跨页面模块 Modules

| ID | 名称 | 状态 | Owner | OpenSpec domain |
|---|---|---|---|---|
| M-04 | 路由 & 转场 | 🟢 done | claude-shell | platform-shell |
| M-12 | DrivingContext | 🔴 blocked | claude-driving | [driving-mode](../openspec/specs/driving-mode/spec.md) |
| M-13 | JS Bridge 抽象 | 🟡 unclaimed | — | [driving-mode](../openspec/specs/driving-mode/spec.md) |

### 后端模块 Backend Modules

| ID | 名称 | 状态 | Owner | OpenSpec domain |
|---|---|---|---|---|
| BE-cart | 购物车服务 | 🔵 in-progress | claude-cart-impl | [cart](../openspec/specs/cart/spec.md) |
| BE-order | 订单服务 | 🟡 unclaimed | — | [order](../openspec/specs/order/spec.md) |
| BE-payment | 支付服务（mock） | 🟡 unclaimed | — | [payment](../openspec/specs/payment/spec.md) |
| BE-user | 账号服务 | 🔵 in-progress | claude-auth | [auth-login](../openspec/specs/auth-login/spec.md), [auth-session](../openspec/specs/auth-session/spec.md) |

## 路由 → Domain 映射

| 路由 | OpenSpec domain | 备注 |
|---|---|---|
| `/` | catalog-home | 首页推荐 + 4 张玻璃卡 |
| `/c/:cid` | catalog | 分类页 |
| `/p/:pid` | catalog | 商品详情 |
| `/cart` | cart | |
| `/checkout` | order | 结算 |
| `/pay/:orderId` | order, payment | 支付 |
| `/orders`, `/orders/:id` | order | 订单 |
| `/login` | auth-login | 登录入口 |
| `/qr-auth/:sessionId` | auth-login | 手机端扫码授权页 |
| `/me/*` | user-profile | 个人中心 |
| `/driving` | driving-mode | 行车态首页 |

## 🔁 进行中的 Changes

| Change ID | 影响 domains | 状态 | Owner |
|---|---|---|---|
| [add-qr-login](../openspec/changes/add-qr-login/) | auth-login (ADDED), auth-session (MODIFIED), driving-mode (MODIFIED) | 🔵 apply | claude-auth |
| [tighten-driving-mode-detection](../openspec/changes/tighten-driving-mode-detection/) | driving-mode (MODIFIED) | 🔴 blocked | claude-driving |
| [add-cart-quick-buy](../openspec/changes/add-cart-quick-buy/) | cart (MODIFIED), catalog (MODIFIED) | 🔵 propose | claude-cart-impl |

## User Story 反向映射

| Story | 关联 P / M / BE | OpenSpec domain | 状态 |
|---|---|---|---|
| US-1 ~ US-6 浏览发现 | P-01 ~ P-04 | catalog, catalog-home | 部分 done |
| US-7 加购到购物车 | P-04, P-05, BE-cart, BE-catalog | catalog, cart | 🔵 |
| US-8 改数量 / 勾选 / 合计 | P-05, BE-cart | cart | 🔵 |
| US-9 立即购买 | P-04 → P-06, BE-cart | catalog, cart, order | 🟡 |
| US-12 再买一次 | P-01 B-105, P-09, BE-cart | cart, order | 🟡 |
| US-13 ~ US-15 支付 | P-07, BE-payment | payment | 🟡 |
| US-16 ~ US-19 订单 | P-08, P-09, BE-order | order | 🟡 |
| US-20 ~ US-24 账号 | P-10 ~ P-12, BE-user | auth-login, auth-session, user-profile | 🔵 |
| US-25 ~ US-29 行车态 | P-13, M-12, M-13 | driving-mode | 🔴 blocked |
| US-30 副驾乘客行车态 | — | driving-mode（已知妥协，见 Q-002） | — |
```

---

## docs/backend-spec.md

> **拥有**：后台模块、数据模型、业务规则、本地依赖
> **上游**：architecture / constraints / 关键 ADR
> **下游**：`services/**` 实现 / api-contracts
> **何时更新**：模块拆分 / 数据 schema / 业务规则变化

### 模板

```markdown
# Backend Spec

> 状态：Draft · 日期：<YYYY-MM-DD>

## Runtime
- Language / Framework / Package manager / 启动命令

## Modules
| Module | Responsibility | Routes | Dependencies |

## Data Model
| Entity | Key fields | Relationships | Indexes | 迁移策略 |

## 业务规则
| Rule | 触发条件 | 执行机制 |

## 状态机
## Background Jobs
## Local Dependencies
## Observability
## 安全 Security
```

### 填法要点

- **Modules** 列**深模块**：catalog / cart / order / payment / user。不列每个 service 类
- **Data Model** 写**业务字段**，不写每个 timestamp / uuid。索引和迁移策略要写
- **业务规则**列那些"系统必须执行"的硬规则，每条带触发条件和执行点
- **状态机**用文本图：`CREATED → pay → PAID → ship → SHIPPED`
- **Local Dependencies** 写明本地怎么跑起来：docker-compose / Testcontainers / managed dev DB
- **错误码命名**：`MODULE_THING_REASON`（`CART_QTY_INVALID`）

### 反模式

- 列所有路由 → 路由在 api-contracts 和 feature-spec，这里只列模块对外接口模式
- 写"以后再加" → 把字段先列出来，加 status: pending
- 业务规则散在各模块描述里 → 抽出来单独一节，便于和 constraints / state machine 对照

### 示例（车机电商 Demo · backend-spec 节选）

```markdown
# Backend Spec

> 状态：Draft · 日期：2026-05-26
> 上游：[architecture.md](./architecture.md) · ADR-0002, 0003

## Runtime

- Language: TypeScript (Node 20)
- Framework: Fastify 4 + zod 3 (schema-first)
- Package manager: pnpm
- 启动命令: `pnpm --filter @jdo/api dev` (port 3000)
- 测试: `pnpm --filter @jdo/api test` (vitest)

## Modules

| Module | Responsibility | Routes 前缀 | Dependencies |
|---|---|---|---|
| `gateway` | 鉴权 / 限流 / CORS / traceId / 错误格式化 | (middleware) | Redis (限流计数), JWT |
| `catalog` | 商品 / 分类 / 搜索 | `/products`, `/categories`, `/search` | Postgres, Redis (热门缓存) |
| `cart` | 购物车 CRUD + 合并 + 失效检测 | `/cart` | Redis (主), Postgres (审计) |
| `order` | 订单创建 / 状态流转 / 列表 | `/orders` | Postgres, `order-state-machine` |
| `payment` | 支付二维码 + 回调（mock） | `/payments` | order (回调), Redis (token) |
| `user` | 登录 / 注册 / 地址 / 个人中心 | `/auth`, `/me` | Postgres, Redis (sms code), bcrypt |
| `fulfillment` | 物流轨迹 mock + 自提点 | `/fulfillment` | Postgres, 第三方地图 mock |

## Data Model

| Entity | Key fields | Relationships | Indexes | 迁移策略 |
|---|---|---|---|---|
| User | id (uuid PK), phone (unique), nickname, theme_pref, created_at | hasMany Address, Order | phone | Prisma migrate |
| Address | id, user_id (FK), label, detail, lng_lat (point), is_default, created_at | belongsTo User | user_id, (user_id, is_default) | Prisma migrate |
| Category | id, parent_id (FK self), name, icon_url, sort_order | hasMany Product | parent_id, sort_order | Prisma migrate, seed |
| Product | id, category_id (FK), title, images (jsonb), price_cents, status (enum: active/draft/archived) | belongsTo Category, hasMany Sku | category_id, status | seed 30 个 demo 商品 |
| Sku | id, product_id (FK), specs (jsonb), price_cents, stock | belongsTo Product | product_id | — |
| Order | id, user_id (FK), state (enum), total_cents, address_snapshot (jsonb), created_at | belongsTo User, hasMany OrderItem | user_id, state, created_at desc | Prisma migrate |
| OrderItem | id, order_id (FK), sku_id, qty, price_snapshot_cents | belongsTo Order | order_id | — |
| Payment | id, order_id (FK), method (enum: wechat/alipay), qr_url, state (enum) | belongsTo Order | order_id, state | — |
| CartAudit | id, user_id, action (enum), payload (jsonb), created_at | — | user_id, created_at desc | 仅追加，按月分区 |

**所有金额用 `*_cents BIGINT`**，避免浮点。

## 业务规则

| Rule | 触发条件 | 执行机制 |
|---|---|---|
| 同 SKU 重复加购累加 qty | `POST /cart/items` 已存在该 sku | cart 模块 service 层 |
| qty 上限 99 | 任何 cart 操作 | zod schema + service 二次校验 |
| 库存为 0 时不允许下单 | `POST /orders` | order 模块开事务时检查 |
| 订单未支付超 30 分钟自动取消 | 后台 job | bull queue + delayed job |
| 已发货订单不可取消 | `DELETE /orders/:id` | state machine 拒绝转换 |
| 支付成功后 5s 内幂等回调 | 多次回调 | payments 表加 unique(`order_id, state=PAID`) |
| 同一手机号 60s 内只能发一次验证码 | `POST /auth/sms` | Redis SETNX with TTL |
| 行车态用户下单走"快速下单" | 客户端 header `X-Driving-State: 1` | gateway 拦截 → 路由到 `/orders/quick` |

## 状态机

**订单**：

```
CREATED  ──pay──→  PAID  ──ship──→  SHIPPED  ──deliver──→  DELIVERED
   │                 │
   ├──cancel(<30m)──→ CANCELED
   └──timeout(30m)──→ CANCELED
                     │
                     └──refund_request──→ REFUNDING ──approve──→ REFUNDED
                                                    └──reject──→ PAID
```

实现在 `packages/order-state-machine/`，纯函数 `transition(state, event, ctx) → newState | error`。order 模块只调用这个包。

**支付**：

```
PENDING ──user_scan──→ SCANNED ──confirm──→ SUCCESS
                                └──cancel──→ FAILED
   └──timeout(5m)──→ EXPIRED
```

## Background Jobs

| Job | Trigger | 职责 | 重试 / 幂等 |
|---|---|---|---|
| `order:expire` | 创建订单后 30min | 未支付订单转 CANCELED | 单次执行，按 order_id 幂等 |
| `cart:cleanup` | 每日 03:00 | 清理 30 天前 cart_audit | 幂等（按日期） |
| `payment:reconcile` | 每 5min | 对账未回调的支付（mock） | 按 payment_id 幂等 |

队列：BullMQ + Redis。失败重试 3 次，超限进死信。

## Local Dependencies

| Dependency | Local URL | 启动方式 |
|---|---|---|
| Postgres 16 | localhost:5432 | `docker compose up -d db` |
| Redis 7 | localhost:6379 | `docker compose up -d cache` |
| 支付 mock | http://localhost:4001 | `pnpm --filter @jdo/payment-mock dev` |
| SMS mock | 内置 dev mode（验证码固定 `111111`） | — |

`infra/docker-compose.yml` 起 db + cache。其它依赖通过 workspace 包跑。

## Observability

- **Logs**：JSON。字段 `ts / level / traceId / userId / route / latencyMs / err`。生产用 Logflare
- **Metrics**：Prometheus 路径 `/metrics`。指标：`http_requests_total{route, status}`, `business_orders_created_total`, `business_payment_success_total`
- **Traces**：OpenTelemetry，通过 `@opentelemetry/instrumentation-fastify`。traceId 透传给前端
- **错误上报**：Sentry（仅生产），含 traceId 关联

## 安全

- **鉴权**：JWT (HS256)。Access token 1h，Refresh token 30d。Refresh 走 `/auth/refresh`
- **密钥**：从 Railway secret manager 注入，本地从 `.env`（gitignored）
- **输入校验**：所有路由 zod schema，缺失 schema 不允许注册
- **限流**：登录 5/min/IP，支付 3/min/user，sms 1/60s/phone，其余 60/min/user
- **CORS**：允许 vercel 域名 + localhost
- **审计**：登录 / 下单 / 退款 / 修改地址 → 写 `audit_log` 表
- **越权**：所有 `/me/*` 强制 `userId = ctx.userId`，对象级授权（BOLA 防护）
```

---

## docs/api-contracts.md

> **拥有**：所有对外 API 的契约，含路径、请求 / 响应 schema、错误格式、鉴权
> **上游**：backend-spec
> **下游**：前端 client / mock-server / contract tests
> **何时更新**：新增 / 修改 / 删除 endpoint、错误码、字段名（**先改这里再改实现**）

### 模板

```markdown
# API Contracts

> 状态：Draft · 日期：<YYYY-MM-DD>

## Source Of Truth
- Human-readable: 本文件
- Machine-readable: `packages/api-contracts/openapi.yaml`
- Generated client: `packages/api-client/`

## Base URLs
| Env | URL |

## Error Format
```json
{ "code": "...", "message": "...", "details": {}, "traceId": "..." }
```

## Auth
- 方式 / 生命周期 / Dev mock

## Endpoints
| Method | Path | Request | Response | Errors | Auth |

## Pagination
## Versioning
```

### 填法要点

- **Source of Truth**：本文件人读，OpenAPI 机器读，两边必须一致。CI 跑契约校验
- **错误码统一**：`MODULE_THING_REASON`，全部在表里列出
- **每个 endpoint 一行**，复杂的展开：方法 / 路径 / 必填字段 / 关键响应字段 / 错误码列表 / 是否需登录
- **Pagination**：cursor or offset，定好一种风格全文统一
- **Versioning**：`/api/v1` 锁定多久，破坏性变更怎么走

### 反模式

- 每个 endpoint 写 3 页 schema → 转 OpenAPI 文件，本文件只做导航
- 错误码每个 endpoint 自己定义 → 必须统一一张表
- 不写"未登录"和"对象级越权"行为 → 安全漏洞高发区

### 示例（车机电商 Demo · api-contracts 节选）

```markdown
# API Contracts v1

> 状态：Draft · 日期：2026-05-26

## Source Of Truth

- Human-readable: 本文件
- Machine-readable: `packages/api-contracts/openapi.yaml`
- Generated client: `packages/api-client/` (由 `pnpm generate:api-client` 生成)

CI 跑 `pnpm test:contract` 校验后端实现与 OpenAPI 一致。

## Base URLs

| Env | URL |
|---|---|
| local | http://localhost:3000/api/v1 |
| staging | https://api-staging.jdo.example.com/api/v1 |
| prod | https://api.jdo.example.com/api/v1 |

## 全局响应格式

成功：
```json
{ "data": <T>, "traceId": "01J..." }
```

错误：
```json
{
  "code": "CART_QTY_INVALID",
  "message": "数量必须在 1-99 之间",
  "details": { "qty": 100 },
  "traceId": "01J..."
}
```

## 错误码表

| code | HTTP | 说明 |
|---|---|---|
| `AUTH_REQUIRED` | 401 | 未登录 |
| `AUTH_INVALID_TOKEN` | 401 | token 无效 / 过期 |
| `AUTH_FORBIDDEN` | 403 | 越权 |
| `VALIDATION_FAILED` | 400 | zod schema 不匹配 |
| `RATE_LIMITED` | 429 | 超限 |
| `CART_QTY_INVALID` | 400 | 购物车数量越界 |
| `SKU_NOT_FOUND` | 404 | SKU 不存在 |
| `SKU_OUT_OF_STOCK` | 409 | 库存不足 |
| `ORDER_STATE_INVALID` | 409 | 订单状态不允许此操作 |
| `PAYMENT_EXPIRED` | 410 | 支付二维码超时 |

## Auth

- 方式：JWT (HS256) via `Authorization: Bearer <accessToken>`
- Access token TTL: 1h
- Refresh token TTL: 30d (`POST /auth/refresh`)
- Dev mock login：`POST /auth/dev-login { phone }` → 直接返回 token（仅 NODE_ENV=development）

## Endpoints

### Auth

| Method | Path | Request | Response | Errors | Auth |
|---|---|---|---|---|---|
| POST | `/auth/sms` | `{ phone }` | `{ data: { sentAt } }` | RATE_LIMITED, VALIDATION_FAILED | no |
| POST | `/auth/login` | `{ phone, code }` | `{ data: { accessToken, refreshToken, user } }` | AUTH_INVALID_TOKEN, VALIDATION_FAILED | no |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ data: { accessToken } }` | AUTH_INVALID_TOKEN | no |
| POST | `/auth/qr-login/start` | — | `{ data: { qrCode, sessionId } }` | — | no |
| GET | `/auth/qr-login/poll?sessionId=...` | — | `{ data: { state: pending\|scanned\|confirmed, ... } }` | — | no |

### Cart

| Method | Path | Request | Response | Errors | Auth |
|---|---|---|---|---|---|
| GET | `/cart` | — | `{ data: { items: [...], totalCents } }` | AUTH_REQUIRED | yes |
| POST | `/cart/items` | `{ skuId, qty, idempotencyKey }` | `{ data: { items, totalCents } }` | CART_QTY_INVALID, SKU_NOT_FOUND, SKU_OUT_OF_STOCK | yes |
| PATCH | `/cart/items/:id` | `{ qty }` | 同上 | CART_QTY_INVALID, AUTH_FORBIDDEN | yes |
| DELETE | `/cart/items/:id` | — | `{ data: { items, totalCents } }` | AUTH_FORBIDDEN | yes |
| POST | `/cart/merge` | `{ items: [{ skuId, qty }] }` | `{ data: { items, totalCents } }` | VALIDATION_FAILED | yes |

### Orders

| Method | Path | Request | Response | Errors | Auth |
|---|---|---|---|---|---|
| POST | `/orders` | `{ addressId, paymentMethod, items, note? }` | `{ data: { orderId, paymentQrUrl } }` | SKU_OUT_OF_STOCK, VALIDATION_FAILED | yes |
| POST | `/orders/quick` | `{ skuId }` (行车态快速下单) | 同上 | 同上 | yes |
| GET | `/orders?cursor=...&limit=20` | — | `{ data: { items: [...], nextCursor } }` | AUTH_REQUIRED | yes |
| GET | `/orders/:id` | — | `{ data: { order, items, payment, tracking } }` | AUTH_FORBIDDEN | yes |
| DELETE | `/orders/:id` | — | `{ data: { state: CANCELED } }` | ORDER_STATE_INVALID | yes |

## Pagination

- Cursor based。`?cursor=<opaque>&limit=20`
- Response 含 `nextCursor`，null 表示没了
- limit 上限 100

## Versioning

- 当前：`/api/v1`，至少维护到 2027-06
- 破坏性变更：进 `/api/v2`，`/api/v1` 并行至少 6 个月
- 非破坏性扩展（新增字段 / endpoint）：直接进 v1

## 对象级授权（BOLA 防护）

所有 `/me/*` 和带资源 ID 的接口（`/orders/:id`、`/addresses/:id` 等）必须强制 `resource.userId = ctx.userId`，否则 `AUTH_FORBIDDEN`。前端只隐藏按钮**不算授权**。
```

---

## docs/testing-strategy.md

> **拥有**：测试层级、覆盖目标、命令、CI gate / release gate
> **上游**：constraints / architecture
> **下游**：CI 配置 / 实施任务的 verification
> **何时更新**：测试栈变更 / 新加测试层级 / CI gate 调整

### 模板

```markdown
# Testing Strategy

## Test Pyramid
| Layer | Tool | Scope | Required In CI |

## Required Coverage
## Test Data
## Commands
## CI Gate
```

### 填法要点

- **每层都填具体工具**，不写"vitest 或 jest 都行"
- **Required Coverage** 写**业务关键面**：状态机所有合法 / 非法转换、鉴权 401/403、错误格式、边界
- **Test Data**：seed 策略 + isolation（事务回滚 / 独立 schema）
- **Commands** 都列出，便于复制粘贴；和 CI gate 对齐
- **CI gate 与 release gate 分开**

### 反模式

- "需要测试" → 没用，必须写命令
- 覆盖率写 80% → 数字没意义，写"哪些必须有测试"
- e2e 在每次 PR 都跑 → 太慢，应该放 release gate

### 示例（车机电商 Demo · testing-strategy）

```markdown
# Testing Strategy

> 状态：Draft · 日期：2026-05-26

## Test Pyramid

| Layer | Tool | Scope | Required In CI |
|---|---|---|---|
| Unit | vitest | 纯函数 / 状态机 / 格式化 / 权限判断 / 金额计算 | yes |
| Backend route/service | vitest + Fastify `inject` | 路由 / service / repository / 错误格式 / 鉴权 | yes |
| Integration | vitest + Testcontainers (Postgres + Redis) | 真实 DB + 缓存 + 队列 | yes |
| Contract | `@redocly/cli` + custom OpenAPI validator | OpenAPI vs 实际响应 | yes |
| Frontend integration | vitest + testing-library + MSW | 浏览器和 Node 双端拦截，覆盖 success/empty/error/slow | yes |
| Visual regression | Playwright + percy.io | mockup 关键页面截图对比 | release gate |
| E2E | Playwright | 主链路 + 关键异常（行车态 / 弱网） | release gate |
| Accessibility | Playwright + axe-core | WCAG AA + 触控目标 ≥ 88px | yes |

## Required Coverage

| Area | Required tests |
|---|---|
| 状态机（order / payment / cart-item） | 所有合法转换 + 所有非法转换抛错 |
| 鉴权 | 401（无 token）/ 401（过期 token）/ 403（越权）/ 200（有效）每个 endpoint |
| 错误格式 | 每个错误码至少一个测试断言响应 shape |
| 边界条件 | qty=0/1/99/100 / 空购物车 / 空订单 / 库存=0 / 价格=0 |
| 行车态 | DrivingContext 状态转换 + 行车态下禁用键盘断言 + URL 参数 mock 触发 |
| 设计 token | 颜色对比度 ≥ 4.5:1 自动断言 / 字号 ≥ 18 / 触控 ≥ 88px |

## Test Data

- **Seed**：`tools/seed/` 下分 `seed:demo`（演示数据）和 `seed:test`（测试数据）
- **Isolation**：
  - Unit/Route：纯内存
  - Integration：每个测试一个 Postgres schema（用 `BEGIN; ... ROLLBACK;` 包住）
  - E2E：每次跑前重置 DB + Redis（`pnpm db:reset`）
- **Reset**：`pnpm db:reset && pnpm seed:demo`

## Commands

| Command | Purpose | 期望耗时 |
|---|---|---|
| `pnpm lint` | ESLint + Stylelint | < 30s |
| `pnpm typecheck` | tsc --noEmit (workspaces) | < 60s |
| `pnpm test` | unit + backend route | < 90s |
| `pnpm test:integration` | 真实 DB / Redis | < 5min |
| `pnpm test:contract` | OpenAPI 校验 | < 30s |
| `pnpm test:a11y` | 可访问性 | < 60s |
| `pnpm test:contrast` | 颜色对比度 | < 10s |
| `pnpm e2e` | Playwright 主链路 | < 8min |
| `pnpm build` | turbo build | < 3min |

## CI Gate

每个 PR：
- [x] lint
- [x] typecheck
- [x] unit + backend route tests
- [x] integration tests
- [x] contract verification
- [x] a11y + contrast
- [x] build
- [x] bundle size check（不超 300KB gzipped）
- [x] Lighthouse CI（FCP / LCP / TBT 在 budget 内）

发布前 gate（merge to main 或打 tag）：
- [x] e2e
- [x] visual regression
- [x] security check (`pnpm audit` + 自定义密钥扫描)
- [x] migration dry run
```

---

## docs/integration-plan.md

> **拥有**：前端从 mock 到真实后端的联调阶段路径
> **上游**：api-contracts / backend-spec
> **下游**：前后端实施排期
> **何时更新**：阶段切换 / 新增 phase / 联调工具变更

### 模板

```markdown
# Frontend-Backend Integration Plan

## Local Ports
| Service | URL |

## Phase A · Frontend With Mock API
## Phase B · Backend API Ready
## Phase C · Contract Lock
## Phase D · E2E

## Environment Flags
```

### 填法要点

- **每个 phase 写**前置条件 + 产出 + 退出条件
- **Phase A** mock 必须覆盖 success/empty/error/slow/auth expired 5 个场景
- **Phase B → C**：从切到真实 API 到锁定契约的过渡
- **环境变量** 给完整 dotenv 片段
- **不要把 phase 当任务**，phase 是状态

### 反模式

- 每个 phase 只写"做某事" → 没有退出条件就过不去下一 phase
- mock 不按契约 → Phase B 切换时撕裂

### 示例（车机电商 Demo · integration-plan 节选）

```markdown
# Frontend-Backend Integration Plan

> 状态：Draft · 日期：2026-05-26

## Local Ports

| Service | URL | 启动 |
|---|---|---|
| frontend | http://localhost:5173 | `pnpm --filter @jdo/h5 dev` |
| backend | http://localhost:3000 | `pnpm --filter @jdo/api dev` |
| api docs (Swagger UI) | http://localhost:3000/docs | (随后端) |
| Postgres | localhost:5432 | `docker compose up -d db` |
| Redis | localhost:6379 | `docker compose up -d cache` |
| payment mock | http://localhost:4001 | `pnpm --filter @jdo/payment-mock dev` |

一键启动：`pnpm dev:all` （并发起所有服务）

## Phase A · Frontend With Mock API

**前置**：api-contracts.md 已定义 happy path endpoints；OpenAPI 草稿就绪

**做什么**：
- 前端用 MSW 拦截 `/api/v1/*`
- mock handlers 放 `tools/mock-server/handlers/`
- 数据 fixtures 放 `tools/mock-server/fixtures/`
- 覆盖场景（每个 endpoint 都要有）：
  - success
  - empty（空列表 / 空购物车）
  - error 400 (VALIDATION_FAILED)
  - error 401 (AUTH_REQUIRED)
  - slow（500ms ~ 3s 随机延迟）
  - auth expired（先 200 再 401，触发 refresh 流程）

**产出**：21 屏 UI 跑通 + tweaks panel 可切换场景

**退出条件**：所有 P-01 ~ P-13 屏不依赖真实后端能跑完整 happy path + 至少 2 个错误 path

## Phase B · Backend API Ready

**前置**：Phase A done；后端 `gateway / catalog / cart / order / payment / user` 模块实现完成

**做什么**：
- 前端通过 `VITE_USE_MOCK_API=false` 切到真实 API
- Vite dev server 配 proxy：`/api → http://localhost:3000`
- 部分模块（如 payment）继续用 mock，逐个迁移
- 修复 mock 与真实 API 的字段不一致

**产出**：localhost 全链路通

**退出条件**：
- 主链路在真实后端跑通
- 5 个错误 path 行为一致（mock vs 真实）
- traceId 能从前端透传到后端 log

## Phase C · Contract Lock

**前置**：Phase B done

**做什么**：
- `packages/api-contracts/openapi.yaml` 锁定
- 前端从 OpenAPI 生成 client：`pnpm generate:api-client`
- 后端跑 contract test：`pnpm test:contract` 校验响应 shape
- 不再允许"先改实现再补 OpenAPI"，必须反过来

**产出**：OpenAPI 是单一真相，前后端从此对齐

**退出条件**：
- `pnpm test:contract` 全绿
- 前端 client 完全自动生成（无手写 fetch）

## Phase D · E2E

**前置**：Phase C done

**做什么**：
- Playwright 在 CI 起完整本地栈
- 启动顺序：db → cache → backend → frontend
- seed：`pnpm seed:e2e`
- 用例：`tools/e2e/specs/`
  - `happy-path.spec.ts` 完整购物链路
  - `driving-state.spec.ts` 行车态降级
  - `auth-expired.spec.ts` token 过期重登
  - `offline.spec.ts` 弱网 / 离线

**产出**：每次 release 跑全套，主链路覆盖

**退出条件**：
- 至少 4 个 spec 覆盖核心场景
- CI 跑通耗时 ≤ 10min

## Environment Flags

```dotenv
# 前端
VITE_API_BASE_URL=/api/v1
VITE_USE_MOCK_API=true           # Phase A; false at Phase B+
VITE_ENABLE_TWEAKS_PANEL=true    # 演示用，prod 关
VITE_DEFAULT_SPEED=0             # URL 参数 mock 车速兜底

# 后端
API_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/jdo_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-only-replace-in-prod
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
LOG_LEVEL=debug

# Observability
# SENTRY_DSN=
# OTEL_EXPORTER_OTLP_ENDPOINT=

# Feature flags
ENABLE_DEBUG_TOOLS=true
```
```

---

## docs/ai-coding-workflow.md

详见 [ai-coding-workflow.md](./ai-coding-workflow.md) 完整版。本节给生成模板，实际填充时引用上下文层 / AI 编码循环 / verification 模式。

### 模板

```markdown
# AI Coding Workflow

> 状态：Draft · 日期：<YYYY-MM-DD>

## Context Layers

| Layer | Files | Purpose | 每次提示都进上下文？ |

## AI 编码循环
## 任务粒度
## 验证证据
## Review Gates
## Adversarial Review
```

详细写法和示例见 [ai-coding-workflow.md](./ai-coding-workflow.md)。

---

## docs/task-plan.md

> **拥有**：第一阶段任务总目录、实施顺序、完成定义
> **上游**：scope §第一条切片 / feature-spec §派活看板
> **下游**：specs/<feature>/tasks.md / 实际 PR
> **何时更新**：切片完成 / 任务认领 / 新增任务

### 模板

```markdown
# Task Plan

> 状态：Draft · 日期：<YYYY-MM-DD>

## 第一条切片 First Vertical Slice
## 任务清单
| ID | 任务 | 关联 | 文件 | 验证 | 状态 |
## Implementation Order
## Done When
```

### 填法要点

- **任务 ID** 用 `T-NN`，全局唯一
- **关联** 写 scope §xxx 或 requirement R-NN 或 ADR-NNNN
- **文件** 写预计触碰路径（glob OK）
- **验证** 写具体命令 + 期望结果
- **状态** 用 4 固定值（同 feature-spec）

### 反模式

- 任务粒度大到一周 → 拆
- 任务无验证方式 → 拒收
- 不关联 scope / requirement → 无法回溯

### 示例（车机电商 Demo · task-plan 节选）

```markdown
# Task Plan

> 状态：Draft · 日期：2026-05-26
> 上游：[scope.md §第一条切片](./scope.md) · [feature-spec.md §派活看板](./feature-spec.md)

## 第一条切片 First Vertical Slice

- 目标：7 步完整购物链路在 1920×1080 上跑通
- 验收：见 [scope.md §第一条切片](./scope.md)

## 任务清单

| ID | 任务 | 关联 | 文件 | 验证 | 状态 |
|---|---|---|---|---|---|
| T-1 | Turborepo + pnpm workspaces 脚手架 | ADR-0006 | 全局 | `pnpm install && pnpm build` 成功 | 🟢 |
| T-2 | `apps/h5` Vite + React 18 + TS 骨架 | ADR-0001 | `apps/h5/**` | `pnpm --filter @jdo/h5 dev` 起得起 + 显示 hello | 🟢 |
| T-3 | `services/api` Fastify + zod 骨架 | ADR-0002 | `services/api/**` | `pnpm --filter @jdo/api dev` 起得起 + `/health` 返回 200 | 🟢 |
| T-4 | `packages/design-tokens` 落地 token | ADR-0007 | `packages/design-tokens/**` | tokens.css 导出 + tokens.ts 类型 + Tailwind 引用 | 🟢 |
| T-5 | `packages/order-state-machine` 状态机包 | ADR + state machine 表 | `packages/order-state-machine/**` | `pnpm --filter @jdo/order-state-machine test` 全绿 | 🔵 |
| T-6 | `infra/docker-compose.yml` (Postgres + Redis) | architecture | `infra/**` | `docker compose up -d` + 能连得上 | 🟢 |
| T-7 | P-01 首页骨架 + 4 张玻璃卡 | feature-spec P-01 | `apps/h5/src/pages/home/**` | mockups/mall-home.jsx 对比一致 + a11y 测试通过 | 🔵 |
| T-8 | P-04 商品详情 | feature-spec P-04 | `apps/h5/src/pages/product/**` | 显示主图 / 规格 / 价格 / 加购 CTA | 🟡 |
| T-9 | BE-catalog 商品 / 分类接口 | feature-spec BE-catalog | `services/api/src/modules/catalog/**` | `pnpm test:integration --grep catalog` 全绿 | 🟡 |
| T-10 | BE-cart 购物车接口 + Redis | feature-spec BE-cart | `services/api/src/modules/cart/**` | route + integration tests 全绿 | 🔵 |
| T-11 | P-05 购物车页 + CartStore | feature-spec P-05 | `apps/h5/src/pages/cart/**`, `apps/h5/src/stores/cart.ts` | mockups 对比 + 离线测试 | 🔵 |
| T-12 | P-06 结算页 + P-07 支付页 | feature-spec P-06/07 | `apps/h5/src/pages/{checkout,pay}/**` | 跳转流程通 + 二维码 mock | 🟡 |
| T-13 | BE-order 订单接口 + 状态机集成 | feature-spec BE-order | `services/api/src/modules/order/**` | 状态机所有转换有测试 | 🟡 |
| T-14 | DrivingContext + URL 参数 mock | ADR-0004 + M-12 | `apps/h5/src/modules/driving/**` | `?speed=30` 切到行车态 + 测试通过 | 🟡 |
| T-15 | P-13 行车态首页 + 再买一次 | feature-spec P-13 + IP-01 | `apps/h5/src/pages/driving/**` | 行车态下 3 步完成下单 + 全程无键盘 | 🟡 |
| T-16 | Vercel + Railway 部署 | ADR-0005 | `.github/workflows/**`, `vercel.json`, `railway.toml` | 演示 URL 可访问 | 🟡 |

## Implementation Order

```
T-1 → T-2, T-3, T-6 (并行)
  → T-4, T-5 (并行)
  → T-7, T-9 (并行)
  → T-10, T-11 (cart 前后端)
  → T-8, T-12, T-13 (详情 → 结算 → 订单)
  → T-14, T-15 (行车态)
  → T-16 (部署)
```

每个 task 占一个 PR，每个 PR 必须带 verification log。

## Done When

- [ ] 所有 T-1 ~ T-16 done
- [ ] 7 步演示链路在演示视频中跑通
- [ ] CI 全绿
- [ ] `docs/INDEX.md` Recent Activity 完整记录所有完工 task
- [ ] `docs/specs/` 下创建了至少 3 个 spec 包（cart / driving / order-state）
- [ ] open-questions.md 仅剩 Q-001 / Q-002 / Q-003 三条产品类问题
```

---

## docs/open-questions.md

> **拥有**：所有未决问题及其假设、影响、owner、截止日期
> **上游**：访谈中的"待定" + 实施中发现的盲点
> **下游**：相关 ADR / spec / PRD（解决后归档指针）
> **何时更新**：发现新问题 / 问题被解答（归档不删）

### 模板

```markdown
# Open Questions

> 状态：持续更新 · 日期：<YYYY-MM-DD>

| ID | 问题 | 当前假设 / 默认值 | 影响 | Owner | 截止 | 状态 |
|---|---|---|---|---|---|---|

## 状态值
- `open` / `assumed` / `resolved`

## 归档区
| ID | 问题 | 解决方式 | 归档位置 |
```

### 填法要点

- **每条都有当前假设**——空着等于卡流程
- **影响**指明哪些文档 / ADR 依赖此问题的答案
- **截止日期**：估个时间，不能"等永远"
- **归档不删**：解决后状态改为 `resolved`，影响列加"已解决，参见 ADR-XXXX"

### 反模式

- 问题列表越攒越长 → 定期审视，超过 30 天的转 ADR 或下沉
- 没有假设默认值 → 卡到不能开工
- 解决后直接删 → 历史信息丢

### 示例（车机电商 Demo · open-questions 节选）

```markdown
# Open Questions

> 状态：持续更新 · 日期：2026-05-26

| ID | 问题 | 当前假设 | 影响 | Owner | 截止 | 状态 |
|---|---|---|---|---|---|---|
| Q-001 | 车厂账号 / 支付通道集成方式 | Demo 不集成，PRD v2 再定 | feature-spec §B-支付, ADR-0005 后续 | 产品 | 2026-07-01 | open |
| Q-002 | 副驾身份识别 | Demo 不识别，统一按驾驶员降级，US-30 标"已知妥协" | M-12 DrivingContext, US-30 | 产品 + 车厂 | 待车厂接入 | assumed |
| Q-003 | 用户数据存储 region | 境内默认 | constraints §Compliance, ADR-0005 | 法务 | 2026-06-15 | open |
| Q-004 | 暗夜极光车型壁纸是否可商用 | 假设可，使用 Unsplash 同类替代待法务确认 | mockups, design-system | 法务 | 2026-06-08 | assumed |
| Q-005 | OpenAPI generator 选 redocly 还是 openapi-typescript | 默认 openapi-typescript（轻量、TS 一等公民） | api-contracts.md, packages/api-client | 工程 | 2026-06-10 | open |

## 归档区

| ID | 问题 | 解决方式 | 归档位置 |
|---|---|---|---|
| Q-000 | IA 用品类型 vs 场景型 | 选场景型，详见 ADR-0008 → 后续 v3 改 7 类，ADR-0009 supersede | ADR-0008-ia-scene-first.md, ADR-0009-ia-7-scenes-v3.md |
```

---

## docs/decisions/ADR-NNNN-*.md

> **拥有**：单个不可轻易撤销的决策、备选方案、被否原因、下游影响
> **上游**：research / 用户决策 / 约束
> **下游**：constraints / architecture / 所有依赖此决策的实现
> **何时更新**：永不修改 Accepted ADR 内容；变更走 Superseded 流程

### 模板

详见 [agent-contract-template.md §附录 ADR 模板](./agent-contract-template.md)。

### 填法要点

- **状态**：Proposed（讨论中）→ Accepted（拍板）→ Superseded（被新 ADR 取代）
- **依赖**：本 ADR 依赖的其它 ADR（例如 ADR-0001 前端依赖 ADR-0006 monorepo）
- **背景**写**当时的约束**：以后回头看时能复盘"为什么当时选这个"
- **替代方案**用表对比：优点 / 缺点 / 为何不选。让人看到"被否的方案到底差在哪"
- **后果**末尾列**触发的下游改动 checklist**，未做完的 ADR 视为"已 Accepted 但未落地"

### 反模式

- 改 Accepted ADR 的决策内容 → 用 Superseded 流程，不动历史
- 替代方案只写一个 → 没对比就没决策
- "后续需要做的事"留空 → drift 会发生

### 示例（车机电商 Demo · ADR-0001 完整版）

```markdown
# ADR-0001: 前端框架选型

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：ADR-0006 monorepo 工具

## 背景 Context

车机电商前端 `apps/h5` 需要选定一个框架，约束如下：

- 必须是 **H5 Web 应用**（PRD 已锁定，运行在车机浏览器 / WebView）
- **响应式 + 双形态**（行车 / 停车），DOM 切换频繁，需要良好的状态管理与组件复用
- **首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）**，Bundle ≤ 300KB gzipped
- **类型安全**（电商业务复杂，订单 / 支付不能容忍运行时类型错误）
- 需要支持 **横屏 + 多分辨率自适应**
- 团队需要在 1 周内打通主链路（开发体验、热更新、上手成本都要好）
- 未来要在车机 WebView 真机调试，框架不能依赖最新浏览器 API

## 决策 Decision

**采用 React 18 + Vite + TypeScript**

辅助选择：
- **路由**：React Router v6
- **状态管理**：Zustand（全局态）+ React Context（DrivingContext 等平台层）
- **HTTP 客户端**：`@tanstack/react-query` + 由 OpenAPI 自动生成的 fetch client
- **样式方案**：详见 ADR-0007

## 理由 Rationale

1. **React 生态最厚**：电商场景需要的 UI 组件、表单库、虚拟列表、状态管理工具，React 都有最成熟的选项
2. **TypeScript 一等公民**：JSX + TS 协作顺畅，与共享包 `@jdo/shared-types`、`@jdo/order-state-machine` 类型直连
3. **Vite 是当前 H5 项目最优 dev server**：
   - 冷启动 < 1s，HMR < 100ms（vs webpack 冷启动 10s+）
   - 生产构建走 Rollup，tree shaking 优秀
   - 与 pnpm workspaces 配合无 quirks
4. **React 18 的 concurrent features 对车机有用**：useTransition / Suspense 能让"行车态 ↔ 停车态"切换更顺滑
5. **车机 WebView 兼容性 OK**：Chromium 79+ 完全支持 React 18 + Vite 默认产物（ES2020）

## 替代方案 Alternatives Considered

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| Vue 3 + Vite | 模板直观、SFC 易读、Composition API 现代 | 生态比 React 浅一档，TS 体验略弱 | 团队熟悉度与生态成熟度都不如 React |
| SolidJS | 性能极致、JSX 语法、bundle 小 | 生态太新、组件库稀缺 | Demo 阶段无法承担生态空白成本 |
| Svelte / SvelteKit | 编译时优化、bundle 最小 | 团队不熟悉、招人难、电商组件少 | 学习曲线 + 生态双重风险 |
| Next.js (React + SSR) | SSR / SSG / ISR 一站式 | SSR 对车机演示价值低（弱网常见），复杂度 +1 | CSR + CDN 已够用 |

## 后果 Consequences

- **正面**：
  - 任何熟悉 React 的工程师 / agent 能立刻上手
  - 大量现成的 UI / 状态 / 表单方案
  - TypeScript 严格模式覆盖整个 app
- **负面 / 代价**：
  - Bundle 比 Svelte / SolidJS 大一些，需要严格 bundle budget
  - React 心智模型有学习曲线，但团队已熟悉
- **后续需要做的事**（触发的下游 sync）：
  - [x] 创建 `apps/h5` Vite 脚手架（T-2）
  - [x] 配置 TS 严格模式 + path alias
  - [x] 引入 React Router v6 + Zustand + react-query
  - [ ] 在 design-system 中验证 React 19 升级路径
  - [ ] 写组件库选型 ADR-0007
```

---

## openspec/ · Feature spec 走 OpenSpec

> Feature 级 spec 不再用 `docs/specs/`，改用 [OpenSpec](https://openspec.dev/) 的 `openspec/specs/`（当前真相）+ `openspec/changes/<id>/`（提议变更）两文件夹模型。完整集成指南见 [openspec-integration.md](./openspec-integration.md)。

### openspec/specs/&lt;domain&gt;/spec.md（当前真相）

> **拥有**：单个 domain 当前已实现的 requirements + scenarios
> **何时更新**：只能通过 `openspec archive <change-id> --yes` 自动合并 delta，**不能手动编辑**

```markdown
# <domain> Spec

## Purpose

[一段话讲清楚这个 domain 是什么、解决什么、对哪些用户。]

## Requirements

### Requirement: <一句话名字>

The system MUST <expected behavior>，<additional context>。

#### Scenario: <happy path 场景名>
- GIVEN <初始状态>
- WHEN <动作 / 事件>
- THEN <可观测结果>
- AND <额外断言>

#### Scenario: <error 场景名>
- GIVEN ...
- WHEN ...
- THEN ...

### Requirement: <下一个>
...
```

**填法要点**：

- domain 命名 kebab-case，按业务边界（`auth-login` / `cart` / `order` / `driving-mode`），不按技术层
- 一个 spec 文件聚焦一个 domain，太大就拆子域
- requirement 用 RFC 2119 关键字（**MUST / SHALL / SHOULD / MAY / MUST NOT / SHALL NOT**）
- 每条 requirement 跟至少一个 scenario，覆盖 happy + error + edge
- scenario 用 GIVEN / WHEN / THEN / AND（Gherkin 风），每条只写**一个**触发动作

**示例**（车机电商 · `openspec/specs/auth-login/spec.md` 节选，archive 完 `add-qr-login` 之后的状态）：

```markdown
# auth-login Spec

## Purpose

车主在车机大屏上完成身份认证，支持手机号 + 验证码、OAuth、扫码三种方式。行车态下仅暴露扫码登录路径。

## Requirements

### Requirement: SMS Verification Code Login

The system MUST allow users to log in via phone number + SMS verification code.

The system MUST rate-limit SMS sending to one code per phone per 60 seconds.

#### Scenario: 用户输入手机号申请验证码
- GIVEN 用户在 `/login` 页面，手机号输入框已填 `+86 138xxxx`
- WHEN 用户点击 "获取验证码"
- THEN 系统调用 `POST /auth/sms`
- AND 系统给该手机号发送 6 位数验证码（dev mode 固定 `111111`）
- AND 系统在 Redis 写 `sms:{phone}` TTL 60s 防重发
- AND UI 倒计时显示 "60s 后可重新发送"

#### Scenario: 用户 60s 内重复申请
- GIVEN Redis 中 `sms:{phone}` 仍存在
- WHEN 用户再次点 "获取验证码"
- THEN 系统返回 `RATE_LIMITED` (HTTP 429)
- AND UI 提示 "请等待 N 秒后重试"

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
- AND 系统将 session state 转为 `CONFIRMED`，写入 accessToken / refreshToken
- AND 车机端下一次轮询拿到 token

#### Scenario: 二维码过期
- GIVEN 车机端 session 在 PENDING 状态超过 60 秒
- WHEN 车机端调用 `GET /auth/qr-login/poll`
- THEN 系统返回 `{ state: "EXPIRED" }`
- AND 车机端显示 "二维码已失效，点击刷新"

### Requirement: Login Method Discovery

The system MUST surface available login methods based on platform context.

#### Scenario: 行车态返回的登录方式
- GIVEN 车机端处于行车态（车速 > 5 km/h）
- WHEN 客户端调用 `GET /auth/methods`
- THEN 系统返回 `{ methods: ["qr-login"] }`
- AND 其它方式（sms、OAuth）被隐藏

#### Scenario: 停车态返回的登录方式
- GIVEN 车机端处于停车态
- WHEN 客户端调用 `GET /auth/methods`
- THEN 系统返回 `{ methods: ["sms", "oauth", "qr-login"] }`
```

### openspec/changes/&lt;change-id&gt;/proposal.md

> **拥有**：本次变更的意图 / 范围 / 高层方案
> **何时创建**：用户提出新 feature / 改既有 feature → 在 Claude Code 里跑 `/opsx:propose <change-id>`（推荐）或 CLI `openspec new change <change-id>`。**没有 `openspec propose` CLI 命令**。

**用 OpenSpec v1.3.1 原生章节名**（`openspec instructions proposal` 实测），不要自创 Intent/Scope/Approach——否则会和 `/opsx:propose` 生成的格式分叉。

```markdown
## Why

[1-2 句问题陈述：为什么要做这个变更？为什么是现在？写画面，让 6 个月后的 reviewer 也能闭眼想出场景。]

## What Changes

- <这次要做的事 1>
- <这次要做的事 2>
- breaking change 标 **BREAKING**

## Capabilities

### New Capabilities
- `<name>`: <新引入的能力，kebab-case，每个 → 一个 specs/<name>/spec.md>

### Modified Capabilities
- `<existing-name>`: <既有能力哪条 requirement 在变。先查 openspec/specs/ 现有名。无则留空。>

## Impact

[受影响的代码、API、依赖、系统。可引用 ADR-NNNN / PRD US-NN / docs/scope.md 条目 / Open question Q-NNN。out-of-scope 移到 design.md 的 Non-Goals。]
```

**填法要点**：

- `change-id` 命名 `<动作>-<对象>` kebab-case：`add-qr-login` / `tighten-driving-mode-detection` / `migrate-cart-to-redis-cluster` / `remove-deprecated-payment-method`
- `Why` 写**画面**而不是抽象描述
- `What Changes` 是 bullet 列表，breaking 标 **BREAKING**
- `Capabilities` 是最关键节——它决定会创建 / 修改哪些 spec 文件，填前先 research `openspec/specs/`
- 聚焦 why & what，不写 how（文件路径、函数签名、技术选型理由 → design.md）

**示例**：见 [openspec-integration.md §阶段 1 · Propose](./openspec-integration.md)。

### openspec/changes/&lt;change-id&gt;/specs/&lt;domain&gt;/spec.md（delta spec）

> **拥有**：本变更对某 domain 的具体增删改
> **何时更新**：proposal 阶段写，apply 阶段如发现需调整可改

```markdown
# Delta for <domain>

## ADDED Requirements

### Requirement: <新增的需求名>

The system MUST <expected behavior>。

#### Scenario: <场景>
- GIVEN ...
- WHEN ...
- THEN ...

## MODIFIED Requirements

### Requirement: <已存在的需求名>

[修改后的完整内容，archive 时整段替换 openspec/specs/<domain>/spec.md 中对应条目]

变更说明：
- 原来：<旧行为>
- 现在：<新行为>
- 原因：<为什么改>

#### Scenario: <如有新增 scenario>
...

## REMOVED Requirements

### Requirement: <要删除的需求名>

废弃原因：<为什么删，引用 PRD / ADR / 用户反馈>
迁移路径：<现有用户怎么过渡到替代方案>
```

**填法要点**：

- 只列**本变更触碰**的 requirement，未变化的不写
- MODIFIED 写**改后的完整内容**，不要写 diff 或 "..."，archive 时整段替换
- REMOVED 不需要保留 requirement 正文，但要说明废弃原因 + 迁移路径
- 新加的 scenario 写完整 GIVEN/WHEN/THEN，不要写 "略" 或 "同上"

**示例**：见 [openspec-integration.md §阶段 1 · Propose · specs/auth-login/spec.md](./openspec-integration.md)。

### openspec/changes/&lt;change-id&gt;/design.md

> **拥有**：本变更的技术方案 / 架构决策 / 数据流 / 影响文件 / 风险 / 回滚
> **何时更新**：proposal 之后写；实施中发现需调整就改

**用 OpenSpec v1.3.1 原生 4 章节**（`openspec instructions design` 实测）：`Context` / `Goals / Non-Goals` / `Decisions` / `Risks / Trade-offs`。skill 原有的 Data Flow / File Changes / Error Handling / Perf / Rollback **折叠进 Decisions 和 Risks**，不另起顶级章节——保持与 `/opsx:propose` 同构。

```markdown
## Context

[背景与当前状态 + 实施方案高层思路（模块级不到文件级）+ 数据流（ASCII 图或文字，从用户动作到落库 / 返回）。]

## Goals / Non-Goals

**Goals:**
- <这个 design 要达成什么>

**Non-Goals:**
- <从 proposal 搬来的 out-of-scope>

## Decisions

**决策表**（本变更内的局部决策；跨变更 / 不可逆的单独写 ADR）

| 决策 | 选择 | 理由 | 替代方案 |
|---|---|---|---|

**File Changes**

| Path | Change |
|---|---|
| `services/api/src/...` | new / modified / deleted |
| `packages/api-contracts/openapi.yaml` | modified |

**Error Handling**

| 场景 | 行为 |
|---|---|

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|

- 性能：响应延迟目标、缓存策略
- 限流：每个 endpoint 的限流配置
- 安全：鉴权、CSRF、注入防护、密钥
- 审计：哪些操作要写 audit log
- Rollback：如何安全回滚？schema 变更 / 数据迁移有无不可逆部分？
```

**填法要点**：

- `Context` 写**判断**与数据流，不写代码细节
- `Decisions` 表里列**本变更内**的局部决策；跨变更 / 不可逆的单独写 ADR
- File Changes 列预计触碰路径，glob 可接受
- 每条 Risk 必须有 Mitigation；没法 mitigate 的 risk 应该在 proposal 阶段就 block 掉
- 不要自创顶级章节（如 `## Data Flow`）——OpenSpec design 只认 Context / Goals-Non-Goals / Decisions / Risks-Trade-offs

### openspec/changes/&lt;change-id&gt;/tasks.md

> **拥有**：实施任务清单
> **何时更新**：proposal 之后写；apply 中按完成情况勾 checkbox

```markdown
# Tasks: <change-id>

> 状态用 checkbox 表达。每条任务一次 session 能做完。

## 1. <分组名>

- [ ] 1.1 <动词开头的具体任务>
  - Files: <预计触碰文件>
  - Verification: <验证命令 + 期望结果>

- [ ] 1.2 ...

## 2. <分组名>

- [ ] 2.1 ...

## 3. <分组名>

- [ ] 3.1 ...

## Implementation Order

1.1 → 1.2, 1.4 (并行) → 1.3 → 2.x → 3.x

## Done When

- [ ] 所有 task checkbox 勾上
- [ ] CI 全绿（`pnpm lint && pnpm typecheck && pnpm test && pnpm build`）
- [ ] PR review + merged
- [ ] `openspec archive <change-id> --yes` 执行成功
- [ ] `docs/INDEX.md` Recent Activity 记录归档
```

**填法要点**：

- 分组按业务领域（Backend / Frontend / Tests / Docs / Infra），不按层（Controller / Service / Repository）
- 每条 task 动词开头：`实现` / `添加` / `配置` / `迁移` / `测试`
- Files 列预计触碰路径，glob OK
- **Verification 必填**：写具体命令 + 期望结果，"我觉得做完了"不算做完
- Implementation Order 用箭头表达依赖，并行的写在一起

**完整示例**：[openspec-integration.md §阶段 1 · Propose · tasks.md](./openspec-integration.md) 给了车机扫码登录的 14 条 task。

---

## docs/design/design-system.md

> **拥有**：设计 token（颜色 / 字号 / 间距 / 圆角 / 阴影 / 动效 / 触控）+ 组件契约
> **上游**：PRD §设计原则 / 竞品调研 / HMI 规范
> **下游**：`packages/design-tokens/` / `packages/ui-components/` / mockups
> **何时更新**：设计原则变化 / token 新增 / 组件契约变化

### 模板

[结构同上节，省略]

### 填法要点

- **每个 token 列具体值**，颜色注明对比度，字号注明行高
- **每条原则**对应一个"行为后果"，例如"驾驶安全优先 → 触控 ≥ 88px、动效 ≤ 240ms"
- **组件契约**列变体 / 尺寸 / 状态，不写实现
- **跨场景降级**单独一节，例如行车态 / 暗色 / 高对比

### 示例（车机电商 Demo · design-system 节选）

```markdown
# 车机电商 · 设计系统 v1.0

> 状态：Draft · 日期：2026-05-26
> 上游：ADR-0007 UI 库与设计系统 · 竞品调研 · PRD §设计原则
> 下游：`packages/design-tokens/tokens.css` · mockups/

## 0. 设计原则

| 原则 | 说明 | 行为后果 |
|---|---|---|
| 驾驶安全优先 Safety First | NHTSA 2/12 + AAOS 76dp 是硬约束 | 触控 ≥ 88px、单步 ≤ 2s、行车态禁键盘 |
| 横屏即一等公民 Landscape Native | 不是把竖屏拉宽，是横屏视觉扫描重设计 | 左 sticky 导航 + 主内容、信息密度 -1 档 |
| 可瞥不可读 Glanceable | 视线离开道路 ≤ 2s 必须扫一眼能识别 | 字 ≥ 18px、对比度 ≥ 7:1、图标 + 文字双通道 |
| 稳过艳 Calm over Flashy | 10 年后看也不过时 | 禁渐变彩虹 / 3D，动效 ≤ 240ms |
| 状态可见 State Visible | 行车 / 停车、连接 / 离线一眼可见 | 顶栏徽 + 卡片徽 + 全局 toast |
| 可降级即可演示 Demonstrable Degradation | 行车态降级本身是 Demo 卖点 | `?speed=N` URL 一键演示 |

## 1. Design Tokens

### 1.1 颜色 Color

#### 中性色

| Token | Hex | 用途 | 对比度 vs bg-0 |
|---|---|---|---|
| `--color-bg-0` | `#0A0B0E` | 最深背景（页面） | — |
| `--color-bg-1` | `#11141A` | 二级背景（区块） | 1.3:1 |
| `--color-bg-2` | `#181C24` | 三级背景（卡片） | 1.6:1 |
| `--color-bg-3` | `#21262D` | 升起表面（弹层） | 1.9:1 |
| `--color-surface-glass` | `rgba(20,22,26,.60)` + blur(24px) | 液态玻璃面板 | — |
| `--color-border-subtle` | `rgba(255,255,255,.06)` | 极弱边框 | — |
| `--color-border-default` | `rgba(255,255,255,.10)` | 常规边框 | — |
| `--color-text-primary` | `#F1F5F9` | 主文字 | **15.6:1** ✅ AAA |
| `--color-text-secondary` | `#94A3B8` | 副文字 | **7.1:1** ✅ AAA |
| `--color-text-muted` | `#64748B` | 弱化文字 | **4.7:1** ✅ AA |

#### 品牌 / 强调

| Token | Hex | 用途 |
|---|---|---|
| `--color-brand-500` | `#3B82F6` | 主品牌（链接、聚焦） |
| `--color-brand-400` | `#60A5FA` | hover |
| `--color-brand-600` | `#2563EB` | pressed |
| `--color-accent` | `#06B6D4` | 电青强调（车机感） |

#### 语义色

| Token | 用途 |
|---|---|
| `--color-success` `#22C55E` | 成功 / 已支付 |
| `--color-warning` `#F59E0B` | 警告 / 待发货 |
| `--color-error` `#EF4444` | 错误 / 失败 |
| `--color-info` `#3B82F6` | 信息 |

### 1.2 字号 Typography

字体栈：`'Noto Sans SC', 'PingFang SC', system-ui, sans-serif`

| Token | size / line-height | 用途 |
|---|---|---|
| `--font-display` | 48 / 56 | 行车态主 CTA、Hero 标题 |
| `--font-h1` | 32 / 40 | 页面主标题 |
| `--font-h2` | 28 / 36 | 区块标题 |
| `--font-h3` | 22 / 28 | 卡片标题 |
| `--font-body` | 18 / 26 | 正文（基础值，最小） |
| `--font-body-strong` | 18 / 26 / 600 | 正文加粗 |
| `--font-caption` | 14 / 20 | 辅助说明（仅停车态） |

**禁用 12px**——可瞥不可读原则。

### 1.3 间距 Spacing（4 的倍数）

| Token | 值 |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |

### 1.4 触控目标

| Token | 值 |
|---|---|
| `--touch-min` | 88px（**硬约束**，单元测试断言） |
| `--touch-comfortable` | 96px |
| `--touch-large` | 120px（行车态 CTA） |
| `--touch-gap` | 16px（按钮间距） |

### 1.5 动效

| Token | 值 | 用途 |
|---|---|---|
| `--motion-fast` | 120ms ease-out | 微动 / hover |
| `--motion-base` | 200ms ease-in-out | 默认 |
| `--motion-slow` | 240ms ease-out | 大块切换 |
| `--motion-driving` | 0ms（禁用） | 行车态全关 |

`prefers-reduced-motion: reduce` 与行车态同样关闭动效。

### 1.6 栅格 / 断点

| 断点 | 宽度 | 主用 |
|---|---|---|
| `--bp-driver` | 1920×720 | 旧车机入门 |
| `--bp-mid` | 1920×1080 | 主流车机 |
| `--bp-large` | 2560×1440 | 中高配 |
| `--bp-xl` | 2560×1600 | 大屏车机 |

## 2. 组件契约

### Button

- 变体：`primary` / `secondary` / `ghost` / `danger`
- 尺寸：`sm`(88px) / `md`(96px) / `lg`(120px)
- 状态：default / hover / pressed / disabled / loading
- 行车态强制 `lg` 尺寸

### Input

- 行车态：`disabled` + 显示"已在行车态，停车后填写"
- 尺寸：高度 ≥ 88px
- 错误态：边框 `--color-error`，下方文字 `--color-error`

### Card (Glass)

- 背景：`--color-surface-glass`
- 边框：`--color-border-default`
- padding：`--space-5`
- 圆角：16px

## 3. 跨场景降级

| 场景 | 触发 | token 变化 |
|---|---|---|
| 行车态 | 车速 > 5 km/h | 字号 +20%；动效 0；触控 ≥ 120px；隐藏 caption |
| 暗夜极光 | URL `?theme=aurora` | bg-0 切到品牌深紫 `#0a0b1e` |
| 高对比 | 用户手动开 | text-primary 切到纯白 `#FFFFFF` |
```

---

## docs/design/page-spec.md / interaction-patterns.md

详细模板与示例见后续单独 reference 文档。这里给精简版：

### page-spec.md 关键写法

每页一节，含：路由、画布、区块表（位置 + 内容 + 数据源 + 跨场景）、状态变化、mock 字段、设计调性备注。链接到对应 mockup 截图或 HTML 路径。

### interaction-patterns.md 关键写法

三大块：

1. **跨页面交互**（IP-NN）：例如"再买一次"在多页出现的统一规则
2. **状态矩阵**：页面 × 场景 × 在线 × 登录 的行为表
3. **决策树**：开发者拿到需求按树走能确定路径

---

## .env.example

> **拥有**：所有环境变量的名字 + 示例值（不是真值）
> **何时更新**：新增 / 删除外部依赖、新增配置项

```dotenv
# ============ Public client config ============
PUBLIC_APP_URL=http://localhost:5173

# ============ API ============
API_PORT=3000
API_BASE_URL=http://localhost:3000
VITE_API_BASE_URL=/api/v1
VITE_USE_MOCK_API=true

# ============ Database ============
DATABASE_URL=postgresql://user:password@localhost:5432/app

# ============ Cache ============
REDIS_URL=redis://localhost:6379

# ============ Auth ============
JWT_SECRET=replace-me-with-strong-random-value
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=10

# ============ 第三方 / 外部服务 ============
# STRIPE_SECRET_KEY=
# OPENAI_API_KEY=
# S3_BUCKET=
# WECHAT_PAY_MCH_ID=

# ============ Observability ============
LOG_LEVEL=debug
# SENTRY_DSN=
# OTEL_EXPORTER_OTLP_ENDPOINT=

# ============ Feature flags ============
ENABLE_DEBUG_TOOLS=true
ENABLE_TWEAKS_PANEL=true
```

**填法**：

- 每条带一行注释说明用途
- 真密钥**不写真值**，写 `replace-me-...`
- 区分环境差异（local / staging / prod）的项加注释
- 集成的外部服务全部列出来（即使尚未启用），用 `#` 注释

---

## .claude/settings.json

> **拥有**：harness 强制规则（hooks + permissions + env）
> **上游**：CLAUDE.md 中标 `must` 的规则
> **下游**：所有 agent 的工具调用受此约束
> **何时更新**：新增 hook / 调整 permission / 修改强制规则

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "description": "开工三件套检查：未在 docs/INDEX.md §Active Workstreams 登记 → 拒绝",
        "command": ".claude/hooks/check-workstream-registered.sh"
      },
      {
        "matcher": "Write|Edit",
        "description": "密钥扫描：内容匹配密钥模式 → 拒绝",
        "command": ".claude/hooks/scan-secrets.sh"
      },
      {
        "matcher": "Bash",
        "description": "commit 自报家门：git commit 时自动追加 agent: tail",
        "command": ".claude/hooks/append-agent-tag.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "description": "文档同步：源码改了但对应 spec / ADR 未改 → 警告",
        "command": ".claude/hooks/check-doc-sync.sh"
      },
      {
        "matcher": "Write",
        "description": "INDEX 同步：新增 docs/*.md 必须同步登记 INDEX",
        "command": ".claude/hooks/check-index-updated.sh"
      }
    ],
    "Stop": [
      {
        "description": "测试 gate：会话改了 src/ 但未跑测试 → 阻塞",
        "command": ".claude/hooks/check-tests-ran.sh"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(pnpm:*)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(docker compose:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)"
    ]
  }
}
```

**hook 脚本骨架**（放 `.claude/hooks/check-workstream-registered.sh`）：

```bash
#!/usr/bin/env bash
# 检查 docs/INDEX.md §Active Workstreams 是否有当前 agent 的登记行
# 如果没有，输出错误信息并 exit 2（拒绝本次工具调用）
#
# 注意：PreToolUse hook 拦截必须用 exit 2，不是 exit 1。
# exit 1 只是告警不阻塞；exit 2 才让 Claude Code 真正拒绝本次工具调用，
# 并把 stderr 内容作为反馈喂回 agent。这是社区 #1 实现 bug。

AGENT_ID="${CLAUDE_AGENT_ID:-claude-unknown}"
INDEX_FILE="docs/INDEX.md"

if [ ! -f "$INDEX_FILE" ]; then
  echo "ERROR: $INDEX_FILE 不存在。请先创建 docs/INDEX.md。" >&2
  exit 2
fi

if ! grep -A 100 "Active Workstreams" "$INDEX_FILE" | grep -q "$AGENT_ID"; then
  echo "ERROR: 未在 docs/INDEX.md §Active Workstreams 找到 agent-id=$AGENT_ID 的登记行。" >&2
  echo "请按开工三件套先 append 一行登记你的工作范围。" >&2
  exit 2
fi

exit 0
```

每个 hook 配一行注释说明它强制的是哪条约束，指回 `constraints.md` 或 `CLAUDE.md` 的条目。

---

## .github/PULL_REQUEST_TEMPLATE.md

```markdown
## 摘要

<本 PR 改了什么，1-2 句>

## 动机

<为什么改，关联哪个 requirement / scope / ADR>

## 测试证据

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] e2e（如适用）

实际命令与输出（贴关键片段）：
```
$ pnpm test --filter @jdo/cart
PASS  packages/cart/src/store.test.ts
PASS  packages/cart/src/merge.test.ts
Test Suites: 2 passed
```

## 关联

- Requirement / Scope：
- ADR：
- Issue：

## 文档同步

- [ ] 涉及的 spec / ADR / INDEX 已同步
- [ ] 如有新约束，已写入 constraints.md
- [ ] 如有 open question 解决，已归档（保留指针）

## 风险

- 风险：
- 回滚方式：
```

---

## CONTRIBUTING.md

```markdown
# Contributing

## 编辑前（开工三件套）

1. 阅读 [docs/INDEX.md](./docs/INDEX.md)
2. 检查 §Active Workstreams 是否有相关在做
3. 登记本次工作范围
4. 阅读 [CLAUDE.md](./CLAUDE.md)（如果你是 agent）

## 完成定义 Definition of Done

- [ ] 文档已更新
- [ ] 已补测试，或明确说明跳过原因
- [ ] lint / typecheck / build 通过
- [ ] 需要记录的决策已写入 ADR
- [ ] INDEX 状态已同步（workstream 移到 Recent Activity）

## Pull Request

- 关联 issue 或任务
- 说明用户可见行为
- 列出已运行的测试（贴命令 + 关键输出）
- 标出风险与回滚方式
- 使用 [PR 模板](./.github/PULL_REQUEST_TEMPLATE.md)

## Commit 规范

[Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修 bug
- `docs:` 文档
- `refactor:` 重构
- `test:` 测试
- `chore:` 杂项
- `perf:` 性能优化

agent 在 commit 末尾追加 `agent: claude-<short-context>`。

## 路径所有权

见 [docs/INDEX.md §Ownership Zones](./docs/INDEX.md)。改别人 zone 的文件前先协调。

## 报告问题

- bug → GitHub Issue + 重现步骤 + 期望 / 实际
- 安全漏洞 → 不要开 Issue，邮件 <security@...>
- 文档错误 → 直接开 PR
```

---

## README.md

```markdown
# <Project Name>

> <一句话定位：做什么、给谁用、解决什么>

## What

<2-3 行讲清楚是什么、给谁用、当前阶段。>

## Quick Start

```bash
# 安装依赖
pnpm install

# 起本地依赖（DB + Cache）
docker compose up -d

# 起开发环境
cp .env.example .env
pnpm dev:all
```

服务地址：

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API docs: http://localhost:3000/docs

## Docs

- [CLAUDE.md](./CLAUDE.md) — AI 协作公约（agent 必读）
- [docs/INDEX.md](./docs/INDEX.md) — 完整文档目录与协作仪表盘
- [docs/project-brief.md](./docs/project-brief.md) — 项目目标
- [docs/scope.md](./docs/scope.md) — MVP 边界
- [docs/architecture.md](./docs/architecture.md) — 系统架构
- [docs/PRD.md](./docs/PRD.md) — 产品需求
- [docs/feature-spec.md](./docs/feature-spec.md) — 路由 / 接口 / 状态机权威源
- [docs/decisions/](./docs/decisions/) — 所有 ADR

## 项目结构

```text
apps/             # 应用入口（H5 / 移动 / 桌面）
services/         # 后端服务
packages/         # 共享包（types / contracts / state-machines / design-tokens）
tools/            # 种子数据 / mock / e2e 脚本
infra/            # docker-compose / Dockerfile / 部署配置
docs/             # 文档（结论唯一来源）
diagrams/         # 架构 / IA / 流程图源文件
mockups/          # 设计原型
.claude/          # AI 协作配置（hooks / settings）
.github/          # PR template / CODEOWNERS / workflows
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev:all` | 起全部本地服务 |
| `pnpm test` | unit + route 测试 |
| `pnpm e2e` | Playwright |
| `pnpm build` | 全量构建 |
| `pnpm db:reset && pnpm seed:demo` | 重置 DB + 注入演示数据 |

## Status

<Demo / MVP / Production>

## License

<MIT / Apache / 内部>
```

---

## 总结：模板使用建议

1. **生成顺序**：CLAUDE.md → INDEX.md → project-brief → scope → constraints → architecture → ADR → PRD → feature-spec → 配套
2. **每生成一个文件**，同步在 INDEX 登记
3. **示例项目（车机电商 Demo）只是参考**，实际项目按用户访谈结果填充
4. **未答的项**走 `open-questions.md`，**不要让缺失隐式存在**
5. **所有模板都可被覆盖**，但偏离前确保理解为什么模板这么设计
