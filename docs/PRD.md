# 车机端电商平台 PRD

> 版本：v0.5 · 日期：2026-05-29 · 状态：Draft
> 取代：v0.4（v0.1 ~ v0.4 保留在 git 历史中）
> 沟通语言：中文 · 协作铁律见 `CLAUDE.md`
>
> **v0.5 变更（本次）：新增「后台管理（admin）」整端范围**——
> - 新增 §I 后台管理 User Stories（US-40 ~ US-58）
> - **删除原 Out-of-Scope #8「后台运营系统不在 Demo 范围」**（该条作废，admin 进入范围）
> - 配套新增 [`docs/scope.md`](./scope.md)、ADR-0010~0012（admin 形态 / RBAC / UI 基准）
> - admin 端运行在 PC 桌面 Web，**不受车机 88px 触控 / 行车态约束**；UI 复用设计 token，**不重画**
> - 消费端需求与 UI（`mockups/jdo-pencil-v3`）保持不变
>
> v0.4 变更：本 PRD 本体内容稳定，**新增 4 份配套文档**让"读完即可开干"升级为"读完即可派活 + 派设计"：
> - [`docs/feature-spec.md`](./feature-spec.md)：把 39 条 User Story 拆解到「页面 × 区块 × 接口 × 状态机」颗粒度，工程派活源
> - [`docs/design/design-system.md`](./design/design-system.md)：完整设计 tokens（色 / 字 / 距 / 圆 / 阴 / 触 / 动）+ 组件契约 + Tailwind 配置约定
> - [`docs/research/competitor-analysis.md`](./research/competitor-analysis.md)：7 家车机商城 + AAOS / NHTSA / 鸿蒙公开 HMI 规范调研，硬数字来源
> - [`mockups/`](../mockups/)：11 屏可点击高保真原型（深色 + 液态玻璃 + 行车态降级），打开 [mockups/index.html](../mockups/index.html) 即可演示
>
> v0.3 变更：补充 **仓库与目录规划**、**后端接入方案**、**起手 Coding 计划**

---

## Problem Statement

我是一个车主。我在车里花了大量时间——通勤等红灯、充电桩前等待 30~60 分钟、网约车上送孩子的间隙、停车场里等家人。我面前是一块 10–17 寸的车机大屏，但它能干的商业化事情只有「加油、充电、导航」。

我想买点东西的时候，必须掏出手机；副驾乘客想买东西的时候，也要掏手机；后排小孩闹腾想买零食的时候，整个家庭还是各自看各自的手机。**车机这块屏，在通用电商这件事上是空的。**

车厂希望沉淀车主消费数据、增加座舱粘性；车主希望"上车这段时间也能像在客厅一样顺手买点东西"。中间缺一个**通用电商入口**，既能在不同车型的车机里跑起来，又不会因为驾驶场景把车主置于危险中。

## Solution

我们做一个 **车机内嵌 H5 电商平台**，以网页形态运行在主流车机浏览器/WebView 中，为车主、副驾、后排乘客提供"车上一键购"的完整购物体验。

关键解法：

- **一套 H5，多端响应式**：横屏车机为主、手机/PC 演示页同源
- **双形态自动切换**：检测车速 → 行车态降级（大按钮、少层级、禁键盘、禁视频）/ 停车态完整体验
- **驾驶安全优先**：所有交互按"≤ 3 步完成下单 + 88×88 px 触控区 + WCAG AA 对比度"约束
- **从 Demo 起步**：阶段一不绑定具体车厂，做通用 Demo（横屏 Web 演示版），验证体验后再去适配具体车厂的 WebView/账号/支付通道
- **完整闭环**：商品 → 购物车 → 订单 → 支付 → 物流（履约）的端到端 Demo

成功标准（Demo 阶段）：

1. 在 1920×720 / 1920×1080 / 2560×1440 车机分辨率下，主链路无横向溢出、无小于 88×88 触控目标
2. 行车态下完成"再买一次"全流程 ≤ 3 步、无键盘输入
3. 首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）
4. 演示视频/真机演示可让车厂方一眼看懂"和现有车机生态如何挂接"

## User Stories

### A. 浏览与发现

