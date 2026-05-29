# ADR-0008: 信息架构（IA）一级分类按"用车场景"组织，而不是"商品品类"

- 状态：**Superseded by [ADR-0009](./ADR-0009-ia-7-scenes-v3.md)**（2026-05-27）
- 日期：2026-05-27
- 决策者：项目负责人（用户）

> ⚠️ **本 ADR 已被取代** · 当天下午用户在 V3 mockup 迭代中将 6 类升级为 7 类、且 6 个名字全部改写以去抄袭风险。
> 最新决策见 [ADR-0009](./ADR-0009-ia-7-scenes-v3.md)。本文档保留供追溯。

## 背景 Context

JDO 车机电商 v0.4 PRD 的一级分类沿用了手机电商的品类树（推荐 / 秒杀 / 车品 / 数码 / 食品 / 生活 / 服饰 / 运动 / 出行 / 图书 / 母婴 / 服务 · 共 12 类），见 [PRD.md](../PRD.md) 与 [feature-spec.md](../feature-spec.md)。

2026-05-27 通过 Appetize.io 实机观察竞品「车机商店 v0.2.0-foundation」时发现：

- 它的一级分类只有 5 个：**加油充电 / 洗车保养 / 周边餐饮 / 旅行服务 / 汽车用品**
- 其中 4/5 是「用车场景动作」，只有 1/5 是传统电商品类
- 这与车机的固有约束（行车态 NHTSA 2/12 规则、横屏视觉扫描成本、时空触发的被动需求）天然对齐

