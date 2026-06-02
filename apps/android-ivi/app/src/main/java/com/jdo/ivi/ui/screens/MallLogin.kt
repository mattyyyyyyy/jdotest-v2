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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens

@Composable
fun MallLogin(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var mode by remember { mutableStateOf("qr") }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("登录 JDO 车机商城", onBack = onBack) {
            listOf("qr" to "车机扫码", "phone" to "手机验证码", "carrier" to "车厂账号").forEach { (id, name) ->
                Text(name, color = if (mode == id) JdoColors.Mint else JdoColors.TextMuted, fontSize = 16.sp, fontWeight = if (mode == id) FontWeight.SemiBold else FontWeight.Normal, modifier = Modifier.clickable { mode = id }.padding(horizontal = 10.dp))
            }
        }
        Row(modifier = Modifier.fillMaxSize().padding(JdoDimens.Space6), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space7)) {
            // 左：登录方式
            Column(modifier = Modifier.weight(1f).fillMaxHeight(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                when (mode) {
                    "qr" -> {
                        Text("用手机扫码登录", color = JdoColors.TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Text("打开 JDO / 京东 App 扫码，按手机提示确认", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(vertical = JdoDimens.Space4))
                        Box(modifier = Modifier.size(320.dp).clip(RoundedCornerShape(JdoDimens.RadiusXl)).background(Color.White), contentAlignment = Alignment.Center) {
                            Text("▦ ▦ ▦\n▦   ▦\n▦ ▦ ▦", color = Color(0xFF0A0B0E), fontSize = 56.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("有效期 02:37 · 自动刷新", color = JdoColors.TextMuted, fontSize = 14.sp, modifier = Modifier.padding(top = JdoDimens.Space4))
                    }
                    "phone" -> {
                        Text("用手机号 + 验证码", color = JdoColors.TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Text("已绑定手机号自动关联订单 / 地址 / 优惠券", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(vertical = JdoDimens.Space4))
                        Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).padding(JdoDimens.Space4)) { Text("138 1234 5678", color = JdoColors.TextPrimary, fontSize = 22.sp) }
                        Spacer(Modifier.height(JdoDimens.Space3))
                        Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2)) {
                            listOf("8", "8", "4", "2", "", "").forEach { c ->
                                Box(modifier = Modifier.size(56.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).border(1.dp, if (c.isNotEmpty()) JdoColors.Mint else JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusMd)), contentAlignment = Alignment.Center) { Text(c, color = JdoColors.TextPrimary, fontSize = 24.sp) }
                            }
                        }
                        Text("验证码已发送 · 58s 后重发", color = JdoColors.TextMuted, fontSize = 14.sp, modifier = Modifier.padding(vertical = JdoDimens.Space4))
                        Box(modifier = Modifier.fillMaxWidth().height(70.dp).clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Brand500).clickable { onNav("mall-home", null) }, contentAlignment = Alignment.Center) { Text("登录", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
                    }
                    else -> {
                        Text("用车厂账号一键登录", color = JdoColors.TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        Text("Demo 占位入口，正式上线由各车厂应用市场对接", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(vertical = JdoDimens.Space4))
                        LazyVerticalGrid(columns = GridCells.Fixed(2), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space3), verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3), modifier = Modifier.fillMaxWidth().height(280.dp)) {
                            items(listOf("理想", "小鹏", "蔚来", "问界", "极氪", "智己")) { b ->
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).clickable { onNav("mall-home", null) }.padding(JdoDimens.Space3)) {
                                    Box(modifier = Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(JdoColors.Brand600), contentAlignment = Alignment.Center) { Text(b.take(1), color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold) }
                                    Spacer(Modifier.width(JdoDimens.Space3))
                                    Text("${b}车主", color = JdoColors.TextPrimary, fontSize = 18.sp)
                                }
                            }
                        }
                    }
                }
            }
            // 右：权益
            Column(modifier = Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.Center) {
                Text("欢迎回到 JDO 车机商城", color = JdoColors.TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                Text("登录享车主专属价、行车安全购物，订单手机端同步", color = JdoColors.TextMuted, fontSize = 15.sp, modifier = Modifier.padding(vertical = JdoDimens.Space4))
                listOf(
                    "★" to ("黄金车主直降 95 折" to "车主权益日全场再叠加"),
                    "📍" to ("附近自提 500m 起" to "订单送达车上停车点"),
                    "🚗" to ("行车态安全购物" to "一键再买、免密支付"),
                    "📱" to ("账号多端同步" to "车机 / 手机 / Pad 通用"),
                ).forEach { (ic, td) ->
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.SuccessBg).padding(JdoDimens.Space4)) {
                        Box(modifier = Modifier.size(48.dp).clip(RoundedCornerShape(12.dp)).background(JdoColors.Bg2), contentAlignment = Alignment.Center) { Text(ic, fontSize = 22.sp) }
                        Spacer(Modifier.width(JdoDimens.Space3))
                        Column { Text(td.first, color = JdoColors.TextPrimary, fontSize = 18.sp); Text(td.second, color = JdoColors.TextMuted, fontSize = 14.sp) }
                    }
                }
                Text("✓ 我已阅读并同意《JDO 车机用户协议》与《隐私政策》", color = JdoColors.TextMuted, fontSize = 14.sp, modifier = Modifier.padding(top = JdoDimens.Space3))
            }
        }
    }
}
