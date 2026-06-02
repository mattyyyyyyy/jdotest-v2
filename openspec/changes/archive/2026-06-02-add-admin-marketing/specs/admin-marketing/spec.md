## ADDED Requirements

### Requirement: Banner / 推荐位 / 优惠券后台 CRUD

The system MUST expose admin CRUD for marketing resources via the generic endpoints `/api/v1/admin/:resource`（`resource ∈ {banners, heroRecs, coupons}`）。Banner 含主/副标题 + 配色 tone + 图；推荐位（heroRecs）含角标 + 标题 + 副文 + 跳转场景 `navScene`；优惠券（coupons）含券名 + 类型（满减/折扣）+ 面额 + 门槛 + 剩余张数 + 启用位。新增置顶。

#### Scenario: 后台新建 banner
- **GIVEN** 运营已登录（持 `banners:write`）
- **WHEN** `POST /api/v1/admin/banners` 创建一个启用的 banner
- **THEN** 返回 201 + 新 banner（含分配 id）

### Requirement: 启用位门控消费端可见性

Banners and heroRecs MUST carry an `active` flag that gates consumer visibility：消费端 `GET /api/v1/bootstrap` 与首页只返回 `active !== false` 的 banner / heroRec。后台停用（`active=false`）MUST immediately hide it from consumer surfaces；启用 MUST 立即恢复。

#### Scenario: 停用 banner 后前台不再展示
- **GIVEN** 一个 `active=true` 的 banner 正在前台展示
- **WHEN** 后台 `PATCH /api/v1/admin/banners/:id { active: false }`
- **THEN** 消费端 `GET /api/v1/bootstrap` 的 banners 不再包含它

#### Scenario: 停用推荐位后前台不再展示
- **GIVEN** 一个启用的 heroRec
- **WHEN** 后台将其 `active` 置为 false
- **THEN** 消费端 bootstrap 的 heroRecs 不再包含它

### Requirement: 营销写操作受 RBAC 权限点守卫与审计

Writes to banners/heroRecs/coupons MUST be guarded by the corresponding permission point（`banners:write` / `heroRecs:write` / `coupons:write`）per `admin-auth` RBAC，并落 `auditLogs`。运营角色持有以上三个写权限点；客服角色不持有 → 403；无 token / 消费端 token → 401。

#### Scenario: 客服建优惠券被拒
- **GIVEN** 客服角色 admin（无 `coupons:write`）
- **WHEN** 调用 `POST /api/v1/admin/coupons`
- **THEN** 系统返回 403 `ADMIN_FORBIDDEN`
- **AND** 不创建优惠券
