# admin-content Specification

## Purpose
后台内容治理：评价审核（`hidden` 非破坏性隐藏 / 删除），写操作受 `reviews:write` 权限点守卫与审计。消费端评价读取接口待补，补时须过滤 `hidden`。
## Requirements
### Requirement: 评价审核

The system MUST let admin moderate consumer reviews via the generic endpoints `/api/v1/admin/reviews[/:id]`：list/read 评价（含关联商品 `productId`、评分 `star`、内容 `text`、显示状态 `hidden`），通过 `PATCH /api/v1/admin/reviews/:id { hidden }` 隐藏/恢复，通过 `DELETE` 删除违规评价。隐藏 MUST be a non-destructive moderation flag（`hidden=true`）区别于物理删除。

#### Scenario: 隐藏违规评价
- **GIVEN** 运营已登录（持 `reviews:write`）
- **WHEN** `PATCH /api/v1/admin/reviews/:id { hidden: true }`
- **THEN** 该评价 `hidden` 置为 true（保留记录，未物理删除）

#### Scenario: 删除评价
- **WHEN** 运营 `DELETE /api/v1/admin/reviews/:id`
- **THEN** 系统返回 `{ ok: true }` 并移除该评价

### Requirement: 评价写操作受 RBAC 权限点守卫与审计

Writes to reviews MUST be guarded by the `reviews:write` permission point per `admin-auth` RBAC，并落 `auditLogs`。运营角色持有 `reviews:write`；缺权限角色 → 403；无 token / 消费端 token → 401。

#### Scenario: 缺权限角色审核评价被拒
- **GIVEN** 财务角色 admin（仅 `*:read`）
- **WHEN** 调用 `PATCH /api/v1/admin/reviews/:id`
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`
- **AND** 评价显示状态不变

### Requirement: 消费端评价读取（过滤 hidden）

The system MUST expose `GET /api/v1/reviews?productId=` 供消费端读取商品评价，且 MUST 排除 `hidden=true` 的评价（后台隐藏的违规评价对消费端不可见）。`productId` 可选：提供时只返回该商品评价；不提供时返回全部未隐藏评价。返回 `{ items }`。

#### Scenario: 消费端读取过滤隐藏评价
- **GIVEN** 某商品有 2 条评价，其中 1 条被后台 `hidden=true`
- **WHEN** 消费端 `GET /api/v1/reviews?productId=<id>`
- **THEN** 返回结果只含未隐藏的那 1 条

#### Scenario: 后台隐藏后消费端立即不可见
- **GIVEN** 一条可见评价正在消费端展示
- **WHEN** 后台 `PATCH /api/v1/admin/reviews/:id { hidden: true }`
- **THEN** 消费端 `GET /api/v1/reviews` 不再返回该评价