1. 作为车主，我想在车机首页看到分类入口、推荐商品和限时秒杀的横屏轮播，以便快速进入感兴趣的购物场景
2. 作为车主，我想按一级/二级分类逐层浏览商品，以便聚焦到我关心的品类
3. 作为车主，我想通过关键字搜索商品，并能看到热门搜索词和我的搜索历史，以便快速找到目标商品
4. 作为车主，我想用语音搜索商品（如"我要买玻璃水"），以便在不便触屏的时候也能找到商品
5. 作为车主，我想在商品详情页看到主图轮播、价格、规格选择和详细描述，以便决定是否购买
6. 作为车主，我想看到附近自提点的距离与营业时间，以便选择「车主到附近自提」这种适合车机场景的履约方式

### B. 加购与下单

7. 作为车主，我想在商品详情页选择规格后加入购物车，以便后续合并下单
8. 作为车主，我想在购物车里增减商品数量、勾选/取消勾选、查看合计金额，以便核对订单内容
9. 作为车主，我想"立即购买"跳过购物车，以便快速完成单品下单
10. 作为车主，我想在结算页选择收货地址、配送方式、支付方式并添加备注，以便提交订单
11. 作为车主，我想能够把"车辆当前位置"自动作为收货/自提地址候选，以便不用手动输入
12. 作为车主，我想对常买的商品一键"再买一次"，以便补给周期性消耗品（玻璃水、车充、香薰）时少操作

### C. 支付

13. 作为车主，我想通过车机弹出的二维码用手机扫码支付，以便不用在车机里输入密码或银行卡
14. 作为车主，我想在已绑定免密协议的场景下一键支付完成订单，以便缩短支付步骤
15. 作为车主，我想看到清晰的支付状态（等待支付 / 成功 / 失败 / 超时），以便决定是否重试

### D. 订单与履约

16. 作为车主，我想在「我的订单」里看到所有订单的状态和详情，以便跟踪订单进度
17. 作为车主，我想取消未发货的订单，以便处理我改变主意的情况
18. 作为车主，我想在订单详情看到物流轨迹或自提取货码，以便完成最后一公里
19. 作为车主，我想接受订单状态变更的车机推送（送达自提点、骑手即将送达），以便及时处理

### E. 账号与个人中心

20. 作为车主，我想用手机号 + 验证码登录车机，以便和我的手机账号互通
21. 作为车主，我想用「车机扫码 → 手机授权」的方式登录，以便不用在车机输入手机号
22. 作为车主，我想绑定我的车厂账号（预留能力），以便未来一次登录、多端同步
23. 作为车主，我想管理多个收货地址（家、公司、自提点），以便不同场景下选不同地址
24. 作为车主，我想查看/编辑个人信息并安全地退出登录，以便保护账号隐私

### F. 驾驶安全（车机专属）

25. 作为系统，我想在车速 > 5 km/h 时自动进入「行车态」，以便对驾驶员降低分心风险
26. 作为系统，我想在行车态下隐藏视频、自动播放、闪烁动效，以便符合座舱安全规范
27. 作为系统，我想在行车态下禁用键盘输入、密码输入、银行卡号输入，以便防止驾驶员低头操作
28. 作为系统，我想在行车态下只暴露"再买一次 + 默认地址 + 默认支付"的简化路径，以便驾驶员一键完成补给
29. 作为系统，我想在车速回落到 0 km/h 持续 3 秒后切回停车态，以便恢复完整购物能力
30. 作为副驾乘客，我想即使在行车态也能正常完整购物（因为我不是驾驶员），以便我不被错误降级——**注意：Demo 阶段无法识别操作者身份，统一按行车态降级；这是已知妥协**

### G. 车机适配（设备与环境）

31. 作为系统，我想在 1920×720 / 1920×1080 / 2560×1440 / 3840×1080 等常见车机分辨率下都正常显示，以便覆盖主流车型
32. 作为系统，我想默认使用深色主题，并允许用户切换为浅色，以便适应夜间驾驶
33. 作为系统，我想保证字号基础值 ≥ 18 px、主标题 ≥ 28 px、对比度 ≥ WCAG AA，以便在强光车内环境下可读
34. 作为系统，我想触控目标 ≥ 88×88 px、间距 ≥ 16 px，以便颠簸路况下也能准确点击
35. 作为系统，我想避免依赖长按/双击/手势，以便降低误操作
36. 作为系统，我想在弱网/隧道断网情况下保留购物车本地缓存，订单提交失败可重试，以便不丢用户输入

