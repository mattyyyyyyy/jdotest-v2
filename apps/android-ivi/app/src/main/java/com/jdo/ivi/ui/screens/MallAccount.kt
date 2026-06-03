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
import com.jdo.ivi.data.UserState
import com.jdo.ivi.data.imageModel
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
    LaunchedEffect(Unit) { UserState.load() } // 进入即刷新：后台改积分/券/收藏，退回再进即同步
    data class Tile(val icon: String, val label: String, val route: String)
    val orderTiles = listOf(
        Tile("package","待付款",Routes.MallOrders), Tile("package","待发货",Routes.MallOrders),
        Tile("package","待收货",Routes.MallTracking), Tile("star","待评价",Routes.MallReviews),
        Tile("back","退换/售后",Routes.MallAftersale),
    )
    // 只保留接得上后端的入口（积分商城/车主钱包/浏览记录/我的车辆/帮助与客服 无后端，已删）
    val services = listOf(
        Tile("star","我的收藏",Routes.MallFavorites),
        Tile("bolt","优惠券",Routes.MallCoupons),
        Tile("location","收货地址",Routes.MallAddresses),
    )
    val menu = listOf(
        Tile("location","收货地址",Routes.MallAddresses),
        Tile("settings","行车安全",Routes.MallDriving),
        Tile("settings","主题与显示",Routes.MallSettings),
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
                        AvatarBadge(UserState.name.take(1), 120.dp)
                        Spacer(Modifier.width(24.dp))
                        Column(Modifier.weight(1f)) {
                            Text(UserState.name, color = c.textPrimary, fontSize = 36.sp, fontWeight = FontWeight.Medium)
                            Spacer(Modifier.height(6.dp))
                            Text(if (UserState.phone.isNotBlank()) "JDO 车主 · ${UserState.phone}" else "JDO 车主", color = c.gold, fontSize = 18.sp)
                        }
                        listOf(
                            UserState.orderCount.toString() to "订单",
                            UserState.points.toString() to "积分",
                            UserState.coupons.size.toString() to "券",
                        ).forEach { (n, l) ->
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
                    OutlineButton("退出登录 · 切换账号") { nav(Routes.MallLogin) }
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

/* ── 12 优惠券（接后端 /coupons：后台建的真实券）── */
@Composable
fun MallCouponsScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    val coupons = UserState.coupons // 后台「营销-优惠券」建的真实可领券
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("优惠券中心 · 可领 ${coupons.size} 张", back)
            if (coupons.isEmpty()) {
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text("暂无可领优惠券（后台「营销 / 优惠券」新增即同步）", color = c.textMuted, fontSize = 20.sp)
                }
            } else {
                // 居中的 FlowRow：少量券时不黏顶、不留大片空白
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                  FlowRow(Modifier.padding(36.dp), horizontalArrangement = Arrangement.spacedBy(20.dp), verticalArrangement = Arrangement.spacedBy(20.dp), maxItemsInEachRow = 2) {
                    coupons.forEach { cp ->
                        val tone = if (cp.type == "discount") c.gold else c.error
                        // fixed: amount 是满减「分」；discount: amount = 折数*10（95=9.5折）
                        val big = if (cp.type == "discount") "${cp.amount / 10.0}".trimEnd('0').trimEnd('.') else "${cp.amount / 100}"
                        val unit = if (cp.type == "discount") "折" else "¥"
                        val min = if (cp.threshold > 0) "满 ${cp.threshold / 100} 可用" else "无门槛"
                        Row(
                            Modifier.width(560.dp).height(190.dp).clip(RoundedCornerShape(24.dp))
                                .background(c.bg2.copy(0.55f)).border(1.dp, c.borderDefault, RoundedCornerShape(24.dp)),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column(
                                Modifier.width(200.dp).fillMaxHeight().background(tone.copy(0.18f)),
                                horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                            ) {
                                Row(verticalAlignment = Alignment.Top) {
                                    if (unit == "¥") Text("¥", color = tone, fontSize = 28.sp, style = MonoNumber)
                                    Text(big, color = tone, fontSize = 64.sp, fontWeight = FontWeight.Bold, style = MonoNumber)
                                    if (unit == "折") Text("折", color = tone, fontSize = 28.sp)
                                }
                                Text(min, color = c.textSecondary, fontSize = 16.sp)
                            }
                            Column(Modifier.weight(1f).padding(24.dp)) {
                                Text(cp.name, color = c.textPrimary, fontSize = 24.sp, maxLines = 2)
                                Spacer(Modifier.height(8.dp))
                                Text("剩 ${cp.stock} 张", color = c.textMuted, fontSize = 16.sp, style = MonoNumber)
                            }
                            PrimaryButton("去使用", Modifier.padding(end = 20.dp)) { nav(Routes.MallCategory) }
                        }
                    }
                  }
                }
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}
