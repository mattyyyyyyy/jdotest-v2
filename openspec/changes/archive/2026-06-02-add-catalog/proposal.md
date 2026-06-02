## Why

消费端商品浏览（首页/分类/搜索/详情，feature-spec P-01~04 + BE-catalog）已实现（`/categories`、`/products[?cat]`、`/products/:id`、`/bootstrap`），并跑过 `close-android-commerce-loop` 回归，但 `openspec/specs/catalog/` 缺位。本 change 以**回填**方式沉淀消费端目录读取行为为当前真相，消除「代码已动、spec 未补」的 drift。

> **回填（backfill）change**：propose 即完工，archive 合并 delta 到 `specs/catalog/`。

## What Changes

- 新增 `catalog` 域 spec：分类列表 + 商品列表/详情 + 首页 bootstrap
- 沉淀**上架可见性**（消费端只见 `onShelf` 商品；下架详情 404）
- 沉淀**场景型 IA 排序**（按 `sort`，对齐 ADR-0009 七类场景）
- 沉淀 bootstrap 一次性引导（首屏单请求）

## Capabilities

### New Capabilities
- `catalog`: 消费端分类列表、商品列表/详情（上架过滤）、首页一次性引导数据

### Modified Capabilities
（无）

## Impact

- 代码（现状）：`services/api/src/app.ts`（`/categories`、`/products`、`/products/:id`、`/bootstrap`）、`store.ts`（`categories`/`productsOnShelf`/`product`/`activeBanners`/`activeHeroRecs`）、消费端 V3 + Android
- 数据：内存 store（种子来自 V3 `data.js`），持久化待 Q2
- 关联：ADR-0009（7 场景 IA）、`openspec/specs/consumer-commerce-loop`、PRD 核心场景、feature-spec P-01~04 + BE-catalog
