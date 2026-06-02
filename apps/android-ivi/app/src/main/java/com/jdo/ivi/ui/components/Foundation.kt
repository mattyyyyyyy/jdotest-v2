package com.jdo.ivi.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.RadiusPill
import com.jdo.ivi.ui.theme.RadiusXl
import com.jdo.ivi.ui.theme.glass
import com.jdo.ivi.ui.theme.glow

/* ============================================================
   通用组件：玻璃卡 / 按钮 / 芯片 / SectionBar
   ============================================================ */

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    corner: androidx.compose.ui.unit.Dp = RadiusXl,
    padding: PaddingValues = PaddingValues(24.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    val shape = RoundedCornerShape(corner)
    Column(
        modifier
            .glass(shape)
            .clip(shape)
            .padding(padding),
        content = content,
    )
}

/** 主行动按钮（强调渐变 + 发光） */
@Composable
fun PrimaryButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
) {
    val c = JdoTheme.colors
    val shape = RoundedCornerShape(RadiusPill)
    Box(
        modifier
            .glow(c.accent.copy(alpha = 0.4f), shape, 20.dp)
            .clip(shape)
            .background(Brush.horizontalGradient(listOf(c.accent, c.brand)))
            .clickable(onClick = onClick)
            .heightIn(min = 56.dp)
            .padding(horizontal = 28.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = Color(0xFF03171F), fontWeight = FontWeight.SemiBold, fontSize = 20.sp)
    }
}

/** 次级按钮（描边玻璃） */
@Composable
fun OutlineButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
) {
    val c = JdoTheme.colors
    val shape = RoundedCornerShape(RadiusPill)
    Box(
        modifier
            .clip(shape)
            .background(c.mint.copy(alpha = 0.10f))
            .border(1.5.dp, c.mint.copy(alpha = 0.4f), shape)
            .clickable(onClick = onClick)
            .heightIn(min = 56.dp)
            .padding(horizontal = 28.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, color = c.mint, fontWeight = FontWeight.Medium, fontSize = 20.sp)
    }
}

/** 过滤芯片 / 标签 */
@Composable
fun Chip(
    text: String,
    active: Boolean = false,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
) {
    val c = JdoTheme.colors
    val shape = RoundedCornerShape(RadiusPill)
    val bg = if (active) c.accent.copy(alpha = 0.15f) else c.bg2.copy(alpha = 0.5f)
    val border = if (active) c.accent.copy(alpha = 0.4f) else c.borderDefault
    val fg = if (active) c.mint else c.textSecondary
    Box(
        modifier
            .clip(shape)
            .background(bg)
            .border(1.dp, border, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 12.dp),
    ) {
        Text(text, color = fg, fontSize = 18.sp, fontWeight = FontWeight.Medium)
    }
}

/** 区块标题：粗标题 + 副标题 */
@Composable
fun SectionBar(title: String, subtitle: String? = null, modifier: Modifier = Modifier) {
    val c = JdoTheme.colors
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.Bottom) {
        Text(title, color = c.textPrimary, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
        if (subtitle != null) {
            Spacer(Modifier.width(14.dp))
            Text(subtitle, color = c.textMuted, fontSize = 18.sp, modifier = Modifier.padding(bottom = 3.dp))
        }
    }
}

@Composable
fun Divider(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(1.dp).background(JdoTheme.colors.borderDefault))
}

fun tagColors(kind: com.jdo.ivi.data.TagKind, c: com.jdo.ivi.ui.theme.JdoColors): Pair<Color, Color> =
    when (kind) {
        com.jdo.ivi.data.TagKind.RED  -> c.error to Color.White
        com.jdo.ivi.data.TagKind.MINT -> c.mint to Color(0xFF03171F)
        com.jdo.ivi.data.TagKind.GOLD -> c.gold to Color(0xFF1F1500)
        com.jdo.ivi.data.TagKind.CYAN -> c.accent to Color(0xFF03171F)
    }
