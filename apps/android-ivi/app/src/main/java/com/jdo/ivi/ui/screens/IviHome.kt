package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.Image
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.R
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber
import com.jdo.ivi.ui.theme.RadiusXl
import com.jdo.ivi.ui.theme.glass

/* ============================================================
   01 · 车机首页
   状态栏 + 车型壁纸 + 底部 4 张玻璃信息卡 + Dock
   ============================================================ */
@Composable
fun IviHomeScreen(nav: (String) -> Unit) {
    val c = JdoTheme.colors
    Box(Modifier.fillMaxSize().background(c.bg0)) {

        // 暗夜极光车型壁纸是 IVI 首页的视觉锚点；叠一层轻遮罩保证文字可读。
        Image(
            painter = painterResource(R.drawable.ivi_wallpaper_dark),
            contentDescription = "JDO 车型壁纸",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(
            Modifier.fillMaxSize().background(
                Brush.verticalGradient(
                    listOf(Color(0x33020810), Color(0x12020810), Color(0x99020810))
                )
            )
        )

        Column(Modifier.fillMaxSize()) {
            StatusBar()
            Spacer(Modifier.weight(1f))

            // 底部信息卡行
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 28.dp).padding(bottom = 112.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                QuickActionsCard(Modifier.weight(1.1f), nav)
                MusicCard(Modifier.weight(1.4f))
                RangeCard(Modifier.weight(1f))
                WeatherCard(Modifier.weight(0.9f))
            }
        }

        Dock(
            onOpenShop = { nav(Routes.MallHome) },
            onHome = {},
            modifier = Modifier.align(Alignment.BottomCenter),
        )
    }
}

@Composable
private fun QuickActionsCard(modifier: Modifier, nav: (String) -> Unit) {
    val c = JdoTheme.colors
    GlassCard(modifier.height(168.dp), padding = PaddingValues(14.dp)) {
        Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            QuickTile("search", "搜索", Modifier.weight(1f)) { nav(Routes.MallSearch) }
            QuickTile("home", "回家", Modifier.weight(1f)) {}
            QuickTile("company", "公司", Modifier.weight(1f)) {}
            QuickTile("bolt", "充电", Modifier.weight(1f), tint = c.mint) {}
        }
    }
}

@Composable
private fun QuickTile(icon: String, label: String, modifier: Modifier, tint: Color? = null, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Column(
        modifier.fillMaxHeight().clip(RoundedCornerShape(18.dp)).clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(jdoIcon(icon), label, tint = tint ?: c.textPrimary, modifier = Modifier.size(30.dp))
        Spacer(Modifier.height(10.dp))
        Text(label, color = c.textSecondary, fontSize = 17.sp)
    }
}

@Composable
private fun MusicCard(modifier: Modifier) {
    val c = JdoTheme.colors
    GlassCard(modifier.height(168.dp), padding = PaddingValues(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=70",
                "封面", contentScale = ContentScale.Crop,
                modifier = Modifier.size(104.dp).clip(RoundedCornerShape(16.dp)),
            )
            Spacer(Modifier.width(20.dp))
            Column(Modifier.weight(1f)) {
                Text("正在播放 · QQ 音乐", color = c.textSecondary, fontSize = 14.sp)
                Spacer(Modifier.height(4.dp))
                Text("黑色幽默 — 周杰伦", color = c.textPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(10.dp))
                Box(Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)).background(c.borderDefault)) {
                    Box(Modifier.fillMaxWidth(0.4f).fillMaxHeight().background(Brush.horizontalGradient(listOf(c.mint, c.brand))))
                }
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                    CircleBtn("prev")
                    CircleBtn("play", primary = true)
                    CircleBtn("next")
                }
            }
        }
    }
}

@Composable
private fun CircleBtn(icon: String, primary: Boolean = false) {
    val c = JdoTheme.colors
    val bg = if (primary) Brush.linearGradient(listOf(c.accent, c.brand)) else Brush.linearGradient(listOf(c.bg3.copy(0.6f), c.bg3.copy(0.6f)))
    Box(
        Modifier.size(if (primary) 48.dp else 42.dp).clip(CircleShape).background(bg).clickable {},
        contentAlignment = Alignment.Center,
    ) { Icon(jdoIcon(icon), null, tint = if (primary) Color(0xFF03171F) else c.textPrimary, modifier = Modifier.size(26.dp)) }
}

@Composable
private fun RangeCard(modifier: Modifier) {
    val c = JdoTheme.colors
    GlassCard(modifier.height(168.dp), padding = PaddingValues(18.dp)) {
        Text("续航", color = c.textSecondary, fontSize = 17.sp)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Text("468", color = c.textPrimary, fontSize = 44.sp, style = MonoNumber)
            Text(" km", color = c.textSecondary, fontSize = 20.sp)
        }
        Spacer(Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(c.mint))
            Spacer(Modifier.width(10.dp))
            Text("充电中 · 剩余 25 分", color = c.mint, fontSize = 15.sp)
        }
    }
}

@Composable
private fun WeatherCard(modifier: Modifier) {
    val c = JdoTheme.colors
    GlassCard(modifier.height(168.dp), padding = PaddingValues(18.dp)) {
        Text("上海 · 浦东", color = c.textSecondary, fontSize = 17.sp)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.Top) {
            Text("23", color = c.textPrimary, fontSize = 48.sp, fontWeight = FontWeight.SemiBold)
            Text("°", color = c.textPrimary, fontSize = 26.sp)
        }
        Spacer(Modifier.weight(1f))
        Text("多云 · 空气良", color = c.textSecondary, fontSize = 15.sp)
        Text("东北风 2 级 · 湿度 62%", color = c.textSecondary, fontSize = 15.sp)
    }
}
