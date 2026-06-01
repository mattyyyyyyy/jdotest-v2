# apps/android-ivi · 消费端原生安卓（Kotlin + Jetpack Compose）

> 依据：[ADR-0013](../../docs/decisions/ADR-0013-consumer-native-android.md)（消费端从 H5 改原生安卓）
> 目标平台：**普通安卓车机 / 平板**（非 AAOS）· 设计基准：`mockups/jdo-pencil-v3`（视觉/交互参照）
> 后端不变：复用 `services/api` 的 `/api/v1/*`

## 现状（首个纵向切片）

- ✅ **设计 token → Compose 主题**（`ui/theme/{Color,Dimens,Type,Theme}.kt`）：颜色/字号/间距/圆角/触控 **1:1 移植自 `mockups/jdo-pencil-v3/styles/tokens.css`**。这是"界面和现在一样"的地基。
- ⬜ 屏幕：IVI 首页（状态栏 + 车型壁纸 + 4 玻璃卡 + Dock）→ 商城 20 屏，按 `docs/design/page-spec.md` 逐屏 Compose 复刻。

## ⚠️ 构建说明（重要）

本仓库的开发沙箱**没有 Android SDK / Gradle / 模拟器**，原生代码无法在此编译/运行/预览。请在 **Android Studio**（本机）构建：

1. Android Studio → New Project → **Empty Activity（Compose）**，包名 `com.jdo.ivi`，最低 API 26+。
2. 把本目录 `app/src/main/java/com/jdo/ivi/ui/theme/*.kt` 拷进工程对应包路径（或直接以本目录为 app module）。
3. 在 `MainActivity` 用 `JdoTheme { ... }` 包裹根 Composable。
4. API 基址指向后端：模拟器用 `http://10.0.2.2:3000/api/v1`，真机用局域网 IP；接口同 web（`/bootstrap`、`/products`、`/auth/qr-code`…）。
5. 行车态车速：普通安卓平板无车速信号时用 mock；真车机接 Android Car API（`CarPropertyManager`，见 ADR-0013 §后续 #5）。

> Gradle/Manifest 由 Android Studio 按你的 SDK 版本生成，避免版本漂移——故本仓库只提供与设计强相关、可复用的主题与屏幕 Kotlin 源，不手写 Gradle 脚手架。

## 设计一致性

- token 已逐值对齐 tokens.css；**字体**要完全一致需把 `Manrope` / `Outfit` / `Noto Sans SC` 字体文件放 `res/font/` 并在 `Type.kt` 用 `FontFamily(Font(R.font.xxx))` 替换 `FontFamily.Default`（当前字号/字重已精确，字形用系统兜底）。
- 玻璃卡：`SurfaceGlass` + `BorderSubtle` + `RenderEffect.createBlurEffect`（API 31+）实现毛玻璃；低版本降级为半透明纯色。

## 目录

```
apps/android-ivi/
  app/src/main/java/com/jdo/ivi/
    ui/theme/{Color,Dimens,Type,Theme}.kt   # ✅ 设计 token 主题（已落地）
    ui/screens/                              # ⬜ 各屏 Composable（待逐屏迁移）
  README.md
```