### H. 运营与可观测

37. 作为运营，我想看到 PV/UV、关键转化漏斗、行车态切换次数等埋点数据，以便分析车机场景下的用户行为差异
38. 作为运维，我想有完整的后端日志、链路追踪和告警，以便快速定位线上问题
39. 作为产品，我想区分「车机入口订单」和「手机入口订单」的指标，以便评估车机端的独立价值

### I. 后台管理（admin · 桌面 Web）★ v0.5 新增

> 运营 / 客服 / 财务在 PC 浏览器使用。详细范围见 [`docs/scope.md §二`](./scope.md)，形态 / 权限 / UI 见 ADR-0010 / 0011 / 0012。

**I-1 账号与权限（admin-auth）**

40. 作为运营人员，我想用账号密码登录后台，以便开始管理工作（与车主账号隔离）
41. 作为超级管理员，我想给不同员工分配角色（运营 / 客服 / 财务），以便按职责限制可见与可操作范围
42. 作为合规负责人，我想看到所有后台写操作的审计日志（谁、何时、改了什么），以便追溯责任

**I-2 商品管理（admin-catalog）**

43. 作为运营，我想新建 / 编辑 / 上下架商品与 SKU（标题、图片、价格、库存、规格），以便维护在售商品
44. 作为运营，我想维护 7 类用车场景分类与商品归属，以便消费端首页场景 rail 正确展示
45. 作为运营，我想批量调整库存与价格，以便应对补货与调价

**I-3 订单管理（admin-order）**

46. 作为客服，我想搜索 / 筛选订单并查看详情，以便处理用户咨询
47. 作为客服，我想对订单执行发货 / 取消 / 改状态（走与消费端同一套订单状态机），以便推进履约
48. 作为客服，我想审核并处理退款 / 售后申请，以便闭环售后
49. 作为财务，我想按时间 / 状态导出订单金额汇总（只读），以便对账

**I-4 用户管理（admin-user）**

50. 作为客服，我想查看用户列表 / 详情 / 地址，以便核实身份与配送信息
51. 作为运营，我想封禁 / 解封异常用户、审核车主认证，以便风控

**I-5 营销与内容（admin-marketing / admin-content）**

52. 作为运营，我想配置首页 banner、限时秒杀、推荐位，以便做活动投放
53. 作为运营，我想创建与发放优惠券（基础规则），以便促销
54. 作为运营，我想编辑首页 7 场景配置与商品详情富文本，以便维护内容

**I-6 履约管理（admin-fulfillment）**

55. 作为运营，我想维护自提点（名称 / 位置 / 营业时间），以便消费端展示可选自提点
56. 作为客服，我想录入 / 更新物流轨迹（mock 对接），以便用户看到配送进度

**I-7 运营看板（admin-analytics）**

57. 作为产品，我想看到 PV/UV、转化漏斗、**车机入口 vs 手机入口订单对比**、行车态切换次数，以便评估车机端独立价值（承接原 §H US-37~39 的埋点可视化）
58. 作为运维，我想看到后端关键指标与告警入口，以便快速定位线上问题

## Implementation Decisions

### 模块拆分（深模块优先）

> **命名约定**：本节列的是「业务领域深模块」（cart / order / payment 等长生命周期、跨多页面、独立测试的领域逻辑）。
> 与 [`docs/feature-spec.md §三 跨页面模块 M-01~M-13`](./feature-spec.md) **不是同一层概念** —— 后者是 UI 壳层 / 基础设施模块（顶栏、底栏、主题、JS Bridge 等），更接近"全局组件"。
> 仅 **M-12 DrivingContext** 同时出现在两边，因为它既是业务关键深模块也是 UI 壳层基座。

按"深模块 = 复杂内部 + 简单稳定接口 + 可独立测试"的原则识别，**已确认的核心模块**：

#### 前端（车机 H5）

- **DrivingContext（驾驶上下文模块，深模块⭐）**
  - 对外接口：`useDrivingMode()` → `{ mode: 'driving' | 'parked', restrictions: { allowKeyboard, allowVideo, allowComplexForm, ... } }`
  - 内部封装：车速/档位传感器适配、阈值与防抖、传感器缺失时的降级（Demo 环境用 mock）、状态变更广播
  - 关键价值：把"行车/停车"这件事压成一个简单状态，所有 UI 组件只读它的接口，不关心数据来源

