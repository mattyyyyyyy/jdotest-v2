# ADR-0009: 信息架构 v2 · 7 类场景型分类（以 V3 mockup 为准）

- 状态：Accepted
- 日期：2026-05-27
- 决策者：项目负责人（用户）
- **Supersedes**：[ADR-0008](./ADR-0008-ia-scene-first.md)

## 背景 Context

[ADR-0008](./ADR-0008-ia-scene-first.md) 在 2026-05-27 上午 Accepted，锁定 6 类场景型一级分类（加油充电 / 洗车保养 / 周边餐饮 / 旅行出行 / 车品配件 / 应急救援）。当天下午 mockup v3 落地时（[mockups/jdo-pencil-v3/](../../mockups/jdo-pencil-v3/)），用户在反复迭代中实际选定了 **7 类，且 6 个名字全部改了**。两个被发现的问题驱动了这次升级：

1. **ADR-0008 的 6 类命名几乎逐字抄袭竞品**「车机商店 v0.2.0-foundation」的一级分类（详见 [research/competitor-analysis.md §车机商店](../research/competitor-analysis.md#追加--车机商店-v020-foundationappetize-实机观察--2026-05-27)）。最初这是 ADR-0008 的论据（"竞品已验证可行"），但作为最终产品命名风险太高。
2. **缺一个"通用商品"出口**。ADR-0008 把传统电商品类（数码 / 食品 / 服饰 / 图书 / 母婴 等）下沉到 `parts 车品配件` 之下，但"车品配件"语义明确指汽车配件，硬塞图书母婴违和。V1 12 类品类型 IA 唯一的好处就是有兜底入口，V3 实际把它捡回来了，命名为"严选好物"。

## 决策 Decision

JDO 车机电商一级分类（mall rail）正式由 6 类升级为 **7 类**，ID 与中文名全部以 V3 mockup 的 [data.js](../../mockups/jdo-pencil-v3/data.js#L8-L16) 为准：

| # | ID | 中文名 | 覆盖范围 | 对应 ADR-0008（已 Superseded） |
|---|---|---|---|---|
| 1 | `energy` | 能量补给 | 加油 / 充电 / 玻璃水 / 车充 / 油卡 | refuel 加油充电（已改名） |
| 2 | `care`   | 爱车养护 | 洗车 / 美容 / 保养 / 内饰清洁 | wash 洗车保养（已改名） |
| 3 | `eat`    | 一路吃喝 | 服务区餐饮 / 自提咖啡 / 车上零食 | dining 周边餐饮（已改名） |
| 4 | `trip`   | 远行出差 | 高速通行 / 酒店 / 景区门票 / 长途套餐 | travel 旅行出行（已改名） |
| 5 | `gear`   | 车内好物 | 香薰 / 行车记录仪 / 充电宝 / 脚垫 / 内饰 | parts 车品配件（已改名） |
| 6 | `sos`    | 24h 救援 | 道路救援 / 拖车 / 故障维修预约 | sos 应急救援（中文名微调，ID 保留） |
| 7 | `select` | 严选好物 | **兜底入口** · V1 通用品类（数码 / 食品 / 服饰 / 图书 / 母婴 / 生活 / 运动）全归入此 | **(新增 · ADR-0008 中无)** |

**首页 hero 区**保留 ADR-0008 的"位置 + 时段 + 车况" 时空推荐机制不变。

## 理由 Rationale

1. **去抄袭风险**。ADR-0008 命名与"车机商店 v0.2.0-foundation"几乎完全相同，作为给车厂看的 Demo，命名要有自己的话语风格。V3 的"能量补给 / 爱车养护"明显比"加油充电 / 洗车保养"更口语化、更"车厂自营 App"调性。
2. **保留场景型 IA 核心论点不变**。6 个驱动场景的语义没变，仍是"司机站在仪表盘前看 = 我现在要做什么"；[ia-scene-vs-category.md](../research/ia-scene-vs-category.md) 的全部论证仍成立。
3. **承认通用商品刚需**。把图书母婴塞进"车品配件"既不自然也不利于搜索。`select 严选好物` 作为兜底，把 V1 的 12 类品类树的好处（任何能在车上买的东西都有归属）拿回来，但降级到 1/7 的视觉权重。
4. **命名风格变化**。从"动作描述（加油充电）"改成"用户口吻 / 营销话术（能量补给）"——更接近车厂自营 App 调性（蔚来 NIO Life / 理想 Mall）而非通用电商。
5. **以代码定调文档**。V3 是用户在 chat 里反复迭代的最终产物，比 ADR-0008（基于早期推断 + 没经用户逐字审）更贴合真实设计意图。

## 替代方案 Alternatives Considered

### A. 维持 ADR-0008 的 6 类，回滚 V3 mockup

- ✅ 文档稳定，工程预期不变
- ❌ 沿用竞品方案，抄袭风险未解
- ❌ 没有通用商品出口，与用户已确认设计意图相悖
- ❌ **拒绝**：用一份没经用户逐字审的 ADR 反向约束已经多轮迭代确认的 mockup，逻辑反了

### B. 维持 6 类但加二级"全部商品"入口

- ✅ 文档改动最小
- ❌ 把"兜底品类"藏起来，违反 V3 已经验证的 UX 选择（用户希望兜底品类是一级可见的）
- ❌ **拒绝**

### C. 写 ADR-0009 取代 ADR-0008（**采纳**）

- ✅ 文档与代码对齐，零漂移
- ✅ 走 [CLAUDE.md](../../CLAUDE.md) 的 Superseded 流程，决策历史可追溯
- ✅ ADR-0008 保留，论证（命名风险 + 通用商品兜底）成为 v0 → v1 演进的注脚

## 后果 Consequences

### 正面影响

- mockup v3 与 ADR 对齐零漂移，后端实施可直接以 V3 [data.js](../../mockups/jdo-pencil-v3/data.js) 的 `categories` 数组为种子
- 命名风格统一为"车厂自营"调性，与车机系统 HMI 设计语言一致
- `严选好物`兜住了"想在车上买本书"这类长尾场景，避免品类下沉到"车品配件"造成的语义违和

### 负面影响 / 代价

- ADR-0008 → Superseded，但内容保留（追溯用 · 不删 · CLAUDE.md §冲突处理 SOP）
- 之前我（claude-ia-scene-first 那次提交）在 [INDEX.md](../INDEX.md) 与 [competitor-analysis.md](../research/competitor-analysis.md) §追加节 引用过 ADR-0008 的 6 类命名，**这些引用需要 sync 到 7 类**（本 ADR 提交时一并修）
- 下游文档（feature-spec / PRD / interaction-patterns）仍以 ADR-0008 §后续需要做的事 为准，**只是把 6 类替换成 7 类**，工作量不变

### 后续需要做的事

> 继承自 ADR-0008 §后续需要做的事，但分类基数从 6 改 7。各 owner 仍需在 [INDEX.md §Active Workstreams](../INDEX.md) 登记后再做。

1. [docs/feature-spec.md](../feature-spec.md) §IA 重写为 7 类场景（工程 agent · 半天）
2. [docs/PRD.md](../PRD.md) §核心场景 命名按本 ADR（产品 agent · 30 分钟）
3. [docs/design/interaction-patterns.md](../design/interaction-patterns.md) 新增"场景推荐"模式（UX agent · 1 小时）
4. 后端 `categories` seed 直接拷 V3 [data.js](../../mockups/jdo-pencil-v3/data.js) 的 7 行 + 新增 `scenarios` 表（实施 agent · 10 分钟）
5. [mockups/category.html](../../mockups/category.html) 的 12 类 rail 改为 7 类（UI agent · 1 小时）
6. 场景与商品多对多映射 schema · 应急救援合规边界 · POI 数据源选型 —— 详见 [ADR-0008](./ADR-0008-ia-scene-first.md) §后续需要做的事

### 与 V1 / V2 mockup 的关系

| Mockup | IA 状态 | 与 ADR-0009 对齐？ | 处理建议 |
|---|---|---|---|
| [jdo-pencil/](../../mockups/jdo-pencil/) (v1) | 12 类品类型 | ❌ | **保留**作为 IA 演进史料，不动 |
| [jdo-pencil-v2/](../../mockups/jdo-pencil-v2/) (v2) | 6 类场景型（ADR-0008） | ❌ | **保留**作为 IA 演进史料，不动 |
| [jdo-pencil-v3/](../../mockups/jdo-pencil-v3/) (v3) | **7 类场景型（本 ADR）** | ✅ | **以此为准**，未来 React 实装基准 |
