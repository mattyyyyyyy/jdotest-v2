package com.jdo.ivi.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Bolt
import androidx.compose.material.icons.outlined.Build
import androidx.compose.material.icons.outlined.DirectionsCar
import androidx.compose.material.icons.outlined.Luggage
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.ApiBanner
import com.jdo.ivi.data.ApiCategory
import com.jdo.ivi.data.ApiHero
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.Bootstrap
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.Chip
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.WallpaperBackdrop
import com.jdo.ivi.ui.components.glass
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import dev.chrisbanes.haze.HazeState
import kotlin.concurrent.thread

private fun categoryIcon(id: String): ImageVector = when (id) {
    "energy" -> Icons.Outlined.Bolt
    "care" -> Icons.Outlined.Build
    "eat" -> Icons.Outlined.Restaurant
    "trip" -> Icons.Outlined.Luggage
    "gear" -> Icons.Outlined.DirectionsCar
    "sos" -> Icons.Outlined.Phone
    "select" -> Icons.Outlined.AutoAwesome
    else -> Icons.Outlined.Bolt
}

// 鲜艳 3 段对角渐变（对齐 web mall-home-hero.css 的 hero-flash/hero-banner）
private fun bannerColors(tone: String): List<Color> = when (tone) {
    "blue" -> listOf(Color(0xFF4F46E5), Color(0xFF3730A3), Color(0xFF1E1B4B))
    "emerald", "mint" -> listOf(Color(0xFF06B6D4), Color(0xFF047857), Color(0xFF064E3B))
    "amber", "orange", "gold" -> listOf(Color(0xFFF59E0B), Color(0xFFB45309), Color(0xFF7C2D12))
    "cyan" -> listOf(Color(0xFF06B6D4), Color(0xFF0E7490), Color(0xFF0C4A6E))
    else -> listOf(Color(0xFF3730A3), Color(0xFF1E1B4B), Color(0xFF0F1722))
}