- **CatalogStore（商品域）**
  - 商品列表、详情、分类、搜索，分页 + 缓存
  - 接口：查询型，无副作用，易测

- **CartStore（购物车域，深模块⭐）**
  - 对外接口：`addItem / removeItem / setQuantity / checkout`
  - 内部封装：本地存储 + 服务端同步 + 登录前后合并、冲突解决、弱网降级
  - 关键价值：状态机清晰，跨场景（未登录→登录、断网→联网）行为一致

- **OrderStateMachine（订单状态机，深模块⭐）**
  - 纯函数：`transition(state, event) => newState`
  - 状态：未付款 / 已付款 / 备货 / 配送 / 已送达 / 已完成 / 已取消 / 售后中
  - 易于单测，前后端共用同一份状态定义

- **PaymentSession（支付会话域，深模块⭐）**
  - 对外接口：`create(orderId) → session`、`session.status$` 状态流
  - 内部封装：二维码生成、手机端轮询、超时、幂等重试、回调处理
  - 关键价值：把"扫码支付"复杂时序压成响应式状态流

- **AccountModule（账号域）**
  - 登录（手机号验证码 / 车机扫码 / 车厂账号预留）、地址簿、个人信息

- **IVIShell（车机适配壳层）**
  - 深色主题切换、横屏布局栅格、大字号/大点击区 design token、安全策略约束
  - 是 UI 层的"地基"，不是业务模块

#### 后端

- `catalog-service`（商品服务）
- `order-service`（订单服务，含状态机）
- `payment-service`（支付服务，Demo 阶段 mock，对接二维码/免密接口）
- `user-service`（账号服务）
- `fulfillment-service`（履约 / 自提点 / 物流轨迹）
- `api-gateway`（鉴权、限流、风控统一入口）

#### 横切

- 设计系统（Design Tokens + 组件库，车机优先尺寸）
- 埋点与可观测（前端 PV/UV/漏斗 + 后端链路追踪）
- 配置中心（行车态阈值、降级开关）

### 仓库与目录规划

**决策**：

- **单仓库 monorepo**：Demo 阶段团队规模小，monorepo 切换成本低；模块边界清晰后想拆 polyrepo 也容易
- **包管理**：`pnpm` + workspaces（性能好、磁盘省、社区采纳广）
- **任务编排**：`turbo`（可选，加速增量构建与并行）
- **后端形态**：Demo 阶段做 **modular monolith**（单进程、按 domain 模块化），**不上微服务**；接口边界按未来拆分预留好，避免初期过度设计
- **前后端共享**：类型、订单状态机、API 契约统一放 `packages/`，单一真相

**目录骨架**（开干前的总图）：

