package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber

/* ============================================================
   10 我的 · 20 钱包 · 16 积分 · 12 优惠券
   ============================================================ */

@Composable
fun MallProfileScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    data class Tile(val icon: String, val label: String, val route: String)
    val orderTiles = listOf(
        Tile("package","待付款",Routes.MallOrders), Tile("package","待发货",Routes.MallOrders),
        Tile("package","待收货",Routes.MallTracking), Tile("star","待评价",Routes.MallReviews),
        Tile("back","退换/售后",Routes.MallAftersale),
    )
    val services = listOf(
        Tile("star","我的收藏",Routes.MallFavorites), Tile("search","浏览记录",Routes.MallFavorites),
        Tile("bolt","优惠券",Routes.MallCoupons), Tile("sparkles","积分商城",Routes.MallPoints),
        Tile("package","车主钱包",Routes.MallWallet), Tile("location","收货地址",Routes.MallAddresses),
    )
    val menu = listOf(
        Tile("location","收货地址",Routes.MallAddresses), Tile("car","我的车辆",Routes.MallSettings),
        Tile("settings","行车安全",Routes.MallDriving), Tile("settings","主题与显示",Routes.MallSettings),
        Tile("phone","帮助与客服",Routes.MallSettings),
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("我的", back) { IconBtn("settings") { nav(Routes.MallSettings) } }
            Row(Modifier.weight(1f).padding(36.dp).verticalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                Column(Modifier.weight(1.2f), verticalArrangement = Arrangement.spacedBy(22.dp)) {
                    // 头部
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp))
                            .background(Brush.linearGradient(listOf(c.accent.copy(0.15f), Color(0xFF26325A).copy(0.2f))))
                            .border(1.dp, c.mint.copy(0.2f), RoundedCornerShape(28.dp)).padding(32.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        AvatarBadge("李", 120.dp)
                        Spacer(Modifier.width(24.dp))
                        Column(Modifier.weight(1f)) {
                            Text("李先生", color = c.textPrimary, fontSize = 36.sp, fontWeight = FontWeight.Medium)
                            Spacer(Modifier.height(6.dp))
                            Text("黄金车主 · Lv.4 · JDO X1 沪A·1234", color = c.gold, fontSize = 18.sp)
                        }
                        listOf("42" to "订单","8248" to "积分","6" to "券").forEach { (n, l) ->
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(start = 24.dp)) {
                                Text(n, color = c.textPrimary, fontSize = 30.sp, style = MonoNumber)
                                Text(l, color = c.textMuted, fontSize = 16.sp)
                            }
                        }
                    }
                    // 我的订单
                    ProfileSection("我的订单") {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                            orderTiles.forEach { t -> ProfileTile(t.icon, t.label) { nav(t.route) } }
                        }
                    }
                    // 常用服务
                    ProfileSection("常用服务") {
                        LazyVerticalGrid(columns = GridCells.Fixed(3), modifier = Modifier.height(180.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(services) { t -> ProfileTile(t.icon, t.label) { nav(t.route) } }
                        }
                    }
                }
                // 设置列表
                Column(Modifier.weight(1f)) {
                    ProfileSection("设置与服务") {
                        menu.forEach { t ->
                            Row(
                                Modifier.fillMaxWidth().clickable { nav(t.route) }.padding(vertical = 18.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(c.bg3.copy(0.6f)), contentAlignment = Alignment.Center) {
                                    Icon(jdoIcon(t.icon), null, tint = c.textSecondary, modifier = Modifier.size(22.dp))
                                }
                                Spacer(Modifier.width(16.dp))
                                Text(t.label, color = c.textPrimary, fontSize = 22.sp, modifier = Modifier.weight(1f))
                                Icon(jdoIcon("chevR"), null, tint = c.textMuted, modifier = Modifier.size(20.dp))
                            }
                            Divider()
                        }
                    }
                    Spacer(Modifier.height(20.dp))
                    OutlineButton("退出登录 · 切换账号", Modifier.fillMaxWidth()) { nav(Routes.MallLogin) }
                }
            }
        }
    }
}

