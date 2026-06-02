## Why

后台「商品管理 / 分类管理」（feature-spec A-03/04/05）已在 `services/api`（通用 CRUD + admin SPA）实现并上线，但 `openspec/specs/admin-catalog/` 一直缺位——属于「代码先行、spec 未沉淀」的反向漂移。本 change 以**回填**方式把已实现的商品/分类后台行为沉淀为当前真相，并顺带暴露一处实现/注释 drift。

> **回填（backfill）change**：spec 描述现有实现现状（贴合 `store.ts` / `app.ts`），不引入新需求；任务在 propose 时即已完成，propose 后直接 archive 合并 delta 到 `specs/admin-catalog/`。

## What Changes

- 新增 `admin-catalog` 域 spec：商品（products）与分类（categories）的后台 CRUD 行为
- 沉淀**商品归一化**规则（后台新增/缺字段商品补默认值，避免前台渲染黑块）
- 沉淀**分类删除引用校验**（被商品引用时 409，防止商品 `cat` 变孤儿）
- 沉淀**新增即上架即进电商**（`onShelf` 默认 true + 列表/前台置顶）
- 暴露并修正一处 drift：`app.ts` 通用 CRUD 段注释「Demo 未挂 RBAC」**已过期**——实际 `parseAdminRoute` + preHandler 钩子已对 `products:write`/`categories:write` 强制权限点（运营持有、客服 403），spec 按真实行为记录

## Capabilities

### New Capabilities
- `admin-catalog`: 商品 / 分类后台 CRUD、商品归一化、分类删除引用校验、写操作受 RBAC 权限点守卫 + 审计

### Modified Capabilities
（无——`admin-auth` 的 RBAC/审计能力本 change 仅复用，不改其 spec）

## Impact

- 代码（现状）：`services/api/src/store.ts`（通用 CRUD + `normalizeProduct` + `categoryInUse`）、`services/api/src/app.ts`（`/api/v1/admin/:resource` 系列 + 分类删除 409 + preHandler 权限守卫 + onSend 审计）、`services/api/src/admin-spa.ts`（A-03/04/05 页面）
- 数据：内存 store 的 `products` / `categories` 集合（种子来自 V3 `data.js`），持久化待 Q2 接 PG
- 契约：复用 `/api/v1/admin/*` 通用 CRUD 协议（见 `docs/api-contracts.md`）
- 关联：ADR-0010（admin 形态）、ADR-0011（RBAC）、ADR-0009（7 场景分类）、PRD US-43~46、feature-spec A-03/04/05 + BE-admin-catalog、依赖 `admin-auth`
