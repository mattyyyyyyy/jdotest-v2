# 车机电商 · 设计系统 Design System v1.0

> 日期：2026-05-26 · 状态：Draft（首版，与 ADR-0007 同步落地）
> 协作铁律见 [CLAUDE.md](../../CLAUDE.md)
> 上游：[ADR-0007 UI 库 / 设计系统起点](../decisions/ADR-0007-ui-library-and-design-system.md) · [竞品调研](../research/competitor-analysis.md)
> 平级：[页面规格 page-spec.md](./page-spec.md)（页面级设计调性 + 区块）· [功能清单 feature-spec.md](../feature-spec.md)（功能 + API 映射）
> 下游：`packages/design-tokens/tokens.css` · `packages/ui-components/*` · [mockups/](../../mockups/)
>
> **本文件目的**：把 ADR-0007 + page-spec 的"设计调性"扩展成一份**可直接编译为 CSS variables 的系统级 token + 组件契约**。所有设计决定（颜色、字号、间距、动效、行车态降级、横屏适配）在此**单一真相**。

---

## 0. 设计原则（Design Principles）

| 原则 | 说明 | 行为后果 |
|---|---|---|
| **驾驶安全优先 Safety First** | NHTSA 2/12 规则、AAOS 76dp 下限是硬约束 | 触控目标 ≥ 88px、单步操作 ≤ 2s、行车态禁键盘 |
| **横屏即一等公民 Landscape Native** | 不是把竖屏拉宽，是从横屏视觉扫描重设计 | 左 sticky 导航 + 主内容、信息密度比手机低 1 档 |
| **可瞥不可读 Glanceable** | 用户视线离开道路 ≤ 2s，必须"扫一眼能识别" | 字号 ≥ 18px、对比度 ≥ 7:1、图标 + 文字双通道 |
| **稳过艳 Calm over Flashy** | 不追潮、不堆动效，10 年后看也不过时 | 禁渐变彩虹、禁 3D、动效 ≤ 240ms、行车态全关 |
| **状态可见 State Visible** | 行车/停车、连接/离线、加载/失败一眼可见 | 顶栏徽章 + 卡片状态徽 + 全局 toast |
| **可降级即可演示 Demonstrable Degradation** | 行车态降级本身就是 Demo 的卖点 | `?speed=N` URL 参数一键演示 |

---

## 1. Design Tokens（最终单一真相）

> 实现：`packages/design-tokens/tokens.css` 导出 CSS variables；`tokens.ts` 导出 TS 字面量类型；Tailwind `@theme` 引用 CSS variables。

### 1.1 颜色 Color

#### 中性色（背景 / 文字 / 边框）

| Token | Hex | 用途 | 对比度（vs `bg-0`） |
|---|---|---|---|
| `--color-bg-0` | `#0A0B0E` | 最深背景（页面） | — |
| `--color-bg-1` | `#11141A` | 二级背景（区块） | 1.3:1 |
| `--color-bg-2` | `#181C24` | 三级背景（卡片表面） | 1.6:1 |
| `--color-bg-3` | `#21262D` | 升起表面（弹层） | 1.9:1 |
| `--color-surface-glass` | `rgba(20, 22, 26, 0.60)` + blur(24px) | 液态玻璃面板 | — |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.06)` | 极弱边框 | — |
| `--color-border-default` | `rgba(255, 255, 255, 0.10)` | 常规边框 | — |
| `--color-border-strong` | `rgba(255, 255, 255, 0.18)` | 强调边框（选中态） | — |
| `--color-text-primary` | `#F1F5F9` | 主文字 | **15.6:1** ✅ AAA |
| `--color-text-secondary` | `#94A3B8` | 副文字 | **7.1:1** ✅ AAA |
| `--color-text-muted` | `#64748B` | 弱化文字（时间戳） | **4.7:1** ✅ AA |
| `--color-text-disabled` | `#475569` | 禁用文字 | **3.1:1** （仅用于明显禁用态） |
| `--color-text-inverse` | `#0A0B0E` | 反色文字（浅底按钮上） | — |

#### 品牌 / 强调色

