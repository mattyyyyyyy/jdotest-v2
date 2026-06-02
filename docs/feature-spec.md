# 车机电商平台 · 详细功能清单 Feature Spec v1.0

> 日期：2026-05-26 · 状态：Draft · **本文件是路由命名与功能拆解的权威源**
> 协作铁律见 [CLAUDE.md](../CLAUDE.md) · 上游 PRD：[PRD.md](./PRD.md)
>
> **📌 文档分工**（避免与平行文档冲突，全部见 [INDEX.md](./INDEX.md)）：
> - **本文件（feature-spec）**：**路由 + 功能拆解 + 状态机 + 接口 + 验收 checklist** — 工程实现层权威源
> - [`docs/design/page-spec.md`](./design/page-spec.md)：设计调性（液态玻璃/近黑/高对比/大点击）+ 视觉区块布局 — UI 视觉层权威源
> - [`docs/research/competitor-analysis.md`](./research/competitor-analysis.md)：竞品调研 + HMI 规范 — 设计 token / 字号 / 对比度依据
>
> 配套图示：[信息架构图](../diagrams/information-architecture.excalidraw) · [系统架构图](../diagrams/system-architecture.excalidraw)
>
> **本文件目的**：把 PRD 的 39 条 User Story 拆解成「页面 × 区块 × 组件 × 交互 × 状态 × 接口 × 行车态行为」的可派活清单。任何一项功能落代码前，对照本文件验收。

---

## 阅读约定

- **页面编号** `P-NN`（路由级页面）；**模块编号** `M-XX`（跨页面的能力）
- **接口** 一律按 `METHOD /api/v1/...` 写完整路径，详见 [packages/api-contracts/openapi.yaml]（待落地）
- **行车态行为** 用图标标注：
  - ✅ 行车态完整保留
  - ⚠️ 行车态降级（简化版/默认值）
  - 🚫 行车态完全隐藏
- **状态机** 用 `STATE-A → event → STATE-B` 表达；与 [packages/order-state-machine](../packages/order-state-machine/) 一致
- **校验** 全部走 zod schema，错误格式遵循 PRD §后端接入方案

---

## 🚦 派活进度 Implementation Status

> 全局派活看板。**认领工作前先在 [`docs/INDEX.md`](./INDEX.md) §Active Workstreams append 一行**，再在此把对应项的状态徽改成你的 agent-id。
> 状态字段固定 4 个值，不允许自定义：`🟡 unclaimed` / `🔵 in-progress` / `🟢 done` / `🔴 blocked`。
> 改这张表本身遵循 append-only 协作精神：状态变更直接覆写自己之前的行（不要复制多行），不要动别人的认领。

### 页面 Pages

| ID | 名称 | 路由 | 状态 | Owner | 关联 mockup | 备注 |
|---|---|---|---|---|---|---|
| P-01 | 首页 | `/` | 🟡 unclaimed | — | `home.html` | 2560×1600 版本已就绪 |
| P-02 | 分类页 | `/c/:cid` | 🟡 unclaimed | — | `category.html` | — |
| P-03 | 搜索页 | `/search` | 🟡 unclaimed | — | `search.html` | — |
| P-04 | 商品详情 | `/p/:pid` | 🟡 unclaimed | — | `product-detail.html` | — |
| P-05 | 购物车 | `/cart` | 🟡 unclaimed | — | `cart.html` | — |
| P-06 | 结算页 | `/checkout` | 🟡 unclaimed | — | `checkout.html` | — |
| P-07 | 支付页 | `/pay/:orderId` | 🟡 unclaimed | — | `payment.html` | — |
| P-08 | 我的订单 | `/orders` | 🟡 unclaimed | — | — | mockup 待补 |
| P-09 | 订单详情 | `/orders/:oid` | 🟡 unclaimed | — | `order-detail.html` | — |
| P-10 | 个人中心 | `/me` | 🟡 unclaimed | — | `profile.html` | — |
| P-11 | 地址簿 | `/me/addresses` | 🟡 unclaimed | — | — | mockup 待补 |
| P-12 | 登录页 / 弹层 | `/login` | 🟡 unclaimed | — | `login.html` | — |
| P-13 | 行车态首页 | `/driving` | 🟡 unclaimed | — | `driving-home.html` | 核心差异化页 |

### 跨页面模块 Modules

| ID | 名称 | 状态 | Owner | 备注 |
|---|---|---|---|---|
| M-01 | 顶部状态栏 | 🟡 unclaimed | — | — |
| M-02 | 全局底栏（行车态） | 🟡 unclaimed | — | — |
| M-03 | 主题与暗色 | 🟡 unclaimed | — | 与 design-tokens 联动 |
| M-04 | 路由 & 转场 | 🟡 unclaimed | — | — |
| M-05 | 全局语音入口 | 🟡 unclaimed | — | — |
| M-06 | 自提点选择弹层 | 🟡 unclaimed | — | 跨 P-04 / P-06 |
| M-07 | 通知中心 | 🟡 unclaimed | — | 含 SSE |
| M-08 | 弱网与缓存 | 🟡 unclaimed | — | IndexedDB + react-query |
| M-09 | 埋点 | 🟡 unclaimed | — | — |
| M-10 | 错误与降级 | 🟡 unclaimed | — | — |
| M-11 | 主题与设计 Token | 🟡 unclaimed | — | 实现见 `packages/design-tokens` |
| M-12 | DrivingContext ⭐ | 🟡 unclaimed | — | 深模块，ADR-0004 |
| M-13 | JS Bridge 抽象 | 🟡 unclaimed | — | 多车厂 stub |