```
JDOTEST/
├── apps/
│   └── h5/                         # 车机端 H5（生产入口；同源跑手机/PC 演示）
│       ├── src/
│       │   ├── modules/            # 业务模块（命名与后端 domain 对齐）
│       │   │   ├── catalog/        # 商品域
│       │   │   ├── cart/           # 购物车域（深模块）
│       │   │   ├── order/          # 订单域
│       │   │   ├── payment/        # 支付域（深模块）
│       │   │   ├── account/        # 账号域
│       │   │   └── fulfillment/    # 履约 / 自提点
│       │   ├── platform/           # 车机平台层（车机专属）
│       │   │   ├── driving-context/  # 行车/停车感知（深模块）
│       │   │   ├── ivi-shell/        # 主题、横屏布局、安全策略
│       │   │   └── bridge/           # JS Bridge 抽象（mock + 真实车厂）
│       │   ├── components/         # 通用 UI 组件
│       │   ├── pages/              # 路由页面
│       │   ├── api/                # 后端接口客户端（由 OpenAPI 生成）
│       │   ├── stores/             # 全局状态
│       │   └── main.tsx
│       ├── public/
│       ├── vite.config.ts
│       └── package.json
│
├── services/
│   └── api/                        # 后端单体（modular monolith）
│       ├── src/
│       │   ├── modules/            # 业务模块（边界即未来拆分点）
│       │   │   ├── catalog/        # controller / service / repository / routes
│       │   │   ├── order/
│       │   │   ├── payment/
│       │   │   ├── cart/
│       │   │   ├── user/
│       │   │   └── fulfillment/
│       │   ├── gateway/            # 路由聚合、鉴权、限流、CORS、错误统一
│       │   ├── db/                 # PG 客户端 + 迁移
│       │   ├── cache/              # Redis 客户端
│       │   ├── observability/      # 日志、追踪、指标
│       │   ├── config/             # 配置加载与校验
│       │   └── main.ts
│       ├── prisma/                 # schema + migrations（或 drizzle，待 ADR）
│       └── package.json
│
├── packages/
│   ├── shared-types/               # 前后端共享 TS 类型（DTO、Entity）
│   ├── order-state-machine/        # 订单状态机（纯函数，前后端共用）
│   ├── design-tokens/              # 颜色、字号、间距、栅格（车机优先尺寸）
│   ├── ui-components/              # 车机 UI 组件库（按需抽取）
│   ├── api-contracts/              # openapi.yaml + 自动生成的 client/server 类型
│   └── eslint-config/              # 统一 lint / format / tsconfig 基线
│
├── tools/
│   ├── seed/                       # 种子数据脚本（商品 / 用户 / 订单）
│   ├── mock-server/                # 独立 mock 服务（前端先行阶段可用）
│   └── e2e/                        # E2E 测试（Playwright，覆盖主链路）
│
├── infra/
│   ├── docker-compose.yml          # 本地 PG + Redis
│   └── Dockerfile.api              # 后端生产镜像
│
├── docs/                           # 协作铁律入口
│   ├── INDEX.md                    # 全部文档索引
│   ├── PRD.md                      # 当前文件
│   ├── architecture/               # 架构图、系统总览
│   ├── decisions/                  # ADR
│   └── research/                   # 调研报告
├── diagrams/                       # excalidraw / svg 源文件
│
├── .github/
│   └── workflows/                  # CI: lint + test + build
│
├── .gitignore
├── CLAUDE.md
├── README.md                       # 起手指南（指向 PRD + INDEX）
├── package.json                    # 根 workspace
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

**命名约定**：

- 包名前缀统一 `@jdo/`（如 `@jdo/h5`、`@jdo/api`、`@jdo/shared-types`）
- 模块文件夹用 kebab-case，TS 类型用 PascalCase，函数/变量 camelCase
- 测试文件与被测文件同目录，命名 `*.test.ts` / `*.spec.ts`

### 关键技术决策（待后续 ADR 化）

1. **前端框架**：暂定 React（生态/H5 支持/团队熟悉度综合最优），待 ADR-0001 正式裁定
2. **状态管理**：DrivingContext 用 React Context + 事件总线，业务态用 Zustand/Redux（待 ADR）
3. **API 风格**：REST + JSON，Demo 阶段不上 GraphQL
4. **后端语言**：暂定 Node.js（与前端同栈，全栈视角友好），待 ADR
5. **数据库**：暂定 PostgreSQL（电商主数据） + Redis（购物车 / 会话），待 ADR
6. **部署**：Demo 阶段前端 Vercel，后端容器化部署到云厂商，CI/CD 待定
7. **车速数据源**：Demo 阶段提供 mock URL 参数（`?speed=20`）模拟，真实接入靠车厂 JS Bridge

### 后端接入方案

#### 接口契约
- **协议**：REST + JSON over HTTPS
- **契约源**：`packages/api-contracts/openapi.yaml` 作为唯一真相
- **代码生成**：
  - 前端 client 由 `openapi-typescript` 自动生成，禁止手写 fetch
  - 后端 DTO 校验用 `zod` 或 `class-validator`，校验失败统一走全局错误处理
- **错误格式**（全局统一）：
  ```json
  { "code": "ORDER_NOT_FOUND", "message": "订单不存在", "details": {}, "traceId": "abc-123" }
  ```
- **版本管理**：URL 前缀 `/api/v1/`，破坏性变更走 `/api/v2/`
- **分页规范**：cursor 分页优先（`?cursor=&limit=`），列表场景才用 offset

#### 鉴权
- **方案**：JWT（access token 15min + refresh token 7d），HttpOnly Cookie + Authorization Header 双轨
- **车机扫码登录**（核心场景）：
  1. 车机 `POST /api/v1/auth/qr-code` → 返回 `{ sessionId, qrUrl, expiresAt }`
  2. 手机扫码后 `POST /api/v1/auth/qr-confirm` 携带手机端 token
  3. 车机轮询 `GET /api/v1/auth/qr-status?sessionId=` → `pending` / `confirmed` / `expired`
  4. `confirmed` 后下发 JWT，车机本地持久化
- **Demo 阶段简化**：`POST /api/v1/auth/mock-login` 直接获得 demo 账户 JWT，跳过整个二维码流程

#### 联调三阶段
- **阶段 A · 前端先行**：API 完全 mock（用 `MSW` 拦截 fetch），前端可独立推进
- **阶段 B · 接真接口**：后端 ready 后关掉 MSW；vite dev server 配 proxy（`/api → http://localhost:3000`），无需改前端代码
- **阶段 C · 部署演示**：前端构建到 Vercel，API 域名通过环境变量切换到云上后端

