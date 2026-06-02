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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.ApiCategory
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.Bootstrap
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

private fun catIcon(id: String) = when (id) {
    "energy" -> "⚡"; "care" -> "🔧"; "eat" -> "🍪"; "trip" -> "🧳"; "gear" -> "🚗"; "sos" -> "📞"; "select" -> "✨"; else -> "•"
}

@Composable
fun MallCategory(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var data by remember { mutableStateOf<Bootstrap?>(null) }
    var cat by remember { mutableStateOf("energy") }
    var sort by remember { mutableStateOf("rec") }

    LaunchedEffect(Unit) { thread { data = NetworkClient.fetchBootstrap() } }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("分类", onBack = onBack) {
            com.jdo.ivi.ui.components.Chip("首页", JdoColors.Bg2, JdoColors.TextPrimary) { onNav("mall-home", null) }
            Spacer(Modifier.width(JdoDimens.Space2))
            com.jdo.ivi.ui.components.Chip("🛒", JdoColors.Bg2, JdoColors.TextPrimary) { onNav("mall-cart", null) }
        }
        val d = data ?: return@Column run { Box(Modifier.fillMaxSize(), Alignment.Center) { Text("加载中…", color = JdoColors.TextSecondary, fontSize = 20.sp) } }
        Row(modifier = Modifier.fillMaxSize()) {
            // 左栏
            Column(modifier = Modifier.width(150.dp).fillMaxHeight().background(JdoColors.Bg1).padding(vertical = JdoDimens.Space4, horizontal = JdoDimens.Space2)) {
                d.categories.forEach { c ->
                    val active = c.id == cat
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                            .background(if (active) JdoColors.SuccessBg else androidx.compose.ui.graphics.Color.Transparent)
                            .clickable { cat = c.id }.padding(vertical = JdoDimens.Space3),
                    ) {
                        Text(catIcon(c.id), fontSize = 26.sp)
                        Text(c.name, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 14.sp, fontWeight = if (active) FontWeight.SemiBold else FontWeight.Normal, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
            // 内容
            Column(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space4)) {
                // 排序条
                Row(verticalAlignment = Alignment.CenterVertically) {
                    listOf("rec" to "综合", "sales" to "销量", "price-asc" to "价格 ↑", "price-desc" to "价格 ↓").forEach { (id, name) ->
                        Text(name, color = if (sort == id) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 16.sp, fontWeight = if (sort == id) FontWeight.SemiBold else FontWeight.Normal, modifier = Modifier.clickable { sort = id }.padding(end = JdoDimens.Space5))
                    }
                    Spacer(Modifier.weight(1f))
                    val n = d.products.count { it.cat == cat }
                    Text("共 $n 件 · 自营优先", color = JdoColors.TextMuted, fontSize = 14.sp)
                }
                Spacer(Modifier.height(JdoDimens.Space3))
                var list = d.products.filter { it.cat == cat }
                list = when (sort) {
                    "price-asc" -> list.sortedBy { it.priceFen }
                    "price-desc" -> list.sortedByDescending { it.priceFen }
                    "sales" -> list.sortedByDescending { it.sold }
                    else -> list
                }
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                    verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                    modifier = Modifier.fillMaxSize(),
                ) { items(list) { p -> CatCard(p) { onNav("mall-detail", p.id) } } }
            }
        }
    }
}

@Composable
private fun CatCard(p: ApiProduct, onClick: () -> Unit) {
    Column(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg)).clickable { onClick() }.padding(JdoDimens.Space3),
    ) {
        ProductImage(p.img, Modifier.fillMaxWidth().height(96.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)))
        Text(p.title, color = JdoColors.TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Medium, maxLines = 2, modifier = Modifier.padding(top = JdoDimens.Space2))
        Row(verticalAlignment = Alignment.Bottom, modifier = Modifier.padding(top = JdoDimens.Space2)) {
            Text(yuan(p.priceFen), color = JdoColors.Mint, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Text("★${p.star}", color = JdoColors.Gold, fontSize = 12.sp)
        }
    }
}