### 后端服务 Backend Modules（per ADR-0002 modular monolith）

| ID | 名称 | 状态 | Owner | 备注 |
|---|---|---|---|---|
| BE-catalog | 商品服务 | 🔵 in-progress | claude-impl-slice1 | 薄切片已落地（内存 seed + /api/v1/products[/:id] + /categories），待接 Prisma/PG |
| BE-cart | 购物车服务 | 🟡 unclaimed | — | Redis-heavy |
| BE-order | 订单服务 | 🔵 in-progress | claude-impl-slice1 | `packages/order-state-machine` 纯函数 + 20 单测已落地；service/repo 待接 DB |
| BE-payment | 支付服务（mock） | 🟡 unclaimed | — | — |
| BE-user | 账号服务 | 🟡 unclaimed | — | JWT |
| BE-fulfillment | 履约服务 | 🟡 unclaimed | — | 自提点 + 物流轨迹 |
| BE-gateway | API 网关 | 🟡 unclaimed | — | 鉴权 / 限流 / CORS |

### 后台管理页面 Admin Pages（内嵌 SPA · `services/api/src/admin-spa.ts` · per ADR-0010）★ v0.5 新增

> admin 不受车机约束（无行车态 / 无 88px）。UI 复用 design token，桌面布局（左导航 + 顶面包屑 + 主区表格/表单）。无 mockup（per ADR-0012）。
> **实现方式**：自包含 vanilla JS SPA，嵌入 `admin-spa.ts` 作为字符串常量，由后端 `/admin-ui` 路由直接服务。无需独立 `apps/admin` 构建。

| ID | 名称 | 路由 | 状态 | Owner | 对应域 | 备注 |
|---|---|---|---|---|---|---|
| A-01 | 后台登录 | `/admin/login` | 🟢 done | claude-admin-impl | admin-auth | 自动登录 admin/ops01/cs01；RBAC 4 角色 |
| A-02 | 工作台 / 看板 | `/admin` | 🟢 done | claude-admin-impl | admin-analytics | KPI 卡片 + GMV 趋势图 + 待办面板 |
| A-03 | 商品列表 | `/admin/products` | 🟢 done | claude-admin-impl | admin-catalog | 搜索 / 分页 / 上下架 / 批量操作 |
| A-04 | 商品编辑 | `/admin/products/:id` | 🟢 done | claude-admin-impl | admin-catalog | 抽屉表单：SKU / 图片上传 / 库存 |
| A-05 | 分类管理 | `/admin/categories` | 🟢 done | claude-admin-impl | admin-catalog | 7 场景维护；删除拦截（有商品引用时 409） |
| A-06 | 订单列表 | `/admin/orders` | 🟢 done | claude-admin-impl | admin-order | 搜索 / 状态筛选 / 分页 |
| A-07 | 订单详情 | `/admin/orders/:id` | 🟢 done | claude-admin-impl | admin-order | 发货 / 取消 / 退款审核（状态机驱动） |
| A-08 | 用户列表 | `/admin/users` | 🟢 done | claude-admin-impl | admin-user | 封禁 / 查看积分余额 |
| A-09 | 营销 - banner/推荐位 | `/admin/marketing` | 🟢 done | claude-admin-impl | admin-marketing | Banner CRUD + HeroRec CRUD + 启停 |
| A-10 | 优惠券 | `/admin/coupons` | 🟢 done | claude-admin-impl | admin-marketing | 创建 / 发放 / 停用 |
| A-11 | 内容 - 评价/推荐位 | `/admin/content` | 🟢 done | claude-admin-impl | admin-content | 评价审核（隐藏/删除）+ 推荐位维护 |
| A-12 | 自提点管理 | `/admin/pickup-points` | 🟢 done | claude-admin-impl | admin-fulfillment | CRUD + 启停 |
| A-13 | 物流轨迹录入 | `/admin/shipping` | 🟢 done | claude-admin-impl | admin-fulfillment | 录入 / 更新轨迹节点 |
| A-14 | 角色 / 权限 / 系统 | `/admin/system` | 🟢 done | claude-admin-impl | admin-auth | RBAC 管理 + 审计日志 + 系统配置 |

### 后台后端能力 Admin Backend（复用 `services/api`，命名空间 `/api/v1/admin/*` · per ADR-0010）★

| ID | 名称 | 状态 | Owner | 备注 |
|---|---|---|---|---|
| BE-admin-auth | admin 登录 + RBAC + 审计 | 🟢 done | claude-harness-reconcile | `admin-auth.ts` · 38 测试 · admin/ops01/cs01 |
| BE-admin-catalog | 商品/SKU/分类写接口 | 🟢 done | claude-admin-impl | 通用 CRUD · `/api/v1/admin/:resource` |
| BE-admin-order | 订单管理 / 发货 / 退款 | 🟢 done | claude-admin-impl | 通用 CRUD + 状态机 `/orders/:id/status` |
| BE-admin-user | 用户管理 / 封禁 / 审核 | 🟢 done | claude-admin-impl | 通用 CRUD |
| BE-admin-marketing | banner/秒杀/券/推荐位 | 🟢 done | claude-admin-impl | 通用 CRUD |
| BE-admin-fulfillment | 自提点 / 物流写接口 | 🟢 done | claude-admin-impl | 通用 CRUD |
| BE-admin-analytics | 看板聚合查询 | 🟢 done | claude-admin-impl | `/api/v1/admin/analytics` |