@Composable
private fun ProfileSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
        Text(title, color = JdoTheme.colors.textPrimary, fontSize = 24.sp, fontWeight = FontWeight.Medium)
        Spacer(Modifier.height(18.dp))
        content()
    }
}

@Composable
private fun ProfileTile(icon: String, label: String, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Column(
        Modifier.clip(RoundedCornerShape(16.dp)).clickable(onClick = onClick).padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(Modifier.size(56.dp).clip(RoundedCornerShape(16.dp)).background(c.mint.copy(0.10f)), contentAlignment = Alignment.Center) {
            Icon(jdoIcon(icon), null, tint = c.mint, modifier = Modifier.size(28.dp))
        }
        Spacer(Modifier.height(8.dp))
        Text(label, color = c.textSecondary, fontSize = 18.sp)
    }
}

/* ── 20 钱包 ── */
@Composable
fun MallWalletScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    data class Txn(val name: String, val meta: String, val amt: Double, val time: String)
    val txns = listOf(
        Txn("订单支付 · JDO...887462","3 件商品 · 京东自营",-234.78,"今天 09:24"),
        Txn("退款入账 · JDO...880102","退货退款",268.0,"今天 08:12"),
        Txn("充电桩 · 浦东华业","快充 47kWh",-42.30,"昨天 15:48"),
        Txn("签到奖励 · 第 12 天","连续签到",2.0,"昨天 09:00"),
        Txn("加油 · 中石化 张江","95# 38.6L",-286.41,"5/20 22:14"),
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("车主钱包", back) { IconBtn("settings") {} }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                Column(Modifier.weight(1.2f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(22.dp)) {
                    Box(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp))
                            .background(Brush.linearGradient(listOf(Color(0xFF0C1832), Color(0xFF1E3A8A), Color(0xFF06B6D4)))).padding(32.dp),
                    ) {
                        Column {
                            Text("车主钱包余额", color = Color.White.copy(0.85f), fontSize = 20.sp)
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text("¥", color = Color.White.copy(0.8f), fontSize = 36.sp, style = MonoNumber)
                                Text("234.50", color = Color.White, fontSize = 72.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                            }
                            Text("JDO 联名卡 **** 4521 · 累计消费 ¥ 12 480", color = Color.White.copy(0.85f), fontSize = 18.sp)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        listOf("plus" to "充值","back" to "提现","sparkles" to "兑积分","bolt" to "充电加油").forEach { (ic, nm) ->
                            GlassCard(Modifier.weight(1f), corner = 22.dp, padding = PaddingValues(vertical = 18.dp)) {
                                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Icon(jdoIcon(ic), null, tint = c.mint, modifier = Modifier.size(28.dp))
                                        Spacer(Modifier.height(10.dp))
                                        Text(nm, color = c.textPrimary, fontSize = 18.sp)
                                    }
                                }
                            }
                        }
                    }
                }
                Column(
                    Modifier.weight(1f).clip(RoundedCornerShape(24.dp)).background(c.bg2.copy(0.6f))
                        .border(1.dp, c.borderDefault, RoundedCornerShape(24.dp)).padding(28.dp).verticalScroll(rememberScrollState()),
                ) {
                    Text("交易明细 · 近 30 天", color = c.textPrimary, fontSize = 24.sp, fontWeight = FontWeight.Medium)
                    Spacer(Modifier.height(12.dp))
                    txns.forEach { t ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(t.name, color = c.textPrimary, fontSize = 20.sp)
                                Text(t.meta, color = c.textMuted, fontSize = 15.sp)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text((if (t.amt > 0) "+ ¥ " else "− ¥ ") + "%.2f".format(kotlin.math.abs(t.amt)),
                                    color = if (t.amt > 0) c.success else c.textPrimary, fontSize = 22.sp, style = MonoNumber)
                                Text(t.time, color = c.textMuted, fontSize = 14.sp, style = MonoNumber)
                            }
                        }
                        Divider()
                    }
                }
            }
        }
    }
}

