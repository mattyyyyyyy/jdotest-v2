package com.jdo.ivi.ui.theme

import android.graphics.RenderEffect
import android.graphics.Shader
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asComposeRenderEffect
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/* ============================================================
   液态玻璃 Modifier
   原型 .gcard = 半透明表面 + backdrop blur + 1px 白色描边
                + 顶部高光 + 投影。
   Compose 没有原生 backdrop-filter；这里：
     1) 用半透明渐变填充模拟玻璃色
     2) 顶部→底部高光/阴影渐变描边（白 14% → 透明）
     3) 阴影 elevation
   若需要真正的「背景模糊」，对【背景层】套 blurBackground()（API 31+）。
   ============================================================ */

@Composable
fun Modifier.glass(
    shape: RoundedCornerShape = RoundedCornerShape(RadiusXl),
    elevation: Dp = 16.dp,
): Modifier {
    val c = JdoTheme.colors
    val fill = if (c.isDark) {
        Brush.linearGradient(
            listOf(Color(0x14FFFFFF), Color(0x05FFFFFF)),
            start = Offset(0f, 0f), end = Offset(0f, Float.POSITIVE_INFINITY)
        )
    } else {
        Brush.linearGradient(listOf(Color(0xF2FFFFFF), Color(0xCCFFFFFF)))
    }
    val stroke = Brush.verticalGradient(
        if (c.isDark) listOf(Color(0x24FFFFFF), Color(0x0AFFFFFF))
        else listOf(Color(0x33FFFFFF), Color(0x140F172A))
    )
    return this
        .shadow(elevation, shape, clip = false)
        .background(if (c.isDark) Color(0x80141619) else Color(0xCCFFFFFF), shape)
        .background(fill, shape)
        .border(1.dp, stroke, shape)
}

/** 给「会被玻璃遮住的背景层」加真模糊（API 31+，低版本无操作）。 */
fun Modifier.blurBackground(radius: Dp = 24.dp): Modifier {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        this.graphicsLayer {
            renderEffect = RenderEffect
                .createBlurEffect(radius.toPx(), radius.toPx(), Shader.TileMode.DECAL)
                .asComposeRenderEffect()
        }
    } else this
}

/** 强调色发光（mint / accent / driving 用于强调按钮、活跃指示）。 */
fun Modifier.glow(color: Color, shape: RoundedCornerShape, radius: Dp = 24.dp): Modifier =
    this.shadow(radius, shape, clip = false, ambientColor = color, spotColor = color)
