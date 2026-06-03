# 测试策略 Testing Strategy

> 状态：Draft · 日期：2026-06-03 · 维护者：QA/工程 agent
> 上游：`_templates/references/backend-testing-integration.md`（方法论）
> 起因：「后端单测全绿 ≠ 产品能用」——大量 UI / 前后端接线坑(banner没接、死按钮、写死 mock、详情页假规格)后端测试根本不覆盖。本文定义**每层测什么、对应命令、绿的边界**。
> **方法论（v4 起）：TDD 测试驱动开发**，权威定义见 [CLAUDE.md §测试驱动开发](../CLAUDE.md)。

## 🧪 TDD 工作法（红-绿-重构 · 测试先行）

本项目改 feature 行为一律 **测试先于实现**：

```
🔴 RED       先把 OpenSpec 的 #### Scenario（GIVEN/WHEN/THEN）翻成失败测试 → 跑，确认红
🟢 GREEN     写最小实现让它变绿
♻️ REFACTOR  绿灯保护下重构，保持全绿
```

- **scenario ↔ 测试一一对应**：propose 出的每个 scenario 必须有测试，否则该 change 未完成。
- **测试落最靠近行为的层**：后端→inject/单测；状态机→单测；安卓 UI↔后端→仪器测试；admin→组件/E2E。
- **Bug 先复现再修**：先写能复现的失败测试，再修到绿（防回归）。
- **强制力**：「测试先写」的顺序无法机器校验（属 `should` 文化约束）；**有牙齿的是覆盖率门槛（CI gate）**——见下文 §覆盖率门槛。

## ⚠️ "测试全绿"的准确含义（别再误读）

| 层 | 测什么 | 命令 | 覆盖 |
|---|---|---|---|
| 后端单元/路由 | `services/api` 路由返回的 JSON 对不对 | `pnpm --filter @jdo/api test`（106）| ✅ 后端逻辑 |
| 前后台打通契约 | **admin 写→consumer 读** 6 域端到端（商品/营销/交易/客户/履约/看板）| 同上（`app.test.ts` §前后台打通契约）| ✅ 后端层数据流 |
| API 契约漂移 | openapi.yaml 每个 path 都是已注册路由 | `contract.test.ts` | ✅ 契约 |
| UI 死按钮 | 消费端 Compose 屏交互控件有没有空 handler | `bash tools/check-dead-ui.sh` | ✅ 死按钮 |
| Android 纯逻辑 | fmtPrice / Catalog 过滤 + **JaCoCo 门槛** | `./gradlew :app:jacocoUnitVerification` | ✅ 局部纯函数（覆盖率 gate）|
| **Android UI ↔ 后端** | **屏幕有没有把后端数据显示出来** | `./gradlew :app:connectedDebugAndroidTest`（CI `android-instrumented` job 用 android-emulator-runner 起后端 + emulator 跑）| 🟢 **接缝已覆盖 + 进 CI**（`BackendDataRenderTest`：拉真后端→渲染→断言商品标题显示；`PrimaryButtonTest`）；逐屏断言待扩 |

**所以**：说"测试过 / 全绿"时必须讲清是哪一层。后端 106 绿 **不等于** Android 屏显示正确——但 Android 仪器测试现已进 CI（`android-instrumented`），UI↔后端接缝有自动断言把关，不再纯靠人工 emulator。

## 护栏（已落地，进 CI）
- **死按钮护栏** `tools/check-dead-ui.sh`：扫消费端屏交互控件空 handler（点了没反应）。故意无操作加 `// dead-ok: <原因>`。首跑抓出 14 个，已修。
- **前后台打通契约** `app.test.ts §前后台打通契约`：6 域 admin→consumer，断了 CI 红。
- **API 契约漂移** `contract.test.ts`：openapi↔路由一致。

## 📊 覆盖率门槛（TDD 的牙齿 · ✅ 已落地 2026-06-03）

TDD 的"测试先写"无法机器强制，但"代码必须被测试覆盖"可以——用覆盖率门槛逼出测试。
**已落地**：`@vitest/coverage-v8` + 每包 `vitest.config.ts` 设 `thresholds`，`test` 脚本带 `--coverage`，
CI 的 `pnpm test` 不达标即 **exit 1 → 红**（已实测：抬高门槛会 exit 1，正常 exit 0）。

| 范围 | 工具 | 基线（2026-06-03） | 门槛（棘轮，只升不降） | gate |
|---|---|---|---|---|
| 后端 `services/api` | `@vitest/coverage-v8` | Lines/Stmts **97.6%** · Funcs **98.8%** · Branch **80.4%** | lines/stmts/funcs ≥ **95**，branch ≥ **78** | `pnpm test` ✅ |
| `packages/order-state-machine` | 同上 | 全部 **100%** | lines/stmts/funcs ≥ **90**，branch ≥ **85** | `pnpm test` ✅ |
| admin（React） | Vitest + jsdom + Testing Library | Lines/Stmts **99.2%** · Branch **87.8%** · Funcs **78.6%**（13 测试：fmt + 登录→控制台流程 + api 封装层） | lines/stmts ≥ **90**，branch ≥ **80**，funcs ≥ **70** | `pnpm test` ✅ |
| Android（JVM 单测） | JaCoCo（限定 `data/Catalog` 纯逻辑层） | 行覆盖 **63.2%**（60/95） | line ≥ **60** | `gradlew :app:jacocoUnitVerification`（CI android-unit）✅ |

> Android 门槛**只限定 data 纯逻辑层**——Compose UI 靠仪器测试覆盖，不算进 JaCoCo，否则海量 UI 会把比例拉到接近 0。可临时验证牙齿：`-PjacocoMin=0.80`（基线 63% → exit 1）。

> 原则：**门槛只升不降**；排除项见各 `vitest.config.ts`（server.ts 入口 / admin-spa.ts 字符串 / seed 数据）。
> 提高门槛 = 改 `thresholds` 数字；新增代码覆盖率不得拉低整体（理想后续上 diff-coverage 卡新增行）。

## 待补（已知缺口，按优先级）
1. **逐屏仪器断言扩面**：当前仪器测试只断言「商品标题渲染 + 按钮回调」；应补「确认订单页提交按钮可见」「各页关键控件可见」等（直接防「下单按钮被裁掉」复发）
2. **diff-coverage**：只卡新增/改动行的覆盖率，而非整体比例（更精准逼出 TDD）
3. **admin（React）从 0 补测试**：组件测试 + Playwright 冒烟
4. **detekt**（`EmptyFunctionBlock` + `UnusedPrivateMember`）补静态死代码检测
5. **写死领域数据 lint**：屏文件里本地 `data class` 假模型 / 硬编码价格姓名（低误报版待打磨）
6. **E2E**（Maestro 安卓 / Playwright admin）跑主链路 + 关键异常
7. MSW 式前端 mock 隔离（确保 mock 永不进生产构建）

## 业界依据（详见对话/research）
- detekt empty-blocks（死按钮/空块）· MSW（mock 隔离）· Pact + OpenAPI（契约,schema 抓结构 + consumer 抓用法,二者缺一漏）。
