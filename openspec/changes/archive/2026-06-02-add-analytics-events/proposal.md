## Why

admin-analytics 的流量类指标（pv/uv/drivingSwitches）原为 Demo 固定值（埋点未接入，spec 已标注）。本 change 接入真实埋点：新增消费端 `POST /api/v1/events` 上报，看板流量指标在种子基线上实时累加并持久化。解 open-questions Q15。

## What Changes

- **ADDED `admin-analytics`**：埋点事件上报 `POST /api/v1/events`（pageview / driving-switch，visitorId 去重 uv，公开、持久化）
- **MODIFIED `admin-analytics`**：看板流量类指标改为真实埋点累加（去掉「Demo 固定值」注记）

## Capabilities

### Modified Capabilities
- `admin-analytics`: 流量指标由固定值改为真实埋点累加 + 新增事件上报端点

## Impact

- 代码：`services/api/src/store.ts`（metrics 状态 + trackEvent + 持久化）、`app.ts`（`POST /api/v1/events` + analytics 读 `store.metrics()`）、`packages/api-contracts/openapi.yaml`
- 数据：metrics + seenVisitors 随 SQLite 持久化（ADR-0014）
- 关联：open-questions Q15、feature-spec A-02 + BE-admin-analytics
