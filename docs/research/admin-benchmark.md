# 主流电商后台管理 调研 Admin Benchmark

> 状态：Accepted（调研结论）· 日期：2026-05-29 · 维护者：调研 agent
> 目的：调研主流电商平台后台的**界面布局 / 分类逻辑 / 功能子项**，作为本项目 admin 演进的对标基线。
> 下游：[admin-spec.md](../design/admin-spec.md)（后台 IA）· [consistency-plan.md](../design/consistency-plan.md)
> 来源见文末。

调研对象覆盖三类形态：
- **独立站 SaaS**：Shopify Admin
- **平台型卖家后台（marketplace seller）**：Amazon Seller Central、淘宝千牛/商家中心、京东京麦
- **国内综合电商后台（平台级全模块）**：中文电商后台系统通用架构（16 中心）

---

## 一、界面布局 Layout（跨平台共识）

| 区域 | 做法（主流共识） |
|---|---|
| **整体框架** | 左侧固定竖向导航 + 顶部条 + 主内容区（经典三段式）。移动端折叠为抽屉。 |
| **左侧导航** | 一级菜单 5–8 组，可折叠二级；图标 + 文案；当前项高亮。复杂系统支持收起成图标条。 |
| **顶部条** | 全局搜索、店铺/账号切换、通知铃铛、帮助、当前用户/角色。 |
| **面包屑** | 主区顶部显示层级路径，便于回溯（列表 → 详情 → 编辑）。 |
| **主区 = 列表页范式** | 工具条（搜索 + 筛选 + 批量操作 + 新建）→ 数据表格 → 分页。 |
| **筛选** | 横向筛选只放高频 4–5 个；多筛选放抽屉/侧栏；已选条件做成**可删除 chip** +「清空」。 |
| **批量操作** | 表格行多选 → 顶部出现批量操作条（批量上下架/删除/导出）。 |
| **详情/编辑** | 右侧抽屉（轻量）或独立页（重量）；表单分组分区。 |
| **栅格** | 8pt / 12 栅格，统一间距、控件高度、字阶。 |
| **首页 = 工作台** | 关键指标卡（今日订单/GMV/待处理）+ 待办 + 趋势图，可配置。 |

> 我们的 admin（ADR-0012：桌面布局 + 复用 design token）已符合"左导航 + 顶部条 + 列表表格 + 抽屉表单"范式。

---

## 二、分类逻辑 IA（导航如何分组）

各平台一级分组对照：

| Shopify（独立站） | Amazon Seller（平台卖家） | 淘宝千牛 / 京东京麦 | 中文综合后台（平台级） |
|---|---|---|---|
| Home 工作台 | Catalog / Inventory 商品库存 | 商品管理 | 商品中心 |
| Orders 订单 | Orders 订单 | 交易/订单管理 | 订单中心 |
| Products 商品 | Pricing 定价 | 营销中心 | 促销中心 |
| Customers 客户 | Advertising 广告 | 客服/售后 | 用户中心 / 会员 |
| Marketing 营销 | Reports/Analytics 报表 | 数据（生意参谋/商智） | 数据/统计 |
| Discounts 优惠 | Performance/Account Health 账号健康 | 店铺装修/内容 | 内容管理 |
| Content 内容 | Shipments/Payments 发货/收款 | 资产/钱包 | 支付中心 / 财务 |
| Analytics 分析 | Brands/B2B 品牌/企业购 | 设置/权限 | 物流 / WMS仓储 |
| Finance 财务 | Growth/Learn 成长 | — | 采购 / 风控 / 客服 / 系统 |
| Settings 设置 | — | — | 调度中心 |

**归纳出的通用分组逻辑（按"运营链路"组织，而非按技术层）**：

```
1) 工作台 Home        —— 概览指标 + 待办
2) 商品 Catalog       —— 商品/SKU/SPU、分类品牌、库存、上下架、评价
3) 订单 Orders        —— 列表/详情、发货、退款、售后、物流
4) 用户/客户 Customers —— 用户、会员等级、积分、卡券、地址
5) 营销 Marketing     —— Banner/活动、优惠券、秒杀/拼团、推荐位、内容页
6) 数据 Analytics     —— 流量、转化漏斗、销售/GMV、商品/用户分析
7) 财务 Finance       —— 对账、结算、发票、提现
8) 内容 Content       —— 首页装修、专题页、富文本
9) 设置/系统 Settings —— 账号、角色权限、店铺、运费模板、配置、审计日志
```

> 关键洞察：**主流后台一律按"运营链路/业务域"分组，不按技术层（不会有 "数据库表" 这种菜单）**。我们的 admin-spec 13 模块基本对齐，下方做差距分析。

---

## 三、功能子项 Functional Sub-items（每模块常见子功能）

### 1. 商品 Catalog
- 商品列表（搜索/分类/状态筛选/批量上下架/批量改价）
- 商品新增/编辑：基本信息、**多图/主图上传**、SKU 规格矩阵、价格/库存、详情富文本、运费模板、上下架
- 分类/类目管理（树形）、品牌管理、属性/规格库
- 库存预警、批量导入导出（Excel）、商品评价管理、商品审核

