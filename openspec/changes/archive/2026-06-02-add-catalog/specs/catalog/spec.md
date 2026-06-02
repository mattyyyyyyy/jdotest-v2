## ADDED Requirements

### Requirement: 分类列表（场景型 IA）

The system MUST expose consumer categories via `GET /api/v1/categories`，返回按 `sort` 升序排列的分类列表（ADR-0009 的 7 类场景型一级分类：能量补给 / 爱车养护 / 一路吃喝 / 远行出差 / 车内好物 / 24h 救援 / 严选好物）。

#### Scenario: 拉取分类按排序返回
- **WHEN** 消费端 `GET /api/v1/categories`
- **THEN** 返回 `{ items }`，items 按 `sort` 升序

### Requirement: 商品列表只含上架商品

The system MUST expose consumer products via `GET /api/v1/products`，仅返回 `onShelf === true` 的商品；可选 `?cat=<categoryId>` 按分类过滤。下架商品 MUST NOT appear in consumer listings。

#### Scenario: 列表只返回上架商品
- **GIVEN** 库中既有上架也有下架商品
- **WHEN** `GET /api/v1/products`
- **THEN** 返回的 items 全部 `onShelf === true`，`total` 为其数量

#### Scenario: 按分类过滤
- **WHEN** `GET /api/v1/products?cat=cat-1`
- **THEN** 只返回该分类下的上架商品

### Requirement: 商品详情对下架商品返回 404

The system MUST expose `GET /api/v1/products/:id`，仅当商品存在且 `onShelf` 时返回详情；不存在或已下架 MUST return 404 `PRODUCT_NOT_FOUND`（不泄漏下架商品内容）。

#### Scenario: 上架商品详情
- **GIVEN** 一个上架商品 `g1`
- **WHEN** `GET /api/v1/products/g1`
- **THEN** 返回该商品详情

#### Scenario: 下架商品详情 404
- **GIVEN** 一个 `onShelf=false` 的商品
- **WHEN** 请求其详情
- **THEN** 系统返回 404 `PRODUCT_NOT_FOUND`

### Requirement: 首页一次性引导数据

The system MUST expose `GET /api/v1/bootstrap` 一次返回首页所需数据：`categories`（已排序）、`products`（上架）、`banners`（启用）、`heroRecs`（启用），供消费端首屏单请求加载（替代静态 data.js）。停用的 banner/heroRec、下架商品 MUST NOT 出现在 bootstrap。

#### Scenario: 引导数据聚合首屏内容
- **WHEN** 消费端 `GET /api/v1/bootstrap`
- **THEN** 返回 `{ categories, products, banners, heroRecs }`
- **AND** products 全部上架、banners/heroRecs 全部启用
