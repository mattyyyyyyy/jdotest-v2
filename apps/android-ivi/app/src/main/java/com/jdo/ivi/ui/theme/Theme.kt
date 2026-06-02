package com.jdo.ivi.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ProvidableCompositionLocal
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/* ============================================================
   JdoTheme — MaterialTheme 包一层，外加一组「设计扩展色」，
   因为液态玻璃配色（mint / gold / driving / 多档表面 / 玻璃描边）
   超出了 M3 ColorScheme 的角色，用 LocalJdoColors 提供。
   ============================================================ */

@Immutable
data class JdoColors(
    val bg0: Color, val bg1: Color, val bg2: Color, val bg3: Color,
    val surfaceGlass: Color,
    val borderSubtle: Color, val borderDefault: Color, val borderStrong: Color,
    val textPrimary: Color, val textSecondary: Color, val textMuted: Color, val textDisabled: Color,
    val brand: Color, val accent: Color, val mint: Color, val gold: Color,
    val success: Color, val warn: Color, val error: Color, val driving: Color,
    val isDark: Boolean,
)

private val DarkJdo = JdoColors(
    bg0 = Bg0, bg1 = Bg1, bg2 = Bg2, bg3 = Bg3,
    surfaceGlass = SurfaceGlass,
    borderSubtle = BorderSubtle, borderDefault = BorderDefault, borderStrong = BorderStrong,
    textPrimary = TextPrimary, textSecondary = TextSecondary, textMuted = TextMuted, textDisabled = TextDisabled,
    brand = Brand500, accent = Accent, mint = Mint, gold = Gold,
    success = Success, warn = Warn, error = ErrorRed, driving = Driving,
    isDark = true,
)

private val LightJdo = JdoColors(
    bg0 = LightBg0, bg1 = LightBg1, bg2 = LightBg2, bg3 = LightBg3,
    surfaceGlass = LightSurfaceGlass,
    borderSubtle = LightBorderDefault, borderDefault = LightBorderDefault, borderStrong = LightBorderStrong,
    textPrimary = LightTextPrimary, textSecondary = LightTextSecondary, textMuted = LightTextMuted, textDisabled = TextDisabled,
    brand = Brand600, accent = Accent, mint = Color(0xFF0E9488), gold = Color(0xFF9A7B3A),
    success = Color(0xFF16A34A), warn = Warn, error = ErrorRed, driving = Color(0xFFEA580C),
    isDark = false,
)

val LocalJdoColors: ProvidableCompositionLocal<JdoColors> = staticCompositionLocalOf { DarkJdo }

/** 在 composable 里用 JdoTheme.colors.mint 等取扩展色 */
object JdoTheme {
    val colors: JdoColors
        @Composable get() = LocalJdoColors.current
}

private val DarkScheme = darkColorScheme(
    primary = Accent, onPrimary = Color(0xFF03171F),
    secondary = Mint, onSecondary = Color(0xFF03171F),
    tertiary = Gold,
    background = Bg0, onBackground = TextPrimary,
    surface = Bg1, onSurface = TextPrimary,
    surfaceVariant = Bg2, onSurfaceVariant = TextSecondary,
    error = ErrorRed, onError = Color.White,
    outline = BorderStrong, outlineVariant = BorderDefault,
)

private val LightScheme = lightColorScheme(
    primary = Brand600, onPrimary = Color.White,
    secondary = Color(0xFF0E9488), onSecondary = Color.White,
    tertiary = Gold,
    background = LightBg0, onBackground = LightTextPrimary,
    surface = LightBg1, onSurface = LightTextPrimary,
    surfaceVariant = LightBg3, onSurfaceVariant = LightTextSecondary,
    error = ErrorRed, onError = Color.White,
    outline = LightBorderStrong, outlineVariant = LightBorderDefault,
)

@Composable
fun JdoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val jdo = if (darkTheme) DarkJdo else LightJdo
    CompositionLocalProvider(LocalJdoColors provides jdo) {
        MaterialTheme(
            colorScheme = if (darkTheme) DarkScheme else LightScheme,
            typography = JdoTypography,
            shapes = JdoShapes,
            content = content,
        )
    }
}
