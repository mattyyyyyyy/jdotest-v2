package com.jdo.ivi.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import kotlinx.coroutines.delay
import kotlin.concurrent.thread

// ─── 硬编码 hero 内容（与 web mall-home.jsx 一致，营销/驾驶上下文，非用户数据）───
private data class HeroSlide(val tone: String, val tag: String, val title: String, val sub: String, val chips: List<String>, val statV: String, val statL: String, val cta: String, val img: String, val cat: String)
private data class HeroRecN(val tone: String, val tag: String, val title: String, val sub: String, val statV: String, val statL: String, val cta: String, val cat: String)

private val OFFICIAL_SLIDES = listOf(
    HeroSlide("gold", "车主权益日 · 5/26 限时", "黄金车主 95 折 · 油卡满 100-8", "加油 / 充电 / 养护 全场叠加 · 双倍积分中", listOf("加油 -3%", "充电 -5%", "养护立减 ¥30", "双倍积分"), "8 折起", "车主直降", "立即参与", "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=70", "energy"),
    HeroSlide("cyan", "充值返现 · 限时 7 天", "加油卡充 ¥500 · 立返 ¥12", "中石化 / 中石油双品牌通用 · 每月一次", listOf("¥100 返 ¥3", "¥300 返 ¥8", "¥500 返 ¥12", "¥1000 返 ¥30"), "¥ 12", "立返 / ¥500", "去充值", "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=600&q=70", "energy"),
    HeroSlide("blue", "附近自提 · 500m 起", "500m 内 18 家自提点 · 送达车上", "骑手抵达停车点 · 平均 32 分钟 · 不收上门费", listOf("张江店 280m", "罗森 420m", "丰巢 680m", "6 家 24h"), "18 家", "500m 内", "查看地图", "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=70", "eat"),
)
private val RECS_TOP = listOf(
    HeroRecN("mint", "前方 3 km · 服务区", "张江服务区 · 8 家可自提", "继续直行 · 预计 4 分钟可达 · 充电桩可用 4 / 6", "4 / 6", "充电桩 · 实时", "导航前往", "energy"),
    HeroRecN("gold", "正午 11:42 · 速达", "12 点前到家 · 老乡鸡 / 瑞幸 / 麦当劳", "基于车辆当前路径 · 预计 32 分钟后抵家", "32 分钟", "到家 ETA", "看 28 家速达", "eat"),
)
private val RECS_BOTTOM = listOf(
    HeroRecN("cyan", "该补给了", "玻璃水还剩 1 瓶 · 上次买 28 天前", "基于车主常买规律 · 一键再买送上车", "28 天前", "上次购买", "一键再买 ¥ 29.9", "energy"),
    HeroRecN("blue", "今晚 21:00 · 出差", "虹桥 ⇌ 浦东 · 8 家亚朵酒店有房", "日历提示 · 明日 09:00 北京会议 · 同城已订", "¥ 488", "起 / 晚", "看 12 家酒店", "trip"),
)
private val CATEGORIES_N = listOf("energy" to "能量补给", "care" to "爱车养护", "eat" to "一路吃喝", "trip" to "远行出差", "gear" to "车内好物", "sos" to "24h 救援", "select" to "严选好物")

private fun categoryIcon(id: String): ImageVector = when (id) {
    "energy" -> Icons.Outlined.Bolt; "care" -> Icons.Outlined.Build; "eat" -> Icons.Outlined.Restaurant
    "trip" -> Icons.Outlined.Luggage; "gear" -> Icons.Outlined.DirectionsCar; "sos" -> Icons.Outlined.Phone
    "select" -> Icons.Outlined.AutoAwesome; else -> Icons.Outlined.Bolt
}

