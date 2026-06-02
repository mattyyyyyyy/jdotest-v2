package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlinx.coroutines.delay

@Composable
fun MallPay(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var method by remember { mutableStateOf("qrcode") }
    var seconds by remember { mutableIntStateOf(180) }
    LaunchedEffect(Unit) {
        while (seconds > 0) { delay(1000); seconds-- }
    }
    val mm = (seconds / 60).toString().padStart(2, '0')
    val ss = (seconds % 60).toString().padStart(2, '0')
    val methods = listOf("qrcode" to "车机扫码", "wechat" to "微信支付", "alipay" to "支付宝", "unionpay" to "银联云闪付", "card" to "车厂联名卡")

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("扫码支付", onBack = onBack)
        Row(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space7), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space7)) {
            // 二维码
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(top = JdoDimens.Space5)) {
                Box(
                    modifier = Modifier.size(360.dp).clip(RoundedCornerShape(JdoDimens.RadiusXl)).background(Color.White),
                    contentAlignment = Alignment.Center,
                ) {
                    // 简易二维码占位：网格 + JD logo
                    Text("▦▦▦\n▦  ▦\n▦▦▦", color = Color(0xFF0A0B0E), fontSize = 64.sp, fontWeight = FontWeight.Bold)
                    Box(modifier = Modifier.size(56.dp).clip(RoundedCornerShape(12.dp)).background(JdoColors.Brand500), contentAlignment = Alignment.Center) {
                        Text("JD", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Text("打开手机 App 扫码确认支付", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(top = JdoDimens.Space4))
            }
            // 信息
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(56.dp).clip(RoundedCornerShape(16.dp)).background(JdoColors.SuccessBg), contentAlignment = Alignment.Center) { Text("📦", fontSize = 26.sp) }
                    Spacer(Modifier.width(JdoDimens.Space4))
                    Column {
                        Text("订单号 · JDO20260526887462", color = JdoColors.TextSecondary, fontSize = 17.sp)
                        Text("3 件商品 · 京东快递·张江店 自提", color = JdoColors.TextMuted, fontSize = 14.sp)
                    }
                }
                Spacer(Modifier.height(JdoDimens.Space5))
                Text("应付金额", color = JdoColors.TextSecondary, fontSize = 16.sp)
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("¥", color = JdoColors.Mint, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text("234.78", color = JdoColors.Mint, fontSize = 48.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(JdoDimens.Space4))
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.WarnBg).padding(horizontal = JdoDimens.Space4, vertical = 8.dp)) {
                    Box(Modifier.size(8.dp).clip(RoundedCornerShape(4.dp)).background(JdoColors.Warn))
                    Spacer(Modifier.width(8.dp))
                    Text("等待手机扫码支付 · 剩余 $mm:$ss", color = JdoColors.Warn, fontSize = 15.sp)
                }
                Spacer(Modifier.height(JdoDimens.Space5))
                Text("切换支付方式", color = JdoColors.TextSecondary, fontSize = 15.sp)
                Spacer(Modifier.height(JdoDimens.Space2))
                Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2)) {
                    methods.forEach { (id, name) ->
                        val active = id == method
                        Box(
                            modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusMd))
                                .background(if (active) JdoColors.SuccessBg else JdoColors.Bg2)
                                .border(1.dp, if (active) JdoColors.Mint else JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusMd))
                                .clickable { method = id }.padding(horizontal = JdoDimens.Space3, vertical = 10.dp),
                        ) { Text(name, color = if (active) JdoColors.Mint else JdoColors.TextSecondary, fontSize = 14.sp) }
                    }
                }
                Spacer(Modifier.height(JdoDimens.Space5))
                Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4)) {
                    BigBtn2("取消支付", JdoColors.Bg3, JdoColors.TextPrimary, Modifier.weight(1f)) { onNav("mall-checkout", null) }
                    BigBtn2("我已支付 →", JdoColors.Brand500, Color.White, Modifier.weight(1f)) { onNav("mall-orders", null) }
                }
                Text("行车安全：车机不输密码，支付走手机扫码 / 免密协议", color = JdoColors.TextMuted, fontSize = 13.sp, modifier = Modifier.padding(top = JdoDimens.Space3))
            }
        }
    }
}

@Composable
private fun BigBtn2(text: String, bg: Color, fg: Color, modifier: Modifier, onClick: () -> Unit) {
    Box(modifier = modifier.height(60.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(bg).clickable { onClick() }, contentAlignment = Alignment.Center) {
        Text(text, color = fg, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
}
