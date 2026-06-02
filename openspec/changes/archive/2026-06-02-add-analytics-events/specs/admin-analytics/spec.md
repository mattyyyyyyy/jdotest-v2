## MODIFIED Requirements

### Requirement: 运营看板聚合指标

The system MUST expose an aggregated operations dashboard at `GET /api/v1/admin/analytics` returning：流量类 `pv` / `uv` / `drivingSwitches`（行车态切换次数），订单类 `orderTotal`（订单总数）、`channel.{car, phone}`（按入口渠道分组计数）、`gmv`（已有订单 `totalAmount` 求和，单位分）。订单类指标 MUST be computed from the live orders store（与后台订单管理同一数据源），so a new order changes `orderTotal` / `gmv` / `channel` 即时。

流量类指标 MUST 来自真实埋点累加（Q15，已接入）：在一个历史种子基线之上，消费端经 `POST /api/v1/events` 上报的事件实时累加 —— `pageview` 加 `pv`，`driving-switch` 加 `drivingSwitches`，带新 `visitorId` 的事件去重后加 `uv`。

#### Scenario: 看板返回聚合指标
- **WHEN** 后台 `GET /api/v1/admin/analytics`
- **THEN** 返回包含 `pv`/`uv`/`drivingSwitches`/`orderTotal`/`channel.car`/`channel.phone`/`gmv` 的对象
- **AND** `gmv` 等于当前所有订单 `totalAmount` 之和（分）

#### Scenario: 新订单即时反映到看板
- **GIVEN** 当前 `orderTotal = N`
- **WHEN** 消费端经 car 渠道新建一个订单后再请求看板
- **THEN** `orderTotal = N + 1` 且 `channel.car` 相应 +1
- **AND** `gmv` 增加该订单金额

#### Scenario: 埋点事件累加流量指标
- **GIVEN** 当前 `pv = P`
- **WHEN** 消费端 `POST /api/v1/events { type: "pageview" }`
- **THEN** 看板 `pv = P + 1`

#### Scenario: uv 按 visitorId 去重
- **GIVEN** 一个此前未出现的 `visitorId`
- **WHEN** 携该 `visitorId` 上报事件
- **THEN** `uv` 加 1
- **AND** 同一 `visitorId` 再次上报时 `uv` 不再增加

## ADDED Requirements

### Requirement: 埋点事件上报

The system MUST expose `POST /api/v1/events { type, visitorId? }` 供消费端上报埋点。`type` MUST 为 `pageview` 或 `driving-switch`；非法 type MUST 被拒（校验失败）。此接口为消费端公开（无需登录）。上报 MUST 累加到看板流量指标并持久化（重启不丢）。

#### Scenario: 上报 pageview 返回最新指标
- **WHEN** `POST /api/v1/events { type: "pageview" }`
- **THEN** 返回 `{ ok: true, metrics }`（含累加后的 pv/uv/drivingSwitches）

#### Scenario: 非法事件类型被拒
- **WHEN** `POST /api/v1/events { type: "bogus" }`
- **THEN** 系统拒绝该请求（zod 校验失败 → 400）
