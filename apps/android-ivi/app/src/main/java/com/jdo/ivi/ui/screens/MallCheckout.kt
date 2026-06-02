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

private data class Opt(val id: String, val name: String, val desc: String)

@Composable
fun MallCheckout(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var items by remember { mutableStateOf<List<CartItem>>(emptyList()) }
    var addr by remember { mutableStateOf("home") }
    var ship by remember { mutableStateOf("pickup") }
    var pay by remember { mutableStateOf("qrcode") }

    LaunchedEffect(Unit) { thread { items = NetworkClient.getCart().filter { it.selected } } }

    val subtotal = items.sumOf { it.priceFen * it.qty }
    val discount = (subtotal * 0.06).toInt()
    val freight = if (ship == "express") 800 else 0
    val total = subtotal - discount + freight

    fun placeOrder() = thread { NetworkClient.checkout(); onNav("mall-pay", null) }

    val addrs = listOf(
        Opt("home", "李先生 · 138****6789 · 家", "上海市 浦东新区 张江路 1888 弄 6 号"),
        Opt("company", "李先生 · 138****6789 · 公司", "上海市 黄浦区 南京东路 666 号 · 创智 28F"),
        Opt("car", "当前位置 · 自动定位 · 车上", "上海市 浦东 · 张衡路停车场 · 实时定位"),
    )
    val ships = listOf(
        Opt("pickup", "附近自提", "京东快递·张江店 · 280m · 30 分钟可取"),
        Opt("express", "快递配送", "次日达 · ¥8 · 预计明天上午"),
        Opt("tocar", "送达车上", "骑手抵达停车点 · 60–90 分钟"),
    )
    val pays = listOf(
        Opt("qrcode", "车机扫码", "手机扫码确认 · 推荐"),
        Opt("wechat", "微信支付", "已绑定 · 免输入"),
        Opt("alipay", "支付宝", "已绑定 · 免密 1500"),
        Opt("unionpay", "银联云闪付", "车厂联名卡 · 95 折"),
    )

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("确认订单 · ${items.size} 件商品", onBack = onBack)
        Row(modifier = Modifier.fillMaxSize()) {
            // 左：地址 / 配送 / 支付 / 备注
            Column(modifier = Modifier.weight(1.4f).fillMaxHeight().verticalScroll(rememberScrollState()).padding(JdoDimens.Space5)) {
                SectionLabel("收货地址")
                addrs.forEach { OptRow(it.name, it.desc, addr == it.id) { addr = it.id } }
                SectionLabel("配送方式")
                ships.forEach { OptRow(it.name, it.desc, ship == it.id) { ship = it.id } }
                SectionLabel("支付方式")
                pays.forEach { OptRow(it.name, it.desc, pay == it.id) { pay = it.id } }
                SectionLabel("订单备注")
                Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).padding(JdoDimens.Space4)) {
                    Text("请输入备注 · 行车态已禁用键盘，停车后填写", color = JdoColors.TextMuted, fontSize = 15.sp)
                }
            }
            // 右：清单 + 汇总
            Column(modifier = Modifier.weight(1f).fillMaxHeight().background(JdoColors.Bg1).padding(JdoDimens.Space5).verticalScroll(rememberScrollState())) {
                Text("商品清单 · ${items.size} 件", color = JdoColors.TextPrimary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(JdoDimens.Space3))
                items.forEach { it ->
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        ProductImage(it.img, Modifier.height(56.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).then(Modifier.width(56.dp)))
                        Spacer(Modifier.width(JdoDimens.Space3))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(it.title, color = JdoColors.TextPrimary, fontSize = 15.sp, maxLines = 2)
                            Text("${it.spec} · ×${it.qty}", color = JdoColors.TextMuted, fontSize = 13.sp)
                        }
                        Text(yuan(it.priceFen * it.qty), color = JdoColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    }
                }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(JdoColors.BorderDefault).padding(vertical = JdoDimens.Space2))
                Spacer(Modifier.height(JdoDimens.Space2))
                SumRow2("商品金额", yuan(subtotal))
                SumRow2("车主权益直降", "− " + yuan(discount), JdoColors.Success)
                SumRow2("运费", if (freight == 0) "免运费" else yuan(freight))
                Row(modifier = Modifier.padding(vertical = JdoDimens.Space3)) {
                    Text("实付", color = JdoColors.TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.weight(1f))
                    Text(yuan(total), color = JdoColors.Mint, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier.fillMaxWidth().height(64.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Brand500).clickable { placeOrder() },
                    contentAlignment = Alignment.Center,
                ) { Text("提交订单", color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold) }
                Text("提交后生成扫码支付二维码", color = JdoColors.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 8.dp).fillMaxWidth())
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(text, color = JdoColors.TextSecondary, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = JdoDimens.Space4, bottom = JdoDimens.Space2))
}

@Composable
private fun OptRow(name: String, desc: String, active: Boolean, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
            .background(if (active) JdoColors.SuccessBg else JdoColors.Bg2)
            .border(1.dp, if (active) JdoColors.Mint else JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusMd))
            .clickable { onClick() }.padding(JdoDimens.Space4),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(name, color = JdoColors.TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Medium)
            Text(desc, color = JdoColors.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 2.dp))
        }
        Box(
            modifier = Modifier.size(22.dp).clip(RoundedCornerShape(11.dp))
                .background(if (active) JdoColors.Mint else Color.Transparent)
                .border(2.dp, if (active) JdoColors.Mint else JdoColors.BorderStrong, RoundedCornerShape(11.dp)),
        )
    }
}

@Composable
private fun SumRow2(label: String, value: String, valueColor: Color = JdoColors.TextPrimary) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp)) {
        Text(label, color = JdoColors.TextSecondary, fontSize = 15.sp)
        Spacer(Modifier.weight(1f))
        Text(value, color = valueColor, fontSize = 15.sp, fontWeight = FontWeight.Medium)
    }
}
