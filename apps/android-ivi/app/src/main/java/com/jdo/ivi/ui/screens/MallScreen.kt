package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
import com.jdo.ivi.data.ApiCategory
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.Bootstrap
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

private fun yuan(fen: Int): String = "¥" + (fen / 100) + "." + ((fen % 100).toString().padStart(2, '0'))

private fun catIcon(id: String): String = when (id) {
    "energy" -> "⚡"; "care" -> "🔧"; "eat" -> "🍪"; "trip" -> "🧳"
    "gear" -> "🚗"; "sos" -> "📞"; "select" -> "✨"; else -> "•"
}

private fun bannerColors(tone: String): List<Color> = when (tone) {
    "blue" -> listOf(Color(0xFF1E3A5F), Color(0xFF0F2233))
    "emerald" -> listOf(Color(0xFF14463A), Color(0xFF0F2922))
    "amber", "orange" -> listOf(Color(0xFF5A3A12), Color(0xFF2E1E0B))
    else -> listOf(JdoColors.Bg3, JdoColors.Bg1)
}

@Composable
fun MallScreen(onBack: () -> Unit) {
    var data by remember { mutableStateOf<Bootstrap?>(null) }
    var selectedCat by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var cart by remember { mutableIntStateOf(0) }
    var receipt by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(reloadKey) {
        loading = true; error = null
        thread {
            try {
                val b = NetworkClient.fetchBootstrap()
                data = b
                if (selectedCat.isEmpty()) selectedCat = b.categories.firstOrNull()?.id ?: ""
                loading = false
            } catch (e: Exception) {
                error = "连不上后端：" + (e.message ?: "网络错误"); loading = false
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        TopBar(cart = cart, onBack = onBack, onRefresh = { reloadKey++ })
        receipt?.let {
            Text(
                it, color = JdoColors.Success, fontSize = 15.sp,
                modifier = Modifier.fillMaxWidth().background(JdoColors.SuccessBg).padding(horizontal = JdoDimens.Space5, vertical = 8.dp),
            )
        }
        val d = data
        when {
            loading -> Center("加载中… 正在从后端拉数据")
            error != null -> Center(error!!)
            d == null -> Center("暂无数据")
            else -> Row(modifier = Modifier.fillMaxSize()) {
                Rail(d.categories, selectedCat) { selectedCat = it }
                Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
                    BannersRow(d.banners)
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
                            ProductCard(p, onAdd = { cart++ }, onOrder = {
                                thread {
                                    val id = NetworkClient.placeOrder(p.title, p.priceFen)
                                    receipt = if (id != null) "已下单 $id —— web 后台「订单管理」即可看到（实时互通）" else "下单失败：检查隧道/网络"
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
private fun TopBar(cart: Int, onBack: () -> Unit, onRefresh: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().background(JdoColors.Bg1).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space3),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 搜索框（仿 web）
        Box(
            modifier = Modifier.width(300.dp).clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Bg2)
                .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusPill)).padding(horizontal = JdoDimens.Space4, vertical = 9.dp),
        ) { Text("🔍  请在此输入 · 试试说\"我要买玻璃水\"", color = JdoColors.TextMuted, fontSize = 15.sp, maxLines = 1) }
        Spacer(Modifier.width(JdoDimens.Space5))
        Text("商城", color = JdoColors.TextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(JdoDimens.Space4))
        Text("我的", color = JdoColors.TextMuted, fontSize = 20.sp)
        Spacer(Modifier.weight(1f))
        Chip("⟳ 刷新", JdoColors.Bg2, JdoColors.Accent) { onRefresh() }
        Spacer(Modifier.width(JdoDimens.Space3))
        Chip("🛒 $cart", JdoColors.Bg2, JdoColors.TextPrimary) { }
        Spacer(Modifier.width(JdoDimens.Space3))
        Chip("‹ IVI", JdoColors.Bg2, JdoColors.TextPrimary) { onBack() }
    }
}

@Composable
private fun Rail(cats: List<ApiCategory>, selected: String, onSelect: (String) -> Unit) {
    Column(modifier = Modifier.width(160.dp).fillMaxHeight().background(JdoColors.Bg1).padding(vertical = JdoDimens.Space4, horizontal = JdoDimens.Space3)) {
        cats.forEach { c ->
            val active = c.id == selected
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(JdoDimens.RadiusMd))
                    .background(if (active) JdoColors.SuccessBg else Color.Transparent)
                    .clickable { onSelect(c.id) }
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
private fun BannersRow(banners: List<ApiBanner>) {
    Row(modifier = Modifier.fillMaxWidth().height(96.dp), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
        banners.take(3).forEach { b ->
            Box(
                modifier = Modifier.weight(1f).fillMaxHeight().clip(RoundedCornerShape(JdoDimens.RadiusLg))
                    .background(Brush.linearGradient(bannerColors(b.tone))).padding(JdoDimens.Space4),
            ) {
                Column {
                    Text(b.title, color = JdoColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                    Spacer(Modifier.height(4.dp))
                    Text(b.sub, color = JdoColors.TextSecondary, fontSize = 14.sp, maxLines = 2)
                }
            }
        }
    }
}

@Composable
private fun ProductCard(p: ApiProduct, onAdd: () -> Unit, onOrder: () -> Unit) {
    Column(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg)).padding(JdoDimens.Space4),
    ) {
        Box(
            modifier = Modifier.fillMaxWidth().height(76.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                .background(Brush.linearGradient(listOf(JdoColors.Bg3, JdoColors.Bg1))),
            contentAlignment = Alignment.TopStart,
        ) {
            if (p.tag.isNotEmpty()) {
                Box(modifier = Modifier.padding(8.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(JdoColors.Mint).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text(p.tag, color = JdoColors.TextInverse, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
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
            Text("★${p.star}", color = JdoColors.Gold, fontSize = 12.sp)
        }
        Spacer(Modifier.height(JdoDimens.Space3))
        Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2)) {
            Chip("加入", JdoColors.Bg3, JdoColors.TextPrimary) { onAdd() }
            Chip("下单", JdoColors.Brand500, Color.White) { onOrder() }
        }
    }
}

@Composable
private fun Chip(text: String, bg: Color, fg: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(bg).clickable { onClick() }
            .padding(horizontal = JdoDimens.Space3, vertical = 8.dp),
    ) { Text(text, color = fg, fontSize = 15.sp, fontWeight = FontWeight.SemiBold) }
}

@Composable
private fun Center(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text, color = JdoColors.TextSecondary, fontSize = 20.sp)
    }
}
