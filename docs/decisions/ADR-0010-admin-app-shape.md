# ADR-0010: 后台管理应用形态

- 状态：Accepted
- 日期：2026-05-29
- 决策者：架构 agent
- 依赖：ADR-0002（后端 Node+Fastify modular monolith）、ADR-0006（pnpm + Turborepo monorepo）

## 背景 Context

JDOTEST v2 新增后台管理端（admin），需要决定 admin 前端如何承载、admin API 如何与既有消费端后端共存。约束：
- 消费端是车机 H5（横屏、行车态约束），admin 是 PC 桌面 Web，两者 UI 形态完全不同，不能共用一个前端 app
- 后端已是 modular monolith（`services/api`），不希望为 admin 再起一个独立服务增加运维成本
- admin 要复用消费端的领域逻辑（订单状态机、商品模型），不能各写一套

## 决策 Decision

- **admin 前端 = monorepo 新增独立 app `apps/admin`**（Vite + React + TS，与 `apps/h5` 同栈但独立构建、独立部署）
- **admin 后端 = 复用同一 `services/api` modular monolith**，新增 admin 路由命名空间 **`/api/v1/admin/*`**，与消费端 `/api/v1/*` 物理隔离、共享 service/repository 层
- admin 与消费端共享 `packages/`（order-state-machine、shared-types、api-contracts），design token 复用但 admin 用桌面布局变量

## 理由 Rationale

- 独立 app 让 admin 不背车机约束（无 88px / 无行车态 / 无横屏栅格），开发心智干净
- 复用同一后端：admin 改订单状态直接调用与消费端同一份 order-service + 状态机，**杜绝两套状态定义漂移**
- 路由命名空间隔离让鉴权中间件可以对 `/api/v1/admin/*` 整体挂 admin-auth + RBAC 守卫
- monorepo 内新增 app 成本低（ADR-0006 已选 Turborepo）

## 替代方案 Alternatives Considered

- **admin 塞进 apps/h5 用路由区分**：否。车机约束与桌面布局混在一个 app，CSS / 组件污染严重
- **admin 起独立后端服务**：否。Demo 阶段运维成本高，且要重复接入 DB / 状态机 / 鉴权
- **admin 用低代码平台（如 Retool）**：否。无法复用领域逻辑，且不利于演示"前后台同源闭环"

## 后果 Consequences

- 正面：前后台 UI 解耦、领域逻辑单一真相、admin 可独立部署到内网
- 负面 / 代价：`services/api` 需要做路由命名空间 + 鉴权分流；前端多一个构建产物
- 后续需要做的事：
  - `apps/admin` 脚手架（Vite+React+TS）
  - `services/api/src/modules/*/admin.controller.ts` 或 `gateway` 加 `/api/v1/admin` 分流 + RBAC 守卫
  - `packages/api-contracts/openapi.yaml` 增加 `/admin/*` 路径分组
  - INDEX Ownership Zones 增加 `apps/admin/**`
