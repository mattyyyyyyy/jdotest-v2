## REMOVED Requirements

### Requirement: 消费端评价展示遵守 hidden（待补读取接口）

**Reason**: 消费端评价读取接口已实现，由下方新 requirement「消费端评价读取（过滤 hidden）」取代，缺口闭合。

## ADDED Requirements

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
