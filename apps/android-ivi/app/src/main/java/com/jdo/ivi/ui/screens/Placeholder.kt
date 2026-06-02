package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.ui.components.Chip
import com.jdo.ivi.ui.theme.JdoColors

private val LABELS = mapOf(
    "mall-search" to "搜索", "mall-pay" to "扫码支付", "mall-orders" to "我的订单",
    "mall-profile" to "我的", "mall-addresses" to "收货地址", "mall-coupons" to "优惠券中心",
    "mall-login" to "登录", "mall-driving" to "行车态首页", "mall-reviews" to "商品评价",
    "mall-points" to "积分商城", "mall-aftersale" to "售后服务", "mall-tracking" to "物流详情",
    "mall-favorites" to "收藏 & 历史", "mall-wallet" to "车主钱包", "mall-settings" to "设置中心",
)

@Composable
fun Placeholder(route: String, onBack: () -> Unit, onHome: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(JdoColors.Bg0).padding(40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(LABELS[route] ?: route, color = JdoColors.TextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Bold)
        Text("该屏原生化中 · 即将复刻 web", color = JdoColors.TextMuted, fontSize = 18.sp, modifier = Modifier.padding(top = 12.dp, bottom = 28.dp))
        androidx.compose.foundation.layout.Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Chip("‹ 返回", JdoColors.Bg2, JdoColors.TextPrimary) { onBack() }
            Chip("回商城首页", JdoColors.Brand500, androidx.compose.ui.graphics.Color.White) { onHome() }
        }
    }
}
