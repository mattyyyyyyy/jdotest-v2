package com.jdo.ivi.ui.screens

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.ApiBanner
import com.jdo.ivi.data.ApiHero
import com.jdo.ivi.data.ApiCategory
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.Bootstrap
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.Chip
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

private fun catIcon(id: String) = when (id) {
    "energy" -> "⚡"; "care" -> "🔧"; "eat" -> "🍪"; "trip" -> "🧳"; "gear" -> "🚗"; "sos" -> "📞"; "select" -> "✨"; else -> "•"
}

private fun bannerColors(tone: String): List<Color> = when (tone) {
    "blue" -> listOf(Color(0xFF1E3A5F), Color(0xFF0F2233))
    "emerald" -> listOf(Color(0xFF14463A), Color(0xFF0F2922))
    "amber", "orange" -> listOf(Color(0xFF5A3A12), Color(0xFF2E1E0B))
    else -> listOf(JdoColors.Bg3, JdoColors.Bg1)
}

@Composable
fun MallScreen(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var data by remember { mutableStateOf<Bootstrap?>(null) }
    var selectedCat by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var cart by remember { mutableIntStateOf(0) }
    var toast by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

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

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        // 顶栏
        Row(
            modifier = Modifier.fillMaxWidth().background(JdoColors.Bg1).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space3),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(modifier = Modifier.width(280.dp).clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Bg2).border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusPill)).clickable { onNav("mall-category", null) }.padding(horizontal = JdoDimens.Space4, vertical = 9.dp)) {
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
        when {
            loading -> Center("加载中… 正在从后端拉数据")
            error != null -> Center(error!!)
            d == null -> Center("暂无数据")
            else -> Row(modifier = Modifier.fillMaxSize()) {
                Rail(d.categories, selectedCat) { selectedCat = it }
                Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
                    HeroArea(d.banners, d.heroRecs)
                    Spacer(Modifier.height(JdoDimens.Space4))
                    val name = d.categories.find { it.id == selectedCat }?.name ?: "推荐"
                    Text("$name · 为你精选", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(Modifier.height(JdoDimens.Space3))
                    val list = d.products.filter { it.cat == selectedCat }
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(3),
                        horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        items(list) { p ->
                            ProductCard(
                                p = p,
                                onOpen = { onNav("mall-detail", p.id) },
                                onAdd = {
                                    thread {
                                        NetworkClient.addCartItem(p.id, 1, "默认规格")
                                        cart = NetworkClient.getCart().sumOf { it.qty }
                                        toast = "已加入购物车：${p.title}"
                                    }
                                },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Rail(cats: List<ApiCategory>, selected: String, onSelect: (String) -> Unit) {
    Column(modifier = Modifier.width(160.dp).fillMaxHeight().background(JdoColors.Bg1).padding(vertical = JdoDimens.Space4, horizontal = JdoDimens.Space3)) {
        cats.forEach { c ->
            val active = c.id == selected
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                    .background(if (active) JdoColors.SuccessBg else Color.Transparent).clickable { onSelect(c.id) }
                    .padding(horizontal = JdoDimens.Space3, vertical = JdoDimens.Space3),
            ) {
                Text(catIcon(c.id), fontSize = 20.sp)
                Spacer(Modifier.width(JdoDimens.Space2))
                Text(c.name, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 16.sp, fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal)
            }
        }
    }
}

@Composable
private fun HeroArea(banners: List<ApiBanner>, heroRecs: List<ApiHero>) {
    Row(modifier = Modifier.fillMaxWidth().height(140.dp), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
        // 左：大 banner
        val b = banners.firstOrNull()
        Box(
            modifier = Modifier.weight(1.5f).fillMaxHeight().clip(RoundedCornerShape(JdoDimens.RadiusLg))
                .background(Brush.linearGradient(bannerColors(b?.tone ?: "blue"))).padding(JdoDimens.Space5),
        ) {
            Column {
                Text("充值返现 · 限时", color = JdoColors.Mint, fontSize = 13.sp)
                Spacer(Modifier.height(6.dp))
                Text(b?.title ?: "车主权益日", color = JdoColors.TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                Text(b?.sub ?: "", color = JdoColors.TextSecondary, fontSize = 14.sp, maxLines = 1)
            }
            Box(modifier = Modifier.align(Alignment.BottomEnd).clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Brand500).padding(horizontal = JdoDimens.Space4, vertical = 8.dp)) {
                Text("去充值 ›", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
        }
        // 右：2 个时空推荐 heroRec 堆叠
        Column(modifier = Modifier.weight(1.6f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
            heroRecs.take(2).forEach { h ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg))
                        .background(Brush.linearGradient(bannerColors(h.tone))).padding(JdoDimens.Space4),
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(h.title, color = JdoColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
                        Text(h.sub, color = JdoColors.TextMuted, fontSize = 12.sp, maxLines = 1)
                    }
                    Spacer(Modifier.width(JdoDimens.Space2))
                    Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Bg0.copy(alpha = 0.4f)).padding(horizontal = JdoDimens.Space3, vertical = 6.dp)) {
                        Text(h.cta, color = JdoColors.Mint, fontSize = 12.sp, maxLines = 1)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductCard(p: ApiProduct, onOpen: () -> Unit, onAdd: () -> Unit) {
    Column(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg)).clickable { onOpen() }.padding(JdoDimens.Space4),
    ) {
        Box(modifier = Modifier.fillMaxWidth().height(110.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))) {
            ProductImage(p.img, Modifier.fillMaxSize())
            if (p.tag.isNotEmpty()) {
                Box(modifier = Modifier.padding(8.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(JdoColors.Mint).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text(p.tag, color = JdoColors.TextInverse, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            // 右下「+」圆钮（仿 web quick-add）
            Box(
                modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp).size(40.dp).clip(RoundedCornerShape(20.dp))
                    .background(JdoColors.Brand500).clickable { onAdd() },
                contentAlignment = Alignment.Center,
            ) { Text("+", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold) }
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
        }
        Spacer(Modifier.height(2.dp))
        Text("★ ${p.star} · 已售 ${p.sold}k+", color = JdoColors.TextMuted, fontSize = 12.sp)
    }
}

@Composable
private fun Center(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(text, color = JdoColors.TextSecondary, fontSize = 20.sp) }
}
