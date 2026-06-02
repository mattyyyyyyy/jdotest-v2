package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.data.Product
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber

/* ============================================================
   06 购物车 · 07 确认订单 · 08 扫码支付
   ============================================================ */

private data class CartLine(val p: Product, val qty: Int, val spec: String, val checked: Boolean = true)

@Composable
fun MallCartScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var lines by remember {
        mutableStateOf(listOf(
            CartLine(Catalog.byId("g1"), 2, "木质香调"),
            CartLine(Catalog.byId("e4"), 1, "6 瓶 / 箱"),
            CartLine(Catalog.byId("g5"), 1, "岩石黑 · M"),
            CartLine(Catalog.byId("f5"), 3, "30 包 / 箱", checked = false),
        ))
    }
    val selected = lines.filter { it.checked }
    val subtotal = selected.sumOf { it.p.price * it.qty }
    val discount = (subtotal * 0.06)
    val total = subtotal - discount

    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("购物车 · 共 ${lines.size} 件", back)
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                // 列表
                Column(Modifier.weight(1.6f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    lines.forEachIndexed { i, ln ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(c.bg2.copy(0.55f))
                                .border(1.dp, c.borderDefault, RoundedCornerShape(22.dp)).padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Checkbox(ln.checked) { lines = lines.toMutableList().also { it[i] = ln.copy(checked = !ln.checked) } }
                            Spacer(Modifier.width(16.dp))
                            AsyncImage(ln.p.img, null, contentScale = ContentScale.Crop,
                                modifier = Modifier.size(140.dp).clip(RoundedCornerShape(18.dp)))
                            Spacer(Modifier.width(20.dp))
                            Column(Modifier.weight(1f)) {
                                Text(ln.p.title, color = c.textPrimary, fontSize = 22.sp, maxLines = 2)
                                Spacer(Modifier.height(6.dp))
                                Text("规格 · ${ln.spec} · 自营", color = c.textMuted, fontSize = 16.sp)
                                Spacer(Modifier.height(8.dp))
                                Text("¥${fmtPrice(ln.p.price)}", color = c.error, fontSize = 26.sp, style = MonoNumber)
                            }
                            QtyStepper(ln.qty,
                                onMinus = { if (ln.qty > 1) lines = lines.toMutableList().also { it[i] = ln.copy(qty = ln.qty - 1) } },
                                onPlus = { lines = lines.toMutableList().also { it[i] = ln.copy(qty = ln.qty + 1) } })
                        }
                    }
                }
                // 汇总
                Column(
                    Modifier.weight(1f).clip(RoundedCornerShape(28.dp)).background(c.bg2.copy(0.6f))
                        .border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)).padding(28.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp),
                ) {
                    SummaryRow("商品金额", "¥ ${"%.2f".format(subtotal)}")
                    SummaryRow("车主权益直降", "− ¥ ${"%.2f".format(discount)}", c.success)
                    SummaryRow("运费", "免运费")
                    Divider()
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("合计", color = c.textSecondary, fontSize = 22.sp, modifier = Modifier.weight(1f))
                        Text("¥ ${"%.2f".format(total)}", color = c.error, fontSize = 40.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                    }
                    PrimaryButton("去结算 · ${selected.sumOf { it.qty }} 件", Modifier.fillMaxWidth()) { nav(Routes.MallCheckout) }
                }
            }
        }
    }
}

