package com.jdo.ivi.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

/**
 * JDO 车机主题。消费端默认深色（design-system / ADR-0009 暗色为主），允许浅色切换。
 * 把 design token 映射到 Material3 ColorScheme + 注入 JdoTypography。
 * 玻璃卡 / 行车态橙 / mint / gold 等非 Material 语义色直接用 JdoColors 引用。
 */

private val DarkColors = darkColorScheme(
    primary = JdoColors.Brand500,
    onPrimary = JdoColors.TextPrimary,
    primaryContainer = JdoColors.Brand600,
    secondary = JdoColors.Accent,
    onSecondary = JdoColors.TextInverse,
    background = JdoColors.Bg0,
    onBackground = JdoColors.TextPrimary,
    surface = JdoColors.Bg1,
    onSurface = JdoColors.TextPrimary,
    surfaceVariant = JdoColors.Bg2,
    onSurfaceVariant = JdoColors.TextSecondary,
    outline = JdoColors.BorderDefault,
    error = JdoColors.Error,
    onError = JdoColors.TextPrimary,
)

// 浅色仅为切换占位；车机主用深色。上线前按 design-system 浅色 token 完善。
private val LightColors = lightColorScheme(
    primary = JdoColors.Brand600,
    background = androidx.compose.ui.graphics.Color(0xFFF7F8FA),
    surface = androidx.compose.ui.graphics.Color(0xFFFFFFFF),
    error = JdoColors.Error,
)

@Composable
fun JdoTheme(
    darkTheme: Boolean = isSystemInDarkTheme().let { true }, // 默认强制深色；要跟随系统改成 isSystemInDarkTheme()
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = JdoTypography,
        content = content,
    )
}
