# API 契约 API Contracts

> 状态：Draft · 日期：2026-06-01 · 维护者：后端 / 前端 agent（双方对齐）
> 上游：[architecture.md](./architecture.md) · [backend-spec.md](./backend-spec.md)
> 下游：`packages/api-contracts/openapi.yaml`（机器可读真相，待落地）· `apps/android-ivi/`（原生 Android 端）· 后端 `services/api`
> **迁移说明**：本文内容由 PRD v0.5 §后端接入方案（接口契约 / 联调三阶段 / 共享代码契约）抽离归位，PRD 对应段落已缩为指针。
> **改 API 字段必须先改这里再改实现，前后端同时对齐。**

---

## 一、协议与契约源

- **协议**：REST + JSON over HTTPS
- **契约源**：`packages/api-contracts/openapi.yaml` 作为唯一真相（待落地）
- **代码生成**：前端 client 由 `openapi-typescript` 自动生成，禁止手写 fetch；后端 DTO 校验用 `zod`，失败统一走全局错误处理
- **CI 检查**：任何 controller 与 OpenAPI 漂移就报错

## 二、错误格式（全局统一）

```json
{ "code": "ORDER_NOT_FOUND", "message": "订单不存在", "details": {}, "traceId": "abc-123" }
```

> 现状：`services/api` 已统一此格式（见 consistency-plan §已统一）。

## 三、版本管理

URL 前缀 `/api/v1/`，破坏性变更走 `/api/v2/`。后台命名空间 `/api/v1/admin/*`。

## 四、分页规范

cursor 分页优先（`?cursor=&limit=`），列表场景才用 offset。

## 五、共享代码契约（模块间）

- 订单状态机定义在 `packages/order-state-machine`，前后端 `import { transition, OrderState } from '@jdo/order-state-machine'` 复用（已落地）
- DTO 类型定义在 `packages/shared-types`，前端 stores、后端 controllers 都 import 它
- OpenAPI yaml 是接口真相之源
- **关键流程合约**（Cart→Order 价格再校验、Order→Payment 状态驱动、支付回调单点改状态）见 [architecture.md §五](./architecture.md)

## 六、联调三阶段

- **阶段 A · 前端先行**：API 完全 mock（`MSW` 拦截 fetch），前端独立推进
- **阶段 B · 接真接口**：后端 ready 后关掉 MSW；vite dev server 配 proxy（`/api → http://localhost:3000`），无需改前端代码
- **阶段 C · 部署演示**：前端构建到 Vercel，API 域名通过环境变量切换到云上后端

> 现状：`services/api` 提供真实接口，消费端 V3 原型部分已接（购物车 / 下单全链路、订单），其余多屏仍 mock，逐屏迁移见 consistency-plan P0#2。
