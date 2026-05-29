# driving-mode

> 当前真相（current truth）。消费端车机行车态降级的已实现行为。
> 改这里只能走 change → delta → archive，不要直接编辑。

## Purpose

车机端根据车速在「行车态」与「停车态」间自动切换，行车态对驾驶员降低分心风险。所有 UI 降级判断必须读 `useDrivingMode()`，禁止页面自行判速。

## Requirements

### Requirement: 行车态自动进入与退出

The system MUST switch to `driving` mode when vehicle speed exceeds 5 km/h sustained for 1 second, and MUST switch back to `parked` mode when speed equals 0 km/h sustained for 3 seconds.

The system MUST expose the current mode via `useDrivingMode()` returning `{ mode, restrictions, speed, source }`.

The system MUST fall back to `parked` mode with a sensor-recovery hint when the speed sensor signal is lost.

#### Scenario: 车速超阈值进入行车态
- **GIVEN** 车机处于 parked 态
- **WHEN** 车速 > 5 km/h 持续 1 秒
- **THEN** 系统切换到 driving 态
- **AND** 所有订阅 `useDrivingMode()` 的组件在 3 秒内完成降级

#### Scenario: 停车持续退出行车态
- **GIVEN** 车机处于 driving 态
- **WHEN** 车速 = 0 km/h 持续 3 秒
- **THEN** 系统切回 parked 态并恢复完整购物能力

#### Scenario: 传感器丢失降级
- **GIVEN** 车速信号源中断
- **WHEN** `useDrivingMode()` 读取不到有效车速
- **THEN** 系统降级为 parked 态
- **AND** 顶部显示"传感器恢复中"提示

### Requirement: 行车态交互限制

The system MUST disable keyboard, password, and bank-card inputs in `driving` mode. The system MUST hide video, autoplay, and flashing animations in `driving` mode. The system MUST expose only the "再买一次 + 默认地址 + 默认支付" simplified path in `driving` mode.

#### Scenario: 行车态禁止键盘输入
- **GIVEN** 车机处于 driving 态
- **WHEN** 用户尝试唤起键盘输入
- **THEN** 键盘组件不可达
- **AND** 仅语音入口可用

#### Scenario: 行车态再买一次 ≤ 3 步
- **GIVEN** 车机处于 driving 态且用户已登录、有默认地址与免密支付
- **WHEN** 用户点击某常买商品的"一键购买"
- **THEN** 系统用默认地址 + 默认免密支付合成订单
- **AND** 全流程 ≤ 3 步、零键盘输入
