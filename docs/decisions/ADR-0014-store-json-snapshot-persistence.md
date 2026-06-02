# ADR-0014: 内存 store 的持久化（SQLite 实库；PG 之前的过渡）

- 状态：Accepted
- 日期：2026-06-02（2026-06-03 升级为 SQLite）
- 决策者：用户（产品/技术负责人）+ claude-gap-fix / claude-finish-todos
- 依赖：ADR-0003（PostgreSQL + Prisma + Redis —— 仍为生产目标，本 ADR 不取代）
- 关联：open-questions Q2（数据全内存、重启丢失）· consistency-plan P2#10

> **🔄 更新（2026-06-03）**：持久化后端从「JSON 文件快照」升级为 **SQLite 实库**（`better-sqlite3`，同步驱动，每行存为关系行 `store_kv(coll,id,seq,data)` + `store_meta`）。
> 升级动机：JSON 文件每次写全量重写、非事务、不可查询；SQLite 是真正的数据库（事务、WAL、按行存储），更贴近生产。`better-sqlite3` 同步 API 让 store 对外仍全同步、**读写逻辑与路由零改动**（95 测试不变全绿）。
> 仍是 ADR-0003（PostgreSQL）落地前的过渡：SQLite 无需独立服务、文件即库，适合 Demo / 单实例；切 PG 时换数据源即可，store 接口不动。下文「JSON 快照」均已由 SQLite 取代，机制描述同理（开关 `STORE_PERSIST_PATH` 改指 `.db` 文件）。

## 背景 Context

`services/api/src/store.ts` 是前后台共享的内存 store。Demo 阶段它**重启即丢数据**（Q2 / P2#10），多人协作与演示重启都会丢失下单 / 改价 / 加购等状态。ADR-0003 定下的 PostgreSQL + Prisma 是生产目标，但当前环境无数据库、无法在此验证一套完整的 Prisma 迁移，贸然引入不可验证的代码风险高。

需要一个**当下可落地、可测试**的方案先消除「重启丢数据」这一硬伤，同时不改变 store 对外接口（保证将来切 PG 时上层零改动）。

## 决策 Decision

为内存 store 增加**可选的 JSON 文件快照持久化**：

- 通过环境变量 `STORE_PERSIST_PATH` 开关。**设置**：启动时若快照存在则加载覆盖种子，每次写操作（create/update/remove/cart*/address*/config）后同步落盘整份快照。**不设**：保持纯内存 + 种子（**测试默认走此路径**，既有 80 测试不受影响）。
- 快照内容：全部 resource 集合 + 计数器 + 购物车 + 地址簿 + 配置。
- 韧性：落盘 best-effort（磁盘错误不让 API 崩）；加载时快照损坏 → 回退种子、不阻断启动。
- store 对外方法签名**完全不变**——这是把它将来替换为 Prisma 的前提。

## 理由 Rationale

- **可验证**：本环境即可写测试证明「变更→重启→数据存活」与「快照损坏→回退种子」（`store.persist.test.ts`，4 测试）。
- **零接口变更**：上层（路由 / admin SPA / 测试）无感知，符合 ADR-0003「接口语义同 Prisma」的前提。
- **风险低**：默认关闭，不影响测试与既有部署；开启也仅 best-effort 落盘。

## 取舍 Trade-offs / 局限

- 单文件全量快照，**非并发安全、无事务、不适合高并发或大数据量**——仅 Demo / 单实例适用。
- 同步写盘在每次写操作发生；Demo 数据量小可接受，量级上来需换 PG。
- **不取代 ADR-0003**：PostgreSQL + Prisma 仍是生产目标。本方案是其落地前的过渡桥；切 PG 时删除快照逻辑即可，store 接口不动。

## 后续 Consequences

- `.env.example` 增 `STORE_PERSIST_PATH`（默认注释关闭）。
- Q2 / consistency-plan P2#10 状态更新为「过渡方案已落地（ADR-0014），PG 仍待接（ADR-0003）」。
- 切 PG（ADR-0003）时：在 store 内部以 Prisma client 替换内存数组 + 快照逻辑，对外方法不变。
