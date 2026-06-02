package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.data.HeroRec
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.RadiusLg
import com.jdo.ivi.ui.theme.RadiusXl
import kotlinx.coroutines.delay

private const val MALL_HOME_UI_SCALE = 0.9f

/* ============================================================
   02 · 商城首页
   顶栏 + 全宽时空推荐横滑轮播 + 左场景 rail + 商品网格
   ============================================================ */
@Composable
fun MallHomeScreen(nav: (String) -> Unit) {
    val c = JdoTheme.colors
    var scene by remember { mutableStateOf("energy") }
    val feed = Catalog.byScene(scene)
    val sceneName = Catalog.scenes.first { it.id == scene }.name
    val gridState = rememberLazyGridState()
    var bannerVisible by remember { mutableStateOf(true) }
    val bannerHeight by animateDpAsState(if (bannerVisible) 300.dp else 0.dp, tween(260), label = "banner-height")
    val bannerPadding by animateDpAsState(if (bannerVisible) 10.dp else 0.dp, tween(260), label = "banner-padding")
    val bannerAlpha by animateFloatAsState(if (bannerVisible) 1f else 0f, tween(220), label = "banner-alpha")
    val bannerScrollConnection = remember {
        object : NestedScrollConnection {
            override fun onPreScroll(available: Offset, source: NestedScrollSource): Offset {
                when {
                    available.y < -2f -> bannerVisible = false
                    available.y > 2f -> bannerVisible = true
                }
                return Offset.Zero
            }
        }
    }
    val density = LocalDensity.current

    // 时空推荐：1 大卡（轮播全部）+ 2 小卡（各轮播 2 张）——对照 V3「1 官方 + 2 场景」3 块并排
    val official = Catalog.heroRecs
    val recsTop = official.take(2)
    val recsBottom = official.drop(2).take(2)

    MallBg {
        CompositionLocalProvider(LocalDensity provides Density(density.density * MALL_HOME_UI_SCALE, density.fontScale)) {
            Column(Modifier.fillMaxSize()) {
                StatusBar()
                MallTopBar(nav)

                // 时空推荐 — 1 大 + 2 小，3 块并排（对照 V3：左 1 官方 + 右 2 场景），上滑收起
                if (official.isNotEmpty()) {
                    Row(
                        Modifier.fillMaxWidth().height(bannerHeight)
                            .graphicsLayer {
                                alpha = bannerAlpha
                                translationY = -(1f - bannerAlpha) * 36.dp.toPx()
                            }
                            .padding(top = bannerPadding, start = 36.dp, end = 36.dp),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        HeroBig(official, Modifier.weight(1.4f), nav) { scene = it }
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                            if (recsTop.isNotEmpty()) HeroSmall(recsTop, 4500, Modifier.weight(1f)) { scene = it }
                            if (recsBottom.isNotEmpty()) HeroSmall(recsBottom, 5500, Modifier.weight(1f)) { scene = it }
                        }
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
                            state = gridState,
                            modifier = Modifier.fillMaxSize().nestedScroll(bannerScrollConnection),
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
}

private fun toneBrush(tone: String, c: com.jdo.ivi.ui.theme.JdoColors): Brush = when (tone) {
    "mint" -> Brush.linearGradient(listOf(Color(0xFF064E3B), Color(0xFF047857), Color(0xFF06B6D4)))
    "gold" -> Brush.linearGradient(listOf(Color(0xFF7C2D12), Color(0xFFB45309), Color(0xFFF59E0B)))
    "cyan" -> Brush.linearGradient(listOf(Color(0xFF0C4A6E), Color(0xFF0E7490), Color(0xFF06B6D4)))
    else   -> Brush.linearGradient(listOf(Color(0xFF1E1B4B), Color(0xFF3730A3), Color(0xFF4F46E5)))
}

/** 左侧大卡：轮播全部时空推荐（6s 切换） */
@Composable
private fun HeroBig(slides: List<HeroRec>, modifier: Modifier, nav: (String) -> Unit, onJump: (String) -> Unit) {
    val c = JdoTheme.colors
    var i by remember { mutableStateOf(0) }
    LaunchedEffect(slides.size) { while (true) { delay(6000); if (slides.isNotEmpty()) i = (i + 1) % slides.size } }
    val r = slides[i % slides.size]
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

/** 右侧小卡：在传入的 2 张之间轮播 */
@Composable
private fun HeroSmall(slides: List<HeroRec>, period: Long, modifier: Modifier, onJump: (String) -> Unit) {
    val c = JdoTheme.colors
    var i by remember { mutableStateOf(0) }
    LaunchedEffect(slides.size) { while (true) { delay(period); if (slides.isNotEmpty()) i = (i + 1) % slides.size } }
    val r = slides[i % slides.size]
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
