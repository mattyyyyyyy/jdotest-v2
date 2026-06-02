package com.jdo.ivi.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.R
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens

/**
 * 车机 IVI 首页 —— 1:1 复刻消费端 V3（mockups/jdo-pencil-v3 screens/ivi-home）。
 * 结构：全屏壁纸 + 顶部状态栏 + 底部 4 张液态玻璃卡 + Dock。
 * 视觉值全部来自 JdoColors / JdoDimens（design token，ADR-0013）。
 */
@Composable
fun IviHomeScreen(onOpenMall: () -> Unit = {}) {
    Box(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        // 壁纸（暗夜极光 + Porsche Cayenne）铺满
        Image(
            painter = painterResource(R.drawable.ivi_wallpaper_dark),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )

        Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space5)) {
            StatusBar()
            Spacer(Modifier.weight(1f))
            CardsRow()
            Spacer(Modifier.height(JdoDimens.Space4))
            Dock(onOpenMall = onOpenMall)
        }
    }
}

@Composable
private fun StatusBar() {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Text("JDO", color = JdoColors.TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(JdoDimens.Space4))
        Pill("560 km")
        Spacer(Modifier.width(JdoDimens.Space2))
        Box(
            modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(JdoColors.SuccessBg).padding(horizontal = 10.dp, vertical = 4.dp),
        ) { Text("D", color = JdoColors.Success, fontWeight = FontWeight.Bold, fontSize = 16.sp) }
        Spacer(Modifier.weight(1f))
        Text("📶  📶", color = JdoColors.TextSecondary, fontSize = 16.sp)
        Spacer(Modifier.width(JdoDimens.Space4))
        Text("20°C", color = JdoColors.TextSecondary, fontSize = 18.sp)
        Spacer(Modifier.width(JdoDimens.Space4))
        Text("09:20", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun Pill(text: String) {
    Box(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.SurfaceGlass)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusPill)).padding(horizontal = 12.dp, vertical = 5.dp),
    ) { Text(text, color = JdoColors.TextSecondary, fontSize = 16.sp) }
}

@Composable
private fun GlassCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(JdoDimens.RadiusXl))
            .background(JdoColors.SurfaceGlass)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusXl))
            .padding(JdoDimens.Space4),
    ) { content() }
}

@Composable
private fun CardsRow() {
    Row(
        modifier = Modifier.fillMaxWidth().height(150.dp),
        horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
    ) {
        // 1. 快捷
        GlassCard(modifier = Modifier.weight(1.1f).fillMaxHeight()) {
            Row(modifier = Modifier.fillMaxSize(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) {
                QuickAction("🔍", "搜索")
                QuickAction("🏠", "回家")
                QuickAction("🏢", "公司")
                QuickAction("⚡", "充电", JdoColors.Mint)
            }
        }
        // 2. 音乐
        GlassCard(modifier = Modifier.weight(1.3f).fillMaxHeight()) {
            Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center) {
                Text("正在播放 · QQ 音乐", color = JdoColors.TextMuted, fontSize = 15.sp)
                Spacer(Modifier.height(6.dp))
                Text("黑色幽默 — 周杰伦", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(10.dp))
                Text("⏮   ▶   ⏭", color = JdoColors.TextPrimary, fontSize = 22.sp)
            }
        }
        // 3. 续航
        GlassCard(modifier = Modifier.weight(1f).fillMaxHeight()) {
            Row(modifier = Modifier.fillMaxSize(), verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("续航", color = JdoColors.TextMuted, fontSize = 15.sp)
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("468", color = JdoColors.TextPrimary, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                        Text(" km", color = JdoColors.TextSecondary, fontSize = 16.sp)
                    }
                    Text("● 充电中", color = JdoColors.Mint, fontSize = 14.sp)
                }
                Spacer(Modifier.weight(1f))
                Ring(0.90f)
            }
        }
        // 4. 天气
        GlassCard(modifier = Modifier.weight(1f).fillMaxHeight()) {
            Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center) {
                Text("上海 · 浦东", color = JdoColors.TextSecondary, fontSize = 15.sp)
                Row(verticalAlignment = Alignment.Top) {
                    Text("23", color = JdoColors.TextPrimary, fontSize = 40.sp, fontWeight = FontWeight.Bold)
                    Text("°", color = JdoColors.TextPrimary, fontSize = 24.sp)
                    Spacer(Modifier.weight(1f))
                    Text("☁️", fontSize = 28.sp)
                }
                Text("多云 · 空气良", color = JdoColors.TextMuted, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun QuickAction(glyph: String, label: String, tint: Color = JdoColors.TextPrimary) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusMd)).clickable { }.padding(JdoDimens.Space2),
    ) {
        Text(glyph, fontSize = 24.sp, color = tint)
        Spacer(Modifier.height(6.dp))
        Text(label, color = JdoColors.TextSecondary, fontSize = 14.sp)
    }
}

@Composable
private fun Ring(progress: Float) {
    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(64.dp)) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = Stroke(width = 7.dp.toPx(), cap = StrokeCap.Round)
            drawArc(color = JdoColors.Bg3, startAngle = 0f, sweepAngle = 360f, useCenter = false, style = stroke,
                size = Size(size.width, size.height))
            drawArc(color = JdoColors.Mint, startAngle = -90f, sweepAngle = 360f * progress, useCenter = false, style = stroke,
                size = Size(size.width, size.height))
        }
        Text("90%", color = JdoColors.Mint, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Dock(onOpenMall: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.SurfaceGlass)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg)).padding(horizontal = JdoDimens.Space5, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("🏠   🚗   🧭", color = JdoColors.TextSecondary, fontSize = 22.sp)
        Spacer(Modifier.weight(1f))
        DockApp("🛒", JdoColors.Brand500, onClick = onOpenMall) // 商城（可点进入）
        Spacer(Modifier.width(JdoDimens.Space3))
        DockApp("📍", JdoColors.Accent)
        Spacer(Modifier.width(JdoDimens.Space3))
        DockApp("🎵", JdoColors.Gold)
        Spacer(Modifier.width(JdoDimens.Space3))
        DockApp("▦", JdoColors.Brand400)
        Spacer(Modifier.weight(1f))
        Text("📞   🔊", color = JdoColors.TextSecondary, fontSize = 22.sp)
    }
}

@Composable
private fun DockApp(glyph: String, bg: Color, onClick: () -> Unit = {}) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.size(52.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(bg).clickable { onClick() },
    ) { Text(glyph, fontSize = 24.sp) }
}