/* ── 16 积分商城 ── */
@Composable
fun MallPointsScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("积分商城 · 黄金车主双倍积分", back)
            Column(Modifier.weight(1f).padding(36.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                Box(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp))
                        .background(Brush.linearGradient(listOf(Color(0xFFD6BC8A), Color(0xFFA07D3C)))).padding(32.dp),
                ) {
                    Column {
                        Text("JDO 车主积分", color = Color(0xFF2A1D05).copy(0.85f), fontSize = 20.sp)
                        Text("8 248", color = Color(0xFF2A1D05), fontSize = 96.sp, fontWeight = FontWeight.Bold, style = MonoNumber)
                        Text("本周 +142 · 距铂金 1752 分", color = Color(0xFF2A1D05).copy(0.85f), fontSize = 18.sp)
                    }
                }
                SectionBar("兑换好物", "积分 + 现金任选")
                LazyVerticalGrid(columns = GridCells.Fixed(4), modifier = Modifier.height(640.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    items(Catalog.products.take(8), key = { it.id }) { p ->
                        Column(Modifier.clip(RoundedCornerShape(20.dp)).background(c.bg2.copy(0.5f))) {
                            AsyncImage(p.img, null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxWidth().aspectRatio(4f/3f))
                            Column(Modifier.padding(14.dp)) {
                                Text(p.title, color = c.textPrimary, fontSize = 18.sp, maxLines = 2)
                                Spacer(Modifier.height(6.dp))
                                Text("${(p.price * 100).toInt()} 积分", color = c.gold, fontSize = 22.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ── 12 优惠券 ── */
@Composable
fun MallCouponsScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var tab by remember { mutableStateOf("avail") }
    data class Coupon(val amt: Int, val min: String, val name: String, val expire: String, val tone: Color)
    val coupons = listOf(
        Coupon(50,"满 299 可用","车主权益日通用券","5/31 到期", c.error),
        Coupon(20,"满 99 可用","车品类目优惠券","5/30 到期", c.mint),
        Coupon(30,"满 199 可用","黄金车主专享券","6/15 到期", c.gold),
        Coupon(100,"满 999 可用","大件直降券","6/30 到期", c.mint),
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("优惠券中心 · JDO 黄金车主", back)
            Row(Modifier.padding(horizontal = 36.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Chip("可使用 ${coupons.size}", tab == "avail") { tab = "avail" }
                Chip("即将过期 3", tab == "soon") { tab = "soon" }
                Chip("已使用 / 过期", tab == "used") { tab = "used" }
            }
            LazyVerticalGrid(columns = GridCells.Fixed(2), modifier = Modifier.weight(1f).padding(horizontal = 36.dp),
                horizontalArrangement = Arrangement.spacedBy(20.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                items(coupons) { cp ->
                    Row(
                        Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(24.dp))
                            .background(c.bg2.copy(0.55f)).border(1.dp, c.borderDefault, RoundedCornerShape(24.dp)),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(
                            Modifier.width(200.dp).fillMaxHeight().background(cp.tone.copy(0.18f)),
                            horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                        ) {
                            Row(verticalAlignment = Alignment.Top) {
                                Text("¥", color = cp.tone, fontSize = 28.sp, style = MonoNumber)
                                Text("${cp.amt}", color = cp.tone, fontSize = 64.sp, fontWeight = FontWeight.Bold, style = MonoNumber)
                            }
                            Text(cp.min, color = c.textSecondary, fontSize = 16.sp)
                        }
                        Column(Modifier.weight(1f).padding(24.dp)) {
                            Text(cp.name, color = c.textPrimary, fontSize = 24.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("⏰ ${cp.expire}", color = c.textMuted, fontSize = 16.sp, style = MonoNumber)
                        }
                        PrimaryButton("去使用", Modifier.padding(end = 20.dp)) { nav(Routes.MallCategory) }
                    }
                }
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}
