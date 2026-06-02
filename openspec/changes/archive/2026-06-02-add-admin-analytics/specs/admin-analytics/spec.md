## ADDED Requirements

### Requirement: 运营看板聚合指标

The system MUST expose an aggregated operations dashboard at `GET /api/v1/admin/analytics` returning：流量类 `pv` / `uv` / `drivingSwitches`（行车态切换次数），订单类 `orderTotal`（订单总数）、`channel.{car, phone}`（按入口渠道分组计数）、`gmv`（已有订单 `totalAmount` 求和，单位分）。订单类指标 MUST be computed from the live orders store（与后台订单管理同一数据源），so a new order changes `orderTotal` / `gmv` / `channel` 即时。

> 实现注记：`pv` / `uv` / `drivingSwitches` 当前为 Demo 固定值（埋点未接入）；订单类为真实聚合。接入埋点后流量类应改为真实统计（spec 行为不变，数值来源升级）。

#### Scenario: 看板返回聚合指标
- **WHEN** 后台 `GET /api/v1/admin/analytics`
- **THEN** 返回包含 `pv`/`uv`/`drivingSwitches`/`orderTotal`/`channel.car`/`channel.phone`/`gmv` 的对象
- **AND** `gmv` 等于当前所有订单 `totalAmount` 之和（分）

#### Scenario: 新订单即时反映到看板
- **GIVEN** 当前 `orderTotal = N`
- **WHEN** 消费端经 car 渠道新建一个订单后再请求看板
- **THEN** `orderTotal = N + 1` 且 `channel.car` 相应 +1
- **AND** `gmv` 增加该订单金额

### Requirement: 看板访问受 RBAC 守卫

`GET /api/v1/admin/analytics` MUST be guarded by the `analytics:read` permission point per `admin-auth` RBAC。四个预设角色均持 `*:read`，故均可读看板；无 token / 消费端 token MUST 收到 401。

#### Scenario: 财务可读看板
- **GIVEN** 财务角色 admin（持 `*:read`）
- **WHEN** 请求看板
- **THEN** 守卫放行并返回指标

#### Scenario: 无 token 访问被拒
- **WHEN** 不带 admin token 请求看板
- **THEN** 系统返回 401 `ADMIN_UNAUTHENTICATED`
