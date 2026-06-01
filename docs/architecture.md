# 系统架构 Architecture

> 状态：Draft · 日期：2026-06-01 · 维护者：架构 agent
> 上游：[PRD.md](./PRD.md)（产品意图）· [scope.md](./scope.md)（边界）· ADR-0001~0012
> 下游：[backend-spec.md](./backend-spec.md)（数据模型 / 后端细节）· [api-contracts.md](./api-contracts.md)（接口契约）· `openspec/specs/`（feature 行为）
> **迁移说明**：本文内容由 PRD v0.5 §Implementation Decisions 抽离归位（唯一真相原则），PRD 对应段落已缩为指针。

---

## 一、系统形态

| 单元 | 形态 | 依据 |
|---|---|---|
| 消费端 | 车机内嵌 H5 / WebView（横屏，行车态降级），同源跑手机 / PC 演示 | 锁定结论 · ADR-0001 |
| 后台端 | 标准桌面 Web（PC 浏览器，不受 88px 触控 / 行车态约束）| ADR-0010 / 0012 |
| 后端 | **modular monolith**（单进程、按 domain 模块化，不上微服务），边界即未来拆分点 | ADR-0002 |
| 共享 | 类型 / 订单状态机 / API 契约统一放 `packages/`，单一真相 | ADR-0006 |

后台端与消费端**复用同一后端**，仅新增 `/api/v1/admin/*` 命名空间（ADR-0010，细节见 [backend-spec.md](./backend-spec.md)）。

## 二、前端深模块（深模块 = 复杂内部 + 简单稳定接口 + 可独立测试）

- **DrivingContext（驾驶上下文 ⭐）**
  - 对外：`useDrivingMode()` → `{ mode: 'driving' | 'parked', restrictions: { allowKeyboard, allowVideo, allowComplexForm, ... } }`
  - 内部：车速 / 档位传感器适配、阈值与防抖、传感器缺失降级（Demo 用 mock）、状态变更广播
  - 价值：把"行车 / 停车"压成一个简单状态，所有 UI 只读它的接口，不关心数据来源
- **CatalogStore（商品域）**：列表 / 详情 / 分类 / 搜索，分页 + 缓存；查询型、无副作用、易测
- **CartStore（购物车域 ⭐）**
  - 对外：`addItem / removeItem / setQuantity / checkout`
  - 内部：本地存储 + 服务端同步 + 登录前后合并、冲突解决、弱网降级
- **OrderStateMachine（订单状态机 ⭐）**：纯函数 `transition(state, event) => newState`；前后端共用同一份（已落地 `packages/order-state-machine`，20 单测）。状态定义见 `openspec/specs/order/spec.md`
- **PaymentSession（支付会话域 ⭐）**：`create(orderId) → session`、`session.status$` 状态流；内部封装二维码生成 / 手机端轮询 / 超时 / 幂等重试 / 回调
- **AccountModule（账号域）**：登录（手机号验证码 / 车机扫码 / 车厂账号预留）、地址簿、个人信息
- **IVIShell（车机适配壳层）**：深色主题、横屏栅格、大字号 / 大点击区 token、安全策略约束（UI 地基，非业务模块）

> 业务深模块 vs UI 壳层模块（M-01~M-13）的区别见 [feature-spec.md](./feature-spec.md)；仅 DrivingContext 同时属于两边。

## 三、后端模块（modular monolith 内的 domain）

`catalog-service` · `order-service`（含状态机）· `payment-service`（Demo mock）· `user-service` · `fulfillment-service`（自提点 / 物流轨迹）· `api-gateway`（鉴权 / 限流 / 风控统一入口）

## 四、横切关注点

设计系统（design tokens + 组件库，车机优先尺寸）· 埋点与可观测（前端 PV/UV/漏斗 + 后端链路追踪）· 配置中心（行车态阈值、降级开关）

## 五、模块间关键流程合约

- **DrivingContext → UI**：所有需降级的 UI 通过 `useDrivingMode()` 读取，禁止各组件自行判断车速
- **Cart → Order**：结算时生成订单草稿（draft order），由 order 模块统一做库存锁定 + 价格再校验，避免前端绕过价格
- **Order → Payment**：订单创建即同步创建 PaymentSession；订单状态由支付状态机驱动，**禁止前端直接改订单状态**
- **支付回调**：第三方回调统一进 `payment` 模块的 handler，订单状态变更仅在此处发生

## 六、仓库与目录结构

- **单仓库 monorepo**（pnpm workspaces + Turborepo，ADR-0006）；模块边界清晰后想拆 polyrepo 也容易
- **前后端共享**：类型、订单状态机、API 契约统一放 `packages/`

```
JDOTEST/
├── apps/h5/                    # 车机端 H5（生产入口；同源跑手机/PC 演示）
│   └── src/{modules/{catalog,cart,order,payment,account,fulfillment},
│            platform/{driving-context,ivi-shell,bridge},
│            components,pages,api,stores,main.tsx}
├── apps/admin/                 # 后台管理前端（桌面 Web，ADR-0010；待落地）
├── services/api/               # 后端单体（modular monolith）
│   └── src/{modules/{catalog,order,payment,cart,user,fulfillment},
│            gateway,db,cache,observability,config,main.ts}
├── packages/{shared-types,order-state-machine,design-tokens,
│            ui-components,api-contracts,eslint-config}
├── tools/{seed,mock-server,e2e}
├── infra/{docker-compose.yml,Dockerfile.api}
├── docs/  diagrams/  mockups/  openspec/
```

> 当前实际落地：`packages/order-state-machine` + `services/api`（薄切片）。`apps/h5` / `apps/admin` 尚未建（消费端仍在 `mockups/jdo-pencil-v3` 原型阶段；后台已有 `services/api/src/admin-spa.ts` 内嵌站点）。差距追踪见 [design/consistency-plan.md](./design/consistency-plan.md)。

**命名约定**：包名前缀 `@jdo/`（`@jdo/h5` / `@jdo/api` / `@jdo/shared-types`）；模块文件夹 kebab-case，TS 类型 PascalCase，函数 / 变量 camelCase；测试与被测同目录 `*.test.ts` / `*.spec.ts`。

## 七、关键技术决策（已 ADR 化）

PRD v0.3 列的"暂定"技术决策已全部收敛到 Accepted ADR：前端框架（ADR-0001）· 后端运行时（ADR-0002）· 数据库 + ORM（ADR-0003）· 行车态数据源（ADR-0004）· 部署（ADR-0005）· monorepo（ADR-0006）· UI / 设计系统（ADR-0007）· IA（ADR-0009）· admin 形态 / RBAC / UI（ADR-0010~0012）。依赖顺序：0006 → 0001/0002/0003 → 0007 → 0004 → 0005。