---

## 路由 → OpenSpec domain 映射

> spec 主体在 `openspec/specs/<domain>/spec.md`；本表只做导航。改 spec 走 `/opsx:propose`，不直接编辑 specs/。
> **spec 状态**（2026-06-02 全域补齐 + forward 实现后）：✅=`specs/` 已有当前真相。**18 域全部 ✅，无 forward 待实现。**

| 路由（消费端 / 后台） | Domain | spec 状态 |
|---|---|---|
| `/`, `/c/:cid`, `/search`, `/p/:pid` | `catalog` | ✅ |
| `/cart` | `cart` | ✅ |
| `/checkout`, `/orders`, `/orders/:oid` | `order` | ✅ |
| `/pay/:orderId` | `payment` | ✅ |
| `/login`（手机号） | `auth-login` | ✅（`/api/v1/auth/sms-code` + `sms-login`）|
| `/login`（扫码）, `/driving` 扫码 | `auth-qr` | ✅ |
| `/me`, `/me/addresses` | `user` | ✅（`/api/v1/me` + `/me/addresses` + `/me/wallet`）|
| `/driving`, 全局行车态降级 | `driving-mode` | ✅ |
| 自提点 / 物流轨迹（消费端展示） | `fulfillment` | ✅（`/api/v1/fulfillment/pickup-points` + `/orders/:id/shipping`）|
| `/admin/login`, `/admin/system` | `admin-auth` | ✅ |
| `/admin/products`, `/admin/categories` | `admin-catalog` | ✅ |
| `/admin/orders` | `admin-order` | ✅ |
| `/admin/users` | `admin-user` | ✅ |
| `/admin/marketing`, `/admin/coupons` | `admin-marketing` | ✅ |
| `/admin/content` | `admin-content` | ✅ |
| `/admin/pickup-points`, `/admin/shipping` | `admin-fulfillment` | ✅ |
| `/admin`（看板） | `admin-analytics` | ✅ |

---

## 一、全局页面骨架 (IVI Shell)

所有页面共享的容器与底层能力。

### M-01 顶部状态栏（持久）
| 区域 | 内容 | 行车态 |
|---|---|---|
| 左：品牌 + 入口 | Logo + 首页 / 分类 / 搜索 / 订单 | ✅ |
| 中：搜索框 | 关键字 + 语音按钮 | ⚠️ 键盘禁用，仅语音 |
| 右：账号 + 购物车 + 主题切换 + 行车态指示 | 头像、购物车角标、☀️/🌙、🚗"行车态"/🅿️"停车态" | ✅ |

接口：
- `GET /api/v1/me` — 拉头像、昵称、未读消息数
- `GET /api/v1/cart/count` — 购物车红点角标

### M-02 全局底栏（行车态时浮现）
- 仅行车态显示一条「⚠️ 行车态：仅显示常用商品 · 已默认地址 · 已默认支付」横幅
- 提供「停车后展开完整购物」按钮：停车时一键回到上次中断页面

