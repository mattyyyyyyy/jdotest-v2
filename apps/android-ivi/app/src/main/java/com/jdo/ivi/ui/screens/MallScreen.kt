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
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

private fun yuan(fen: Int): String = "¥" + (fen / 100) + "." + ((fen % 100).toString().padStart(2, '0'))

private val TAG_TONES = listOf(JdoColors.Mint, JdoColors.Brand400, JdoColors.Accent, JdoColors.Gold, JdoColors.Driving)

@Composable
fun MallScreen(onBack: () -> Unit) {
    var products by remember { mutableStateOf<List<ApiProduct>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var cart by remember { mutableIntStateOf(0) }
    var banner by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    // 拉后台实时商品（后台改 → 刷新即出现）
    LaunchedEffect(reloadKey) {
        loading = true; error = null
        thread {
            try {
                val list = NetworkClient.fetchProducts()
                products = list; loading = false
            } catch (e: Exception) {
                error = "连不上后端：" + (e.message ?: "网络错误"); loading = false
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        // 顶栏：返回 + 标题 + 刷新 + 购物车
        Row(
            modifier = Modifier.fillMaxWidth().background(JdoColors.Bg1).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TextChip("‹ 返回", JdoColors.Bg2, JdoColors.TextPrimary) { onBack() }
            Spacer(Modifier.width(JdoDimens.Space4))
            Text("JDO 商城", color = JdoColors.TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.width(JdoDimens.Space3))
            Text("· 后台实时数据", color = JdoColors.TextMuted, fontSize = 15.sp)
            Spacer(Modifier.weight(1f))
            TextChip("⟳ 刷新", JdoColors.Bg2, JdoColors.Accent) { reloadKey++ }
            Spacer(Modifier.width(JdoDimens.Space3))
            TextChip("🛒 $cart", JdoColors.Brand500, Color.White) { }
        }

        // 下单回执（app→后台写互通的证据）
        banner?.let {
            Text(
                it, color = JdoColors.Success, fontSize = 16.sp,
                modifier = Modifier.fillMaxWidth().background(JdoColors.SuccessBg).padding(horizontal = JdoDimens.Space5, vertical = 10.dp),
            )
        }

        when {
            loading -> Center("加载中… 正在从后端拉商品")
            error != null -> Center(error!!)
            products.isEmpty() -> Center("暂无商品")
            else -> LazyVerticalGrid(
                columns = GridCells.Fixed(3),
                contentPadding = PaddingValues(JdoDimens.Space5),
                horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
                modifier = Modifier.fillMaxSize(),
            ) {
                items(products) { p ->
                    ProductCard(
                        p = p,
                        onAdd = { cart++ },
                        onOrder = {
                            thread {
                                val id = NetworkClient.placeOrder(p.title, p.priceFen)
                                banner = if (id != null) "已下单 $id —— 去 web 后台「订单管理」即可看到（实时互通）" else "下单失败：检查隧道/网络"
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun Center(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text, color = JdoColors.TextSecondary, fontSize = 20.sp)
    }
}

@Composable
private fun TextChip(text: String, bg: Color, fg: Color, onClick: () -> Unit) {
    Box(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(bg).clickable { onClick() }
            .padding(horizontal = JdoDimens.Space4, vertical = 10.dp),
    ) { Text(text, color = fg, fontSize = 17.sp, fontWeight = FontWeight.SemiBold) }
}

@Composable
private fun ProductCard(p: ApiProduct, onAdd: () -> Unit, onOrder: () -> Unit) {
    val tone = TAG_TONES[(p.id.hashCode() and 0x7fffffff) % TAG_TONES.size]
    Column(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg)).padding(JdoDimens.Space4),
    ) {
        Box(
            modifier = Modifier.fillMaxWidth().height(80.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                .background(Brush.linearGradient(listOf(JdoColors.Bg3, JdoColors.Bg1))),
            contentAlignment = Alignment.TopStart,
        ) {
            if (p.tag.isNotEmpty()) {
                Box(
                    modifier = Modifier.padding(8.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(tone).padding(horizontal = 8.dp, vertical = 3.dp),
                ) { Text(p.tag, color = JdoColors.TextInverse, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
            }
        }
        Spacer(Modifier.height(JdoDimens.Space3))
        Text(p.title, color = JdoColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Medium, maxLines = 2)
        Spacer(Modifier.height(JdoDimens.Space2))
        Text(yuan(p.priceFen), color = JdoColors.Mint, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(JdoDimens.Space3))
        Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2)) {
            TextChip("加入", JdoColors.Bg3, JdoColors.TextPrimary) { onAdd() }
            TextChip("下单", JdoColors.Brand500, Color.White) { onOrder() }
        }
    }
}
