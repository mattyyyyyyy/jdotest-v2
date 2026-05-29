# ADR-0012: 后台 UI 技术与设计基准（复用 token，不重画）

- 状态：Accepted
- 日期：2026-05-29
- 决策者：UI agent
- 依赖：ADR-0007（自研 tokens + Tailwind + Radix）、ADR-0010（admin 独立 app）

## 背景 Context

用户明确要求："UI 界面用现在的基础上，不要重新画。" 消费端有 `mockups/jdo-pencil-v3`（车机横屏、深色、液态玻璃、88px 触控）。admin 是桌面 Web，**没有现成原型**。需要决定 admin UI 的视觉基准与技术选型，既"不另造设计语言"，又适配桌面表格密集型场景。

## 决策 Decision

- **视觉基准 = 复用 `docs/design/design-system.md` 的设计 token**（色板 / 字体 Noto Sans SC / 圆角 / 阴影 / 主色），admin 继承同一品牌色与暗色支持
- **布局基准 = 桌面 admin 标准范式**（左侧导航 + 顶部面包屑 + 主区表格 / 表单），**不套用车机的 88px 触控与横屏栅格**——admin 用常规桌面密度（紧凑表格、32~40px 控件）
- **组件层 = Radix Primitives + Tailwind（与 ADR-0007 一致）**，表格 / 表单 / 弹窗等 admin 重组件按需引入轻量库（如 TanStack Table），不引入与 Radix 冲突的大型 UI 框架
- **不画高保真 admin mockup**：第一阶段 admin UI 直接用设计 token + 标准布局实装，原型按需后补；消费端 v3 mockup 保持唯一视觉真相不动

## 理由 Rationale

- "不重画"对消费端 = 沿用 v3；对 admin = 不发明新设计语言，复用 token 保证品牌一致
- admin 是效率工具，表格密集，车机的大触控区反而有害，所以布局基准必须切到桌面范式
- 复用 ADR-0007 的 Radix+Tailwind 技术栈，避免引入第二套 UI 体系

## 替代方案 Alternatives Considered

- **admin 直接套车机 v3 样式**：否。88px 控件 + 横屏栅格在桌面表格场景下极其低效
- **admin 引入 Ant Design / MUI 整套**：否。与 ADR-0007 的 Radix+Tailwind 冲突，且视觉与品牌 token 割裂
- **先画 admin 高保真再开发**：否。用户要求不重画，且 admin 走标准范式无需逐屏设计

## 后果 Consequences

- 正面：品牌一致、技术栈统一、admin 开发不被车机约束拖累、省掉重画工作量
- 负面 / 代价：design-system.md 需补一节"桌面 admin 变量"（密度 / 表格 token），与车机变量并存
- 后续需要做的事：
  - `docs/design/design-system.md` 增「admin 桌面变量」节（控件高度 / 表格行高 / 桌面间距）
  - `apps/admin` 引入 token 包 `packages/design-tokens` + TanStack Table
  - 不新增 admin mockup 目录（保持 mockups/ 只有消费端 v3）
