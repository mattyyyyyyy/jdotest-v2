## Why

消费端 mock 屏接 API（consistency-plan P0#2）+ 闭合 `admin-content` 标注的缺口：后台有评价 `hidden` 审核，但消费端无评价读取接口，`hidden` 无处生效。本 change 补 `GET /api/v1/reviews`（过滤 hidden）。

## What Changes

- **REMOVED** `admin-content` 的「消费端评价展示遵守 hidden（待补读取接口）」缺口 requirement
- **ADDED** `admin-content`「消费端评价读取（过滤 hidden）」：`GET /api/v1/reviews?productId=` 排除 hidden

## Capabilities

### Modified Capabilities
- `admin-content`: 把"待补读取接口"缺口替换为已实现的消费端评价读取（过滤 hidden）

## Impact

- 代码：`services/api/src/store.ts`（`reviewsByProduct`）、`app.ts`（`GET /api/v1/reviews`）
- 关联：consistency-plan P0#2、feature-spec A-11、`openspec/specs/admin-content`
