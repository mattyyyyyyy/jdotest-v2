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
import com.jdo.ivi.data.ShoppingState
import com.jdo.ivi.data.imageModel
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber

/* ============================================================
   09 我的订单 · 18 物流详情 · 17 售后
   ============================================================ */

private data class Order(val id: String, val rawStatus: String, val status: String, val statusColor: Color, val itemTitles: List<String>, val total: Double, val time: String)

@Composable
fun MallOrdersScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    LaunchedEffect(Unit) { ShoppingState.loadOrders() }
    fun statusLabel(status: String) = when (status) {
        "PENDING_PAYMENT" -> "待付款"
        "PAID" -> "待发货"
        "SHIPPING" -> "配送中"
        "PICKUP_READY" -> "待自提"
        "DELIVERED", "COMPLETED" -> "已完成"
        "CANCELED", "CANCELLED" -> "已取消"
        else -> status
    }
    fun statusColor(status: String) = when (status) {
        "SHIPPING" -> c.brand
        "DELIVERED", "COMPLETED" -> c.success
        "CANCELED", "CANCELLED" -> c.textMuted
        else -> c.driving
    }
    val sampleOrders = listOf(
        Order("JDO...887462", "PAID", "待发货", c.driving, listOf("车载香薰", "玻璃水", "主动降噪蓝牙耳机"), 234.78, "今天 09:24"),
        Order("JDO...331205", "SHIPPING", "配送中", c.brand, listOf("每日坚果", "原产地咖啡豆"), 168.0, "昨天 18:02"),
        Order("JDO...118207", "PICKUP_READY", "待自提", c.driving, listOf("PD 100W 车载快充"), 79.0, "5/24 14:15"),
        Order("JDO...772091", "COMPLETED", "已完成", c.success, listOf("声波电动牙刷", "氨基酸洗发水"), 249.8, "5/20 21:48"),
    )
    val allOrders = ShoppingState.orders.map {
        Order(it.id, it.status, statusLabel(it.status), statusColor(it.status), it.itemTitles, it.totalFen / 100.0, it.createdAt)
    }.ifEmpty { sampleOrders }
    var tab by remember { mutableStateOf("all") }
    val orders = when (tab) {
        "unpaid" -> allOrders.filter { it.rawStatus == "PENDING_PAYMENT" }
        "paid" -> allOrders.filter { it.rawStatus == "PAID" }
        "shipping" -> allOrders.filter { it.rawStatus == "SHIPPING" || it.rawStatus == "PICKUP_READY" }
        "review" -> allOrders.filter { it.rawStatus == "DELIVERED" || it.rawStatus == "COMPLETED" }
        else -> allOrders
    }
    var active by remember { mutableStateOf(0) }
    LaunchedEffect(tab, orders.size) { active = 0 }
    val cur = orders.getOrNull(active.coerceAtMost(orders.lastIndex))
    fun timeline(status: String) = when (status) {
        "PENDING_PAYMENT" -> listOf(true, false, false, false, false)
        "PAID" -> listOf(true, true, false, false, false)
        "SHIPPING", "PICKUP_READY" -> listOf(true, true, true, false, false)
        "DELIVERED", "COMPLETED" -> listOf(true, true, true, true, true)
        else -> listOf(true, false, false, false, false)
    }.zip(listOf("下单成功", "付款完成", "商家备货", "配送 / 自提", "完成")).map { (done, label) -> label to done }

    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("我的订单", back) { IconBtn("search") {} }
            Row(Modifier.padding(horizontal = 36.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                listOf("all" to "全部", "unpaid" to "待付款", "paid" to "待发货", "shipping" to "待收货", "review" to "待评价")
                    .forEach { (id, label) -> Chip(label, tab == id) { tab = id } }
            }
            Row(Modifier.weight(1f).padding(horizontal = 36.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                // 列表
                Column(Modifier.weight(1.05f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    orders.forEachIndexed { i, o ->
                        Column(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(c.bg2.copy(0.55f))
                                .border(if (active == i) 2.dp else 1.dp, if (active == i) c.mint else c.borderDefault, RoundedCornerShape(22.dp))
                                .clickable { active = i }.padding(22.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp),
                        ) {
                            Row {
                                Text(o.id, color = c.textMuted, fontSize = 18.sp, style = MonoNumber, modifier = Modifier.weight(1f))
                                Text(o.status, color = o.statusColor, fontSize = 22.sp)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                o.itemTitles.take(3).forEachIndexed { index, title ->
                                    AsyncImage(imageModel(Catalog.products[index % Catalog.products.size].img), title, contentScale = ContentScale.Crop,
                                        modifier = Modifier.size(88.dp).clip(RoundedCornerShape(14.dp)))
                                }
                            }
                            Text(o.itemTitles.joinToString(" · "), color = c.textSecondary, fontSize = 16.sp, maxLines = 1)
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text("${o.time}", color = c.textMuted, fontSize = 18.sp, modifier = Modifier.weight(1f))
                                Text("¥ ${"%.2f".format(o.total)}", color = c.textPrimary, fontSize = 26.sp, style = MonoNumber)
                            }
                        }
                    }
                }
                // 详情
                if (cur == null) {
                    Box(
                        Modifier.weight(1f).clip(RoundedCornerShape(28.dp)).background(c.bg2.copy(0.6f))
                            .border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)),
                        contentAlignment = Alignment.Center,
                    ) { Text("暂无该状态订单", color = c.textMuted, fontSize = 24.sp) }
                } else {
                    Column(
                        Modifier.weight(1f).clip(RoundedCornerShape(28.dp)).background(c.bg2.copy(0.6f))
                            .border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)).padding(28.dp).verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        Text(cur.status, color = cur.statusColor, fontSize = 32.sp, fontWeight = FontWeight.SemiBold)
                        Text("订单号 ${cur.id}", color = c.textMuted, fontSize = 18.sp, style = MonoNumber)
                        // 时间线
                        Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                            timeline(cur.rawStatus).forEach { (label, done) ->
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(Modifier.size(18.dp).clip(CircleShape).background(if (done) c.mint else c.borderStrong))
                                    Spacer(Modifier.width(16.dp))
                                    Text(label, color = if (done) c.textPrimary else c.textMuted, fontSize = 22.sp)
                                }
                            }
                        }
                        Divider()
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            when (cur.rawStatus) {
                                "PENDING_PAYMENT" -> PrimaryButton("继续支付", Modifier.weight(1f)) {
                                    ShoppingState.selectOrderForPayment(cur.id, (cur.total * 100).toInt())
                                    nav(Routes.MallPay)
                                }
                                "PAID" -> OutlineButton("催发货", Modifier.weight(1f)) {}
                                "SHIPPING", "PICKUP_READY" -> PrimaryButton("查看物流", Modifier.weight(1f)) { nav(Routes.MallTracking) }
                                "DELIVERED", "COMPLETED" -> {
                                    OutlineButton("申请售后", Modifier.weight(1f)) { nav(Routes.MallAftersale) }
                                    PrimaryButton("再买一次", Modifier.weight(1f)) { nav(Routes.MallHome) }
                                }
                                else -> PrimaryButton("返回商城", Modifier.weight(1f)) { nav(Routes.MallHome) }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ── 18 物流详情 ── */
@Composable
fun MallTrackingScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    val feed = listOf(
        "配送中 · 即将送达" to "距离车辆 480m · ETA 8 分钟",
        "已揽收" to "顺丰同城 · 张师傅 · 今天 08:14",
        "商家备货" to "JDO 浦东仓 · 昨天 19:30",
        "付款完成" to "JDO 联名卡 · 昨天 18:02",
        "下单成功" to "上海·浦东 JDO 车机 · 昨天 17:58",
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("物流详情", back) { IconBtn("phone") {} }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                // 地图占位
                Box(
                    Modifier.weight(1.4f).fillMaxHeight().clip(RoundedCornerShape(28.dp))
                        .background(c.bg2.copy(0.5f)).border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(jdoIcon("location"), null, tint = c.mint, modifier = Modifier.size(64.dp))
                        Spacer(Modifier.height(12.dp))
                        Text("实时配送地图", color = c.textSecondary, fontSize = 22.sp)
                        Text("骑手距您 480m · ETA 8 分钟", color = c.textMuted, fontSize = 18.sp)
                    }
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    Column(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp))
                            .background(c.mint.copy(0.12f)).border(1.dp, c.mint.copy(0.3f), RoundedCornerShape(28.dp)).padding(28.dp),
                    ) {
                        Text("配送中 · 即将送达", color = c.mint, fontSize = 20.sp)
                        Spacer(Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.Bottom) {
                            Text("8", color = c.textPrimary, fontSize = 56.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                            Text(" 分钟 · 距离 480 m", color = c.textSecondary, fontSize = 20.sp)
                        }
                    }
                    GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                        Text("实时轨迹", color = c.textPrimary, fontSize = 22.sp, fontWeight = FontWeight.Medium)
                        Spacer(Modifier.height(12.dp))
                        feed.forEachIndexed { i, (label, meta) ->
                            Row(Modifier.padding(vertical = 8.dp)) {
                                Box(Modifier.padding(top = 6.dp).size(14.dp).clip(CircleShape).background(if (i == 0) c.mint else c.borderStrong))
                                Spacer(Modifier.width(16.dp))
                                Column {
                                    Text(label, color = c.textPrimary, fontSize = 20.sp)
                                    Text(meta, color = c.textMuted, fontSize = 16.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ── 17 售后 ── */
@Composable
fun MallAftersaleScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var type by remember { mutableStateOf("refund") }
    val steps = listOf("提交申请","商家审核","退货 / 收货","退款完成")
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("售后服务", back) { IconBtn("phone") {} }
            Column(Modifier.weight(1f).padding(36.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                // 进度
                Row(verticalAlignment = Alignment.CenterVertically) {
                    steps.forEachIndexed { i, s ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(Modifier.size(44.dp).clip(CircleShape).background(if (i <= 1) c.mint else c.bg3.copy(0.6f)), contentAlignment = Alignment.Center) {
                                Text("${i + 1}", color = if (i <= 1) Color(0xFF03171F) else c.textMuted, fontSize = 18.sp, style = MonoNumber)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(s, color = if (i <= 1) c.textPrimary else c.textMuted, fontSize = 16.sp)
                        }
                        if (i < steps.size - 1) Box(Modifier.weight(1f).height(3.dp).padding(horizontal = 8.dp).background(if (i < 1) c.mint else c.borderDefault))
                    }
                }
                Text("售后类型", color = c.textSecondary, fontSize = 20.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf("refund" to "仅退款", "return" to "退货退款", "exchange" to "换货", "repair" to "上门维修").forEach { (id, name) ->
                        Chip(name, type == id) { type = id }
                    }
                }
                GlassCard(Modifier.fillMaxWidth(), corner = 20.dp) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(imageModel(Catalog.byId("e5").img), null, contentScale = ContentScale.Crop, modifier = Modifier.size(88.dp).clip(RoundedCornerShape(14.dp)))
                        Spacer(Modifier.width(16.dp))
                        Column(Modifier.weight(1f)) {
                            Text(Catalog.byId("e5").title, color = c.textPrimary, fontSize = 22.sp)
                            Text("规格 · 默认 · ×1", color = c.textMuted, fontSize = 16.sp)
                        }
                        Text("¥ 79.00", color = c.textPrimary, fontSize = 24.sp, style = MonoNumber)
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlineButton("撤销申请", Modifier.weight(1f)) { back() }
                    PrimaryButton("提交售后", Modifier.weight(1f)) { back() }
                }
            }
        }
    }
}