#### 共享代码契约
- 订单状态机定义在 `packages/order-state-machine`，前后端通过 `import { transition, OrderState } from '@jdo/order-state-machine'` 复用
- DTO 类型定义在 `packages/shared-types`，前端 stores、后端 controllers 都 import 它
- OpenAPI yaml 是接口的真相之源，CI 检查任何 controller 与 OpenAPI 漂移就报错

#### 关键流程合约（模块间）
- **DrivingContext → UI**：所有需要降级的 UI 组件通过 `useDrivingMode()` 读取，禁止各组件自行判断车速
- **Cart → Order**：购物车结算时生成订单草稿（draft order），由 order 模块统一做库存锁定 + 价格再校验，避免前端绕过价格
- **Order → Payment**：订单创建即同步创建 PaymentSession；订单状态由支付状态机驱动，**禁止前端直接修改订单状态**
- **支付回调**：第三方支付回调统一进 `payment` 模块的回调 handler，订单状态变更仅在此处发生

#### 数据模型核心实体（preview，详细 schema 见后续 ADR）

```
User           id, phone, name, avatar, createdAt
Address        id, userId, name, phone, region, detail, isDefault,
               kind: home | company | pickup | car
Product        id, title, categoryId, images[], status, createdAt
Sku            id, productId, attrs{}, price, stock
Category       id, parentId, name, sort
Cart           userId, items: [{ skuId, quantity, selected }]
Order          id, userId, status, totalAmount, addressId,
               fulfillmentKind: delivery | pickup, createdAt
OrderItem      orderId, skuId, quantity, snapshotPrice, snapshotTitle
Payment        id, orderId, method, status, amount, paidAt, externalRef
Fulfillment    orderId, kind, trackingNo?, pickupPointId?, status, eta
PickupPoint    id, name, lat, lng, address, openingHours
```

#### 本地开发端口约定
| 服务 | 地址 |
|---|---|
| 前端 H5 dev (vite) | `http://localhost:5173` |
| 后端 API | `http://localhost:3000` |
| OpenAPI 渲染（Swagger UI） | `http://localhost:3000/docs` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

#### 环境变量分层
- `.env.local` —— 本地开发（git 不入仓）
- `.env.development` / `.env.production` —— 模板（入仓，含示例值）
- 敏感变量（JWT secret、DB 密码）只通过云厂商 secret manager 注入，不进任何 .env 文件
- 前端只读 `VITE_PUBLIC_*` 前缀变量，避免泄漏

## Testing Decisions

### 什么是好测试

只测外部行为，不测内部实现。模块只要接口稳定，内部重构不应该让测试失败。

### 哪些模块必须有测试（按价值排序）

1. **OrderStateMachine** — 纯函数状态机，覆盖所有合法/非法 transition；这是订单正确性的最后防线
2. **CartStore** — 增删改、本地存储同步、登录前后合并、断网降级；电商最容易出 bug 的地方
3. **DrivingContext** — 车速阈值进入/退出行车态、防抖、传感器缺失降级；这是车机端独有的关键路径
4. **PaymentSession** — 幂等性、超时处理、回调状态收敛；钱相关的必须测
5. **后端 order-service / payment-service** — 接口契约测试、状态流转测试

### 哪些模块测试优先级低（Demo 阶段）

- 纯展示组件（首页轮播、商品卡片）— 视觉走 UI 设计稿审查 + 真机验收
- CatalogStore 查询逻辑 — 依赖后端接口，Demo 阶段以集成测试覆盖

### 测试形态

