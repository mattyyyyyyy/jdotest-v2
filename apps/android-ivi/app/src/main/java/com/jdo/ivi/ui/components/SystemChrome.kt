package com.jdo.ivi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
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

/* ============================================================
   车机系统栏：StatusBar（顶）+ Dock（底）
   ============================================================ */

@Composable
fun StatusBar(time: String = "09:20", modifier: Modifier = Modifier) {
    val c = JdoTheme.colors
    Row(
        modifier.fillMaxWidth().height(72.dp).padding(horizontal = 28.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 左：头像 + 品牌 + 续航 + 档位
        AvatarBadge("J")
        Spacer(Modifier.width(16.dp))
        Text("JDO", color = c.textPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(20.dp))
        Pill { IconSmall("battery"); Spacer(Modifier.width(8.dp)); Text("560 km", color = c.textPrimary, fontSize = 18.sp) }
        Spacer(Modifier.width(16.dp))
        Box(
            Modifier.size(40.dp).clip(RoundedCornerShape(12.dp))
                .background(Brush.linearGradient(listOf(c.accent.copy(0.18f), c.brand.copy(0.10f))))
                .border(1.dp, c.mint.copy(0.3f), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center,
        ) { Text("D", color = c.mint, fontWeight = FontWeight.Bold, fontSize = 20.sp) }

        Spacer(Modifier.weight(1f))

        // 右：BT / WiFi / 天气 / 时间
        IconSmall("bluetooth"); Spacer(Modifier.width(20.dp))
        IconSmall("wifi"); Spacer(Modifier.width(20.dp))
        Pill { IconSmall("sunCloud"); Spacer(Modifier.width(8.dp)); Text("20°C", color = c.textPrimary, fontSize = 18.sp) }
        Spacer(Modifier.width(16.dp))
        Text(time, color = c.textPrimary, fontSize = 24.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun Pill(content: @Composable RowScope.() -> Unit) {
    val c = JdoTheme.colors
    Row(
        Modifier.clip(RoundedCornerShape(RadiusPill)).background(c.bg2.copy(0.5f))
            .border(1.dp, c.borderDefault, RoundedCornerShape(RadiusPill))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically, content = content,
    )
}

@Composable
fun AvatarBadge(letter: String, size: androidx.compose.ui.unit.Dp = 48.dp) {
    val c = JdoTheme.colors
    Box(
        Modifier.size(size).clip(CircleShape)
            .background(Brush.linearGradient(listOf(Color(0xFF4A5570), Color(0xFF2A3245)))),
        contentAlignment = Alignment.Center,
    ) { Text(letter, color = Color(0xFFCBD5E1), fontWeight = FontWeight.Bold) }
}

@Composable
private fun IconSmall(name: String) {
    Icon(jdoIcon(name), null, tint = JdoTheme.colors.textPrimary.copy(0.85f), modifier = Modifier.size(26.dp))
}

/* ── Dock（底部系统栏）── */
@Composable
fun Dock(onOpenShop: () -> Unit, onHome: () -> Unit, modifier: Modifier = Modifier) {
    val c = JdoTheme.colors
    Row(
        modifier.fillMaxWidth().height(96.dp)
            .background(c.bg1.copy(0.85f))
            .border(1.dp, c.borderSubtle)
            .padding(horizontal = 28.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        DockIcon("home", onHome); Spacer(Modifier.width(10.dp))
        DockIcon("car") {}; Spacer(Modifier.width(10.dp))
        DockIcon("compass") {}

        Spacer(Modifier.weight(1f))

        // 中央 App 启动器
        AppLauncher("JD", Brush.linearGradient(listOf(Color(0xFFFF5B3A), Color(0xFFB91C1C))), onOpenShop)
        Spacer(Modifier.width(16.dp))
        AppLauncher("⌖", Brush.linearGradient(listOf(Color(0xFF3B82F6), Color(0xFF1E3A8A)))) {}
        Spacer(Modifier.width(16.dp))
        AppLauncher("♬", Brush.linearGradient(listOf(Color(0xFFF97316), Color(0xFFB45309)))) {}
        Spacer(Modifier.width(16.dp))
        AppLauncher("▦", Brush.linearGradient(listOf(Color(0xFF06B6D4), Color(0xFF1E3A8A)))) {}

        Spacer(Modifier.weight(1f))

        DockIcon("phone") {}; Spacer(Modifier.width(10.dp))
        DockIcon("music") {}; Spacer(Modifier.width(10.dp))
        DockIcon("volume") {}
    }
}

@Composable
private fun DockIcon(name: String, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Box(
        Modifier.size(64.dp).clip(RoundedCornerShape(20.dp))
            .background(c.bg2.copy(0.4f)).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(jdoIcon(name), null, tint = c.textPrimary, modifier = Modifier.size(30.dp)) }
}

@Composable
private fun AppLauncher(glyph: String, brush: Brush, onClick: () -> Unit) {
    Box(
        Modifier.size(72.dp).clip(RoundedCornerShape(22.dp)).background(brush).clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(glyph, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 26.sp) }
}
