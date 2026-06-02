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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.CartItem
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

@Composable
fun MallCart(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var items by remember { mutableStateOf<List<CartItem>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) { thread { items = NetworkClient.getCart(); loading = false } }
    fun patch(id: String, qty: Int? = null, selected: Boolean? = null) = thread { items = NetworkClient.patchCartItem(id, qty, selected) }
    fun del(id: String) = thread { items = NetworkClient.deleteCartItem(id) }

    val selected = items.filter { it.selected }
    val subtotal = selected.sumOf { it.priceFen * it.qty }
    val discount = (subtotal * 0.06).toInt()
    val freight = if (subtotal >= 9900 || subtotal == 0) 0 else 800
    val total = subtotal - discount + freight
    val totalQty = selected.sumOf { it.qty }
    val allChecked = items.isNotEmpty() && items.all { it.selected }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("购物车 · 共 ${items.size} 件", onBack = onBack)
        if (loading) {
            Box(Modifier.fillMaxSize(), Alignment.Center) { Text("加载中…", color = JdoColors.TextSecondary, fontSize = 20.sp) }
        } else Row(modifier = Modifier.fillMaxSize()) {
            // 左：清单
            LazyColumn(modifier = Modifier.weight(1.5f).fillMaxHeight().padding(JdoDimens.Space4), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
                if (items.isEmpty()) item { Text("购物车是空的，去逛逛吧", color = JdoColors.TextMuted, fontSize = 22.sp, modifier = Modifier.padding(40.dp)) }
                items(items) { it ->
                    Row(
                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2).padding(JdoDimens.Space3),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Checkbox(it.selected) { patch(it.id, selected = !it.selected) }
                        Spacer(Modifier.width(JdoDimens.Space3))
                        ProductImage(it.img, Modifier.size(88.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)))
                        Spacer(Modifier.width(JdoDimens.Space3))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(it.title, color = JdoColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Medium, maxLines = 2)
                            Text("规格 · ${it.spec} · 自营", color = JdoColors.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(vertical = 4.dp))
                            Text(yuan(it.priceFen), color = JdoColors.Mint, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                        }
                        Stepper2(it.qty, { patch(it.id, qty = (it.qty - 1).coerceAtLeast(1)) }, { patch(it.id, qty = it.qty + 1) })
                        Spacer(Modifier.width(JdoDimens.Space2))
                        Box(modifier = Modifier.size(40.dp).clickable { del(it.id) }, contentAlignment = Alignment.Center) { Text("🗑", fontSize = 18.sp) }
                    }
                }
            }
            // 右：结算汇总
            Column(modifier = Modifier.weight(1f).fillMaxHeight().background(JdoColors.Bg1).padding(JdoDimens.Space5)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(allChecked) { thread { items = items.map { NetworkClient.patchCartItem(it.id, selected = !allChecked) }.lastOrNull() ?: items } }
                    Spacer(Modifier.width(JdoDimens.Space2))
                    Text("全选", color = JdoColors.TextPrimary, fontSize = 18.sp)
                    Spacer(Modifier.weight(1f))
                    Text("已选 $totalQty 件", color = JdoColors.TextMuted, fontSize = 15.sp)
                }
                Divider()
                SumRow("商品金额", yuan(subtotal))
                SumRow("车主权益直降 VIP", "− " + yuan(discount), JdoColors.Success)
                SumRow("运费", if (freight == 0) "免运费" else yuan(freight))
                SumRow("预估积分", "+ ${total / 100} pt", JdoColors.Gold)
                Divider()
                Row(modifier = Modifier.padding(vertical = JdoDimens.Space3)) {
                    Text("合计", color = JdoColors.TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.weight(1f))
                    Text(yuan(total), color = JdoColors.Mint, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier.fillMaxWidth().height(64.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg))
                        .background(if (totalQty > 0) JdoColors.Brand500 else JdoColors.Bg3).clickable(enabled = totalQty > 0) { onNav("mall-checkout", null) },
                    contentAlignment = Alignment.Center,
                ) { Text("去结算 · $totalQty 件", color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold) }
            }
        }
    }
}

@Composable
private fun Checkbox(checked: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier.size(28.dp).clip(RoundedCornerShape(6.dp))
            .background(if (checked) JdoColors.Mint else Color.Transparent)
            .border(2.dp, if (checked) JdoColors.Mint else JdoColors.BorderStrong, RoundedCornerShape(6.dp))
            .clickable { onClick() },
        contentAlignment = Alignment.Center,
    ) { if (checked) Text("✓", color = JdoColors.TextInverse, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
}

@Composable
private fun Stepper2(qty: Int, onMinus: () -> Unit, onPlus: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg3)) {
        Box(modifier = Modifier.size(38.dp).clickable { onMinus() }, contentAlignment = Alignment.Center) { Text("−", color = JdoColors.TextPrimary, fontSize = 20.sp) }
        Text("$qty", color = JdoColors.TextPrimary, fontSize = 16.sp, modifier = Modifier.width(32.dp), fontWeight = FontWeight.SemiBold)
        Box(modifier = Modifier.size(38.dp).clickable { onPlus() }, contentAlignment = Alignment.Center) { Text("+", color = JdoColors.TextPrimary, fontSize = 20.sp) }
    }
}

@Composable
private fun Divider() {
    Box(modifier = Modifier.fillMaxWidth().height(1.dp).padding(vertical = 0.dp).background(JdoColors.BorderDefault).padding(vertical = JdoDimens.Space2))
    Spacer(Modifier.height(JdoDimens.Space2))
}

@Composable
private fun SumRow(label: String, value: String, valueColor: Color = JdoColors.TextPrimary) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
        Text(label, color = JdoColors.TextSecondary, fontSize = 16.sp)
        Spacer(Modifier.weight(1f))
        Text(value, color = valueColor, fontSize = 16.sp, fontWeight = FontWeight.Medium)
    }
}
