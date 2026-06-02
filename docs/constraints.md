# 约束 Constraints

> 状态：Draft · 日期：2026-06-01 · 维护者：架构 / 产品 agent
> 上游：[PRD.md](./PRD.md)（User Story F/G + 成功标准）· [scope.md](./scope.md)（边界）· ADR-0001~0013
> 下游：`.claude/settings.json`（must 级走 hook）· [testing-strategy（待补）] · 实现代码
> **分级**：`must` 不可妥协（须有 hook/CI 兜底）· `should` 推荐默认 · `optional` 可选增强 · `out` 明确不做。

---

## 一、产品 / 驾驶安全约束（消费端车机专属）

| 级别 | 约束 | 来源 / 执行 |
|---|---|---|
| must | 车速 > 5 km/h 自动进入行车态；车速回 0 持续 3s 切回停车态 | PRD US-25/29 · DrivingContext |
| must | 行车态隐藏视频 / 自动播放 / 闪烁动效 | PRD US-26 |
| must | 行车态禁用键盘 / 密码 / 银行卡号输入 | PRD US-27 |
| must | 行车态只暴露"再买一次 + 默认地址 + 默认支付"简化路径，≤ 3 步完成 | PRD US-28 / Solution |
| should | 副驾 / 后排乘客身份识别（Demo 统一按驾驶员降级，已知妥协）| PRD US-30 · 见 [open-questions.md](./open-questions.md) |

## 二、车机适配约束（设备 / 环境）

| 级别 | 约束 | 来源 |
|---|---|---|
| must | 支持 1920×720 / 1920×1080 / 2560×1440 / 2560×1600 横屏，无横向溢出 | PRD US-31 / 成功标准 |
| must | 触控目标 ≥ 88×88 px、间距 ≥ 16 px | PRD US-34 |
| must | 字号基础 ≥ 18px、主标题 ≥ 28px、对比度 ≥ WCAG AA | PRD US-33 |
| must | 默认深色主题，允许切换浅色 | PRD US-32 |
| should | 避免依赖长按 / 双击 / 手势 | PRD US-35 |
| should | 弱网 / 断网保留购物车本地缓存，订单提交失败可重试 | PRD US-36 · CartStore |

> 后台端**不受**车机 88px 触控 / 行车态约束（桌面 Web，ADR-0010/0012）。

## 三、业务约束

| 级别 | 约束 | 来源 |
|---|---|---|
| must | 价格 / 库存以服务端为准，前端不可绕过（结算走 draft order 再校验）| architecture §五 · openspec/specs/order |
| must | 订单状态变更只由支付状态机 / 服务端驱动，禁止前端直接改 | architecture §五 |
| must | 后台 AdminUser 与车主 User 隔离；写操作记审计日志 | ADR-0011 |
| must | 库存为 0 不可购，下单前服务端校验 | consistency-plan P2#9 |

## 四、性能 / 成功标准

| 级别 | 约束 | 来源 |
|---|---|---|
| should | 首屏 FCP ≤ 1.5s（Wi-Fi）/ 2.5s（4G）| PRD 成功标准 |
| should | 行车态"再买一次"全流程 ≤ 3 步、无键盘输入 | PRD 成功标准 |

## 五、工程 / 架构 / 配置 / 协作约束

| 级别 | 约束 | 执行机制 |
|---|---|---|
| must | 包管理 pnpm + workspaces；任务编排 turbo | ADR-0006 |
| must | 密钥不入仓，走 .env / secret manager | hook `scan-secrets.sh` |
| must | 编辑前完成开工三件套（读 CLAUDE/INDEX + 登记 Workstream）| hook `check-workstream-registered.sh` |
| must | commit 末尾带 `agent:` 尾标 | hook `check-agent-tag.sh` |
| must | 新增 docs/*.md 必须登记 INDEX（防孤儿）| hook `check-index-updated.sh` |
| must | 改 openspec/** 通过 `validate --all --strict` | hook `openspec-validate.sh` |
| must | API 契约单一真相 openapi.yaml，controller 漂移 CI 报错 | api-contracts.md（CI 待建）|
| should | 文档同步（源码↔spec/ADR）、测试 gate（Stop 前跑 test）| CLAUDE.md 软约束（误报率高，暂未 hook 化）|
| should | Conventional Commits（feat/fix/docs/refactor/test/chore/perf）| CONTRIBUTING.md（待补）|

## 六、明确不做（out of scope）

> 完整清单见 [scope.md](./scope.md)；此处汇总红线，防范围膨胀。

- 直播 / 短视频带货、复杂营销（拼团 / 砍价 / 瓜分红包 / 跨店满减）
- 第三方商家入驻（先自营）；多租户 / 多商家后台
- 真实支付 / 真实物流 / 车厂账号 SSO 真实对接（Demo 全 mock，预留接口）
- 多车型 WebView 真机适配（Demo 只验证通用横屏）
- 副驾 / 后排身份识别；国际化多语言；AR/VR/3D 展示
- 后台：复杂审批工作流、财务对账 / 开票、BI 自助报表、移动端适配
