package com.jdo.ivi.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * 设计 token · 颜色 —— 1:1 移植自 mockups/jdo-pencil-v3/styles/tokens.css
 * 单一真相：docs/design/design-system.md。改色先改 token 源，再同步此处。
 * ARGB 十六进制：0xAARRGGBB。半透明 token 的 alpha 由 css 的 rgba() 小数换算（×255 取整）。
 */
object JdoColors {
    // ── 背景 ──
    val Bg0 = Color(0xFF0A0B0E)
    val Bg1 = Color(0xFF11141A)
    val Bg2 = Color(0xFF181C24)
    val Bg3 = Color(0xFF21262D)
    val SurfaceGlass = Color(0x9914161A) // rgba(20,22,26,.60)

    // ── 描边 ──
    val BorderSubtle = Color(0x0FFFFFFF)  // rgba(255,255,255,.06)
    val BorderDefault = Color(0x1AFFFFFF) // .10
    val BorderStrong = Color(0x2EFFFFFF)  // .18

    // ── 文本 ──
    val TextPrimary = Color(0xFFF1F5F9)
    val TextSecondary = Color(0xFF94A3B8)
    val TextMuted = Color(0xFF64748B)
    val TextDisabled = Color(0xFF475569)
    val TextInverse = Color(0xFF0A0B0E)

    // ── 品牌 / 强调 ──
    val Brand500 = Color(0xFF3B82F6)
    val Brand400 = Color(0xFF60A5FA)
    val Brand600 = Color(0xFF2563EB)
    val Accent = Color(0xFF06B6D4)
    val AccentGlow = Color(0x3306B6D4) // rgba(6,182,212,.20)
    val Mint = Color(0xFF5EEAD4)
    val Gold = Color(0xFFD6BC8A)

    // ── 语义 ──
    val Success = Color(0xFF22C55E)
    val SuccessBg = Color(0x1F22C55E) // .12
    val Warn = Color(0xFFF59E0B)
    val WarnBg = Color(0x1FF59E0B)
    val Error = Color(0xFFEF4444)
    val ErrorBg = Color(0x1FEF4444)

    // ── 行车态（专用橙）──
    val Driving = Color(0xFFFB923C)
    val DrivingBg = Color(0x1FFB923C)
}
