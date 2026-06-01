package com.jdo.ivi.ui.theme

import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * 设计 token · 间距 / 圆角 / 触控 / 模糊 / 动效 —— 1:1 移植自 tokens.css。
 * 车机关键约束：触控目标 ≥ 88dp（min）、间距 ≥ 16dp（constraints.md must）。
 */
object JdoDimens {
    // ── 间距 ──
    val Space1 = 4.dp
    val Space2 = 8.dp
    val Space3 = 12.dp
    val Space4 = 16.dp
    val Space5 = 24.dp
    val Space6 = 32.dp
    val Space7 = 48.dp
    val Space8 = 64.dp
    val Space9 = 96.dp

    // ── 圆角 ──
    val RadiusSm = 8.dp
    val RadiusMd = 12.dp
    val RadiusLg = 20.dp
    val RadiusXl = 28.dp
    val Radius2xl = 40.dp
    val RadiusPill = 9999.dp

    // ── 触控（车机 must）──
    val TouchMin = 88.dp
    val TouchComfortable = 96.dp
    val TouchHero = 120.dp
    val TouchSpacing = 16.dp

    // ── 模糊（玻璃卡 blur）──
    val BlurSm = 12.dp
    val BlurMd = 24.dp
    val BlurLg = 32.dp

    // ── 字号（sp）──
    val FontXs = 18.sp
    val FontSm = 20.sp
    val FontBase = 24.sp
    val FontLg = 28.sp
    val FontXl = 32.sp
    val Font2xl = 40.sp
    val Font3xl = 56.sp
    val FontDisplay = 72.sp
}

/** 动效时长（毫秒）。Compose animationSpec 用。 */
object JdoMotion {
    const val Instant = 0
    const val Fast = 150
    const val Base = 240
    const val Slow = 400
}