// 鲜艳 3 段对角渐变（对齐 web mall-home-hero.css）
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
    var selectedCat by remember { mutableStateOf("energy") }
    var cart by remember { mutableIntStateOf(0) }
    var toast by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }
    val gridState = rememberLazyGridState()
    // 列表离顶即收起 banner（渐隐滑走），回顶再现
    val bannerVisible by remember { derivedStateOf { gridState.firstVisibleItemIndex == 0 && gridState.firstVisibleItemScrollOffset < 80 } }

    LaunchedEffect(reloadKey) {
        thread {
            try {
                data = NetworkClient.fetchBootstrap()
                cart = NetworkClient.getCart().sumOf { it.qty }
            } catch (e: Exception) { android.util.Log.e("JDOMall", "bootstrap failed: ${e.message}") }
        }
    }

    WallpaperBackdrop(haze, dim = 0.45f, backdropBlur = 22.dp) {
        Column(modifier = Modifier.fillMaxSize()) {
            // 顶栏（玻璃）
            Row(
                modifier = Modifier.fillMaxWidth().glass(haze, RectangleShape).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space3),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(modifier = Modifier.width(280.dp).glass(haze, RoundedCornerShape(JdoDimens.RadiusPill)).clickable { onNav("mall-search", null) }.padding(horizontal = JdoDimens.Space4, vertical = 9.dp)) {
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
            // banner 通栏（轮播）：上滑渐隐滑走、回顶再现
            AnimatedVisibility(visible = bannerVisible, enter = fadeIn() + expandVertically(), exit = fadeOut() + shrinkVertically()) {
                Box(modifier = Modifier.padding(horizontal = JdoDimens.Space4, vertical = JdoDimens.Space3)) {
                    HeroArea(onCat = { selectedCat = it })
                }
            }
            // 左目录 + 右列表（weight(1f) 占 banner 之后的剩余高度，避免 fillMaxHeight 抢高度把 banner 挤短）
            Row(modifier = Modifier.fillMaxWidth().weight(1f)) {
                Rail(haze, selectedCat) { selectedCat = it }
                Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
                    val name = CATEGORIES_N.find { it.first == selectedCat }?.second ?: "推荐"
                    Text("$name · 为你精选", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(JdoDimens.Space3))
                    val list = data?.products?.filter { it.cat == selectedCat } ?: emptyList()
                    LazyVerticalGrid(
                        state = gridState,
                        columns = GridCells.Fixed(3),
                        horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        items(list) { p ->
                            ProductCard(p, onOpen = { onNav("mall-detail", p.id) }, onAdd = {
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

// ─── 轮播槽（自动切换 + 交叉淡入）───
@Composable
private fun <T> SlideSlot(slides: List<T>, intervalMs: Long, content: @Composable (T) -> Unit) {
    var i by remember { mutableIntStateOf(0) }
    LaunchedEffect(slides.size, intervalMs) {
        if (slides.size <= 1) return@LaunchedEffect
        while (true) { delay(intervalMs); i = (i + 1) % slides.size }
    }
    Crossfade(targetState = i.coerceIn(0, (slides.size - 1).coerceAtLeast(0)), label = "slot") { idx ->
        if (slides.isNotEmpty()) content(slides[idx])
    }
}

@Composable
private fun HeroArea(onCat: (String) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().height(248.dp), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
        Box(modifier = Modifier.weight(1.4f).fillMaxHeight()) {
            SlideSlot(OFFICIAL_SLIDES, 6000) { MarketingCard(it) { onCat(it.cat) } }
        }
        Column(modifier = Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth()) { SlideSlot(RECS_TOP, 4500) { RecCard(it) { onCat(it.cat) } } }
            Box(modifier = Modifier.weight(1f).fillMaxWidth()) { SlideSlot(RECS_BOTTOM, 5500) { RecCard(it) { onCat(it.cat) } } }
        }
    }
}

@Composable
private fun MarketingCard(m: HeroSlide, onCta: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(Brush.linearGradient(bannerColors(m.tone)))) {
        ProductImage(m.img, Modifier.fillMaxSize())
        Box(modifier = Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Color(0xF20A0B0E), Color(0xA60A0B0E), Color(0x000A0B0E)))))
        Box(modifier = Modifier.fillMaxSize().background(Brush.radialGradient(listOf(Color(0x40FFFFFF), Color.Transparent), center = Offset(1500f, 0f), radius = 880f)))
        Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
            Text(m.tag, color = JdoColors.Mint, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(4.dp))
            Text(m.title, color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            Spacer(Modifier.height(4.dp))
            Text(m.sub, color = Color(0xFFCBD5E1), fontSize = 13.sp, maxLines = 1)
            Spacer(Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                m.chips.forEach { c ->
                    Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(Color(0x26FFFFFF)).padding(horizontal = 8.dp, vertical = 3.dp)) {
                        Text(c, color = Color.White, fontSize = 11.sp)
                    }
                }
            }
            Spacer(Modifier.height(JdoDimens.Space3))
            Row(verticalAlignment = Alignment.Bottom) {
                Column {
                    Text(m.statV, color = JdoColors.Mint, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text(m.statL, color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                Spacer(Modifier.weight(1f))
                Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(Color.White).clickable { onCta() }.padding(horizontal = JdoDimens.Space4, vertical = 9.dp)) {
                    Text("${m.cta} ›", color = Color(0xFF1E1B4B), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun RecCard(r: HeroRecN, onCta: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(Brush.linearGradient(bannerColors(r.tone))).clickable { onCta() }) {
        Box(modifier = Modifier.fillMaxSize().background(Brush.radialGradient(listOf(Color(0x26FFFFFF), Color.Transparent), center = Offset(1100f, 0f), radius = 620f)))
        // 顶部文字（顶对齐）：kicker + 标题 + 副标（小字）
        Column(modifier = Modifier.align(Alignment.TopStart).fillMaxWidth().padding(horizontal = JdoDimens.Space4, vertical = JdoDimens.Space3)) {
            Text(r.tag, color = Color(0xFFA7F3D0), fontSize = 11.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
            Spacer(Modifier.height(4.dp))
            Text(r.title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
        }
        // 底行（钉底，整行）：stat 左 + CTA 右
        Row(
            modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(horizontal = JdoDimens.Space4, vertical = JdoDimens.Space3),
            verticalAlignment = Alignment.Bottom,
        ) {
            Text(r.statV, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold, maxLines = 1)
            Spacer(Modifier.width(6.dp))
            Text(r.statL, color = Color(0xFFCBD5E1), fontSize = 11.sp, maxLines = 1, modifier = Modifier.padding(bottom = 2.dp))
            Spacer(Modifier.weight(1f))
            Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(Color(0x40FFFFFF)).padding(horizontal = 13.dp, vertical = 7.dp)) {
                Text("${r.cta} ›", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
            }
        }
    }
}

@Composable
private fun Rail(haze: HazeState, selected: String, onSelect: (String) -> Unit) {
    Column(modifier = Modifier.width(160.dp).fillMaxHeight().glass(haze, RectangleShape).padding(vertical = JdoDimens.Space4, horizontal = JdoDimens.Space3)) {
        CATEGORIES_N.forEach { (id, name) ->
            val active = id == selected
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                    .background(if (active) JdoColors.SuccessBg else Color.Transparent).clickable { onSelect(id) }
                    .padding(horizontal = JdoDimens.Space3, vertical = JdoDimens.Space3),
            ) {
                Icon(categoryIcon(id), contentDescription = null, tint = if (active) JdoColors.Mint else JdoColors.TextSecondary, modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(JdoDimens.Space2))
                Text(name, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 16.sp, fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal)
            }
        }
    }
}

@Composable
private fun ProductCard(p: ApiProduct, onOpen: () -> Unit, onAdd: () -> Unit) {
    // 按 design-system §4.1：商品卡不用 backdrop blur（性能），用半透明深色面（壁纸隐约透出）
    Column(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2.copy(alpha = 0.82f))
            .clickable { onOpen() }.padding(JdoDimens.Space4),
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