### M-03 主题与暗色
- 深色为默认，浅色可手动切换
- 切换 token 由 [DrivingContext](#m-12-driving-context) 与用户偏好双轨决定
- 持久化：`localStorage.theme = 'dark' | 'light'`

### M-04 路由 & 转场
| 路由 | 页面 | Lazy 拆包 |
|---|---|---|
| `/` | P-01 首页 | 否（入口） |
| `/c/:cid` | P-02 分类页 | 是 |
| `/search` | P-03 搜索页 | 是 |
| `/p/:pid` | P-04 商品详情 | 是 |
| `/cart` | P-05 购物车 | 是 |
| `/checkout` | P-06 结算页 | 是 |
| `/pay/:orderId` | P-07 支付页 | 是 |
| `/orders` | P-08 我的订单 | 是 |
| `/orders/:oid` | P-09 订单详情 | 是 |
| `/me` | P-10 个人中心 | 是 |
| `/me/addresses` | P-11 地址簿 | 是 |
| `/login` | P-12 登录页 | 是（也作模态弹层使用） |
| `/driving` | P-13 行车态首页（特殊路由，仅行车态自动跳） | 否 |

- 转场：横屏特化 `slide-x`，时长 240ms，行车态降为 0ms（瞬切，降低视觉刺激）

---

## 二、页面详解

### P-01 首页 `/`

#### 布局（停车态，1920×720 横屏基准）
```
┌─ M-01 顶部栏 ───────────────────────────────────────┐
│ 主视觉横幅 banner (1920×360, 自动轮播 5s)            │
├──────────┬──────────────────────────────────────────┤
│ 左：     │ 右上：限时秒杀（4 商品横向，倒计时）       │
│ 一级     │                                          │
│ 分类     ├──────────────────────────────────────────┤
│ 导航     │ 右中：为你推荐（瀑布 2 行 × 6 列）         │
│ (10项)   │                                          │
│          ├──────────────────────────────────────────┤
│          │ 右下：常买商品 / 再买一次（横向滑动）       │
└──────────┴──────────────────────────────────────────┘
```

#### 区块清单

| 区块 ID | 名称 | 数据源 | 行车态 | 备注 |
|---|---|---|---|---|
| B-101 | 主视觉横幅 | `GET /api/v1/home/banners` | 🚫 隐藏（动效分心） | 5 张，4:1，自动轮播可手动停 |
| B-102 | 一级分类导航 | `GET /api/v1/categories?level=1` | ⚠️ 仅前 4 项 | 88×88px 入口图标 |
| B-103 | 限时秒杀 | `GET /api/v1/home/flash-sales` | 🚫 隐藏 | 倒计时按服务端时间，禁本地时钟 |
| B-104 | 为你推荐 | `GET /api/v1/home/recommend?cursor=&limit=12` | ⚠️ 仅 6 项，且只显示「再买一次」候选 | 个性化或冷启时按品类热度 |
| B-105 | 常买/再买一次 | `GET /api/v1/me/frequent-items` | ✅ 完整 | 行车态首屏核心，按用户历史 |

#### 交互
- 点击 banner → 跳 banner.targetUrl（站内路由或商品详情）
- 点击分类 → `/c/:cid`
- 点击商品卡 → `/p/:pid`
- 「再买一次」按钮 → 调 `POST /api/v1/cart/quick-add { skuId, qty: 1 }` → toast「已加入购物车」→ 停留 2s 后自动消失

#### 状态
- 加载：骨架屏（card-shimmer）
- 空（无推荐）：显示「为你寻找好物中…」 + 跳分类引导
- 错误：保留上次缓存 + 顶部红条「网络异常，点击重试」

---

### P-02 分类页 `/c/:cid`

#### 布局
```
┌─ M-01 ────────────────────────────────────────────┐
│ 左侧：二级分类竖向 Tab (sticky)                       │
│ 主区：商品列表 (4 列 grid，无限滚动)                  │
│ 顶部条：筛选（综合/销量/价格升降）+ 视图切换（大卡/小卡）│
└───────────────────────────────────────────────────┘
```

#### 数据
- `GET /api/v1/categories/:cid` — 顶部面包屑 + 二级树
- `GET /api/v1/products?categoryId=&sort=&cursor=&limit=24` — 商品列表（cursor 分页）

#### 交互
- 切二级分类 → 替换主区列表，不刷整页
- 排序变更 → 重置 cursor 重新拉
- 滚到底（剩 2 行触发） → 拉下一页
- 点商品 → `/p/:pid`，并埋 `track('product_card_click', { from: 'category', cid })`

#### 状态
- 空品类：显示「该分类暂无商品」+ 回首页按钮
- 加载更多失败：列表底部红色重试条

#### 行车态 ⚠️
- 二级 Tab 折叠成单选 Dropdown
- 排序条隐藏（默认综合）
- 商品列表强制大卡，每行 2 列

---

### P-03 搜索页 `/search`

#### 输入区
- 大输入框（高度 80px），右侧语音按钮 88×88
- 输入触发联想：`GET /api/v1/search/suggest?q=` (debounce 200ms)
- 历史关键字：`GET /api/v1/me/search-history`（前 8 条，可清空）
- 热门搜索：`GET /api/v1/search/hot`

#### 结果区（提交搜索后）
- 复用 P-02 的商品 grid 组件
- 顶部加「相关分类 chips」（命中分类时显示）
- 接口：`GET /api/v1/products/search?q=&sort=&cursor=`

#### 语音搜索 M-05
- 点麦克风 → 唤起 Web Speech API（车机 WebView 内通常已注入）
- 实时显示识别中的文字
- 识别完成 → 自动提交搜索
- 失败兜底：「没听清，请重试」+ 文本输入降级

#### 行车态 ⚠️
- 默认聚焦麦克风按钮，文本输入框禁用（display: none 也可）
- 历史关键字仍可点击
- 搜索结果强制大卡 2 列

---

### P-04 商品详情 `/p/:pid`

#### 布局（横屏左右分栏）
```
┌─ M-01 ────────────────────────────────────────────┐
│ 左 60%：主图轮播 (1152×648) + 缩略图导航             │
│ 右 40%：                                            │
│   标题、副标题、价格、销量                            │
│   SKU 选择（规格/颜色/尺寸）                          │
│   数量步进器                                         │
│   "加入购物车" + "立即购买" 双按钮                    │
│   配送/自提选项（小卡片）                             │
│   详情/参数/评价 Tab                                  │
└───────────────────────────────────────────────────┘
```

#### 数据
- `GET /api/v1/products/:pid` — 商品主信息 + SKU 列表 + 主图组
- `GET /api/v1/products/:pid/reviews?cursor=&limit=10` — 评价
- `GET /api/v1/fulfillment/pickup-points?lat=&lng=&radius=3000` — 附近自提点（最多 5 个）

#### 交互详解

| 元素 | 交互 | 接口 / 状态 |
|---|---|---|
| 主图缩略图 | 点切换大图 | 本地状态 |
| SKU 矩阵 | 任选属性组合，未匹配时按钮变灰禁用 | 本地推导 selectedSku |
| 数量 - / + | 边界：1 ≤ qty ≤ min(stock, 99) | 本地状态 |
| 加入购物车 | 必须先选齐 SKU | `POST /api/v1/cart/items { skuId, qty }` → toast |
| 立即购买 | 同上 + 跳过购物车 | 调 `POST /api/v1/orders/draft` 直接进 P-06 |
| 配送/自提切换 | 切到自提，下方显示自提点列表 | 见 M-06 |
| 评价 Tab | 懒加载 | `GET .../reviews` |

#### 状态
- 缺货：SKU 灰 + 「补货提醒」按钮（`POST /api/v1/products/:pid/notify-restock`）
- 已下架：全屏 toast + 自动 3s 跳回上一页
- 加载：左图 placeholder + 右文 shimmer

#### 行车态 ⚠️
- SKU 矩阵保留，但默认选「上次购买的 SKU」（取自 `/me/last-purchased-sku/:pid`）
- 数量步进器锁定 1
- 隐藏「立即购买」「详情 Tab」，只留「再买一次（默认地址 + 默认支付）」大按钮
- 评价 Tab 折叠

---

### P-05 购物车 `/cart`

#### 布局
- 表格化：勾选 / 商品图 / 标题 + SKU / 单价 / 数量 / 小计 / 删除
- 底部 sticky 结算栏：全选 + 已选 N 件 + 合计 + 「去结算」

#### 数据
- `GET /api/v1/cart` — 全量购物车
- 状态机由 [`CartStore` 深模块](../packages/) 管理，详见 PRD §模块拆分

#### 交互（每行）
| 操作 | 接口 |
|---|---|
| 勾选/取消 | `PATCH /api/v1/cart/items/:id { selected: bool }`（debounce 300ms 合批） |
| 数量增减 | `PATCH /api/v1/cart/items/:id { qty }` |
| 删除 | `DELETE /api/v1/cart/items/:id` → 行 collapse 动画 240ms |
| 失效商品提示 | item.status='invalid' 时灰底 + 「移除」 |

#### 「去结算」按钮
- 校验：至少 1 件选中 → 否则按钮禁用
- 调 `POST /api/v1/orders/draft { itemIds: [...] }` → 跳 P-06 携带 draftOrderId

#### 行车态 🚫
- 整页不可达。导航栏「购物车」入口隐藏
- 行车态下「再买一次」绕过购物车直接进 P-06 默认快捷流

---

### P-06 结算页 `/checkout?draftOrderId=`

#### 布局（横屏左右分栏）
```
左 60% — 信息确认：
  收货/自提地址（卡片，可换）
  配送方式（标准 / 自提 / 加急）
  商品清单（折叠摘要：3 个缩略图 + N 件）
  发票信息（可选）
  备注（限 50 字，行车态禁用）

右 40% — 价格与提交：
  商品小计
  运费
  优惠
  实付（大字 32px）
  支付方式选择（扫码 / 免密 / 货到付款）
  "提交订单" 主按钮（88px 高）
```

#### 数据
- `GET /api/v1/orders/draft/:id` — 草稿订单详情（含已选地址、运费、优惠快照）
- `GET /api/v1/me/addresses` — 地址簿
- `GET /api/v1/fulfillment/quote { addressId, items }` — 运费试算
- 「提交订单」 → `POST /api/v1/orders { draftOrderId, addressId, paymentMethod, remark }`

#### 状态机（前后端共用，详见 [order-state-machine](../packages/order-state-machine/)）
- 提交前：`DRAFT`
- 提交成功 → `PENDING_PAYMENT` → 跳 P-07
- 提交失败：
  - `STOCK_CHANGED` → 弹窗「库存变化，请确认新清单」，重新拉草稿
  - `PRICE_CHANGED` → 弹窗「价格已更新」
  - `ADDRESS_INVALID` → 高亮地址卡片

#### 行车态 ⚠️
- 地址锁定为默认；不允许切换
- 配送方式锁定为默认（按用户偏好）
- 备注栏 disabled
- 发票折叠
- 支付方式锁定为已绑定的免密通道；若无 → 引导停车后操作
- 「提交订单」按钮文案改为「确认下单（已用默认配置）」

---

### P-07 支付页 `/pay/:orderId`

#### 形态切换
- **二维码扫码（默认）**
  - 左 50%：超大二维码 (480×480px) + 倒计时 (5min)
  - 右 50%：订单摘要 + 「换支付方式」+ 「已支付」按钮
- **免密一键**
  - 中央巨大「点击支付 ¥199.00」按钮，无二维码
  - 直接调 `POST /api/v1/payments/:sessionId/confirm`

#### 数据
- `POST /api/v1/payments` → 创建 PaymentSession（订单创建时已同步创建，此处只查）
- `GET /api/v1/payments/:sessionId` — 当前状态
- `GET /api/v1/payments/:sessionId/status` — 长轮询/SSE 流（深模块 PaymentSession 负责）

#### 状态机
- `PENDING` → 等待 / 显示二维码
- `PAID` → 全屏绿色对勾动画 1.5s → 跳 P-09
- `FAILED` → 红色提示 + 重试按钮
- `EXPIRED` → 倒计时归零 → 「二维码已失效，刷新重试」

#### 行车态 ⚠️
- 强制只允许免密通道（PRD §F-27 安全约束）
- 二维码扫码 path 不展示，行车态用户无该路径可走

---

### P-08 我的订单 `/orders`

#### Tab：全部 / 待付款 / 待发货 / 待收货 / 已完成 / 售后

#### 列表项
- 订单号 + 下单时间
- 前 3 个商品缩略图 + 「共 N 件」
- 状态徽章 + 金额
- 主操作按钮（按状态切）：「去支付」「催发货」「确认收货」「再买一次」「申请售后」

#### 数据
- `GET /api/v1/orders?status=&cursor=&limit=20`

#### 行车态 ⚠️
- 仅显示「待收货」+「已完成」最近 5 单
- 操作按钮只保留「再买一次」与「查看物流」

---

### P-09 订单详情 `/orders/:oid`

#### 布局区块
1. 顶部状态条（大字号 + 时间线）
2. 物流轨迹（自提单显示取货码 + 地图，配送单显示配送轨迹）
3. 收货/自提信息
4. 商品清单
5. 金额明细
6. 订单信息（订单号、下单时间、支付方式等，可复制）
7. 底部操作栏

#### 数据
- `GET /api/v1/orders/:oid` — 全量
- `GET /api/v1/orders/:oid/tracking` — 物流轨迹（SSE，订单送达后停推）

#### 操作（按状态）
| 状态 | 主操作 | 次操作 |
|---|---|---|
| 待付款 | 去支付 | 取消订单 |
| 待发货 | 催发货 | 取消订单 |
| 待收货 | 确认收货 | 查看物流 |
| 已完成 | 再买一次 | 申请售后 / 评价 |

---

### P-10 个人中心 `/me`

#### 区块
- 头像 + 昵称 + 「车主认证」徽章（如已绑定车厂账号）
- 订单入口横排：待付款 / 待发货 / 待收货 / 已完成 / 售后（带角标）
- 我的卡片：地址簿 / 收藏 / 优惠券 / 客服 / 设置
- 设置：主题、行车态阈值调整（仅 Demo 显示用 mock 控件）、退出登录

#### 数据
- `GET /api/v1/me/profile`
- `GET /api/v1/me/order-counts` — Tab 角标
- `POST /api/v1/auth/logout`

---

### P-11 地址簿 `/me/addresses`

- 列表：默认地址置顶，每条卡片含地址、电话、操作（编辑/删除/设为默认）
- 「+ 新增地址」按钮 → 弹层表单
- 字段：收件人 / 电话 / 省市区 / 详细地址 / 标签（家/公司/自提/车辆当前位置）
- 「使用车辆当前位置」按钮 → 调 Bridge → 自动填入

#### 接口
- `GET /api/v1/me/addresses`
- `POST /api/v1/me/addresses`
- `PATCH /api/v1/me/addresses/:id`
- `DELETE /api/v1/me/addresses/:id`

---

### P-12 登录页 / 登录弹层 `/login`

#### 两个登录方式（默认扫码）

**方式 A · 扫码登录（推荐）**
- 大二维码 (480×480) + 倒计时
- 文案：「请用已登录手机扫码 / 5 分钟内有效」
- 状态：
  - `pending` → 等待
  - `scanned` → 二维码变灰 + 「请在手机上确认」
  - `confirmed` → 跳回上次页或首页
  - `expired` → 「二维码已失效」+ 刷新按钮

#### 接口（PRD §鉴权已定）
- `POST /api/v1/auth/qr-code` → `{ sessionId, qrUrl, expiresAt }`
- `GET /api/v1/auth/qr-status?sessionId=` → `pending|scanned|confirmed|expired`
- `confirmed` 后下发 JWT

**方式 B · 手机号 + 验证码（仅停车态）**
- 输入手机号 → `POST /api/v1/auth/sms/send`
- 输入验证码 → `POST /api/v1/auth/sms/verify` → JWT

#### Demo 阶段额外
- `POST /api/v1/auth/mock-login` → 一键登录 demo 账户（页面右下角小入口，仅开发环境）

#### 行车态 ⚠️
- 仅扫码方式可用，手机号登录入口隐藏

---

### P-13 行车态首页 `/driving`

> 这是车机商城最独特的页面。行车态触发后**自动跳**到本页（也保留导航入口）。

#### 布局（极简）
```
┌ 顶部安全条：⚠️ 行车中 · 仅显示常用 · 当前车速 32 km/h ┐
├──────────────────────────────────────────────────┤
│  [再买一次 - 玻璃水]  [再买一次 - 车充]  [再买一次 - 香薰] │
│      88x88 大图          88x88 大图          88x88 大图  │
│      ¥29              ¥99              ¥49             │
│      [一键购买]        [一键购买]        [一键购买]      │
├──────────────────────────────────────────────────┤
│  [我的订单] [扫码登录] [停车后展开完整购物]              │
└──────────────────────────────────────────────────┘
```

#### 数据
- `GET /api/v1/me/frequent-items?limit=3` — 仅取前 3
- 一键购买：`POST /api/v1/orders/quick { skuId }` — 后端用用户默认地址 + 默认免密支付一气合成

#### 状态
- 一键购买成功：大对勾 + 「已下单 · 订单号 #xxxxx」 toast，3s 后回行车态首页
- 未登录：直接显示「请扫码登录」二维码
- 无默认地址 / 无免密：「请停车后完成设置」提示，引导回 P-10

---

## 三、跨页面模块

> **命名约定**：本节 M-01 ~ M-13 是「UI 壳层 / 基础设施模块」（顶栏、底栏、主题、JS Bridge 等），更接近"全局组件"。
> 与 [`docs/PRD.md §模块拆分`](./PRD.md#模块拆分深模块优先) **不是同一层概念** —— 那边列的是业务领域深模块（cart / order / payment 等），是后端/前端 store 视角。
> 仅 **M-12 DrivingContext** 同时出现在两边，因为它既是业务关键深模块也是 UI 壳层基座。

### M-06 自提点选择
- 弹层组件，跨 P-04 商品详情、P-06 结算页
- 拉 `GET /api/v1/fulfillment/pickup-points?lat=&lng=&radius=`
- 列表项：名称 + 距离（km）+ 营业时间 + 当前是否营业 + 距您约 N 分钟
- 选中后回写到地址 / 配送配置

### M-07 通知中心
- 入口：M-01 顶部铃铛
- 触发场景：
  - 订单状态变更（备货中 / 配送中 / 送达）
  - 自提取货码到达
- 接口：`GET /api/v1/me/notifications?cursor=` + SSE `/api/v1/me/notifications/stream`
- 行车态：仅展示「订单送达」「即将到自提点」类急事；动效全关

### M-08 弱网与缓存
- 购物车本地优先（IndexedDB），上线后 sync
- 订单提交失败本地排队（最多 3 单），网络恢复时自动重试
- 商品列表 stale-while-revalidate（react-query 默认）

### M-09 埋点 (PRD §H 运营可观测)
- 事件分级：page_view / element_click / business_event / error
- 统一 `trackEvent(name, payload)`
- 必埋的关键事件：
  - `driving_mode_change` { from, to, trigger }
  - `quick_buy_clicked` { sku, from: 'driving_home' | 'product_detail' }
  - `order_submit` { amount, payMethod, deliveryKind }
  - `payment_status` { orderId, status, durationMs }
  - `voice_search_used` { query, success }

### M-10 错误与降级
- 统一错误码（PRD §后端错误格式），前端按 code 决定文案与降级
- 网络断开：全局红条「已离线，部分功能不可用」
- API 5xx：toast + 上报 sentry
- 行车态时所有错误优先静默不打扰，只在「停车后展开购物」前提示

### M-11 主题与设计 Token
- 详见 [docs/design/design-system.md](./design/design-system.md)
- 切换走 CSS variables，热切换无闪烁

### M-12 DrivingContext 深模块 ⭐
（PRD §模块拆分已锁定）
- 输入：`speed`（来源：URL `?speed=20` mock / 车机 JS Bridge / Demo 滑块）
- 防抖：>5 km/h 持续 1s → driving；=0 km/h 持续 3s → parked
- 输出：`useDrivingMode()` → `{ mode, restrictions, speed, source }`
- 所有降级判断必须读它，禁止页面自行判速

### M-13 JS Bridge 抽象
- 接口：`platform/bridge/index.ts`
- 当前实现：`mock` (URL 参数 / 调试面板) / `nio` / `lixiang` / `aito`（预留 stub）
- 暴露方法：`getVehicleSpeed()`, `getCurrentLocation()`, `requestPay({ amount })`, `showToast(msg)`, `vibrate(ms)`

---

## 四、状态机汇总

### 订单状态机（packages/order-state-machine）
```
DRAFT
  └─ submit → PENDING_PAYMENT
       └─ paid → PAID
            └─ prepared → SHIPPING
                 └─ delivered → COMPLETED
                      └─ refundReq → REFUNDING → REFUNDED
       └─ cancel → CANCELED
       └─ expire → EXPIRED
```

### 支付会话状态机（PaymentSession 深模块）
```
PENDING → scanned → CONFIRMED
       → expire → EXPIRED
       → fail → FAILED → retry → PENDING
```

### DrivingContext 状态机
```
parked --speed>5km/h 持续1s--> driving
driving --speed=0km/h 持续3s--> parked
unknown --first signal--> parked|driving
sensor_lost --fallback--> parked (打开传感器恢复提示)
```

---

## 五、接口清单总览（前端视角）

> 完整契约见 `packages/api-contracts/openapi.yaml`（待落地）。以下是按使用频率分组的速查表。

### 高频
- `GET /api/v1/home/banners`
- `GET /api/v1/home/recommend`
- `GET /api/v1/home/flash-sales`
- `GET /api/v1/me/frequent-items`
- `GET /api/v1/categories?level=1`
- `GET /api/v1/products?...`
- `GET /api/v1/products/:pid`
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:id`
- `DELETE /api/v1/cart/items/:id`
- `GET /api/v1/cart/count`

### 中频
- `POST /api/v1/orders/draft`
- `GET /api/v1/orders/draft/:id`
- `POST /api/v1/orders`
- `POST /api/v1/orders/quick`（行车态一键购）
- `GET /api/v1/orders?status=`
- `GET /api/v1/orders/:oid`
- `GET /api/v1/orders/:oid/tracking` (SSE)
- `POST /api/v1/payments`
- `GET /api/v1/payments/:sessionId/status` (SSE)
- `POST /api/v1/payments/:sessionId/confirm`（免密）

### 低频
- `GET /api/v1/search/suggest`
- `GET /api/v1/search/hot`
- `GET /api/v1/products/search`
- `GET /api/v1/products/:pid/reviews`
- `GET /api/v1/fulfillment/pickup-points`
- `GET /api/v1/fulfillment/quote`
- `GET /api/v1/me/profile`
- `GET /api/v1/me/order-counts`
- `GET /api/v1/me/addresses`
- `POST/PATCH/DELETE /api/v1/me/addresses[/:id]`
- `POST /api/v1/auth/qr-code`
- `GET /api/v1/auth/qr-status`
- `POST /api/v1/auth/sms/send`
- `POST /api/v1/auth/sms/verify`
- `POST /api/v1/auth/mock-login` (Dev only)
- `POST /api/v1/auth/logout`
- `GET /api/v1/me/notifications`
- `GET /api/v1/me/notifications/stream` (SSE)

---

## 六、验收 Checklist（开发完成前自查）

### 通用
- [ ] 所有按钮 ≥ 88×88px、点击间距 ≥ 16px
- [ ] 主字号 ≥ 18px，正文 ≥ 20px，主标题 ≥ 28px
- [ ] 对比度 ≥ WCAG AA (深色背景下文字 ≥ 7:1)
- [ ] 1920×720 / 1920×1080 / 2560×1440 三档无横向滚动条
- [ ] 弱网（throttle Slow 3G）首屏可见 ≤ 4s
- [ ] 离线状态购物车不丢

### 行车态
- [ ] `?speed=20` URL 参数能立即进入行车态
- [ ] 进入行车态后 3 秒内 UI 完成切换
- [ ] 行车态下尝试输入键盘 → 键盘组件不可达
- [ ] 行车态下所有 banner / 视频 / 闪烁停止
- [ ] 「再买一次」全链路 ≤ 3 步、零键盘输入

### 接口
- [ ] 所有 fetch 走自动生成的 typed client，禁手写
- [ ] 错误格式遵循统一 `{ code, message, details, traceId }`
- [ ] 关键写操作幂等（订单 / 支付带 Idempotency-Key Header）

### 安全
- [ ] JWT 存 HttpOnly cookie + Authorization 双轨
- [ ] 价格、库存以服务端为准，前端只显示，不做最终结算
- [ ] 二维码 sessionId 一次性，扫描后立即作废

---

## 七、与 PRD User Stories 的反向映射

| US# | 对应功能项 |
|---|---|
| 1 | P-01 B-101/B-102/B-103 |
| 2 | P-01 B-102 + P-02 |
| 3 | P-03 |
| 4 | P-03 + M-05 |
| 5 | P-04 |
| 6 | P-04 + M-06 |
| 7 | P-04 + P-05 |
| 8 | P-05 |
| 9 | P-04「立即购买」 |
| 10 | P-06 |
| 11 | P-11 + M-13 Bridge |
| 12 | P-01 B-105 + P-13 |
| 13 | P-07 二维码 |
| 14 | P-07 免密 |
| 15 | P-07 状态机 |
| 16 | P-08 |
| 17 | P-08 / P-09 取消订单 |
| 18 | P-09 物流 + 取货码 |
| 19 | M-07 通知 |
| 20 | P-12 方式 B |
| 21 | P-12 方式 A |
| 22 | M-13 Bridge 车厂账号预留 |
| 23 | P-11 |
| 24 | P-10 |
| 25-29 | M-12 DrivingContext |
| 30 | 全局已知妥协，文档注脚 |
| 31 | 验收 Checklist 横屏分辨率 |
| 32 | M-03 主题 |
| 33-34 | 验收 Checklist 触控 / 字号 |
| 35 | 设计规范禁手势 |
| 36 | M-08 弱网与缓存 |
| 37-39 | M-09 埋点 |

---

## 八、Open Questions（写完后必须解决）

> 任何 agent 拿到一项后，把 Owner 改成自己的 agent-id，状态改成 `🔵 in-progress`；解决后改 `🟢 done` 并在「结论 / commit」列填证据。

| # | 问题 | Owner | 状态 | 建议倾向 / 结论 |
|---|---|---|---|---|
| OQ-1 | 自提点数据是否需要打通真实地图 API | — | 🟡 待认领 | Demo 阶段建议 mock 5 个固定点 |
| OQ-2 | 「再买一次」的"常用"如何定义？ | — | 🟡 待认领 | 建议「近 30 天购买频次 ≥ 2 次」，待业务方确认 |
| OQ-3 | 行车态阈值 5km/h 是否合理？ | — | 🟢 已解决 | 见 [ADR-0004](./decisions/ADR-0004-driving-state-source.md) · 5km/h + 3s 防抖 |
| OQ-4 | 评价是否在 Demo 阶段做？ | — | 🟡 待认领 | 建议只读、可读不可写，下次 PRD 升版明确 |
| OQ-5 | 收藏功能是否在 Demo 范围？ | — | 🟡 待认领 | 建议放出占位 UI 但接口走 mock |