| Token | Hex | 用途 |
|---|---|---|
| `--color-brand-500` | `#3B82F6` | 主品牌色（链接、聚焦） |
| `--color-brand-400` | `#60A5FA` | hover / 活跃态 |
| `--color-brand-600` | `#2563EB` | pressed 态 |
| `--color-accent` | `#06B6D4` | 电青强调（车机感） |
| `--color-accent-glow` | `rgba(6, 182, 212, 0.20)` | 强调发光（CTA 按钮 ring） |

#### 语义色

| Token | Hex | 用途 |
|---|---|---|
| `--color-success` | `#22C55E` | 成功 |
| `--color-success-bg` | `rgba(34, 197, 94, 0.12)` | 成功背景 |
| `--color-warn` | `#F59E0B` | 警告（行车态横幅） |
| `--color-warn-bg` | `rgba(245, 158, 11, 0.12)` | 警告背景 |
| `--color-error` | `#EF4444` | 错误 |
| `--color-error-bg` | `rgba(239, 68, 68, 0.12)` | 错误背景 |
| `--color-driving` | `#FF6B35` | 行车态专属（顶部安全条） |

#### 浅色主题（自动镜像）

通过 `[data-theme="light"]` 覆盖所有 `--color-bg-*` 与 `--color-text-*`：

```css
[data-theme="light"] {
  --color-bg-0: #FFFFFF;
  --color-bg-1: #F8FAFC;
  --color-bg-2: #F1F5F9;
  --color-bg-3: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  --color-border-default: rgba(15, 23, 42, 0.10);
  /* brand / semantic 保持不变 */
}
```

### 1.2 字号 Typography

#### 字体族

```css
--font-sans: "PingFang SC", "HarmonyOS Sans", "Noto Sans CJK SC", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;
--font-display: var(--font-sans); /* 主标题可日后换品牌字 */
```

> 选择 PingFang SC / HarmonyOS Sans 优先：车机系统字体已预装，避免外网加载、避免回退到衬线字带来的"非车机感"。

#### 字号梯度（基础 18px，比手机大 1-2 档）

| Token | size / line-height | 用途 | 行车态映射 |
|---|---|---|---|
| `--font-xs` | 18px / 1.5 | 辅助文字、徽章（**绝对下限**，禁用 16px 以下） | → `--font-sm`（升档） |
| `--font-sm` | 20px / 1.5 | 列表正文、表格 | → `--font-base` |
| `--font-base` | 24px / 1.4 | 卡片标题、按钮文字 | → `--font-lg` |
| `--font-lg` | 28px / 1.3 | 区块标题 | → `--font-xl` |
| `--font-xl` | 32px / 1.3 | 页面 H1 | → `--font-2xl` |
| `--font-2xl` | 40px / 1.2 | 价格、关键数字 | 不变 |
| `--font-3xl` | 56px / 1.1 | 巨型展示（行车态价格、自提码） | 不变 |
| `--font-display` | 72px / 1.0 | 仅 Hero / 二维码区 |

#### 字重

