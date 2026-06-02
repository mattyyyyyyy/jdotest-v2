package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.data.HeroRec
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.RadiusLg
import com.jdo.ivi.ui.theme.RadiusXl
import kotlinx.coroutines.delay

/* ============================================================
   02 · 商城首页
   顶栏 + 全宽时空推荐轮播（1 大 + 2 小）+ 左场景 rail + 商品网格
   ============================================================ */
@Composable
fun MallHomeScreen(nav: (String) -> Unit) {
    val c = JdoTheme.colors
    var scene by remember { mutableStateOf("energy") }
    val feed = Catalog.byScene(scene)
    val sceneName = Catalog.scenes.first { it.id == scene }.name

    val official = Catalog.heroRecs    // 简化：复用时空推荐作为轮播内容
    val recsTop = listOf(Catalog.heroRecs[0], Catalog.heroRecs[1])
    val recsBottom = listOf(Catalog.heroRecs[2], Catalog.heroRecs[3])

    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            MallTopBar(nav)

            // 时空推荐 hero 行
            Row(
                Modifier.fillMaxWidth().height(300.dp).padding(horizontal = 36.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                HeroBig(official, Modifier.weight(1.4f), nav) { scene = it }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    HeroSmall(recsTop, 4500, Modifier.weight(1f)) { scene = it }
                    HeroSmall(recsBottom, 5500, Modifier.weight(1f)) { scene = it }
                }
            }

            // 场景 rail + 商品网格
            Row(Modifier.fillMaxSize()) {
                NavRail(scene, { scene = it })
                Column(Modifier.weight(1f).padding(horizontal = 32.dp, vertical = 24.dp)) {
                    SectionBar("$sceneName · 为你精选", "基于车主常买 · 已为您过滤大件")
                    Spacer(Modifier.height(20.dp))
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(4),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        items(feed, key = { it.id }) { p ->
                            ProductCard(p) { nav(Routes.MallDetail) }
                        }
                    }
                }
            }
        }
    }
}

private fun toneBrush(tone: String, c: com.jdo.ivi.ui.theme.JdoColors): Brush = when (tone) {
    "mint" -> Brush.linearGradient(listOf(Color(0xFF064E3B), Color(0xFF047857), Color(0xFF06B6D4)))
    "gold" -> Brush.linearGradient(listOf(Color(0xFF7C2D12), Color(0xFFB45309), Color(0xFFF59E0B)))
    "cyan" -> Brush.linearGradient(listOf(Color(0xFF0C4A6E), Color(0xFF0E7490), Color(0xFF06B6D4)))
    else   -> Brush.linearGradient(listOf(Color(0xFF1E1B4B), Color(0xFF3730A3), Color(0xFF4F46E5)))
}

@Composable
private fun HeroBig(slides: List<HeroRec>, modifier: Modifier, nav: (String) -> Unit, onJump: (String) -> Unit) {
    val c = JdoTheme.colors
    var i by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) { while (true) { delay(6000); i = (i + 1) % slides.size } }
    val r = slides[i]
    Box(
        modifier.fillMaxHeight().clip(RoundedCornerShape(RadiusXl)).background(toneBrush(r.tone, c))
            .clickable { onJump(r.navScene) }.padding(32.dp),
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(jdoIcon(r.icon), null, tint = Color.White, modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(10.dp))
                Text(r.tag, color = Color.White.copy(0.92f), fontSize = 20.sp)
            }
            Spacer(Modifier.height(12.dp))
            Text(r.title, color = Color.White, fontSize = 40.sp, fontWeight = FontWeight.SemiBold, lineHeight = 44.sp)
            Spacer(Modifier.height(6.dp))
            Text(r.sub, color = Color.White.copy(0.8f), fontSize = 18.sp)
            Spacer(Modifier.weight(1f))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(r.statValue, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                    Text(r.statLabel, color = Color.White.copy(0.7f), fontSize = 14.sp)
                }
                Spacer(Modifier.weight(1f))
                Box(
                    Modifier.clip(RoundedCornerShape(9999.dp)).background(Color.White)
                        .clickable { onJump(r.navScene) }.padding(horizontal = 28.dp, vertical = 16.dp),
                ) { Text(r.cta, color = Color(0xFF0F172A), fontSize = 20.sp, fontWeight = FontWeight.SemiBold) }
            }
        }
    }
}

@Composable
private fun HeroSmall(slides: List<HeroRec>, period: Long, modifier: Modifier, onJump: (String) -> Unit) {
    var i by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) { while (true) { delay(period); i = (i + 1) % slides.size } }
    val r = slides[i]
    val c = JdoTheme.colors
    Box(
        modifier.fillMaxWidth().clip(RoundedCornerShape(RadiusLg)).background(toneBrush(r.tone, c))
            .clickable { onJump(r.navScene) }.padding(24.dp),
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(jdoIcon(r.icon), null, tint = Color.White.copy(0.85f), modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(r.tag, color = Color.White.copy(0.85f), fontSize = 15.sp)
            }
            Spacer(Modifier.height(6.dp))
            Text(r.title, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, lineHeight = 26.sp)
            Spacer(Modifier.weight(1f))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(r.statValue, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                Text(r.cta, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}
