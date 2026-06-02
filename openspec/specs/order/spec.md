# order

> 当前真相（current truth）。消费端订单域已实现行为。订单状态机前后端共用 `packages/order-state-machine`。
> 改这里只能走 change → delta → archive。

## Purpose

管理订单从草稿到完成 / 取消 / 退款的完整生命周期。状态变更只能由合法 transition 驱动，禁止前端直接改订单状态。
## Requirements
### Requirement: 订单状态机

The system MUST model order lifecycle as a pure-function state machine `transition(state, event) → newState | InvalidTransition`, shared between frontend and backend.

States: `DRAFT` / `PENDING_PAYMENT` / `PAID` / `SHIPPING` / `COMPLETED` / `CANCELED` / `EXPIRED` / `REFUNDING` / `REFUNDED`.

The system MUST reject illegal transitions and MUST NOT allow the frontend to set order status directly. 支付确认 MUST 由 payment 模块回调端点接收并通过 `paid` 事件持久化，持久化结果 MUST 同步反映到消费端订单页和后台订单管理。

#### Scenario: 提交草稿订单进入待支付
- **GIVEN** 一个 DRAFT 订单
- **WHEN** 用户提交订单（submit）
- **THEN** 订单转为 PENDING_PAYMENT
- **AND** 同步创建对应 PaymentSession

#### Scenario: 支付成功推进订单
- **GIVEN** 一个 PENDING_PAYMENT 订单
- **WHEN** 支付回调上报 paid
- **THEN** 订单转为 PAID
- **AND** 状态变更仅发生在 payment 模块的回调 handler
- **AND** 消费端订单页和后台订单管理均能读取 PAID

#### Scenario: 非法状态转换被拒
- **GIVEN** 一个 DRAFT 订单
- **WHEN** 收到 deliver 事件（越过支付）
- **THEN** `transition` 返回 InvalidTransition
- **AND** 订单状态保持 DRAFT

### Requirement: 下单价格与库存以服务端为准

The system MUST re-validate price and lock stock at the order module when a draft is submitted. The frontend MUST NOT compute the final payable amount.

#### Scenario: 提交时库存变化
- **GIVEN** 购物车中某商品在提交前库存减少
- **WHEN** 用户提交订单
- **THEN** 系统返回 STOCK_CHANGED
- **AND** 前端弹窗提示并重新拉取草稿
