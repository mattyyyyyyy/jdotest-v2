## MODIFIED Requirements

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
