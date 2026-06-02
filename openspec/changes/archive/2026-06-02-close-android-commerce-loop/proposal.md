## Why

原生 Android 已覆盖 V3 Web 原型的 21 屏，但部分页面仍停留在展示壳或存在异步竞态。当前最明显的问题是支付页点击「我已支付」后只跳转订单页，没有向后端持久化支付结果，导致消费端和后台仍显示待付款。

## What Changes

- 增加消费端支付确认回调端点，通过共享订单状态机持久化 `PENDING_PAYMENT -> PAID`。
- 原生端在下单、立即购买、行车态一键再买和支付确认成功后再跳转目标页面，避免异步请求与页面加载竞态。
- 订单页按真实状态过滤 tab、渲染时间线和状态动作，避免所有状态共用同一套展示。
- 搜索建议可进入对应商品详情，补齐消费端页面循环。
- 增加可重复执行的 Android 原生回归检查，覆盖路由挂载、关键页面跳转和前后台订单同步。

## Capabilities

### New Capabilities
- `consumer-commerce-loop`: 消费端原生购物、支付、订单查看与关键页面跳转的闭环契约。

### Modified Capabilities
- `order`: 明确支付确认必须由 payment 回调端点通过状态机持久化，并同步反映到消费端订单页和后台订单管理。

## Impact

- `services/api/src/app.ts` 与 API 测试：新增 payment 确认端点及回归用例。
- `apps/android-ivi/**`：调整网络客户端、共享购物状态和多个 Compose 页面跳转。
- `apps/android-ivi/scripts/**`：新增持续回归脚本。
- `docs/research/**`：记录 Android 与 V3 Web 原型的页面对齐审计。