```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

> 禁用 100/200/300（车内强光下细体可读性差），禁用 900（视觉过冲）。

### 1.3 间距 Spacing

8 倍数体系（外加 4 作为微调下限）：

| Token | 值 | 用途 |
|---|---|---|
| `--space-1` | 4px | 最小内间距（icon 与文字） |
| `--space-2` | 8px | 紧凑控件间距 |
| `--space-3` | 12px | 表单元素间 |
| `--space-4` | 16px | 卡片内 padding、列表项间 |
| `--space-5` | 24px | 区块内间距、卡片间 |
| `--space-6` | 32px | 区块间、栅格 gutter |
| `--space-7` | 48px | 大区块分隔 |
| `--space-8` | 64px | 页面外边距 |
| `--space-9` | 96px | 巨型区块（行车态首页卡片间） |

### 1.4 圆角 Radius

| Token | 值 | 用途 |
|---|---|---|
| `--radius-sm` | 8px | Tag / 小徽章 |
| `--radius-md` | 12px | 输入框 |
| `--radius-lg` | 20px | 卡片 |
| `--radius-xl` | 28px | 弹层、大按钮 |
| `--radius-2xl` | 40px | 二维码框 |
| `--radius-pill` | 9999px | 胶囊按钮、chip |

### 1.5 阴影 / 高光（深色背景）

深色背景下阴影几乎不可见，改用**内描边高光 + 模糊光晕**：

```css
--shadow-glass: 0 8px 32px 0 rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06);
--shadow-elev-1: 0 4px 16px 0 rgba(0,0,0,0.30);
--shadow-elev-2: 0 12px 40px 0 rgba(0,0,0,0.50);
--glow-brand: 0 0 0 4px rgba(59, 130, 246, 0.20);
--glow-accent: 0 0 24px 0 rgba(6, 182, 212, 0.30);
--glow-success: 0 0 24px 0 rgba(34, 197, 94, 0.30);
```

### 1.6 模糊 Blur（液态玻璃专用）

| Token | 值 | 用途 |
|---|---|---|
| `--blur-sm` | 12px | 顶栏 |
| `--blur-md` | 24px | 卡片、面板 |
| `--blur-lg` | 32px | 全屏遮罩 |

### 1.7 触控目标 Touch（**车机硬约束**）

| Token | 值 | 用途 |
|---|---|---|
| `--touch-min` | 88px | 任何可点击元素最小尺寸 |
| `--touch-comfortable` | 96px | 主操作按钮 |
| `--touch-hero` | 120px | 结算/支付/行车态主按钮 |
| `--touch-spacing` | 16px | 相邻触控目标最小间距 |

> 严格执行：CI 加视觉回归检查或 lint 规则。

### 1.8 动效 Motion

```css
--duration-instant: 0ms;        /* 行车态用 */
--duration-fast: 150ms;          /* 按钮 hover */
--duration-base: 240ms;          /* 卡片转场、Tab 切换 */
--duration-slow: 400ms;          /* 弹层、Drawer */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);    /* 默认进场 */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);      /* 默认退场 */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹跳（仅停车态） */
```

**行车态强制**：`prefers-reduced-motion: reduce` 与 `[data-mode="driving"]` 都会触发 `--duration-* = 0ms`。

### 1.9 栅格 Grid

```
12 列基准，gutter 24px，外边距 32px（行车态 64px）
左 sticky 导航宽 240px，主内容自适应剩余宽度

横屏断点（min-width）：
- xs: 1280px  (备用，老式车机)
- sm: 1600px
- md: 1920px  ← 主流车机基准
- lg: 2560px
- xl: 3840px  (高端 ID.4 等)
```

### 1.10 Z-index 层级

| Token | 值 | 用途 |
|---|---|---|
| `--z-base` | 0 | 内容流 |
| `--z-sticky` | 10 | sticky 头部 / 侧栏 |
| `--z-dropdown` | 100 | 下拉菜单 |
| `--z-overlay` | 1000 | 全屏遮罩 |
| `--z-modal` | 1100 | 弹窗 |
| `--z-toast` | 1200 | 全局提示 |
| `--z-debug` | 9999 | 调试浮窗（DrivingHUD） |

---

## 2. 行车态降级系统（Driving Mode）

### 2.1 切换契约

`[data-mode="driving|parked"]` 挂在 `<html>` 上，所有组件通过 CSS 自动响应：

```css
/* 字号升档 */
[data-mode="driving"] {
  --font-xs: 20px;
  --font-sm: 24px;
  --font-base: 28px;
  --font-lg: 32px;
  --font-xl: 40px;
}

/* 触控升档 */
[data-mode="driving"] {
  --touch-min: 96px;
  --touch-comfortable: 120px;
}

/* 动效全关 */
[data-mode="driving"] {
  --duration-fast: 0ms;
  --duration-base: 0ms;
  --duration-slow: 0ms;
}

