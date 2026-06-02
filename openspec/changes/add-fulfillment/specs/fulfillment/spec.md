## ADDED Requirements

### Requirement: 附近自提点查询

The system MUST let a consumer query nearby pickup points via `GET /api/v1/fulfillment/pickup-points?lat=&lng=&radius=`，仅返回 `open=true` 的自提点，按距离排序，最多 N 个（默认 5）。数据源 MUST 与后台 `admin-fulfillment` 同源（后台改动即时反映）。

#### Scenario: 查询返回营业中的就近自提点
- **GIVEN** 后台维护了若干自提点（部分停业）
- **WHEN** 消费端 `GET /api/v1/fulfillment/pickup-points?lat=..&lng=..&radius=3000`
- **THEN** 只返回 `open=true` 的自提点，按距离升序，至多 5 个

#### Scenario: 后台停用自提点后消费端不再返回
- **GIVEN** 一个自提点被后台 `open=false`
- **WHEN** 消费端再次查询附近自提点
- **THEN** 结果不包含该自提点

### Requirement: 订单物流轨迹展示

The system MUST let a logged-in consumer view their order's shipping track via `GET /api/v1/orders/:id/shipping`（车主 token，仅本人订单）：运单号 / 状态 / 轨迹节点（按时间倒序）。数据源 MUST 与后台 `admin-fulfillment` 录入的 shipping 同源。无物流记录 MUST 返回空轨迹（非错误）。他人订单 MUST 返回 403/404（不泄漏）。

#### Scenario: 查看本人订单物流
- **GIVEN** 后台已为车主某订单录入运单与轨迹
- **WHEN** 车主 `GET /api/v1/orders/:id/shipping`
- **THEN** 返回运单号 / 状态 / 轨迹节点（时间倒序）

#### Scenario: 越权查看他人订单物流被拒
- **GIVEN** 一个不属于当前车主的订单 id
- **WHEN** 车主请求其物流
- **THEN** 系统返回 403 或 404（不泄漏订单存在性）
