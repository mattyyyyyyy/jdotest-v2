package com.jdo.ivi.ui.theme

import androidx.compose.ui.graphics.Color

/* ============================================================
   设计 token 配色 — 与 styles/tokens.css 一致
   ============================================================ */

// ── 中性 / 表面（深色）──
val Bg0          = Color(0xFF0A0B0E)
val Bg1          = Color(0xFF11141A)
val Bg2          = Color(0xFF181C24)
val Bg3          = Color(0xFF21262D)
val TextPrimary  = Color(0xFFF1F5F9)
val TextSecondary= Color(0xFF94A3B8)
val TextMuted    = Color(0xFF64748B)
val TextDisabled = Color(0xFF475569)

// 玻璃表面 / 描边（带透明度）
val SurfaceGlass   = Color(0x99141619)   // rgba(20,22,26,0.60)
val BorderSubtle   = Color(0x0FFFFFFF)   // white 6%
val BorderDefault  = Color(0x1AFFFFFF)   // white 10%
val BorderStrong   = Color(0x2EFFFFFF)   // white 18%

// ── 品牌 / 强调 ──
val Brand500 = Color(0xFF3B82F6)
val Brand400 = Color(0xFF60A5FA)
val Brand600 = Color(0xFF2563EB)
val Accent   = Color(0xFF06B6D4)
val Mint     = Color(0xFF5EEAD4)
val Gold     = Color(0xFFD6BC8A)

// ── 语义 ──
val Success  = Color(0xFF22C55E)
val Warn     = Color(0xFFF59E0B)
val ErrorRed = Color(0xFFEF4444)
val Driving  = Color(0xFFFB923C)

// ── 浅色覆盖 ──
val LightBg0         = Color(0xFFF4F6FA)
val LightBg1         = Color(0xFFFFFFFF)
val LightBg2         = Color(0xFFFFFFFF)
val LightBg3         = Color(0xFFEEF2F7)
val LightSurfaceGlass= Color(0xB8FFFFFF)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF475569)
val LightTextMuted   = Color(0xFF64748B)
val LightBorderDefault = Color(0x1A0F172A)
val LightBorderStrong  = Color(0x2E0F172A)
