## ADDED Requirements

### Requirement: 商品与分类后台 CRUD

The system MUST expose admin CRUD for products and categories through the generic resource endpoints `GET/POST/PATCH/DELETE /api/v1/admin/:resource`（`resource ∈ {products, categories}`）。An unknown resource MUST return 404 `UNKNOWN_RESOURCE`; a missing row on get/patch/delete MUST return 404 `NOT_FOUND`. Newly created rows MUST be prepended (置顶) so admin list and consumer surfaces see them first.

Products and categories are a single source of truth shared with the consumer storefront: an admin write MUST be immediately visible to consumer reads (no separate sync step).

#### Scenario: 后台新增商品后前台立即可见
- **GIVEN** 后台运营已登录（具 `products:write` 权限点）
- **WHEN** `POST /api/v1/admin/products` 创建一个 `onShelf=true` 的商品
- **THEN** 返回 201 + 新商品（含分配的 id）
- **AND** 该商品出现在 `GET /api/v1/products` 上架列表的最前

#### Scenario: 访问未知资源返回 404
- **WHEN** 调用 `GET /api/v1/admin/widgets`（非注册资源）
- **THEN** 系统返回 404 `UNKNOWN_RESOURCE`

### Requirement: 商品归一化

When a product is created via admin CRUD, the system MUST normalize it so the consumer UI never renders a broken card: missing `img` MUST get a placeholder image, string `price`/`ori` MUST be coerced to number (分), and absent `price`/`ori`/`sold`/`star`/`tagKind`/`onShelf` MUST receive defaults (`0` / `0` / `0.1` / `5` / `mint` / `true`).

#### Scenario: 缺图缺价商品补默认值
- **GIVEN** 一个不含 `img` 且 `price` 为字符串 `"199"` 的创建请求
- **WHEN** 后台创建该商品
- **THEN** 持久化的商品 `img` 为占位图、`price` 为数字 `199`
- **AND** `onShelf` 默认为 `true`，`star` 默认为 `5`

### Requirement: 分类删除引用校验

The system MUST refuse to delete a category that is still referenced by any product. `DELETE /api/v1/admin/categories/:id` MUST return 409 `CATEGORY_IN_USE`（带被引用商品数）when one or more products have `cat === id`, and MUST NOT remove the category. This prevents products from being orphaned to a non-existent category.

#### Scenario: 删除被引用分类被拒
- **GIVEN** 分类 `cat-x` 下仍有 3 个商品
- **WHEN** 调用 `DELETE /api/v1/admin/categories/cat-x`
- **THEN** 系统返回 409 `CATEGORY_IN_USE`（`used=3`）
- **AND** 分类未被删除

#### Scenario: 删除无引用分类成功
- **GIVEN** 分类 `cat-y` 下没有任何商品
- **WHEN** 调用 `DELETE /api/v1/admin/categories/cat-y`
- **THEN** 系统返回 `{ ok: true }` 并移除该分类

### Requirement: 商品/分类写操作受 RBAC 权限点守卫与审计

Every write to products/categories under `/api/v1/admin/*` MUST be guarded by the corresponding permission point (`products:write` / `categories:write`) per `admin-auth` 的 RBAC，and MUST be recorded to `auditLogs` with who/when/action/target/before-after/ip. A consumer token or missing token MUST yield 401; a role lacking the write permission point MUST yield 403 and perform no write.

> 实现注记：`app.ts` 通用 CRUD 段旧注释「Demo 未挂 RBAC」已过期——preHandler 钩子 + `parseAdminRoute` 实际已强制权限点。运营角色持 `products:write`/`categories:write`；客服角色不持有。

#### Scenario: 客服改商品被拒
- **GIVEN** 客服角色 admin（无 `products:write`）
- **WHEN** 调用 `PATCH /api/v1/admin/products/:id`
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`（`need=products:write`）
- **AND** 不执行任何写操作

#### Scenario: 运营改商品落审计
- **GIVEN** 运营角色 admin（持 `products:write`）
- **WHEN** 成功 `PATCH /api/v1/admin/products/:id` 改价
- **THEN** 写入一条 `auditLogs`（含操作者/动作/目标/前后值/ip）
