## ADDED Requirements

### Requirement: 支付确认走共享订单状态机

The system MUST expose `POST /api/v1/payments/:orderId/confirm` 模拟支付渠道回调，仅接受 `paid` 事件并经共享订单状态机（`@jdo/order-state-machine`）推进订单状态（`PENDING_PAYMENT --paid--> PAID`）。前端 MUST NOT 直接 set 订单状态绕过状态机。订单不存在 MUST 返回 404 `ORDER_NOT_FOUND`。

#### Scenario: 待支付订单确认支付
- **GIVEN** 一个 `PENDING_PAYMENT` 订单
- **WHEN** `POST /api/v1/payments/:orderId/confirm`
- **THEN** 订单经状态机推进到 `PAID`
- **AND** 返回 `{ ok: true, from: "PENDING_PAYMENT", to: "PAID" }`

#### Scenario: 订单不存在
- **WHEN** 对不存在的 orderId 确认支付
- **THEN** 系统返回 404 `ORDER_NOT_FOUND`

### Requirement: 重复回调幂等

When the order is already `PAID`，支付渠道的重复回调 MUST be treated as idempotent success：返回 `{ ok: true, idempotent: true }` 且订单状态不变，不重复推进或报错。

#### Scenario: 已支付订单的重复回调
- **GIVEN** 一个已 `PAID` 的订单
- **WHEN** 再次 `POST /api/v1/payments/:orderId/confirm`
- **THEN** 返回 `{ ok: true, idempotent: true }`
- **AND** 订单仍为 `PAID`

### Requirement: 不可支付状态拒绝确认

When the current state does not allow `paid`（如已取消/已退款等），the system MUST 返回 409 `INVALID_TRANSITION`（带 `from` / `event` / `allowed` 可用事件列表）and MUST NOT change the order。

#### Scenario: 非可支付状态确认被拒
- **GIVEN** 一个不允许 `paid` 事件的订单状态
- **WHEN** `POST /api/v1/payments/:orderId/confirm`
- **THEN** 系统返回 409 `INVALID_TRANSITION`（含 `allowed`）
- **AND** 订单状态不变
