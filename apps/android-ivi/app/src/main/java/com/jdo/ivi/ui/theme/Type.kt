package com.jdo.ivi.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight

/**
 * 设计 token · 字体 —— 字号/字重 1:1 移植自 tokens.css。
 * 字体族：tokens.css 用 Manrope/Outfit + Noto Sans SC。原生若要完全一致，
 * 把 Manrope/Outfit/Noto Sans SC 字体文件放 res/font 并替换 FontFamily（见 README）。
 * 这里先用系统默认（FontFamily.Default，HarmonyOS/PingFang 兜底），字号/字重已精确。
 */
private val JdoFontFamily = FontFamily.Default

val JdoTypography = Typography(
    // 对应 --font-display 72 / --font-3xl 56 / --font-2xl 40
    displayLarge = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Bold, fontSize = JdoDimens.FontDisplay, lineHeight = JdoDimens.FontDisplay * 1.1f),
    displayMedium = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Bold, fontSize = JdoDimens.Font3xl, lineHeight = JdoDimens.Font3xl * 1.1f),
    headlineLarge = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.SemiBold, fontSize = JdoDimens.Font2xl, lineHeight = JdoDimens.Font2xl * 1.3f),
    // --font-xl 32 / --font-lg 28（主标题 ≥ 28，constraints must）
    headlineMedium = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.SemiBold, fontSize = JdoDimens.FontXl, lineHeight = JdoDimens.FontXl * 1.3f),
    titleLarge = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.SemiBold, fontSize = JdoDimens.FontLg, lineHeight = JdoDimens.FontLg * 1.3f),
    // --font-base 24（正文基础 ≥ 18 must）
    bodyLarge = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Normal, fontSize = JdoDimens.FontBase, lineHeight = JdoDimens.FontBase * 1.4f),
    // --font-sm 20
    bodyMedium = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Normal, fontSize = JdoDimens.FontSm, lineHeight = JdoDimens.FontSm * 1.4f),
    // --font-xs 18（最小，仍 ≥ 18 满足车机可读约束）
    bodySmall = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Normal, fontSize = JdoDimens.FontXs, lineHeight = JdoDimens.FontXs * 1.4f),
    labelLarge = TextStyle(fontFamily = JdoFontFamily, fontWeight = FontWeight.Medium, fontSize = JdoDimens.FontSm, lineHeight = JdoDimens.FontSm * 1.3f),
)
