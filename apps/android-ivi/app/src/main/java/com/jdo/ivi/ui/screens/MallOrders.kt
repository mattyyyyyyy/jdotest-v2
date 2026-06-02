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
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.jdo.ivi.data.ApiOrder
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

private fun statusCn(s: String) = when (s) {
    "PENDING_PAYMENT" -> "待付款"; "PAID" -> "待发货"; "SHIPPING" -> "配送中"; "COMPLETED" -> "已完成"
    "CANCELED" -> "已取消"; "EXPIRED" -> "已过期"; "REFUNDING" -> "退款中"; "REFUNDED" -> "已退款"; else -> s
}
private fun statusColor(s: String) = when (s) {
    "COMPLETED" -> JdoColors.Success; "SHIPPING" -> JdoColors.Accent; "CANCELED", "EXPIRED" -> JdoColors.TextMuted
    "REFUNDING", "REFUNDED" -> JdoColors.Warn; else -> JdoColors.Mint
}
private fun timeline(s: String): List<Pair<String, Int>> {
    // (label, state: 0 done,1 active,2 future)
    val steps = listOf("下单成功", "付款完成", "商家备货", "配送 / 自提", "订单完成")
    val done = when (s) {
        "PENDING_PAYMENT" -> 0; "PAID" -> 1; "SHIPPING" -> 3; "COMPLETED" -> 4; else -> 1
    }
    return steps.mapIndexed { i, l -> l to (if (i < done) 0 else if (i == done) 1 else 2) }
}

@Composable
fun MallOrders(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var orders by remember { mutableStateOf<List<ApiOrder>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var sel by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) { thread { orders = NetworkClient.fetchOrders(); loading = false } }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("我的订单", onBack = onBack)
        when {
            loading -> Box(Modifier.fillMaxSize(), Alignment.Center) { Text("加载中…", color = JdoColors.TextSecondary, fontSize = 20.sp) }
            orders.isEmpty() -> Box(Modifier.fillMaxSize(), Alignment.Center) { Text("暂无订单", color = JdoColors.TextMuted, fontSize = 20.sp) }
            else -> Row(modifier = Modifier.fillMaxSize()) {
                // 左：订单列表
                LazyColumn(modifier = Modifier.weight(1f).fillMaxHeight().padding(JdoDimens.Space4), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
                    itemsIndexed(orders) { i, o ->
                        Column(
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusLg))
                                .background(if (i == sel) JdoColors.Bg3 else JdoColors.Bg2)
                                .border(1.dp, if (i == sel) JdoColors.Mint else JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg))
                                .clickable { sel = i }.padding(JdoDimens.Space4),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(o.id, color = JdoColors.TextMuted, fontSize = 14.sp)
                                Spacer(Modifier.weight(1f))
                                Text(statusCn(o.status), color = statusColor(o.status), fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Text(o.itemTitles.firstOrNull() ?: "—", color = JdoColors.TextPrimary, fontSize = 17.sp, maxLines = 1, modifier = Modifier.padding(vertical = 6.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("${o.itemTitles.size} 件 · ${if (o.channel == "car") "车机" else "手机"} · ${o.createdAt}", color = JdoColors.TextMuted, fontSize = 13.sp)
                                Spacer(Modifier.weight(1f))
                                Text(yuan(o.totalFen), color = JdoColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
                // 右：详情
                val cur = orders.getOrNull(sel) ?: orders.first()
                Column(modifier = Modifier.weight(1.2f).fillMaxHeight().background(JdoColors.Bg1).padding(JdoDimens.Space5).verticalScroll(rememberScrollState())) {
                    Text(statusCn(cur.status), color = statusColor(cur.status), fontSize = 30.sp, fontWeight = FontWeight.Bold)
                    Text("订单号 ${cur.id}", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(top = 4.dp))
                    Spacer(Modifier.height(JdoDimens.Space5))
                    // 时间线
                    timeline(cur.status).forEach { (label, st) ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 8.dp)) {
                            Box(modifier = Modifier.size(14.dp).clip(RoundedCornerShape(7.dp)).background(if (st == 2) JdoColors.Bg3 else if (st == 1) JdoColors.Mint else JdoColors.Success))
                            Spacer(Modifier.width(JdoDimens.Space3))
                            Text(label, color = if (st == 2) JdoColors.TextMuted else JdoColors.TextPrimary, fontSize = 16.sp, fontWeight = if (st == 1) FontWeight.SemiBold else FontWeight.Normal)
                        }
                    }
                    Spacer(Modifier.height(JdoDimens.Space4))
                    Text("商品清单", color = JdoColors.TextSecondary, fontSize = 16.sp, modifier = Modifier.padding(bottom = JdoDimens.Space2))
                    cur.itemTitles.forEach { t ->
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp)) {
                            Text("· $t", color = JdoColors.TextPrimary, fontSize = 15.sp, maxLines = 2, modifier = Modifier.weight(1f))
                        }
                    }
                    Spacer(Modifier.height(JdoDimens.Space3))
                    Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).padding(JdoDimens.Space4)) {
                        Column { Text("📍 李先生 · 138****6789", color = JdoColors.TextPrimary, fontSize = 16.sp); Text("上海市 浦东新区 张江路 1888 弄 6 号", color = JdoColors.TextMuted, fontSize = 14.sp, modifier = Modifier.padding(top = 4.dp)) }
                    }
                    Spacer(Modifier.height(JdoDimens.Space4))
                    Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space3)) {
                        OrderBtn("联系客服", JdoColors.Bg3, JdoColors.TextPrimary, Modifier.weight(1f)) {}
                        if (cur.status == "SHIPPING") OrderBtn("查看物流", JdoColors.Bg3, JdoColors.TextPrimary, Modifier.weight(1f)) { onNav("mall-tracking", null) }
                        if (cur.status == "COMPLETED") OrderBtn("申请售后", JdoColors.Bg3, JdoColors.TextPrimary, Modifier.weight(1f)) { onNav("mall-aftersale", null) }
                        OrderBtn("再买一次", JdoColors.Brand500, Color.White, Modifier.weight(1f)) { onNav("mall-home", null) }
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderBtn(text: String, bg: Color, fg: Color, modifier: Modifier, onClick: () -> Unit) {
    Box(modifier = modifier.height(56.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(bg).clickable { onClick() }, contentAlignment = Alignment.Center) {
        Text(text, color = fg, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
    }
}