- 单元测试：纯函数模块（OrderStateMachine、DrivingContext 状态机部分）
- 集成测试：CartStore、PaymentSession（mock 后端）
- E2E：主链路（浏览 → 加购 → 下单 → 支付 → 订单查询）一条 happy path + 一条行车态降级 path

### 先例参考

车机 H5 是新项目，无既有测试基础设施。**首个搭建测试脚手架的 PR 同时落地 OrderStateMachine 单测作为示范**，后续模块参照该 PR 风格。

## Out of Scope

Demo 阶段明确不做的事：

1. **直播 / 短视频带货** — 车内驾驶安全约束
2. **复杂营销** — 拼团、砍价、瓜分红包、跨店满减
3. **第三方商家入驻** — 先做自营商品，多商家是中长期能力
4. **真实支付** — Demo 阶段使用 mock 支付，不接入真实微信/支付宝/银联（需牌照）
5. **真实物流接入** — 物流轨迹 mock，不对接顺丰/京东物流等真实承运商
6. **车厂账号 SSO 真实接入** — 预留接口，但 Demo 阶段不实际对接任何车厂
7. **多车型 WebView 真机适配** — Demo 阶段只验证「通用横屏 Web 演示」，不专门去解决某个车厂 WebView 的 quirks
8. ~~**后台运营系统** — 商品/订单管理后台不在 Demo 范围~~ **【v0.5 作废，已移入范围】** 见 §I 后台管理 + [`docs/scope.md §二`](./scope.md)。数据现可由 admin-catalog 手工维护，种子脚本仅作初始兜底。
9. **副驾/后排乘客身份识别** — Demo 阶段统一按"驾驶员"降级（已在 User Story #30 中明确）
10. **国际化 / 多语言** — Demo 中文单语
11. **AR/VR/3D 商品展示** — 性能与场景都不合适

## Further Notes

### 阶段策略

- **阶段一（当前，Demo）**：通用横屏 Web 演示版，不绑定任何具体车厂，目标是把"车机电商体验长什么样"讲清楚
- **阶段二（中期）**：选 1-2 个真实车厂应用市场对接（WebView 适配 + 账号 + 支付通道）
- **阶段三（长期）**：车机 + 手机双端互通账号体系，沉淀车主消费数据

### 研发顺序（已锁定）

PRD → 信息架构 → 技术架构 → UI 设计 → 前端骨架 → 后端服务 → 部署

每一步必须在 `docs/` 下落到文件，详见 `CLAUDE.md`。

### 已存在文档

- `docs/INDEX.md` — 文档总目录
- `diagrams/information-architecture.excalidraw` — 信息架构图（已交付）

### 关键风险

| 风险 | 应对 |
|---|---|
| 支付合规：Demo 后真实上线需电商/支付牌照 | Demo 阶段全 mock，上线前由业务方解决资质 |
| 车机适配差异大：不同车厂 WebView 内核、字体、安全策略各异 | Demo 不解决，进入阶段二时按目标车厂做专项适配 ADR |
| 账号体系不确定：是否接车厂账号 / 微信 / 支付宝 | 账号模块设计为可插拔登录器，具体登录方式待业务确认 |
| 物流模式不确定：自营 vs 第三方 vs 车厂周边服务 | 履约模块抽象为多策略，具体策略后选 |

### 决策需要立刻发起的 ADR（占位）

- ADR-0001 前端框架选型（React vs Vue vs SolidJS）
- ADR-0002 后端语言与运行时（Node.js vs Go vs Java）
- ADR-0003 数据库选型（PostgreSQL vs MySQL）
- ADR-0004 行车态车速数据源协议（Demo 用 URL 参数模拟，正式接入用什么 JS Bridge 标准）
- ADR-0005 部署方案（Vercel + 云厂商容器 vs 一体化云原生）

### 起手 Coding 计划

#### 开发环境前置（一次性）

- **Node.js** ≥ 20.x（LTS）
- **pnpm** ≥ 9（`npm i -g pnpm`）
- **Docker Desktop**（跑本地 PG + Redis）
- **Git**（已装，Windows 用自带的 GCM 做 GitHub 鉴权）
- **VS Code** + 插件：ESLint / Prettier / TypeScript Importer / Tailwind IntelliSense（如用）

#### 第一行代码怎么写（5 步起跑）

