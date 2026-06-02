> **回填 change（2026-06-02）**：spec 描述行为已实现并经回归（`close-android-commerce-loop`）。映射：分类=`app.ts` `/categories`（`store.categories` 排序）；商品列表=`/products`（`productsOnShelf`）；详情=`/products/:id`（`store.product` 仅上架）；引导=`/bootstrap`。数据=内存 store，持久化待 Q2。

## 1. 后端（✅ 已实现）

- [x] 1.1 分类列表按 sort 排序
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.2 商品列表仅上架 + 可选 cat 过滤
  - Files: `services/api/src/app.ts`、`store.ts`
- [x] 1.3 商品详情下架返回 404
  - Files: `services/api/src/app.ts`
- [x] 1.4 首页 bootstrap 聚合（上架商品 + 启用 banner/heroRec）
  - Files: `services/api/src/app.ts`

## Done When

- [x] `openspec validate add-catalog --strict` 通过
- [ ] `openspec archive add-catalog --yes` 合并 delta
- [ ] INDEX 同步
