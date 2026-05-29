# ADR-0004: 行车态车速数据源协议

- 状态：Accepted
- 日期：2026-05-25
- 决策者：用户 + Claude
- 依赖：[ADR-0001 前端框架](./ADR-0001-frontend-framework.md)

## 背景 Context

`DrivingContext` 是车机端核心深模块（PRD §模块拆分 / 深模块⭐），需要根据**当前车速**或**档位状态**决定 UI 进入「行车态」还是「停车态」。问题是：

- **Demo 阶段没有真实车机**，需要一种方式让开发者/演示者能模拟车速变化，触发降级 UI
- **未来接入真实车厂**时，不同车厂的 JS Bridge 接口千差万别（华为鸿蒙、小鹏、理想、蔚来、特斯拉 Web App……），不能让业务代码绑死任何一家
- 数据源必须**可观测**（调试时能看到当前车速/档位/进入行车态的原因）
- 数据源缺失时必须**安全降级**（默认不进入行车态？还是默认进入？需要决策）

本 ADR 的目的是定义一份「车速数据源抽象协议」，让 Demo 与真实车厂接入用同一套接口。

## 决策 Decision

### 协议抽象

定义统一接口 `DrivingStateSource`（位于 `apps/h5/src/platform/driving-context/source.ts`）：

```typescript
interface DrivingState {
  speedKmh: number;           // 当前车速，km/h
  gear?: 'P' | 'R' | 'N' | 'D';  // 档位（可选，部分车厂不暴露）
  isParked?: boolean;         // 是否手刹拉起 / P 档（可选）
  source: 'mock-url' | 'mock-keyboard' | 'bridge:<vendor>' | 'fallback';
}

interface DrivingStateSource {
  /** 订阅状态变化，返回取消订阅函数 */
  subscribe(listener: (state: DrivingState) => void): () => void;
  /** 一次性读取当前状态 */
  read(): DrivingState;
  /** 数据源标识，用于调试 */
  readonly name: string;
}
```

### 实现策略（按优先级，运行时自动 fallback）

1. **真实车厂 JS Bridge**（生产）：检测 `window.JDOBridge?.getDrivingState`，若存在则使用
2. **URL 参数 mock**（Demo 默认）：`?speed=20&gear=D` → DrivingContext 读取 search params
3. **键盘 mock**（开发调试）：按 `Ctrl+Shift+S` 唤起浮层，可拖动 slider 改车速
4. **fallback**：以上都不可用时，默认 `{ speedKmh: 0, source: 'fallback' }`（停车态）

### 进入行车态的判定规则

```
isDriving = speedKmh > 5
  OR (gear === 'D' OR gear === 'R')
  OR (isParked === false AND speedKmh > 0)
```

退出行车态：`speedKmh === 0` 且 `isParked === true` 连续 **3 秒**（防抖）

### 调试可见性

DrivingContext 提供 `useDrivingDebug()` hook，开发模式下右下角浮窗显示：
- 当前 source（mock-url / bridge:huawei / fallback）
- 实时车速 / 档位
- 当前 mode（driving / parked）
- 上次切换的时间戳

### 安全默认

- **生产构建（NODE_ENV=production）下，fallback 默认进入「停车态」**（不降级）
- 理由：宁可让副驾/后排乘客在行车中也能看到完整 UI（已知妥协，PRD User Story #30），也不要让停车的用户被错误降级
- 当真实车厂接入时，这条默认会被覆盖

## 理由 Rationale

1. **协议抽象隔离了"哪里来的车速"和"怎么用车速"**：业务组件只 import `useDrivingMode()`，无须关心数据源
2. **URL 参数 mock 是 Demo 的最佳选择**：
   - 演示者可以在车机/PC 浏览器中直接改 URL 触发降级，无需写代码
   - 录演示视频时清晰可控
   - 不依赖任何外部硬件或浏览器扩展
3. **键盘 mock 解决了"边开发边调试"的痛点**：写代码时按快捷键拖 slider，比反复改 URL 快
4. **JS Bridge 抽象层为未来接车厂留了口子**：每个车厂只需要写一个 `JDOBridgeAdapter`，不污染业务代码
5. **3 秒防抖**：避免红绿灯瞬间车速归零就退出行车态，又瞬间起步进入行车态的"闪屏"

## 替代方案 Alternatives Considered

| 方案 | 优点 | 缺点 | 为何不选 |
|---|---|---|---|
| **直接绑定特定车厂 SDK** | 实现简单 | 完全无法演示，且锁定单一车厂 | Demo 阶段不可接受 |
| **完全不模拟，永远停车态** | 最简单 | 演示无法展示行车态降级（PRD 的核心卖点之一） | 失去演示能力 |
| **后端推送车速** | 集中管理 | 弱网/断网就拿不到，延迟高 | 行车态是前端实时降级，必须本地数据源 |
| **WebSocket 接车机模拟器** | 与未来 bridge 接近 | Demo 阶段无车机模拟器 | 过度工程 |
| **用 Page Visibility / DeviceMotion** | 利用浏览器原生 API | PC/手机演示时拿不到真实车速 | 无法解决根本问题 |
| **每个组件自己判断车速** | 无需中心模块 | 重复逻辑、不一致、难测 | 不符合深模块原则 |
| **基于时间自动切换** | 演示连续性好 | 用户改不了状态，不真实 | 不可控 |

## 后果 Consequences

### 正面影响
- ✅ Demo 演示者可通过 URL 一键切换行车态/停车态
- ✅ 业务组件代码与车机平台完全解耦
- ✅ 未来接入真实车厂只需写一个 adapter
- ✅ 调试浮窗让 QA 与产品都能确认降级生效

### 负面影响 / 代价
- ⚠️ URL 参数会暴露在地址栏（演示时刻意而为之，生产可隐藏）
- ⚠️ fallback 默认停车态意味着「真实车机 bridge 失效时不降级」—— 这是已知的安全 trade-off，需在阶段二接入真实车机时重新审视
- ⚠️ 多车厂接入时，每家的 JS Bridge 接口形态可能差异极大，adapter 层会越来越厚

### 后续需要做的事
- [ ] `apps/h5/src/platform/driving-context/` 落地：
  - [ ] `source.ts`：协议接口定义
  - [ ] `sources/url.ts`：URL 参数 mock 实现
  - [ ] `sources/keyboard.ts`：键盘 mock 实现
  - [ ] `sources/bridge.ts`：JS Bridge 适配（先写空壳，标记 TODO）
  - [ ] `sources/fallback.ts`：fallback 实现
  - [ ] `index.ts`：导出 `useDrivingMode`、`DrivingProvider`、`useDrivingDebug`
- [ ] 写单元测试覆盖判定规则与防抖逻辑（PRD 测试优先级 #3）
- [ ] 开发模式右下角调试浮窗组件
- [ ] 在 README 与 `apps/h5/README.md` 标注 `?speed=N&gear=D` 用法
- [ ] 阶段二启动时新建 ADR-NNNN（具体车厂 bridge 协议），替换本 ADR 的"未来接入"假设