/* 外边距升档（信息密度更低） */
[data-mode="driving"] {
  --grid-margin: 64px;
}
```

### 2.2 组件级行为规约

| 组件 | 停车态 | 行车态 |
|---|---|---|
| `<Button>` | 全部可用 | 仅显式声明 `availableInDriving` 的可用 |
| `<Input type="text">` | 可用 | `disabled` 自动加上 + 视觉灰 |
| `<Input type="password">` | 可用 | 整个组件 `display: none` |
| `<VoiceButton>` | 可用 | 优先级提升、尺寸放大 1 档 |
| `<Video>` / `<AutoplayBanner>` | 可用 | 整个组件 `display: none` |
| `<FormCheckbox>` | 可用 | 默认全选或全不选锁定 |
| `<DataTable>` | 可用 | 折叠为简化卡片 |

### 2.3 行车态全局横幅

`<DrivingBanner>` 自动渲染：

```
┌─ #FF6B35 背景 · 高 64px · 永久 sticky ─────────────────┐
│ ⚠️ 行车态 · 仅显示常用商品 · 已默认地址 · 已默认支付   │
│                              [停车后展开完整购物]      │
└────────────────────────────────────────────────────────┘
```

---

## 3. 组件库 Component Inventory

> 实现位置：`packages/ui-components/<Component>/`
> 模式：每个组件 = Radix Primitive（如适用） + Tailwind 样式 + tokens 引用

### 3.1 基础控件 Primitives

| 组件 | Radix 依赖 | 关键 prop | 行车态行为 |
|---|---|---|---|
| `Button` | — | `variant: primary\|secondary\|ghost\|danger`, `size: sm\|md\|lg\|hero`, `loading`, `icon`, `availableInDriving` | 见 §2.2 |
| `IconButton` | — | `icon`, `aria-label` 必填, `size` | 同 Button |
| `Input` | — | `type`, `prefix`, `suffix`, `error`, `clearable` | 见 §2.2 |
| `Select` | `@radix-ui/react-select` | `options`, `value`, `onChange` | 行车态降级为单按钮 |
| `Tabs` | `@radix-ui/react-tabs` | `defaultValue`, 横屏走横向 tab | 行车态保留 |
| `Switch` | `@radix-ui/react-switch` | — | 行车态保留 |
| `Slider` | `@radix-ui/react-slider` | — | 行车态 disabled |
| `Tooltip` | `@radix-ui/react-tooltip` | — | 行车态完全禁用（不弹） |
| `Dialog` | `@radix-ui/react-dialog` | `title`, `description` | 行车态仅允许「确认 / 取消」二元交互 |
| `DropdownMenu` | `@radix-ui/react-dropdown-menu` | — | 行车态禁用，改用全屏选项 |
| `Toast` | `@radix-ui/react-toast` | `kind: info\|success\|warn\|error`, `duration` | 行车态延长 2s 显示时间 |
| `Avatar` | — | `src`, `fallback` | 不变 |
| `Badge` | — | `count`, `dot`, `kind` | 不变 |
| `Skeleton` | — | `width`, `height`, `kind: text\|card\|circle` | 不变 |

### 3.2 业务组件 Domain

| 组件 | 说明 | 关键 prop |
|---|---|---|
| `PriceTag` | 价格展示，主价 + 划线原价 + 优惠标签 | `current`, `original?`, `discount?`, `size` |
| `ProductCard` | 商品卡，图 + 标题 + 价格 + 按钮 | `product`, `variant: grid\|list\|hero`, `onQuickBuy?` |
| `SkuPicker` | SKU 矩阵选择 | `skus`, `value`, `onChange` |
| `Stepper` | 数量增减 | `min`, `max`, `value`, `onChange` |
| `AddressCard` | 地址卡片（家/公司/自提/车上） | `address`, `selected`, `onEdit` |
| `OrderStatusBadge` | 订单状态徽章 | `status: OrderState`（来自 packages/order-state-machine） |
| `OrderTimeline` | 物流轨迹时间线 | `events[]` |
| `QrLogin` | 扫码登录卡 | `sessionId`, `qrUrl`, `status`, `onConfirmed` |
| `QrPay` | 扫码支付卡 | 同上 + `amount` |
| `PickupPointCard` | 自提点卡 | `point`, `distance`, `selected` |
| `CategoryNav` | 左 sticky 一级分类导航 | `categories`, `value`, `onChange` |
| `SearchBar` | 搜索框（含语音） | `value`, `onSubmit`, `onVoice` |
| `VoiceButton` | 麦克风按钮 | `listening`, `onToggle` |
| `DrivingBanner` | 行车态全局横幅 | （从 DrivingContext 自动取） |
| `SpeedBadge` | 当前车速徽章 | `speed`, `mode` |
| `DrivingHUD` | 调试浮窗（仅 dev） | — |

### 3.3 布局组件 Layout

| 组件 | 说明 |
|---|---|
| `IVIShell` | 顶层容器，含 TopBar / SideRail / Main / DrivingBanner，自动响应 `data-mode` |
| `TopBar` | 顶部 sticky 玻璃栏 |
| `SideRail` | 左 sticky 240px 导航 |
| `PageContainer` | 主内容容器，自动 padding + 横向滚动隔离 |
| `GlassPanel` | 液态玻璃面板（卡片 / 弹层 / Drawer 都基于此） |
| `SplitView` | 横屏左右分栏（详情页 / 结算页用） |
| `StickyFooter` | 底部 sticky 操作栏（购物车 / 详情 CTA 用） |

### 3.4 命名与导出约定

```tsx
// packages/ui-components/Button/index.tsx
export interface ButtonProps { /* ... */ }
export const Button: React.FC<ButtonProps> = (...) => { /* ... */ }

