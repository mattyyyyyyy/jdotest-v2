## Why

消费端支付确认（feature-spec P-07 + BE-payment）已实现并经 `close-android-commerce-loop` 回归（`/payments/:orderId/confirm` 走共享状态机 + 幂等），但 `openspec/specs/payment/` 缺位。本 change 以**回填**方式沉淀 Demo 支付回调行为为当前真相。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/payment/`。

## What Changes

- 新增 `payment` 域 spec：支付确认回调
- 沉淀**只接受 `paid` 事件经共享状态机推进**（不允许前端直接 set 状态）
- 沉淀**重复回调幂等**（已 PAID 返回 idempotent）
- 沉淀**不可支付状态 409**（带 allowed）

## Capabilities

### New Capabilities
- `payment`: 支付确认回调（状态机驱动 + 幂等 + 非法状态 409）

### Modified Capabilities
（无——复用 `order` 状态机，不改其 spec）

## Impact

- 代码（现状）：`services/api/src/app.ts`（`POST /api/v1/payments/:orderId/confirm`）、`packages/order-state-machine`、消费端 V3 + Android 支付页
- 数据：内存 store `orders`，持久化待 Q2
- 说明：当前为 Demo mock 支付（无真实支付渠道对接），真实接入时回调入口语义不变
- 关联：`openspec/specs/order`、`openspec/specs/consumer-commerce-loop`、PRD P-07、feature-spec P-07 + BE-payment