### 2. 订单 Orders
- 订单列表（按状态 Tab：待付款/待发货/待收货/已完成/售后；搜索/时间筛选/导出）
- 订单详情：商品快照、金额明细、收货/物流、状态时间线、操作日志
- 发货（单个/批量、打单、运单号回填）、改地址、取消、备注
- 退款/退货/换货审核（售后工单）、物流轨迹

### 3. 用户/客户 Customers
- 用户列表（搜索/分群/标签）、详情、地址簿、消费记录
- 会员等级/权益、积分流水与调整、卡券发放、封禁/解封、实名/认证审核

### 4. 营销 Marketing
- 优惠券（满减/折扣/无门槛，创建/发放/停用/核销统计）
- 限时秒杀、拼团、满减满赠、组合购、代金券
- Banner/广告位、推荐位/选品、活动专题页、投放时段

### 5. 数据 Analytics
- 概览看板（PV/UV、GMV、订单数、转化率）
- 转化漏斗、流量来源、商品分析（销量榜/动销）、用户分析（新老/复购）
- 自定义时间范围、导出报表

### 6. 财务 Finance
- 交易对账、结算/账单、发票、提现、资金流水

### 7. 内容 Content
- 首页装修（楼层/模块拖拽）、专题页、图文/富文本、敏感词

### 8. 物流/履约 Fulfillment
- 运费模板、自提点、物流公司对接、轨迹查询、电子面单

### 9. 设置/系统 Settings
- 店铺信息、**角色与权限（RBAC）**、子账号、**操作审计日志**、消息通知、运营配置、开放接口

---

## 四、与本项目 admin 的差距分析 Gap Analysis

> 现状见 [admin-spec.md](../design/admin-spec.md)（13 模块）。✅=已有，🟡=部分，❌=缺。

| 通用模块 | 本项目现状 | 差距/建议 |
|---|---|---|
| 工作台 Home | ✅ 运营看板（PV/UV/GMV/渠道） | 🟡 缺"待办"（待发货/待审售后计数） |
| 商品 Catalog | ✅ 商品/分类 CRUD + 图片上传 + 上下架 | 🟡 缺 SKU 规格矩阵、批量操作、导入导出、库存预警 |
| 订单 Orders | ✅ 列表 + 改状态 | 🟡 缺状态 Tab 分组、批量发货、打单、操作日志 |
| 用户 Customers | ✅ 列表 + 封禁 + 积分 | 🟡 会员等级/卡券核销未细化 |
| 营销 Marketing | ✅ Banner/推荐位/优惠券 | 🟡 缺秒杀/拼团；券核销统计 |
| 数据 Analytics | ✅ 看板 | 🟡 缺转化漏斗下钻、导出 |
| 财务 Finance | ❌ 无 | 建议加只读对账/结算（P2） |
| 内容 Content | 🟡 场景/推荐位 | 🟡 缺首页装修拖拽（演示可简化） |
| 物流 Fulfillment | ✅ 自提点 + 物流轨迹录入 | 🟡 缺运费模板、电子面单 |
| 设置/系统 | 🟡 账号列表 | ❌ **RBAC 未真正挂载 + 审计日志未落地**（P0-③ add-admin-auth）|
| **批量操作 / 筛选 chip / 列表 Tab** | ❌ 通用 CRUD 暂无 | 建议给通用列表加：状态筛选、批量选择、分页（横切增强）|

**优先级建议（接入 consistency-plan）**：
1. **P0-③ RBAC + 审计**（设置/系统）—— 主流后台标配，spec 已写好
2. **列表横切能力**：状态 Tab + 筛选 chip + 批量操作 + 分页（一次性提升所有模块体验）
3. **商品 SKU 规格矩阵 + 批量上下架/导入**（商品是后台使用频率最高模块）
4. **订单状态 Tab + 批量发货 + 操作日志**

---

## 来源 Sources

- Shopify 后台导航：[Navigating the Shopify admin](https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview)、[eesel Shopify admin guide](https://www.eesel.ai/blog/shopify-admin)
- Amazon Seller Central：[How to Navigate Amazon Seller Central (dummies)](https://www.dummies.com/article/business-careers-money/business/sales/how-to-navigate-amazon-seller-central-271814/)、[Seller Central guide](https://goaura.com/blog/amazon-seller-central-guide)
- 淘宝千牛 / 京东京麦：[京麦工作台](https://jm.jd.com/)、[千牛卖家工作台](https://qianniu.1688.com/)、[淘宝商家后台指南](https://diantuoyi.com/article/17984.html)
- 中文综合后台 16 模块：[电商后台管理系统全面解析（九数云）](https://www.jiushuyun.com/blog/ds/53310.html)
- 后台 UI 范式：[Admin Dashboard UI/UX Best Practices 2025](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)、[Dashboard Filter Design Guide](https://www.aufaitux.com/blog/dashboard-filter-design-guide/)