@Composable
fun Checkbox(checked: Boolean, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Box(
        Modifier.size(44.dp).clip(CircleShape)
            .background(if (checked) c.mint else Color.Transparent)
            .border(2.dp, if (checked) c.mint else c.borderStrong, CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { if (checked) Icon(jdoIcon("plus"), null, tint = Color(0xFF03171F), modifier = Modifier.size(20.dp)) }
}

@Composable
private fun QtyStepper(qty: Int, onMinus: () -> Unit, onPlus: () -> Unit) {
    val c = JdoTheme.colors
    Row(
        Modifier.clip(RoundedCornerShape(9999.dp)).background(c.bg3.copy(0.6f))
            .border(1.dp, c.borderDefault, RoundedCornerShape(9999.dp)),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(48.dp).clickable(onClick = onMinus), contentAlignment = Alignment.Center) {
            Icon(jdoIcon("chevL"), null, tint = c.textPrimary, modifier = Modifier.size(18.dp))
        }
        Text("$qty", color = c.textPrimary, fontSize = 20.sp, style = MonoNumber)
        Box(Modifier.size(48.dp).clickable(onClick = onPlus), contentAlignment = Alignment.Center) {
            Icon(jdoIcon("plus"), null, tint = c.textPrimary, modifier = Modifier.size(18.dp))
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String, valueColor: Color? = null) {
    val c = JdoTheme.colors
    Row {
        Text(label, color = c.textSecondary, fontSize = 20.sp, modifier = Modifier.weight(1f))
        Text(value, color = valueColor ?: c.textPrimary, fontSize = 20.sp, style = MonoNumber)
    }
}

/* ── 07 确认订单 ── */
@Composable
fun MallCheckoutScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    val items = listOf(Catalog.byId("g1"), Catalog.byId("e4"), Catalog.byId("g5"))
    var ship by remember { mutableStateOf("pickup") }
    var pay by remember { mutableStateOf("qrcode") }
    val total = items.sumOf { it.price } * 0.94

    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("确认订单 · ${items.size} 件商品", back)
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                Column(Modifier.weight(1.4f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    // 地址
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp))
                            .background(c.accent.copy(0.10f)).border(1.dp, c.accent.copy(0.3f), RoundedCornerShape(24.dp)).padding(24.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(jdoIcon("location"), null, tint = c.mint, modifier = Modifier.size(28.dp))
                        Spacer(Modifier.width(16.dp))
                        Column(Modifier.weight(1f)) {
                            Text("李先生 · 138****6789  [家]", color = c.textPrimary, fontSize = 24.sp)
                            Text("上海市 浦东新区 张江路 1888 弄 6 号", color = c.textSecondary, fontSize = 18.sp)
                        }
                        Text("切换 ›", color = c.mint, fontSize = 20.sp)
                    }
                    // 配送方式
                    Text("配送方式", color = c.textSecondary, fontSize = 20.sp)
                    OptRow("location", "附近自提", "京东·张江店 · 280m · 30 分钟", ship == "pickup") { ship = "pickup" }
                    OptRow("package", "快递配送", "次日达 · ¥8", ship == "express") { ship = "express" }
                    OptRow("car", "送达车上", "骑手抵达停车点 · 60–90 分钟", ship == "tocar") { ship = "tocar" }
                    // 支付方式
                    Text("支付方式", color = c.textSecondary, fontSize = 20.sp)
                    OptRow("phone", "车机扫码", "手机扫码确认 · 推荐", pay == "qrcode") { pay = "qrcode" }
                    OptRow("package", "JDO 联名卡", "免密 ≤ ¥500 · 95 折", pay == "card") { pay = "card" }
                }
                Column(
                    Modifier.weight(1f).clip(RoundedCornerShape(28.dp)).background(c.bg2.copy(0.6f))
                        .border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)).padding(28.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Text("商品清单 · ${items.size} 件", color = c.textPrimary, fontSize = 22.sp)
                    items.forEach { p ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(p.img, null, contentScale = ContentScale.Crop, modifier = Modifier.size(72.dp).clip(RoundedCornerShape(12.dp)))
                            Spacer(Modifier.width(14.dp))
                            Text(p.title, color = c.textPrimary, fontSize = 18.sp, maxLines = 2, modifier = Modifier.weight(1f))
                            Text("¥${fmtPrice(p.price)}", color = c.textPrimary, fontSize = 20.sp, style = MonoNumber)
                        }
                    }
                    Divider()
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("实付", color = c.textSecondary, fontSize = 22.sp, modifier = Modifier.weight(1f))
                        Text("¥ ${"%.2f".format(total)}", color = c.error, fontSize = 40.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                    }
                    PrimaryButton("提交订单", Modifier.fillMaxWidth()) { nav(Routes.MallPay) }
                }
            }
        }
    }
}

@Composable
fun OptRow(icon: String, name: String, desc: String, selected: Boolean, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp))
            .background(if (selected) c.accent.copy(0.10f) else c.bg2.copy(0.4f))
            .border(1.dp, if (selected) c.accent.copy(0.4f) else c.borderDefault, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(52.dp).clip(RoundedCornerShape(14.dp)).background(c.bg3.copy(0.6f)), contentAlignment = Alignment.Center) {
            Icon(jdoIcon(icon), null, tint = c.textPrimary, modifier = Modifier.size(26.dp))
        }
        Spacer(Modifier.width(16.dp))
        Column(Modifier.weight(1f)) {
            Text(name, color = c.textPrimary, fontSize = 22.sp)
            Text(desc, color = c.textMuted, fontSize = 16.sp)
        }
        Box(Modifier.size(32.dp).clip(CircleShape).border(2.dp, if (selected) c.mint else c.borderStrong, CircleShape)
            .background(if (selected) c.mint else Color.Transparent))
    }
}

/* ── 08 扫码支付 ── */
@Composable
fun MallPayScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("扫码支付", back)
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                Row(
                    Modifier.clip(RoundedCornerShape(40.dp)).background(c.bg2.copy(0.6f))
                        .border(1.dp, c.borderDefault, RoundedCornerShape(40.dp)).padding(48.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(56.dp),
                ) {
                    // 二维码占位
                    Box(Modifier.size(420.dp).clip(RoundedCornerShape(28.dp)).background(Color.White), contentAlignment = Alignment.Center) {
                        Box(Modifier.size(84.dp).clip(RoundedCornerShape(18.dp)).background(c.accent), contentAlignment = Alignment.Center) {
                            Text("JD", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 26.sp)
                        }
                    }
                    Column(verticalArrangement = Arrangement.spacedBy(24.dp)) {
                        Text("订单号 · JDO20260526887462", color = c.textSecondary, fontSize = 20.sp)
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text("¥", color = c.textSecondary, fontSize = 40.sp, style = MonoNumber)
                            Text("234.78", color = c.textPrimary, fontSize = 80.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                        }
                        Row(
                            Modifier.clip(RoundedCornerShape(9999.dp)).background(c.driving.copy(0.15f))
                                .border(1.dp, c.driving.copy(0.4f), RoundedCornerShape(9999.dp)).padding(horizontal = 24.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(Modifier.size(12.dp).clip(CircleShape).background(c.driving))
                            Spacer(Modifier.width(12.dp))
                            Text("等待手机扫码支付 · 剩余 02:58", color = c.driving, fontSize = 20.sp)
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                            OutlineButton("取消支付", Modifier.weight(1f)) { back() }
                            PrimaryButton("我已支付", Modifier.weight(1f)) { nav(Routes.MallOrders) }
                        }
                    }
                }
            }
        }
    }
}