详见 [research/ia-scene-vs-category.md](../research/ia-scene-vs-category.md) 与 [research/competitor-analysis.md §追加 · 车机商店 v0.2.0](../research/competitor-analysis.md#追加--车机商店-v020-foundationappetize-实机观察--2026-05-27)。

## 决策 Decision

**JDO 车机电商的一级分类（mall rail）采用「场景型 IA」共 6 类：**

| ID | 名称 | 说明 |
|---|---|---|
| `refuel` | 加油充电 | 油表 / 充电桩 / 服务区触发 |
| `wash` | 洗车保养 | 停车后 / 4S 附近触发 |
| `dining` | 周边餐饮 | 导航中 / 用餐时段触发 |
| `travel` | 旅行出行 | 长途 / 跨城触发 |
| `parts` | 车品配件 | 兜底品类入口（手机电商习惯保留） |
| `sos` | 应急救援 | 故障 / 事故触发 |

**首页 hero 区**从"秒杀倒计时"切换为「位置 + 时段 + 车况」驱动的 4 张场景推荐卡。

传统电商的 12 个商品品类（数码 / 食品 / 服饰 …）**降级为二级**，挂在 `parts` 之下作为"全部商品"浏览入口。

## 理由 Rationale

1. **车机的购买决策入口是「动作意图」，不是「商品品类」**。司机进服务区时心智里冒出的是「加油 / 吃饭」，不是「数码区 / 食品区」。
2. **NHTSA 12s 累计预算下，分类树深度即成本**。12 类需要"扫一眼 → 决定归属 → 点击 → 浏览"4 步；6 个场景类对应已经成型的动作意图，几乎跳过"分类决策"步。
3. **时空数据是车机独有的杠杆**。位置 + 车况信号天然驱动场景型推荐，无法驱动品类型推荐 —— IA 不切到场景，这些数据就白费。
4. **现在是 IA 重切的最低成本窗口期**。Demo 阶段、无真实用户、无车厂集成依赖；mockups + 后端 seed 调整即可，设计 tokens / 路由 / 状态机全部保留。
5. **实证支持**：竞品「车机商店 v0.2.0-foundation」已经验证了 5 类场景型一级分类的可行性，不是凭空假设。

## 替代方案 Alternatives Considered

### A. 维持现状（12 类品类型）

- ✅ mockups 不用改
- ❌ 与车机心智正交；位置 / 车况数据无法驱动；行车态扫描成本高
- ❌ **拒绝**：现在是改的最便宜的时候，等接入车厂后再改成本暴涨

### B. 场景 + 品类 双轴并存

- 一级 tab 切换"场景 / 全品类"，让用户自选
- ✅ 兼顾两种习惯
- ❌ 增加一层决策，违反"降低信息密度"的车机原则
- ❌ 双数据源维护成本翻倍（场景表 + 品类表两套）
- ❌ **拒绝**：在 Demo 阶段引入复杂度，违反 YAGNI

### C. 完全无分类，只有"为你推荐"流

- 极简：只有一个"推荐"信息流，按场景自动排序
- ✅ 最贴近车机被动消费心智
- ❌ 推荐算法依赖大量真实数据，Demo 阶段没有
- ❌ 用户无法主动浏览（"我想看看有什么充电桩附近的"无入口）
- ❌ **拒绝**：技术债 + UX 风险都太高

### D. 学手机：12 类品类 + 顶部"附近"快捷区

- ✅ 改动最小
- ❌ 把场景型需求挤到顶部 banner，本质上仍是品类型 IA
- ❌ 一级 rail 仍然占用 12 个槽位，没解决扫描成本问题
- ❌ **拒绝**：折中方案，没抓住核心问题

最终选 **场景型 IA**（本 ADR 决策）。

## 后果 Consequences

### 正面影响

- 单步决策时间预期下降（场景型一级 ≈ 已有动作意图 → 接近 0 决策成本）
- 位置 / 车况信号可以驱动 hero 推荐，把"车机独有的数据杠杆"用起来
- 一级分类数从 12 砍到 6，符合 [competitor-analysis.md §规避 1](../research/competitor-analysis.md) "降低信息密度"
- 为后续接入服务区 POI / 充电桩数据 / 车况 JS Bridge 打开通道

### 负面影响 / 代价

- 后端 `categories` 表 seed 需重组（12 行 → 6 行 + 新增 `scenarios` 表）
- mockups（`category.html` 与 `jdo-pencil/mall-home.jsx`）的 rail 需重画
- PRD / feature-spec / interaction-patterns 三处文档需同步更新
- 商品与场景需要"多对多"打标（一瓶玻璃水可挂 `refuel` + `wash` + `parts`），schema 复杂度增加
- 应急救援（`sos`）涉及合规边界，可能引入新的法律责任分析需求

### 后续需要做的事

> ⚠️ 以下变更**不在本 ADR 范围内**，需各 owner 在 [INDEX.md §Active Workstreams](../INDEX.md) 登记后再做。

1. **[docs/feature-spec.md](../feature-spec.md) §IA** 重写一级分类树（工程 agent · 半天）
2. **[docs/PRD.md](../PRD.md) §核心场景** 补"位置/时段/车况驱动"小节（产品 agent · 1 小时）
3. **[docs/design/interaction-patterns.md](../design/interaction-patterns.md)** 新增"场景推荐"交互模式（UX agent · 1 小时）
4. **后端 categories seed** + 新增 `scenarios` 表（实施 agent · 半天）
5. **[mockups/category.html](../../mockups/category.html) + [mockups/jdo-pencil/](../../mockups/jdo-pencil/)** rail 重画（UI agent · 2 小时）
6. **场景与商品 schema 设计**（多对多映射 · 调研 agent · 待定）
7. **应急救援合规边界调研**（独立调研 agent · 待定）
8. **场景的位置数据源选型**（高德 / 百度 POI · 影响成本 · 调研 agent · 待定）

### 不在此 ADR 涉及

- 设计 tokens（颜色 / 字体 / 间距 / 圆角）：完全不动 · 见 [design-system.md](../design/design-system.md)
- 路由命名：完全不动 · 见 [feature-spec.md](../feature-spec.md) §路由
- 行车态降级机制：完全不动 · 见 [ADR-0004](./ADR-0004-driving-state-source.md)
- 商品详情 / 购物车 / 结算 / 支付 / 订单流程：完全不动
