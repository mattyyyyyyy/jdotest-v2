# 后端规格 Backend Spec

> 状态：Draft · 日期：2026-06-01 · 维护者：后端 agent
> 上游：[architecture.md](./architecture.md)（系统形态 / 模块边界）· ADR-0002 / 0003 / 0010 / 0011
> 下游：`services/api/**` 实现 · [api-contracts.md](./api-contracts.md)（对外契约）· `openspec/specs/{order,driving-mode}`
> **迁移说明**：本文内容由 PRD v0.5 §后端接入方案（数据模型 / 鉴权 / 端口 / 环境变量）抽离归位，PRD 对应段落已缩为指针。
> **改 schema 必须先改这里再改实现。**

---

## 一、后端形态

modular monolith（单进程、按 domain 模块化，ADR-0002）。后台端不另起服务，**复用同一 monolith**，新增 `/api/v1/admin/*` 路由命名空间（ADR-0010）。模块：`catalog` / `order` / `payment` / `cart` / `user` / `fulfillment` + `gateway`（鉴权 / 限流 / CORS / 错误统一）。

## 二、数据模型核心实体（preview · 详细 schema 落地见 Prisma migration）

```
User           id, phone, name, avatar, createdAt
Address        id, userId, name, phone, region, detail, isDefault,
               kind: home | company | pickup | car
Product        id, title, categoryId, images[], status, createdAt
Sku            id, productId, attrs{}, price, stock
Category       id, parentId, name, sort           # 一级 = 7 类用车场景（ADR-0009）
Cart           userId, items: [{ skuId, quantity, selected }]
Order          id, userId, status, totalAmount, addressId,
               fulfillmentKind: delivery | pickup, createdAt
OrderItem      orderId, skuId, quantity, snapshotPrice, snapshotTitle
Payment        id, orderId, method, status, amount, paidAt, externalRef
Fulfillment    orderId, kind, trackingNo?, pickupPointId?, status, eta
PickupPoint    id, name, lat, lng, address, openingHours
AdminUser      id, username, passwordHash, role, status   # 与车主 User 隔离（ADR-0011）
AuditLog       id, adminUserId, action, target, before, after, at  # 后台写操作审计
```

- 金额单位：全链路存 **「分」(整数)**，显示层换算元（见 [design/data-dictionary.md](./design/data-dictionary.md) / consistency-plan）
- 字段口径 / 命名 / 枚举大小写的单一真相：[design/data-dictionary.md](./design/data-dictionary.md)
- admin 实体（AdminUser / RBAC / AuditLog）spec：`openspec/changes/add-admin-auth/`

## 三、鉴权

- **方案**：JWT（access 15min + refresh 7d），HttpOnly Cookie + Authorization Header 双轨
- **车机扫码登录**（核心场景）：
  1. 车机 `POST /api/v1/auth/qr-code` → `{ sessionId, qrUrl, expiresAt }`
  2. 手机扫码后 `POST /api/v1/auth/qr-confirm` 携带手机端 token
  3. 车机轮询 `GET /api/v1/auth/qr-status?sessionId=` → `pending` / `confirmed` / `expired`
  4. `confirmed` 后下发 JWT，车机本地持久化
- **Demo 简化**：`POST /api/v1/auth/mock-login` 直接拿 demo 账户 JWT，跳过二维码
- **后台鉴权**：独立 AdminUser + RBAC 角色（超管 / 运营 / 客服 / 财务）+ 写操作审计，与车主账号隔离（ADR-0011）。⚠️ **现状：admin RBAC 尚未实施**（spec 已写于 `add-admin-auth`，代码 drift，见 [open-questions.md](./open-questions.md) Q1 / [consistency-plan](./design/consistency-plan.md) P0#3）

## 四、本地开发端口约定

| 服务 | 地址 |
|---|---|
| 前端 H5 dev (vite) | `http://localhost:5173` |
| 后端 API | `http://localhost:3000` |
| OpenAPI 渲染（Swagger UI）| `http://localhost:3000/docs` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## 五、环境变量分层

- `.env.local` —— 本地开发（git 不入仓）
- `.env.development` / `.env.production` —— 模板（入仓，含示例值）
- 敏感变量（JWT secret、DB 密码）只通过云厂商 secret manager 注入，不进任何 `.env` 文件
- 前端只读 `VITE_PUBLIC_*` 前缀变量，避免泄漏
- 变量清单的单一真相：仓库根 `.env.example`（待补，见 [open-questions.md](./open-questions.md) Q3）

## 六、数据持久化现状

⚠️ 当前 `services/api` 用**全内存 store**（`services/api/src/store.ts`），重启丢数据。计划接 Prisma + PostgreSQL（ADR-0003），store 接口语义不变。追踪：[design/consistency-plan.md](./design/consistency-plan.md) P2#10。