```bash
# 1. clone 仓库
git clone https://github.com/mattyyyyyyy/JDOTEST.git
cd JDOTEST

# 2. 安装依赖（一次性下完所有 workspace 包）
pnpm install

# 3. 起本地依赖服务
docker compose -f infra/docker-compose.yml up -d

# 4. 建表 + 灌种子数据
pnpm --filter @jdo/api db:migrate
pnpm --filter @jdo/api seed

# 5. 并行启动前端 + 后端
pnpm dev
```

打开 `http://localhost:5173`，默认看到首页 + 商品列表。
横屏验证：浏览器 DevTools → 自定义设备 → 1920×720 / 1920×1080 / 2560×1440。

#### Week 0 · 脚手架（0.5–1 天）
- [ ] 初始化 pnpm workspace、`tsconfig.base.json`、`packages/eslint-config`
- [ ] 写 `infra/docker-compose.yml`（postgres + redis）
- [ ] 配 `.github/workflows/ci.yml`：lint + typecheck + test + build 四件套
- [ ] 写 `README.md`：指向 PRD 与 `docs/INDEX.md`，给出"5 步起跑"
- [ ] 保留现有 `docs/` 与 `diagrams/`

#### Week 1 · 关键路径打通（5 天）

| Day | 任务 | 验收标准 |
|---|---|---|
| 1 | 后端 `services/api` 骨架 + `catalog` 模块 + 商品种子数据 | `curl localhost:3000/api/v1/products` 返回 JSON |
| 2 | 前端 `apps/h5` 骨架 + 路由 + `DrivingContext` + 设计 tokens | `localhost:5173` 渲染首页（MSW mock 数据） |
| 3 | 前后端联调：关掉 MSW，vite proxy 转发到后端 | 前端拿到真实商品列表 |
| 4 | 商品详情 + 加购 + `CartStore` 本地存储 | 购物车 CRUD 跑通，刷新页面不丢 |
| 5 | 下单 + Mock Payment + 订单状态机集成 | 主链路可演：浏览→加购→下单→支付→订单详情 |

#### Week 2 · 完善与演示
- [ ] 完善行车态降级（DrivingContext 接入更多组件，验证安全约束）
- [ ] 横屏分辨率自适应（写 1920×720 / 1920×1080 / 2560×1440 三套断点）
- [ ] 深色主题完成度提升 + 浅色切换
- [ ] 关键埋点接入（PV、转化漏斗、行车态切换次数）
- [ ] 前端 Vercel 部署、后端容器化部署
- [ ] 录演示视频（30s 主链路 + 30s 行车态降级）

#### 开干前必须先定的 ADR（与上节呼应）

按依赖顺序，**逐个落 ADR 文件**，不要一次性大讨论：

| 序号 | 主题 | 建议默认 | 阻塞谁 |
|---|---|---|---|
| ADR-0006 | monorepo 工具 | pnpm workspaces + Turborepo | 所有后续工作 |
| ADR-0001 | 前端框架 | React + Vite + TypeScript | 前端骨架 |
| ADR-0002 | 后端运行时与框架 | Node.js + Fastify（轻量）或 NestJS（结构化） | 后端骨架 |
| ADR-0003 | 数据库 + ORM | PostgreSQL + Prisma | 后端 schema 落地 |
| ADR-0007 | UI 库 / 设计系统起点 | 自研 design tokens + 按需抠现成组件 | UI 设计稿落代码 |
| ADR-0004 | 行车态车速数据源协议 | Demo 用 `?speed=20` URL 参数 mock | DrivingContext 实装 |
| ADR-0005 | 部署方案 | 前端 Vercel + 后端 Railway/Render | Week 2 演示 |

**规则**：每个 ADR 写一份 `docs/decisions/ADR-NNNN-*.md`，写完先确认再写代码。

#### 边界与节奏控制

- **Demo 阶段只做 happy path + 一条行车态降级 path**，不追求边界 case 覆盖
- **每个模块的"第一版"先打通端到端，再回头加测试与边界**（深模块除外，深模块必须随实现写单测）
- **每周日复盘**：把这一周的决策写进 ADR 或更新 PRD，落入 `docs/`，**不允许靠记忆**

### 沟通与协作

- 沟通语言：中文
- 用户视角：全栈产品视角（需求 → UI → 前端 → 后端 → 部署完整闭环）
- 协作铁律：所有调研与决策必须落到本仓库 `docs/` 下（见 `CLAUDE.md`），下一轮会话不依赖口头结论