@Composable
fun MallScreen(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    val haze = remember { HazeState() }
    var data by remember { mutableStateOf<Bootstrap?>(null) }
    var selectedCat by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var cart by remember { mutableIntStateOf(0) }
    var toast by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }
    val gridState = rememberLazyGridState()
    // 网格离开顶部即收起 banner（渐隐滑走），回到顶部再出现。稳，不受触底回弹影响。
    val bannerVisible by remember {
        derivedStateOf { gridState.firstVisibleItemIndex == 0 && gridState.firstVisibleItemScrollOffset < 80 }
    }

    LaunchedEffect(reloadKey) {
        loading = true; error = null
        thread {
            try {
                val b = NetworkClient.fetchBootstrap()
                data = b
                if (selectedCat.isEmpty()) selectedCat = b.categories.firstOrNull()?.id ?: ""
                cart = NetworkClient.getCart().sumOf { it.qty }
                loading = false
            } catch (e: Exception) {
                error = "连不上后端：" + (e.message ?: "网络错误"); loading = false
            }
        }
    }

    // 商城铺车型壁纸：整体模糊 + 调暗 → 卡片玻璃透出柔焦壁纸，还原 web 观感
    WallpaperBackdrop(haze, dim = 0.45f, backdropBlur = 22.dp) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 顶栏（玻璃）
            Row(
                modifier = Modifier.fillMaxWidth().glass(haze, RectangleShape).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space3),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(modifier = Modifier.width(280.dp).glass(haze, RoundedCornerShape(JdoDimens.RadiusPill)).clickable { onNav("mall-category", null) }.padding(horizontal = JdoDimens.Space4, vertical = 9.dp)) {
                    Text("🔍  请在此输入 · 试试说\"我要买玻璃水\"", color = JdoColors.TextMuted, fontSize = 15.sp, maxLines = 1)
                }
                Spacer(Modifier.width(JdoDimens.Space5))
                Text("商城", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(JdoDimens.Space4))
                Text("我的", color = JdoColors.TextMuted, fontSize = 20.sp, modifier = Modifier.clickable { onNav("mall-profile", null) })
                Spacer(Modifier.weight(1f))
                Chip("⟳ 刷新", JdoColors.Bg2, JdoColors.Accent) { reloadKey++ }
                Spacer(Modifier.width(JdoDimens.Space3))
                Chip("🛒 $cart", JdoColors.Bg2, JdoColors.TextPrimary) { onNav("mall-cart", null) }
                Spacer(Modifier.width(JdoDimens.Space3))
                Chip("‹ IVI", JdoColors.Bg2, JdoColors.TextPrimary) { onBack() }
            }
            toast?.let {
                Text(it, color = JdoColors.Success, fontSize = 15.sp, modifier = Modifier.fillMaxWidth().background(JdoColors.SuccessBg).padding(horizontal = JdoDimens.Space5, vertical = 8.dp))
            }
            val d = data
            // ① banner 通栏在最上（数据未到也先渲染骨架，不显示"加载中"，后台静默拉数据）
            //    上滑渐隐滑走、下滑再出现
            AnimatedVisibility(
                visible = bannerVisible,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically(),
            ) {
                Box(modifier = Modifier.padding(horizontal = JdoDimens.Space4, vertical = JdoDimens.Space3)) {
                    HeroArea(d?.banners ?: emptyList(), d?.heroRecs ?: emptyList())
                }
            }
            // ② 下面：左目录 + 右列表（mall-body）
            Row(modifier = Modifier.fillMaxSize()) {
                Rail(haze, d?.categories ?: emptyList(), selectedCat) { selectedCat = it }
                Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
                    val name = d?.categories?.find { it.id == selectedCat }?.name ?: "推荐"
                    Text("$name · 为你精选", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(JdoDimens.Space3))
                    val list = d?.products?.filter { it.cat == selectedCat } ?: emptyList()
                    LazyVerticalGrid(
                        state = gridState,
                        columns = GridCells.Fixed(3),
                        horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        items(list) { p ->
                            ProductCard(haze, p, onOpen = { onNav("mall-detail", p.id) }, onAdd = {
                                thread {
                                    NetworkClient.addCartItem(p.id, 1, "默认规格")
                                    cart = NetworkClient.getCart().sumOf { it.qty }
                                    toast = "已加入购物车：${p.title}"
                                }
                            })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Rail(haze: HazeState, cats: List<ApiCategory>, selected: String, onSelect: (String) -> Unit) {
    Column(modifier = Modifier.width(160.dp).fillMaxHeight().glass(haze, RectangleShape).padding(vertical = JdoDimens.Space4, horizontal = JdoDimens.Space3)) {
        cats.forEach { c ->
            val active = c.id == selected
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                    .background(if (active) JdoColors.SuccessBg else Color.Transparent).clickable { onSelect(c.id) }
                    .padding(horizontal = JdoDimens.Space3, vertical = JdoDimens.Space3),
            ) {
                Icon(categoryIcon(c.id), contentDescription = null, tint = if (active) JdoColors.Mint else JdoColors.TextSecondary, modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(JdoDimens.Space2))
                Text(c.name, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 16.sp, fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal)
            }
        }
    }
}

@Composable
private fun HeroArea(banners: List<ApiBanner>, heroRecs: List<ApiHero>) {
    Row(modifier = Modifier.fillMaxWidth().height(168.dp), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
        // 左：大 banner（鲜艳渐变 + 图片 + 高光）
        val b = banners.firstOrNull()
        Box(modifier = Modifier.weight(1.5f).fillMaxHeight().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(Brush.linearGradient(bannerColors(b?.tone ?: "blue")))) {
            if (b != null && b.img.isNotEmpty()) ProductImage(b.img, Modifier.fillMaxSize())
            // 左实右透（文字可读、图片右露）
            Box(modifier = Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Color(0xF20A0B0E), Color(0xA60A0B0E), Color(0x000A0B0E)))))
            // 右上高光
            Box(modifier = Modifier.fillMaxSize().background(Brush.radialGradient(listOf(Color(0x40FFFFFF), Color.Transparent), center = Offset(1400f, 0f), radius = 820f)))
            Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space5)) {
                Text("充值返现 · 限时", color = JdoColors.Mint, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(6.dp))
                Text(b?.title ?: "车主权益日", color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                Text(b?.sub ?: "", color = Color(0xFFCBD5E1), fontSize = 14.sp, maxLines = 1)
            }
            Box(modifier = Modifier.align(Alignment.BottomEnd).padding(JdoDimens.Space4).clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(Color.White).padding(horizontal = JdoDimens.Space4, vertical = 8.dp)) {
                Text("去充值 ›", color = Color(0xFF1E1B4B), fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
        // 右：2 个时空推荐（Column 布局，标题/副标/CTA 各行，CTA 完整不截断）
        Column(modifier = Modifier.weight(1.6f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
            heroRecs.take(2).forEach { h ->
                Box(modifier = Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(Brush.linearGradient(bannerColors(h.tone)))) {
                    Box(modifier = Modifier.fillMaxSize().background(Brush.radialGradient(listOf(Color(0x26FFFFFF), Color.Transparent), center = Offset(1000f, 0f), radius = 560f)))
                    Column(modifier = Modifier.fillMaxSize().padding(horizontal = JdoDimens.Space4, vertical = JdoDimens.Space3)) {
                        Text(h.title, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                        Spacer(Modifier.height(2.dp))
                        Text(h.sub, color = Color(0xFFCBD5E1), fontSize = 11.sp, maxLines = 1)
                        Spacer(Modifier.weight(1f))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Spacer(Modifier.weight(1f))
                            Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(Color(0x33FFFFFF)).padding(horizontal = 12.dp, vertical = 5.dp)) {
                                Text(h.cta, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductCard(haze: HazeState, p: ApiProduct, onOpen: () -> Unit, onAdd: () -> Unit) {
    Column(
        modifier = Modifier.glass(haze, RoundedCornerShape(JdoDimens.RadiusLg)).clickable { onOpen() }.padding(JdoDimens.Space4),
    ) {
        Box(modifier = Modifier.fillMaxWidth().height(110.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))) {
            ProductImage(p.img, Modifier.fillMaxSize())
            if (p.tag.isNotEmpty()) {
                Box(modifier = Modifier.padding(8.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(JdoColors.Mint).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text(p.tag, color = JdoColors.TextInverse, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            Box(modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp).size(38.dp).clip(CircleShape).background(JdoColors.Brand500).clickable { onAdd() }, contentAlignment = Alignment.Center) {
                Icon(Icons.Outlined.Add, contentDescription = "加入购物车", tint = Color.White, modifier = Modifier.size(22.dp))
            }
        }
        Spacer(Modifier.height(JdoDimens.Space3))
        Text(p.title, color = JdoColors.TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Medium, maxLines = 2)
        Spacer(Modifier.height(JdoDimens.Space2))
        Row(verticalAlignment = Alignment.Bottom) {
            Text(yuan(p.priceFen), color = JdoColors.Mint, fontSize = 19.sp, fontWeight = FontWeight.Bold)
            if (p.oriFen > p.priceFen) {
                Spacer(Modifier.width(6.dp))
                Text(yuan(p.oriFen), color = JdoColors.TextMuted, fontSize = 13.sp)
            }
            Spacer(Modifier.weight(1f))
            Text("★${p.star} · 已售${p.sold}k+", color = JdoColors.TextMuted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun Center(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(text, color = JdoColors.TextSecondary, fontSize = 20.sp) }
}
