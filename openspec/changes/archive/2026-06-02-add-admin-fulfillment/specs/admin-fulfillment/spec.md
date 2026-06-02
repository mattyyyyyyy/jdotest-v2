## ADDED Requirements

### Requirement: 自提点后台 CRUD 与营业状态

The system MUST let admin manage pickup points via the generic endpoints `/api/v1/admin/pickupPoints[/:id]`：名称 / 地址 / 营业时间 `hours` / 营业状态 `open`。运营可增删改自提点并切换 `open` 启停。

#### Scenario: 后台新增自提点
- **GIVEN** 运营已登录（持 `pickupPoints:write`）
- **WHEN** `POST /api/v1/admin/pickupPoints` 创建一个营业中的自提点
- **THEN** 返回 201 + 新自提点（含分配 id）

#### Scenario: 停用自提点
- **WHEN** 运营 `PATCH /api/v1/admin/pickupPoints/:id { open: false }`
- **THEN** 该自提点 `open` 置为 false

### Requirement: 物流轨迹后台录入

The system MUST let admin manage shipping records via `/api/v1/admin/shipping[/:id]`（以 `orderId` 作主键）：运单号 `trackingNo` / 状态 `status` / 轨迹节点 `nodes`。客服可录入与更新物流轨迹。

#### Scenario: 录入物流运单
- **GIVEN** 客服已登录（持 `shipping:write`）
- **WHEN** `PATCH /api/v1/admin/shipping/:orderId { trackingNo, status }`
- **THEN** 该订单物流记录被更新

### Requirement: 履约写操作受分角色 RBAC 权限点守卫与审计

Writes MUST be guarded by distinct permission points per `admin-auth` RBAC：自提点用 `pickupPoints:write`（运营持有），物流用 `shipping:write`（客服持有）。所有写操作落 `auditLogs`。缺对应权限点的角色 → 403；无 token / 消费端 token → 401。

#### Scenario: 运营录物流被拒（权限点分离）
- **GIVEN** 运营角色 admin（持 `pickupPoints:write`，无 `shipping:write`）
- **WHEN** 调用 `PATCH /api/v1/admin/shipping/:orderId`
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`（`need=shipping:write`）

#### Scenario: 客服管自提点被拒
- **GIVEN** 客服角色 admin（持 `shipping:write`，无 `pickupPoints:write`）
- **WHEN** 调用 `POST /api/v1/admin/pickupPoints`
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`（`need=pickupPoints:write`）

### Requirement: 消费端履约展示（待补读取接口）

When consumer-facing fulfillment endpoints exist（附近自提点查询 / 订单物流轨迹展示），they MUST read this same fulfillment data source。

> **实现缺口（暴露）**：当前消费端无履约读取 API（`app.ts` 未暴露 `/api/v1/fulfillment/*`），自提点/物流仅后台可见。补消费端接口由 forward change `add-fulfillment` 跟进。

#### Scenario: 消费端查附近自提点（未来接口）
- **WHEN** 未来的消费端自提点查询接口被调用
- **THEN** 返回 `open=true` 的自提点（同源数据）
