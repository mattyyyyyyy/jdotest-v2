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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

@Composable
fun MallDetail(productId: String, onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var p by remember { mutableStateOf<ApiProduct?>(null) }
    var loading by remember { mutableStateOf(true) }
    var color by remember { mutableStateOf("曜石黑") }
    var size by remember { mutableStateOf("M") }
    var qty by remember { mutableIntStateOf(1) }

    LaunchedEffect(productId) {
        loading = true
        thread { p = NetworkClient.fetchProduct(productId); loading = false }
    }

    fun addThen(route: String) {
        val prod = p ?: return
        thread { NetworkClient.addCartItem(prod.id, qty, color); onNav(route, null) }
    }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("商品详情", onBack = onBack) {
            Text("车主评价 4.8", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.clickable { onNav("mall-reviews", null) }.padding(end = 12.dp))
            com.jdo.ivi.ui.components.Chip("🛒", JdoColors.Bg2, JdoColors.TextPrimary) { onNav("mall-cart", null) }
        }
        val prod = p
        when {
            loading -> Center("加载中…")
            prod == null -> Center("商品不存在")
            else -> Row(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space5)) {
                // 左：主图 + 缩略
                Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
                    Box(modifier = Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(JdoDimens.RadiusXl))) {
                        ProductImage(prod.img, Modifier.fillMaxSize())
                        Row(modifier = Modifier.padding(JdoDimens.Space3)) {
                            Tag("⚡ 限时秒杀", JdoColors.Driving)
                            Spacer(Modifier.width(8.dp))
                            Tag("车主推荐", JdoColors.Accent)
                        }
                    }
                    Spacer(Modifier.height(JdoDimens.Space3))
                    Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
                        repeat(3) {
                            ProductImage(prod.img, Modifier.size(72.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)).border(if (it == 0) 2.dp else 0.dp, JdoColors.Mint, RoundedCornerShape(JdoDimens.RadiusMd)))
                        }
                    }
                }
                Spacer(Modifier.width(JdoDimens.Space5))
                // 右：规格信息（可滚）
                Column(modifier = Modifier.weight(1f).fillMaxHeight().verticalScroll(rememberScrollState())) {
                    Text(prod.title, color = JdoColors.TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                    Text("京东自营 · JDO 直配 · 7 天无忧退换", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(top = 6.dp))
                    Spacer(Modifier.height(JdoDimens.Space4))
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(yuan(prod.priceFen), color = JdoColors.Mint, fontSize = 40.sp, fontWeight = FontWeight.Bold)
                        if (prod.oriFen > prod.priceFen) {
                            Spacer(Modifier.width(10.dp))
                            Text(yuan(prod.oriFen), color = JdoColors.TextMuted, fontSize = 18.sp)
                            Spacer(Modifier.width(10.dp))
                            Tag("直降${((1 - prod.priceFen.toDouble() / prod.oriFen) * 100).toInt()}%", JdoColors.Error)
                        }
                        Spacer(Modifier.weight(1f))
                        Text("距结束 00:42:17", color = JdoColors.Driving, fontSize = 14.sp)
                    }
                    Row(modifier = Modifier.padding(vertical = JdoDimens.Space3), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
                        Text("★ ${prod.star} 分", color = JdoColors.Gold, fontSize = 15.sp)
                        Text("已售 ${prod.sold}k+", color = JdoColors.TextMuted, fontSize = 15.sp)
                        Text("30 天 1.2 万人浏览", color = JdoColors.TextMuted, fontSize = 15.sp)
                    }
                    SpecRow("颜色 · $color", listOf("曜石黑", "极光白", "薄荷绿"), color) { color = it }
                    SpecRow("规格", listOf("S", "M", "L"), size) { size = it }
                    Text("数量 · 库存 86 件", color = JdoColors.TextSecondary, fontSize = 16.sp, modifier = Modifier.padding(top = JdoDimens.Space3, bottom = JdoDimens.Space2))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Stepper(qty, onMinus = { if (qty > 1) qty-- }, onPlus = { qty++ })
                        Spacer(Modifier.width(JdoDimens.Space4))
                        Text("累计已购 1 次 · 上次 30 天前", color = JdoColors.TextMuted, fontSize = 14.sp)
                    }
                    // 自提
                    Column(modifier = Modifier.padding(top = JdoDimens.Space4).fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2).padding(JdoDimens.Space4)) {
                        Text("📍 配送至 上海市 · 浦东新区 · 张江", color = JdoColors.TextSecondary, fontSize = 15.sp)
                        Text("附近自提点 · 京东快递·张江店 · 280m", color = JdoColors.TextPrimary, fontSize = 15.sp, modifier = Modifier.padding(top = 6.dp))
                        Text("今日 09:00–22:00 · 预计 30 分钟可取", color = JdoColors.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                    Spacer(Modifier.height(JdoDimens.Space4))
                    Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
                        BigBtn("加入购物车", JdoColors.Bg3, JdoColors.TextPrimary, Modifier.weight(1f)) { addThen("mall-cart") }
                        BigBtn("立即购买", JdoColors.Brand500, Color.White, Modifier.weight(1f)) { addThen("mall-checkout") }
                    }
                }
            }
        }
    }
}

@Composable
private fun Tag(text: String, bg: Color) {
    Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(bg).padding(horizontal = 8.dp, vertical = 3.dp)) {
        Text(text, color = JdoColors.TextInverse, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun SpecRow(label: String, opts: List<String>, sel: String, onSel: (String) -> Unit) {
    Column(modifier = Modifier.padding(top = JdoDimens.Space3)) {
        Text(label, color = JdoColors.TextSecondary, fontSize = 16.sp, modifier = Modifier.padding(bottom = JdoDimens.Space2))
        Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2)) {
            opts.forEach { o ->
                val active = o == sel
                Box(
                    modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusMd))
                        .background(if (active) JdoColors.SuccessBg else JdoColors.Bg2)
                        .border(1.dp, if (active) JdoColors.Mint else JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusMd))
                        .clickable { onSel(o) }.padding(horizontal = JdoDimens.Space4, vertical = 10.dp),
                ) { Text(o, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 15.sp) }
            }
        }
    }
}

@Composable
private fun Stepper(qty: Int, onMinus: () -> Unit, onPlus: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).border(1.dp, JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusMd))) {
        Box(modifier = Modifier.size(44.dp).clickable { onMinus() }, contentAlignment = Alignment.Center) { Text("−", color = JdoColors.TextPrimary, fontSize = 22.sp) }
        Text("$qty", color = JdoColors.TextPrimary, fontSize = 18.sp, modifier = Modifier.width(40.dp), fontWeight = FontWeight.SemiBold)
        Box(modifier = Modifier.size(44.dp).clickable { onPlus() }, contentAlignment = Alignment.Center) { Text("+", color = JdoColors.TextPrimary, fontSize = 22.sp) }
    }
}

@Composable
private fun BigBtn(text: String, bg: Color, fg: Color, modifier: Modifier, onClick: () -> Unit) {
    Box(modifier = modifier.height(64.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(bg).clickable { onClick() }, contentAlignment = Alignment.Center) {
        Text(text, color = fg, fontSize = 19.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Center(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text(text, color = JdoColors.TextSecondary, fontSize = 20.sp) }
}
