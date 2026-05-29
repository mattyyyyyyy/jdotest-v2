# ADR-0001: 前端框架选型

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0006 monorepo 工具](./ADR-0006-monorepo-tool.md)

## 背景 Context

车机电商前端 `apps/h5` 需要选定一个框架，约束如下：

- 必须是 **H5 Web 应用**（PRD 已锁定，运行在车机浏览器/WebView）
- **响应式 + 双形态**（行车/停车），DOM 切换频繁，需要良好的状态管理与组件复用
- **首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）**，Bundle ≤ 300KB gzipped
- **类型安全**（电商业务复杂，订单/支付不能容忍运行时类型错误）
- 需要支持 **横屏 + 多分辨率自适应**
- 团队需要在 1 周内打通主链路（开发体验、热更新、上手成本都要好）
- 未来要在车机 WebView 真机调试，框架不能依赖最新浏览器 API

## 决策 Decision

**采用 React 18 + Vite + TypeScript**

辅助选择：
- **路由**：React Router v6
- **状态管理**：Zustand（全局态）+ React Context（DrivingContext 等平台层）
- **HTTP 客户端**：`@tanstack/react-query` + 由 OpenAPI 自动生成的 fetch client
- **样式方案**：详见 [ADR-0007](./ADR-0007-ui-library-and-design-system.md)

## 理由 Rationale

1. **React 生态最厚**：电商场景需要的 UI 组件、表单库、虚拟列表、状态管理工具，React 都有最成熟的选项
2. **TypeScript 一等公民**：JSX + TS 协作顺畅，与共享包 `@jdo/shared-types`、`@jdo/order-state-machine` 类型直连
3. **Vite 是当前 H5 项目最优 dev server**：
   - 冷启动 < 1s，HMR < 100ms（vs webpack 冷启动 10s+）
   - 生产构建走 Rollup，tree shaking 优秀
   - 与 pnpm workspaces 配合无 quirks
4. **React 18 的 concurrent features 对车机有用**：useTransition / Suspense 能让"行车态↔停车态"切换更顺滑，避免主线程长任务
5. **车机 WebView 兼容性 OK**：Chromium 79+ 完全支持 React 18 + Vite 默认产物（ES2020）
6. **团队熟悉度**：用户全栈视角，React 心智模型与后端组件化思维契合

## 替代方案 Alternatives Considered

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **Vue 3 + Vite** | 模板直观、SFC 易读、Composition API 现代 | 生态比 React 浅一档（特别是电商场景），TS 体验略弱 | 团队熟悉度与生态成熟度都不如 React |
| **SolidJS** | 性能极致、JSX 语法、bundle 小 | 生态太新、组件库稀缺 | Demo 阶段无法承担生态空白的成本 |
| **Svelte / SvelteKit** | 编译时优化、bundle 最小 | 团队不熟悉、招人难、电商组件少 | 学习曲线 + 生态双重风险 |
| **Next.js（React + SSR）** | SSR/SSG/ISR 一站式 | SSR 对车机演示价值低（车机离线/弱网常见），增加复杂度 | 过度设计，CSR + Vercel CDN 已够用 |
| **Nuxt 3** | Vue 全栈 | 同时承担 Vue + 全栈框架的不确定性 | 不如 Vite + React 路线清晰 |
| **Qwik** | resumability 极致首屏 | 生态新、坑多 | 不适合 Demo 阶段 |
| **原生 Web Components** | 无框架依赖 | 状态管理/组件复用都得自己造 | 工程化成本高 |

## 后果 Consequences

### 正面影响
- ✅ 一周内打通主链路完全可行
- ✅ 共享包类型直连，前后端 DTO 不双份维护
- ✅ Vite dev server 飞快，团队幸福感高
- ✅ 招聘/外包友好，React 工程师供给充足

### 负面影响 / 代价
- ⚠️ React 18 + 多个生态库的版本协调需要关注（peer deps 警告）
- ⚠️ 默认 bundle 不算小，需要 code split + lazy load 来达到 300KB 目标
- ⚠️ 状态管理需要纪律（Zustand vs Context 边界清晰）

### 后续需要做的事
- [ ] `apps/h5` 初始化：`pnpm create vite apps/h5 --template react-ts`
- [ ] 配 React Router v6 + 基础路由（首页/分类/详情/购物车/结算/我的）
- [ ] 配 Zustand store 基础结构
- [ ] 引入 `@tanstack/react-query` 并对接 `packages/api-contracts` 生成的 client
- [ ] 写 `apps/h5/README.md` 说明启动方式
- [ ] CI 加 typecheck + build 检查