// packages/ui-components/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

- 所有组件 `displayName` 必填，方便 React DevTools 调试
- 所有交互组件接受 `data-testid` 透传，方便 E2E

---

## 4. 设计模式 Patterns

### 4.1 液态玻璃 Glassmorphism 规范

```css
.glass-panel {
  background: var(--color-surface-glass);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}
```

**何时用 glass**：顶栏、弹层、Drawer、sticky 合计栏、登录/支付中央卡片、行车态横幅。
**何时不用**：商品卡（性能考虑，大量卡片同时 blur 在弱算力车机会卡）、长列表项。

### 4.2 横屏分栏 Split View

```
1920px 总宽
├── SideRail 240px ──┬── Main (1680px) ────────────────┐
│  • 首页            │  ┌────────────┬─────────────┐   │
│  • 分类            │  │ Left 60%   │ Right 40%   │   │
│  • 订单            │  │ (主图)     │ (操作区)    │   │
│  • 我的            │  └────────────┴─────────────┘   │
└──────────────────────────────────────────────────────┘
```

- 详情页：左 60% 图 / 右 40% 信息+CTA
- 结算页：左 60% 信息 / 右 40% 价格+提交
- 购物车：左 65% 列表 / 右 35% 合计

### 4.3 卡片网格 Card Grid

- 商品 grid：每行 4 列（停车态）、3 列（分类页停车态）、2 列（行车态）
- 卡片宽高比 **4:5**（图 + 文案 + 按钮的合理留白）
- 卡片之间 gap = `--space-5` (24px)
- 鼠标 / 触摸 hover：边框 `--color-border-strong` + 上移 4px（停车态）

### 4.4 焦点态 Focus

```css
:focus-visible {
  outline: none;
  box-shadow: var(--glow-brand);
}
```

> 车机虽以触摸为主，但 Radix 的键盘 a11y 给了我们「未来接入旋钮 / 方向键」的能力，焦点态必须做。

### 4.5 加载 / 空 / 错误 三态

| 态 | 组件 | 时机 |
|---|---|---|
| 加载 | `<Skeleton kind="card" />` | 数据请求中（≥ 200ms 才显示，避免闪烁） |
| 空 | `<EmptyState icon title description action />` | 列表无数据 |
| 错误 | `<ErrorState retry />` | 请求失败 |

每个数据驱动的页面/区块都必须实现这三态。

### 4.6 反馈节奏

| 操作类型 | 反馈形式 | 时长 |
|---|---|---|
| 加入购物车 | Toast 顶部 + 购物车角标 +1 动画 | 2s |
| 删除购物车项 | 行 collapse 动画 + 撤销 toast | 5s |
| 切换 SKU | 价格/库存原地高亮闪烁 | 240ms |
| 提交订单 | 按钮内置 loading + 全屏遮罩 | 直到响应 |
| 支付成功 | 全屏绿对勾动画 | 1.5s 后跳转 |

---

## 5. 资源 / 图标 / 文案

