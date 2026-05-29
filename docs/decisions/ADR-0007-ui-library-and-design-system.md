# ADR-0007: UI 库 / 设计系统起点

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0001 前端框架](./ADR-0001-frontend-framework.md)

## 背景 Context

前端 `apps/h5` 需要选定 UI 起点。约束特别强：

- **车机优先**，所有触控目标 ≥ 88×88 px、间距 ≥ 16 px、字号基础 ≥ 18 px、主标题 ≥ 28 px
- **WCAG AA 对比度**（强光车内可读）
- **深色主题为默认**，浅色可切换
- **横屏布局优先**（16:9 ~ 21:9），现成的手机端组件库往往是竖屏假设
- 行车态需要**视觉降级**（隐藏复杂控件、放大主操作）
- Demo 阶段要快，但不能套一个看起来像"手机后台"的组件库（车机演示会很怪）

## 决策 Decision

**采用「自研 design tokens + Tailwind CSS + Radix Primitives（无样式基座）」组合，不引入完整组件库。**

### 三层结构

```
┌──────────────────────────────────────────────────────────┐
│  apps/h5/src/components             业务组件             │
│  ↓ 使用                                                  │
│  packages/ui-components             车机化包装层（按需）│
│  ↓ 基于                                                  │
│  Radix Primitives + Tailwind        无样式基座 + 原子样式│
│  ↓ 消费                                                  │
│  packages/design-tokens             tokens 单一真相      │
└──────────────────────────────────────────────────────────┘
```

### 设计 tokens 范围（`packages/design-tokens`）

- **颜色**：主色 / 辅助色 / 语义色（success/warn/error/info）、深浅双套
- **字号梯度**：18 / 20 / 24 / 28 / 32 / 40 / 48（基础 18 起步，符合车机约束）
- **间距梯度**：4 / 8 / 12 / 16 / 24 / 32 / 48
- **触控目标尺寸 token**：`hit-area-min = 88px`（强制约束）
- **栅格**：12 列 + 车机横屏断点（1280 / 1600 / 1920 / 2560 / 3840）
- **圆角、阴影、动效曲线、动效时长**

### 输出形态

- CSS 变量（`--jdo-color-primary-500`）+ Tailwind config 双导出
- 同一份 tokens 同时支持 CSS-in-JS / Tailwind / 直接 CSS

### Tailwind 配置约束

- 禁用 Tailwind 默认 `text-xs` / `text-sm`（小于 18px 的字号全部禁用）
- 自定义 `touch-target` utility 强制最小 88×88
- 自定义 `landscape-*` 响应式断点

### Radix Primitives 用法

- 只用 **无样式 primitives**：Dialog / Dropdown / Tabs / Switch / Slider / Toast 等
- 不引入 Radix UI Themes（那是有样式的，与车机不匹配）
- 每个 primitive 写一个 `packages/ui-components/<Component>` 套上车机 tokens

### 图标

- 起步用 `lucide-react`（开源、tree-shake 友好、风格中性）
- 关键品牌图标后期自研 SVG

## 理由 Rationale

1. **车机 UI 与手机/桌面 UI 差距大**：任何成熟组件库都是基于手机/桌面假设设计的（点击区 44×44、字号 14px），照搬过来要二次封装一遍每个组件，反而费时
2. **Tailwind 让 design tokens 直达使用**：CSS 变量定义一次，Tailwind 配置导入，用的时候 `text-base-lg`、`p-md-2`，开发体验顺
3. **Radix Primitives 提供无样式但可访问性合规的复杂组件**：Modal / Dropdown / Tabs 这种自己写很容易漏 a11y，Radix 给你正确的 ARIA / 键盘导航，但样式完全留给你
4. **设计 tokens 单独成包**：未来 design system 独立演进、给 admin 后台或其它端复用都不困难
5. **不选 Material-UI / Ant Design / Chakra**：
   - 主题深度定制成本 ≥ 自研
   - bundle size 大，违反"≤ 300KB"目标
   - 视觉风格强烈，演示给车厂方"看起来像 Antd"是负资产

