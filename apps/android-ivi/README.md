# apps/android-ivi · 消费端原生安卓（Kotlin + Jetpack Compose）

> 依据：[ADR-0013](../../docs/decisions/ADR-0013-consumer-native-android.md)（消费端从 H5 改原生安卓）
> 目标平台：**普通安卓车机 / 平板**（非 AAOS）· 设计基准：`mockups/jdo-pencil-v3`（视觉/交互参照）
> 后端不变：复用 `services/api` 的 `/api/v1/*`

## 当前进度

- ✅ **设计 token → Compose 主题**：颜色、字号、间距、圆角、触控已从 `mockups/jdo-pencil-v3/styles/tokens.css` 移植。
- ✅ **21 屏 Compose 原生页面**：IVI 首页 + 商城 20 屏已按用户交付的原生参考包落地；商城首页保留仓库既有的 V3 定制还原。
- ✅ **真实后端闭环**：启动加载 `/bootstrap`；商品卡和详情页写入 `/cart/items`；购物车读写 `/cart`；结算调用 `/cart/checkout`；支付确认写入 `/payments/:orderId/confirm`；订单页回读 `/orders`。
- ✅ **图片兜底**：CDN 图片直接加载；后端 `data:image/*` 内联占位图映射到本地 `product_placeholder.xml`，避免 Coil 2 渲染空块。

## 构建说明

2026-06-02 已在本机 Android SDK 36、Android Studio JBR 21、Gradle 8.14.3 和 `emulator-5554` 上验证：

```bash
ANDROID_HOME="$HOME/Library/Android/sdk" \
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
"$HOME/.local/gradle-8.14.3/bin/gradle" --no-daemon :app:assembleDebug
```

APK 输出：`app/build/outputs/apk/debug/app-debug.apk`。

API 基址在 `app/build.gradle.kts` 的 `API_BASE`。cloudflared 隧道重启后需要更新地址并重新打包。行车态车速目前仍为 mock；真车机接 Android Car API（`CarPropertyManager`，见 ADR-0013 §后续 #5）。

## 持续回归

静态检查 21 条路由、运行 API 测试和 Android debug 构建：

```bash
apps/android-ivi/scripts/regression-check.sh
```

追加模拟器真实点击 `商城 → 购物车 → 结算 → 支付 → 待发货`：

```bash
apps/android-ivi/scripts/regression-check.sh --emulator
```

次级页面与 V3 Web 的对齐矩阵见 [`docs/research/android-native-v3-regression-audit.md`](../../docs/research/android-native-v3-regression-audit.md)。

> Gradle/Manifest 由 Android Studio 按你的 SDK 版本生成，避免版本漂移——故本仓库只提供与设计强相关、可复用的主题与屏幕 Kotlin 源，不手写 Gradle 脚手架。

## 设计一致性

- token 已逐值对齐 tokens.css；**字体**要完全一致需把 `Manrope` / `Outfit` / `Noto Sans SC` 字体文件放 `res/font/` 并在 `Type.kt` 用 `FontFamily(Font(R.font.xxx))` 替换 `FontFamily.Default`（当前字号/字重已精确，字形用系统兜底）。
- 玻璃卡：`SurfaceGlass` + `BorderSubtle` + `RenderEffect.createBlurEffect`（API 31+）实现毛玻璃；低版本降级为半透明纯色。

## 目录

```
apps/android-ivi/
  app/src/main/java/com/jdo/ivi/
    data/                                    # Catalog + NetworkClient + ShoppingState
    ui/theme/                                # 设计 token 主题
    ui/components/                           # 通用组件
    ui/nav/                                  # 21 屏导航
    ui/screens/                              # IVI 首页 + 商城 20 屏
  scripts/                                   # 静态契约 + 模拟器支付闭环回归
  README.md
```