### 5.1 图标
- 首选：[Lucide React](https://lucide.dev)（线条粗细 2px 一致）
- 业务图标（车厂 logo、自提点）：单独 SVG，放 `apps/h5/public/icons/`
- 命名规范：`<scene>-<noun>-<modifier>.svg`，如 `home-banner-flashsale.svg`

### 5.2 图片
- 商品图：1:1 主图、4:5 卡片图
- Banner：4:1（1920×480）
- 占位图：使用 placeholder 渐变 + Logo 水印，避免 broken image

### 5.3 文案约定
- 按钮：动词开头、≤ 4 字（「加入购物车」「去结算」「确认下单」）
- Toast：≤ 16 字，明确结果（「已加入购物车」「下单失败，请重试」）
- 空状态：友好不卖萌（「这里还没有商品」而非「空空如也喵～」）
- 错误：可操作（「网络异常 · 点击重试」），不暴露技术细节
- 行车态文案统一加「⚠️」前缀；不许出现「不安全」「危险」等恐吓字眼

---

## 6. 与 Tailwind 的契合

### 6.1 `tailwind.config.ts` 关键配置（节选）

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui-components/src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: { 0: 'var(--color-bg-0)', 1: 'var(--color-bg-1)', 2: 'var(--color-bg-2)' },
        text: { primary: 'var(--color-text-primary)', /* ... */ },
        brand: { 500: 'var(--color-brand-500)' /* ... */ },
      },
      fontSize: {
        xs: ['var(--font-xs)', { lineHeight: '1.5' }],
        sm: ['var(--font-sm)', { lineHeight: '1.5' }],
        base: ['var(--font-base)', { lineHeight: '1.4' }],
        // ...
      },
      spacing: { 1: 'var(--space-1)', /* ... */ },
      borderRadius: { lg: 'var(--radius-lg)', /* ... */ },
      screens: {
        // 禁用默认 sm/md/lg（这些是手机断点）
        'ivi-xs': '1280px',
        'ivi-sm': '1600px',
        'ivi-md': '1920px',
        'ivi-lg': '2560px',
      },
    },
  },
  plugins: [
    // 自定义 variant: driving:xxx 和 parked:xxx
    require('./tailwind/plugins/driving-mode'),
  ],
} satisfies Config;
```

### 6.2 自定义 variants

```css
/* tailwind plugin */
@variant driving (&:where([data-mode="driving"] *));
@variant parked  (&:where([data-mode="parked"] *));
```

使用示例：

```tsx
<button className="text-base driving:text-lg">提交</button>
<div className="bg-bg-2 parked:bg-glass driving:bg-bg-1">...</div>
```

### 6.3 禁用的 Tailwind 默认

- `text-xs` / `text-sm`（小于 18px 的字号）— PostCSS 插件直接报错
- `text-7xl` 以上（巨型字号）— 仅 `--font-3xl` 56px 与 `--font-display` 72px 可用

---

## 7. 资源命名与目录

```
packages/
├── design-tokens/
│   ├── src/
│   │   ├── tokens.css       # CSS variables 总入口
│   │   ├── tokens.ts        # TS 字面量
│   │   ├── theme-dark.css   # 深色主题（默认）
│   │   ├── theme-light.css  # 浅色主题
│   │   ├── mode-driving.css # 行车态覆盖
│   │   └── tailwind.preset.ts
│   └── package.json         # name: @jdo/design-tokens
└── ui-components/
    ├── src/
    │   ├── Button/
    │   ├── Card/
    │   ├── ...
    │   └── index.ts
    └── package.json         # name: @jdo/ui-components
```

---

## 8. 验收 / 与其它文档的关系

### 8.1 与 [page-spec.md](./page-spec.md) 关系
- page-spec：**页面级**设计调性 + 区块组成 + 行车态差异
- design-system（本文）：**系统级** token + 组件契约 + Tailwind 配置
- **落代码顺序**：先按本文落 tokens + 基础组件，再按 page-spec 拼页面

### 8.2 与 [feature-spec.md](../feature-spec.md) 关系
- feature-spec：功能 + API + 状态机
- design-system：表现层
- 任何 PR 都需要"功能 → 组件 → token"三层有据可查

### 8.3 与 [ADR-0007](../decisions/ADR-0007-ui-library-and-design-system.md) 关系
- ADR-0007 决策"用什么"
- design-system 决策"怎么用，具体值是什么"
- ADR 变更需新 ADR；本文档变更直接 bump 版本号即可

### 8.4 完工 Checklist
- [ ] tokens.css 落 §1 所有 token
- [ ] tokens.ts 导出对应 TS 类型
- [ ] theme-light.css / mode-driving.css 覆盖逻辑实现
- [ ] tailwind.preset.ts 引用 CSS variables
- [ ] 基础组件 §3.1 第一批：Button / Card / Input / Dialog / Toast / Skeleton 实现
- [ ] 业务组件 §3.2 第一批：ProductCard / QrLogin / QrPay / PriceTag 实现
- [ ] 横屏分辨率 1920×720 / 1920×1080 / 2560×1440 三档无溢出
- [ ] 行车态 `?speed=20` 触发后所有 token 自动切换
- [ ] WCAG AA 对比度全表通过（用 axe-core 跑回归）