## 替代方案 Alternatives Considered

### 完整组件库

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Material-UI (MUI)** | 组件全、文档好 | bundle 重、Material 风格强烈、车机改造困难 | 视觉不合、改造成本高 |
| **Ant Design** | 中文文档好、组件多 | 桌面后台风格、bundle 巨大 | 演示给车厂看会非常违和 |
| **Chakra UI** | 主题系统好 | runtime CSS-in-JS、性能不如 Tailwind | 性能与定制都不如自研路线 |
| **Mantine** | 设计感好、组件丰富 | 风格固定、车机改造需大量覆盖 | 与车机风格不匹配 |
| **NextUI / Hero UI** | 设计现代 | 不够成熟、车机适配性未知 | 风险大于收益 |
| **Arco Design** | 字节出品、设计感好 | 桌面端 | 不适合车机 |
| **TDesign** | 腾讯出品 | 偏桌面/移动端 | 同上 |

### 无样式组件库

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Headless UI (Tailwind 官方)** | 与 Tailwind 配合天然 | 组件数量比 Radix 少 | Radix 更全 |
| **React Aria (Adobe)** | a11y 极强 | API 心智模型陡 | Radix 学习曲线更友好 |
| **Ariakit** | API 优雅 | 生态比 Radix 小 | 是备选 |

### 样式方案

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **CSS Modules** | 标准、纯净 | 没有原子化的便利 | Tailwind 在车机 tokens 强约束场景更高效 |
| **styled-components / emotion** | 主题系统强 | runtime 性能损耗、bundle 重 | Tailwind 零 runtime |
| **vanilla-extract** | 零 runtime + TS | 生态比 Tailwind 小 | Tailwind 更主流 |
| **UnoCSS** | 比 Tailwind 更快 | 生态新 | 风险 |

### 偏激进路线

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **完全自研 + CSS Modules** | 完全可控 | 时间成本高 | 与 Tailwind+Radix 比，自研的边际收益低 |
| **完全不用任何库** | 极致简单 | 复杂组件（Modal/Dropdown）从零造轮子、a11y 漏洞多 | 不可取 |

## 后果 Consequences

### 正面影响
- ✅ 视觉完全可控，演示给车厂看不会"撞脸"
- ✅ design tokens 是单一真相，未来设计师/PD 调色调字号只改一处
- ✅ bundle 体积小，符合 ≤ 300KB 目标
- ✅ a11y 合规由 Radix 兜底，自己写 Modal 也不会漏键盘导航
- ✅ Tailwind 生态文档/AI 友好，开发提速

### 负面影响 / 代价
- ⚠️ 初期组件库稀缺，每个新组件都要在 `packages/ui-components` 包一层 —— Week 1 会感觉比直接用 Antd 慢
- ⚠️ 设计 tokens 第一版需要花时间沉淀，决策成本高于"装一个库就用"
- ⚠️ Radix Primitives 不熟的话，第一次写复杂组件需要查文档

### 后续需要做的事
- [ ] `packages/design-tokens` 初始化：定义颜色、字号、间距、栅格 tokens（深色为默认）
- [ ] 输出 CSS 变量与 Tailwind config 两份产物
- [ ] `apps/h5` 安装 Tailwind CSS + PostCSS + autoprefixer
- [ ] 写 `tailwind.config.ts`，禁用默认 `text-xs/sm`，加 `landscape-*` 断点、`touch-target` utility
- [ ] `packages/ui-components` 落基础组件：Button / Card / Input / Modal / Tabs / Toast（先 6 个够用）
- [ ] 引入 `lucide-react`
- [ ] 写 Storybook 或简单的 `packages/ui-components/playground` 页面展示组件
- [ ] 在 README 标注设计原则（字号、点击区、对比度）
