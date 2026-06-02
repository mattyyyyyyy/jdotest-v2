package com.jdo.ivi.ui.theme

import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.sp

/* ============================================================
   字体 / 排版 — 与 tokens.css 字号刻度对齐
   字体回退：放 res/font 后把 FontFamily 换成 bundled font。
   原型: --font-sans Manrope / --font-display Outfit /
        --font-mono JetBrains Mono / 中文 Noto Sans SC
   ============================================================ */

// 放入 res/font 后改为：
// val Manrope = FontFamily(Font(R.font.manrope_regular), Font(R.font.manrope_medium, FontWeight.Medium), ...)
val SansFamily: FontFamily = FontFamily.Default      // ← Manrope / Noto Sans SC
val DisplayFamily: FontFamily = FontFamily.Default   // ← Outfit
val MonoFamily: FontFamily = FontFamily.Monospace    // ← JetBrains Mono

val JdoTypography = Typography(
    displayLarge = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.SemiBold, fontSize = 57.sp, lineHeight = 64.sp, letterSpacing = (-0.5).sp),
    headlineLarge = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.SemiBold, fontSize = 36.sp, lineHeight = 40.sp),
    headlineMedium = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.SemiBold, fontSize = 30.sp, lineHeight = 36.sp),
    titleLarge = TextStyle(fontFamily = DisplayFamily, fontWeight = FontWeight.SemiBold, fontSize = 24.sp, lineHeight = 30.sp),
    titleMedium = TextStyle(fontFamily = SansFamily, fontWeight = FontWeight.Medium, fontSize = 20.sp, lineHeight = 26.sp),
    bodyLarge = TextStyle(fontFamily = SansFamily, fontWeight = FontWeight.Normal, fontSize = 18.sp, lineHeight = 26.sp),
    bodyMedium = TextStyle(fontFamily = SansFamily, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 22.sp),
    labelLarge = TextStyle(fontFamily = SansFamily, fontWeight = FontWeight.Medium, fontSize = 15.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontFamily = SansFamily, fontWeight = FontWeight.Medium, fontSize = 13.sp, lineHeight = 16.sp),
)

// 等宽数字样式（价格 / 续航 / 时间）
val MonoNumber = TextStyle(
    fontFamily = MonoFamily,
    fontWeight = FontWeight.SemiBold,
    letterSpacing = (-0.4).sp,
)
