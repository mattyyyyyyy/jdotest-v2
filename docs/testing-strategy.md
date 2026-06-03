# 测试策略 Testing Strategy

> 状态：Draft · 日期：2026-06-03 · 维护者：QA/工程 agent
> 上游：`_templates/references/backend-testing-integration.md`（方法论）
> 起因：「后端单测全绿 ≠ 产品能用」——大量 UI / 前后端接线坑(banner没接、死按钮、写死 mock、详情页假规格)后端测试根本不覆盖。本文定义**每层测什么、对应命令、绿的边界**。

## ⚠️ "测试全绿"的准确含义（别再误读）

| 层 | 测什么 | 命令 | 覆盖 |
|---|---|---|---|
| 后端单元/路由 | `services/api` 路由返回的 JSON 对不对 | `pnpm --filter @jdo/api test`（106）| ✅ 后端逻辑 |
| 前后台打通契约 | **admin 写→consumer 读** 6 域端到端（商品/营销/交易/客户/履约/看板）| 同上（`app.test.ts` §前后台打通契约）| ✅ 后端层数据流 |
| API 契约漂移 | openapi.yaml 每个 path 都是已注册路由 | `contract.test.ts` | ✅ 契约 |
| UI 死按钮 | 消费端 Compose 屏交互控件有没有空 handler | `bash tools/check-dead-ui.sh` | ✅ 死按钮 |
| Android 纯逻辑 | fmtPrice / Catalog 过滤 | `./gradlew :app:testDebugUnitTest` | ✅ 局部纯函数 |
| **Android UI ↔ 后端** | **屏幕有没有把后端数据显示出来** | `./gradlew :app:connectedDebugAndroidTest`（需 emulator + 后端）| 🟢 **接缝已覆盖**（`BackendDataRenderTest`：拉真后端→渲染→断言商品标题显示）；逐屏断言待扩 |

**所以**：说"测试过 / 全绿"时必须讲清是哪一层。后端 106 绿 **不等于** Android 屏显示正确——后者目前主要靠**人工 emulator 验证**（仪器测试覆盖待补，需 SDK，CI 暂不跑）。

## 护栏（已落地，进 CI）
- **死按钮护栏** `tools/check-dead-ui.sh`：扫消费端屏交互控件空 handler（点了没反应）。故意无操作加 `// dead-ok: <原因>`。首跑抓出 14 个，已修。
- **前后台打通契约** `app.test.ts §前后台打通契约`：6 域 admin→consumer，断了 CI 红。
- **API 契约漂移** `contract.test.ts`：openapi↔路由一致。

## 待补（已知缺口，按优先级）
1. **Android 仪器测试断言"屏显示后端数据"**（最该补——直接防 banner/资料/mock 这类坑；需 emulator，CI 走 `reactivecircus/android-emulator-runner`）
2. **detekt**（`EmptyFunctionBlock` + `UnusedPrivateMember`）补静态死代码检测
3. **写死领域数据 lint**：屏文件里本地 `data class` 假模型 / 硬编码价格姓名（低误报版待打磨）
4. **E2E**（Maestro / Playstore 链路）跑主链路 + 关键异常
5. MSW 式前端 mock 隔离（确保 mock 永不进生产构建）

## 业界依据（详见对话/research）
- detekt empty-blocks（死按钮/空块）· MSW（mock 隔离）· Pact + OpenAPI（契约,schema 抓结构 + consumer 抓用法,二者缺一漏）。
