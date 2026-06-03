# JDOTEST v2 · 车机电商 + 后台管理

> 用 [ai-project-bootstrapper](./_templates/BOOTSTRAPPER-SKILL.md) 模板重做 [JDOTEST](https://github.com/mattyyyyyyy/JDOTEST)，**新增后台管理（admin）整端**。
> 消费端 UI 沿用既有 `mockups/jdo-pencil-v3`（**不重画**）；后台 UI 复用设计 token，桌面布局。

## 这是什么

- **消费端**：车机内嵌 H5 电商（横屏 / 深色 / 行车态降级），沿用 JDOTEST 的 39 条需求 + v3 原型（21 屏）
- **后台端**（v2 新增）：运营 / 客服 / 财务用的桌面 Web 管理后台，覆盖商品 / 订单 / 用户 / 营销 / 履约 / 内容 / 看板 / 权限

## 怎么读（开工前必读）

> 🧪 **开发方法论：TDD（测试驱动 · 红-绿-重构 · 测试先行）** — 改 feature 行为先写失败测试再实现。权威定义见 [CLAUDE.md §测试驱动开发](./CLAUDE.md) / [docs/testing-strategy.md](./docs/testing-strategy.md)。

1. [`CLAUDE.md`](./CLAUDE.md) — 协作公约（Harness 5 层 + OpenSpec 原生 + 开工三件套 + TDD）
2. [`docs/INDEX.md`](./docs/INDEX.md) — 导航仪表盘 + Active Workstreams + Ownership Zones
3. [`docs/PRD.md`](./docs/PRD.md) — 需求 v0.5（§I 后台管理）
4. [`docs/scope.md`](./docs/scope.md) — MVP 边界（admin 已入范围）
5. [`docs/feature-spec.md`](./docs/feature-spec.md) — 派活看板（P-01~13 消费端 + A-01~14 后台）+ 路由→domain 映射

## 目录结构

```
jdotest-v2/
├── CLAUDE.md                    # 协作公约 v3
├── README.md                    # 本文
├── docs/                        # 项目级文档
│   ├── INDEX.md / PRD.md / scope.md / feature-spec.md
│   ├── decisions/               # ADR-0001~0009（沿用）+ 0010~0012（admin 新增）
│   ├── design/                  # design-system / page-spec / interaction-patterns
│   └── research/                # 竞品 / IA 调研
├── openspec/                    # Feature 级 spec（OpenSpec 原生）
│   ├── specs/                   # 当前真相：driving-mode / order（示范）
│   ├── changes/                 # 提议变更：add-admin-auth（完整）+ 3 骨架
│   └── config.yaml
├── mockups/jdo-pencil-v3/       # 消费端主前端原型（21 屏，不重画）
├── diagrams/                    # IA / 系统架构 excalidraw 源
└── _templates/                  # bootstrapper 模板（references + SKILL 方法论）
```

## 怎么用（下一步）

### 看消费端原型

```bash
npx serve mockups/jdo-pencil-v3 -p 3000
# 打开 http://localhost:3000/JDO 车机电商.html
```

### 补齐后台 feature 的 spec（OpenSpec 工作流）

后台已建 4 个 change：`add-admin-auth`（已完整）+ `add-admin-catalog` / `add-admin-order` / `add-admin-analytics`（骨架待填）。在 Claude Code 里逐个跑：

```
/opsx:propose add-admin-catalog
/opsx:propose add-admin-order
/opsx:propose add-admin-analytics
```

AI 会按 PRD §I + scope §二 + ADR-0010~0012 自动补满 proposal / delta spec / design / tasks。

> ⚠️ **没有 `openspec propose` CLI 命令**。propose 走 `/opsx:propose`（AI）或 `openspec new change`（CLI 骨架）。

### 校验 spec 格式

```bash
openspec validate add-admin-auth --strict   # 单个 change
openspec validate --specs --strict           # 全部当前真相
openspec list                                  # 看所有 change 进度
```

### 实施完归档

```bash
openspec archive add-admin-auth --yes   # 合并 delta 到 specs/，移入 changes/archive/
```

## 关键约束（来自 ADR）

- 消费端 = 车机 H5（88px 触控 / 横屏 / 行车态降级）；**后台 = 桌面 Web，不受这些约束**（ADR-0010/0012）
- 后台账号与车主账号**隔离**，RBAC + 审计（ADR-0011）
- 后台复用同一后端 `services/api`，命名空间 `/api/v1/admin/*`（ADR-0010）
- 订单状态机前后台**同源** `packages/order-state-machine`，禁止两套定义
