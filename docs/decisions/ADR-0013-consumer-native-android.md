# ADR-0013: 消费端运行形态改为原生安卓（Kotlin + Jetpack Compose）

- 状态：Accepted
- 日期：2026-06-02
- 决策者：用户（产品/技术负责人）+ claude-harness-reconcile
- 依赖：ADR-0007（design tokens / 设计系统）· ADR-0004（车速数据源 JS Bridge → 改为原生 Car API）
- Supersedes：CLAUDE.md §锁定结论「消费端运行形态 = 车机内嵌 H5 / WebView」；并改写 ADR-0001（React+Vite 仅适用于 H5）在消费端的适用范围

## 背景 Context

消费端原定为车机内嵌 H5 / WebView（锁定结论 + ADR-0001），现有 21 屏以 React 原型落在 `mockups/jdo-pencil-v3`。用户决定把消费端**改为原生安卓应用**，运行在**普通安卓车机 / 平板**（非 Android Automotive OS），并要求**界面设计与现状完全一致**。

关键前提（已与用户确认）：
- **目标平台 = 普通安卓车机 / 平板**（非 AAOS）。这点决定可行性：普通安卓**无 AAOS 的 car app library 模板化 / 分心限制**，允许自绘整套电商 UI；若为 AAOS 则纯原生自绘会受限。
- **实现路线 = 纯原生 Kotlin + Jetpack Compose**（最彻底）。

## 决策 Decision

消费端从「H5 / WebView」改为「**原生安卓 App：Kotlin + Jetpack Compose**」，目标普通安卓车机 / 平板。**设计 1:1 保持**——靠把 `design-system.md` / `mockups/jdo-pencil-v3/styles/tokens.css` 的设计 tokens 移植成 Compose 主题（`Color.kt` / `Type.kt` / `Dimens.kt`），所有屏按 `page-spec.md` 区块布局用 Compose 重写。后端 `services/api` 与契约 **不变**，原生端通过同一套 `/api/v1/*` REST 接口取数。

## 理由 Rationale

- **设计可移植**：本项目已把设计沉淀为 tokens + page-spec + mockups 基准，不锁死在 web 实现里——原生照 token 复刻即可保证"界面还和现在一样"。这是文档先行的直接回报。
- **普通安卓平台无 UI 限制**：可自绘整套电商界面，Compose 能忠实还原暗色玻璃卡 / 大字号 / 88px 触控 / 行车态降级。
- **原生收益**：性能、流畅度、深度车机集成（真实车速/档位走 Android Car API 而非 mock URL 参数）、离线能力优于 WebView。
- 后端不动，迁移面收敛在前端。

## 替代方案 Alternatives Considered

| 方案 | 设计还原 | 工作量 | 否决理由 |
|---|---|---|---|
| **A. WebView 套壳** | 100%（即现 web）| 小 | 是"原生壳 + web 内核"，非真原生；性能/集成无原生收益。用户明确要"最彻底" |
| **B. React Native** | 高 | 中 | 复用 React 逻辑，但多一层 RN 运行时；车机/AAOS 生态支持不如纯原生；非"最彻底" |
| **C. 纯原生 Compose** ✅ | 高（按 token 重画）| 大 | **选定**：真原生、平台无限制、集成最佳 |
| AAOS 目标 | — | — | 用户选普通安卓平板，非 AAOS（AAOS 自绘电商 UI 受分心限制，另案） |

## 后果 Consequences

**正面：**
- 真原生性能与车机集成；设计与现状一致（token 驱动）。
- 后端 / API / 订单状态机 / admin 全部复用，不受影响。

**负面 / 代价：**
- ⚠️ **本仓库当前 sandbox 无 Android SDK / Gradle / 模拟器**——原生代码可编写，但**无法在此环境编译/运行/预览**，构建与验证须在 Android Studio（本机或 CI）。这是与 web 预览的根本差异。
- 21 屏需用 Compose 重写（工作量大），H5 原型降级为"视觉与交互参照基准"（不删，标参照）。
- 行车态车速源从 ADR-0004 的 URL 参数 mock 改为 Android Car API（`CarPropertyManager` 车速/档位）+ mock 兜底；需新增"原生 Car 信号适配"决策（后续 ADR）。

**后续需要做的事（下游 sync 清单）：**
1. 更新 CLAUDE.md §锁定结论：消费端运行形态指向本 ADR（H5 改原生）。
2. 新建 `apps/android-ivi/`（Gradle + Compose）；落 **设计 token → Compose 主题**（`Color/Type/Dimens.kt`）作为"设计 1:1"的地基（**首个纵向切片**）。
3. 首个参照屏：IVI 首页（状态栏 + 车型壁纸 + 4 玻璃卡 + Dock）用 Compose 1:1 复刻，对照现 web 截图验收。
4. 按 page-spec 逐屏迁移商城 20 屏；行车态降级用 Compose 状态驱动（对应 interaction-patterns）。
5. 车速源适配：Android Car API + mock；可能升 ADR-0004 或新增 ADR-0014。
6. PRD §Solution「车机内嵌 H5」表述更新为"原生安卓 App"。
7. `mockups/jdo-pencil-v3` 标注为"视觉/交互参照基准（原生实装据此）"，保留不删。
