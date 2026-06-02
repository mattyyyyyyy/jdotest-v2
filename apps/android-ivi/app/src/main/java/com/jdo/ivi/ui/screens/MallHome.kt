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
    val bannerHeight by animateDpAsState(if (bannerVisible) 220.dp else 0.dp, tween(260), label = "banner-height")
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

    val allHeros = Catalog.heroRecs    // 时空推荐卡列表，支持左右滑动

    MallBg {
        CompositionLocalProvider(LocalDensity provides Density(density.density * MALL_HOME_UI_SCALE, density.fontScale)) {
            Column(Modifier.fillMaxSize()) {
                StatusBar()
                MallTopBar(nav)

                // 时空推荐 — 左右滑动轮播 + 圆点指示器
                Column(
                    Modifier.fillMaxWidth()
                        .graphicsLayer {
                            alpha = bannerAlpha
                            translationY = -(1f - bannerAlpha) * 36.dp.toPx()
                        }
                        .padding(top = bannerPadding),
                ) {
                    val pagerState = rememberPagerState(pageCount = { allHeros.size })

                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxWidth().height(bannerHeight - 30.dp)
                            .padding(horizontal = 36.dp),
                        contentPadding = PaddingValues(end = 0.dp),
                        pageSpacing = 20.dp,
                    ) { page ->
                        HeroFullWidth(allHeros[page], nav) { scene = it }
                    }

                    // 圆点指示器
                    Row(
                        Modifier.fillMaxWidth().padding(top = 10.dp),
                        horizontalArrangement = Arrangement.Center,
                    ) {
                        repeat(allHeros.size) { i ->
                            Box(
                                Modifier.padding(horizontal = 4.dp)
                                    .size(if (i == pagerState.currentPage) 8.dp else 6.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (i == pagerState.currentPage) Color.White
                                        else Color.White.copy(0.35f)
                                    )
                            )
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

/** 全宽时空推荐卡（横滑轮播中的单张） */
@Composable
private fun HeroFullWidth(rec: HeroRec, nav: (String) -> Unit, onJump: (String) -> Unit) {
    val c = JdoTheme.colors
    Box(
        Modifier.fillMaxSize().clip(RoundedCornerShape(RadiusXl)).background(toneBrush(rec.tone, c))
            .clickable { onJump(rec.navScene) }.padding(22.dp),
    ) {
        Row(Modifier.fillMaxSize()) {
            // 左侧：文案 + CTA
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(jdoIcon(rec.icon), null, tint = Color.White, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(rec.tag, color = Color.White.copy(0.92f), fontSize = 16.sp)
                }
                Spacer(Modifier.height(8.dp))
                Text(rec.title, color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.SemiBold, lineHeight = 32.sp)
                Spacer(Modifier.height(4.dp))
                Text(rec.sub, color = Color.White.copy(0.8f), fontSize = 15.sp)
                Spacer(Modifier.weight(1f))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(rec.statValue, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Text(rec.statLabel, color = Color.White.copy(0.7f), fontSize = 12.sp)
                    }
                    Spacer(Modifier.weight(1f))
                    Box(
                        Modifier.clip(RoundedCornerShape(9999.dp)).background(Color.White)
                            .clickable { onJump(rec.navScene) }.padding(horizontal = 22.dp, vertical = 12.dp),
                    ) { Text(rec.cta, color = Color(0xFF0F172A), fontSize = 16.sp, fontWeight = FontWeight.SemiBold) }
                }
            }
            // 右侧：装饰色块（保留视觉平衡）
            Spacer(Modifier.weight(0.3f))
        }
    }
}
