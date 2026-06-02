# admin-order Specification

## Purpose
后台订单管理：状态流转一律走共享订单状态机（发货/取消/退款，非法流转 409），订单查询与消费端共享单一数据源（前→后即时可见），写操作受 `orders:write` 权限点守卫与审计。
## Requirements
### Requirement: 后台订单状态流转走共享状态机

The system MUST drive all admin order state changes through the shared order state machine（`@jdo/order-state-machine`，与消费端同一套，见 `openspec/specs/order`）via `PATCH /api/v1/admin/orders/:id/status { event }`. 发货 / 取消 / 退款审核等动作 MUST be expressed as state-machine events（如 `prepared` / `delivered` / `cancel` / `refundReq` / `refunded`）。The admin MUST NOT set an order status to an arbitrary value bypassing the machine.

An unknown order id MUST return 404 `NOT_FOUND`. An event illegal from the current state MUST return 409 `INVALID_TRANSITION`（带 `from` / `event` / `allowed` 可用事件列表）and MUST NOT change the order.

#### Scenario: 合法发货流转
- **GIVEN** 一个 `PAID` 状态订单
- **WHEN** 后台 `PATCH /api/v1/admin/orders/:id/status { event: "prepared" }`
- **THEN** 系统经状态机校验通过并更新订单状态
- **AND** 返回 `{ ok: true, from, to }`

#### Scenario: 非法流转被拒
- **GIVEN** 一个 `PENDING_PAYMENT` 状态订单
- **WHEN** 后台提交一个当前状态不允许的事件（如 `refunded`）
- **THEN** 系统返回 409 `INVALID_TRANSITION`（含 `allowed` 列表）
- **AND** 订单状态不变

#### Scenario: 订单不存在
- **WHEN** 后台对不存在的订单 id 调用状态流转
- **THEN** 系统返回 404 `NOT_FOUND`

### Requirement: 订单后台查询与渠道可见

The system MUST let admin list and read orders via `GET /api/v1/admin/orders[/:id]`（通用资源读取），exposing 用户 / 商品清单 / 金额（分）/ 状态 / 入口渠道（car|phone）/ 下单时间。消费端下单（含购物车结算）创建的真实订单 MUST be immediately visible to admin（前→后单一数据源）。

#### Scenario: 消费端下单后台立即可见
- **GIVEN** 消费端经 `POST /api/v1/orders` 或 `/cart/checkout` 创建了订单
- **WHEN** 后台 `GET /api/v1/admin/orders`
- **THEN** 列表包含该订单（含渠道 `channel` 与金额 `totalAmount`，单位分）

### Requirement: 订单写操作受 RBAC 权限点守卫与审计

Order state changes MUST be guarded by the `orders:write` permission point per `admin-auth` RBAC，and MUST be recorded to `auditLogs`（who/when/action/target/before-after/ip）。客服角色持有 `orders:write`（负责发货/退款处理）；缺该权限点的角色 MUST 收到 403；无 token / 消费端 token MUST 收到 401。

#### Scenario: 客服处理订单成功并落审计
- **GIVEN** 客服角色 admin（持 `orders:write`）
- **WHEN** 成功流转订单状态
- **THEN** 写入一条 `auditLogs`（含 from→to 前后值）

