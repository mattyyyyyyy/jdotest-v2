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
   11 收货地址 · 21 设置 · 13 登录 · 14 行车态首页
   ============================================================ */

/* ── 11 收货地址 + 自提点 ── */
@Composable
fun MallAddressesScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    data class Addr(val icon: String, val name: String, val tag: String, val addr: String, val def: Boolean)
    var sel by remember { mutableStateOf(0) }
    val addrs = listOf(
        Addr("home","李先生 · 138****6789","家 · 默认","上海市 浦东新区 张江路 1888 弄 6 号", true),
        Addr("company","李先生 · 138****6789","公司","上海市 黄浦区 南京东路 666 号 创智 28F", false),
        Addr("car","当前位置 · 实时定位","车上","浦东张衡路停车场 · A 区 28 号位", false),
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("收货地址", back) { IconBtn("plus") {} }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    addrs.forEachIndexed { i, a ->
                        Column(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(c.bg2.copy(0.55f))
                                .border(if (sel == i) 2.dp else 1.dp, if (sel == i) c.mint else c.borderDefault, RoundedCornerShape(22.dp))
                                .clickable { sel = i }.padding(22.dp), verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(56.dp).clip(RoundedCornerShape(16.dp)).background(c.accent.copy(0.12f)), contentAlignment = Alignment.Center) {
                                    Icon(jdoIcon(a.icon), null, tint = c.mint, modifier = Modifier.size(28.dp))
                                }
                                Spacer(Modifier.width(14.dp))
                                Text(a.name, color = c.textPrimary, fontSize = 24.sp, modifier = Modifier.weight(1f))
                                Text(a.tag, color = if (a.def) c.mint else c.textMuted, fontSize = 16.sp)
                            }
                            Text(a.addr, color = c.textSecondary, fontSize = 20.sp)
                        }
                    }
                }
                // 自提点地图占位
                Box(
                    Modifier.weight(1.1f).fillMaxHeight().clip(RoundedCornerShape(28.dp))
                        .background(c.bg2.copy(0.5f)).border(1.dp, c.borderDefault, RoundedCornerShape(28.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(jdoIcon("location"), null, tint = c.driving, modifier = Modifier.size(64.dp))
                        Spacer(Modifier.height(12.dp))
                        Text("附近自提点 · 500m 内 18 家", color = c.textSecondary, fontSize = 22.sp)
                        Text("基于车辆当前定位 · 地图组件由团队接入", color = c.textMuted, fontSize = 16.sp)
                    }
                }
            }
        }
    }
}

/* ── 21 设置中心 ── */
@Composable
fun MallSettingsScreen(nav: (String) -> Unit, back: () -> Unit, onToggleTheme: () -> Unit) {
    val c = JdoTheme.colors
    val sections = listOf("display" to "主题与显示","driving" to "行车安全","notify" to "通知与声音","account" to "账号与隐私","pay" to "支付与免密","about" to "关于 JDO")
    var sec by remember { mutableStateOf("display") }
    var dark by remember { mutableStateOf(c.isDark) }
    var voice by remember { mutableStateOf(true) }
    var autoPay by remember { mutableStateOf(true) }
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("设置中心", back) { IconBtn("search") {} }
            Row(Modifier.weight(1f).padding(horizontal = 36.dp, vertical = 20.dp), horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                // 左导航
                Column(Modifier.width(260.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    sections.forEach { (id, name) ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp))
                                .background(if (sec == id) c.accent.copy(0.15f) else Color.Transparent)
                                .clickable { sec = id }.padding(18.dp), verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(name, color = if (sec == id) c.mint else c.textSecondary, fontSize = 22.sp,
                                fontWeight = if (sec == id) FontWeight.Medium else FontWeight.Normal)
                        }
                    }
                }
                // 右内容
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                    when (sec) {
                        "display" -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("主题与显示")
                            SettingsSwitch("深色模式", "夜间 / 长时间驾驶推荐", dark) { dark = it; onToggleTheme() }
                            Divider()
                            SettingsSwitch("减少动态效果", "等同 prefers-reduced-motion", false) {}
                        }
                        "driving" -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("行车安全")
                            SettingsSwitch("车速 > 5km/h 自动进入行车态", "来源车厂 JS Bridge", true) {}
                            Divider()
                            SettingsSwitch("行车态优先语音搜索", "唤醒词「你好 JDO」", voice) { voice = it }
                            Divider()
                            SettingsSwitch("行车态隐藏视频 / 自动播放", "符合座舱安全规范", true) {}
                        }
                        "pay" -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("支付与免密")
                            SettingsSwitch("行车态默认免密支付", "单笔 ≤ ¥500 · 每日 ≤ ¥2000", autoPay) { autoPay = it }
                            Divider()
                            SettingsRow("默认支付方式", "JDO 联名卡 **** 4521")
                        }
                        "notify" -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("通知与声音")
                            SettingsSwitch("订单状态推送", "下单 / 发货 / 配送 / 签收", true) {}
                            Divider()
                            SettingsSwitch("物流到车语音播报", "骑手抵达时车机播报", true) {}
                        }
                        "account" -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("账号与隐私")
                            SettingsRow("手机号", "138 **** 6789 · 已实名")
                            Divider()
                            SettingsRow("绑定的车厂账号", "JDO X1 · 黄金车主 Lv.4")
                        }
                        else -> GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            SettingsTitle("关于 JDO")
                            SettingsRow("版本", "v1.0.0 · build 2026.06")
                            Divider()
                            SettingsRow("用户协议 / 隐私政策", "PIPL 合规版本")
                            Spacer(Modifier.height(16.dp))
                            OutlineButton("退出登录", Modifier.fillMaxWidth()) { nav(Routes.MallLogin) }
                        }
                    }
                }
            }
        }
    }
}

@Composable private fun SettingsTitle(t: String) {
    Text(t, color = JdoTheme.colors.textPrimary, fontSize = 28.sp, fontWeight = FontWeight.Medium)
    Spacer(Modifier.height(8.dp))
}

@Composable private fun SettingsRow(label: String, value: String) {
    val c = JdoTheme.colors
    Row(Modifier.fillMaxWidth().padding(vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text(label, color = c.textPrimary, fontSize = 22.sp) }
        Text(value, color = c.textMuted, fontSize = 18.sp)
    }
}

@Composable private fun SettingsSwitch(label: String, desc: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    val c = JdoTheme.colors
    Row(Modifier.fillMaxWidth().padding(vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(label, color = c.textPrimary, fontSize = 22.sp)
            Text(desc, color = c.textMuted, fontSize = 16.sp)
        }
        Box(
            Modifier.width(72.dp).height(40.dp).clip(RoundedCornerShape(9999.dp))
                .background(if (checked) c.mint else c.bg3).clickable { onChange(!checked) }
                .padding(3.dp),
            contentAlignment = if (checked) Alignment.CenterEnd else Alignment.CenterStart,
        ) { Box(Modifier.size(34.dp).clip(CircleShape).background(if (checked) Color(0xFF03171F) else Color(0xFFCBD5E1))) }
    }
}

/* ── 13 登录 ── */
@Composable
fun MallLoginScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var mode by remember { mutableStateOf("qr") }
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("登录 JDO 车机商城", back)
            Row(Modifier.padding(horizontal = 36.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Chip("车机扫码", mode == "qr") { mode = "qr" }
                Chip("手机验证码", mode == "phone") { mode = "phone" }
                Chip("车厂账号", mode == "carrier") { mode = "carrier" }
            }
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                Row(
                    Modifier.fillMaxWidth(0.9f).clip(RoundedCornerShape(40.dp)).background(c.bg2.copy(0.6f))
                        .border(1.dp, c.borderDefault, RoundedCornerShape(40.dp)).padding(56.dp),
                    horizontalArrangement = Arrangement.spacedBy(56.dp),
                ) {
                    Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(24.dp)) {
                        Text("用手机扫码登录", color = c.textPrimary, fontSize = 32.sp, fontWeight = FontWeight.Medium)
                        Box(Modifier.size(380.dp).clip(RoundedCornerShape(28.dp)).background(Color.White), contentAlignment = Alignment.Center) {
                            Box(Modifier.size(84.dp).clip(RoundedCornerShape(18.dp)).background(c.accent), contentAlignment = Alignment.Center) {
                                Text("JD", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 26.sp)
                            }
                        }
                        Text("打开 JDO / 京东 App 扫一扫", color = c.textSecondary, fontSize = 20.sp)
                        PrimaryButton("已扫码，进入商城", Modifier.fillMaxWidth(0.7f)) { nav(Routes.MallHome) }
                    }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("欢迎回到 JDO 车机商城", color = c.textPrimary, fontSize = 32.sp, fontWeight = FontWeight.Medium)
                        listOf("黄金车主直降 95 折","附近自提 500m 起","行车态安全购物","账号多端同步").forEach {
                            Row(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(c.mint.copy(0.06f))
                                    .border(1.dp, c.mint.copy(0.2f), RoundedCornerShape(16.dp)).padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Icon(jdoIcon("star"), null, tint = c.mint, modifier = Modifier.size(24.dp))
                                Spacer(Modifier.width(16.dp))
                                Text(it, color = c.textPrimary, fontSize = 22.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ── 14 行车态首页 ── */
@Composable
fun MallDrivingScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    val repeats = listOf("e4","g1","f5","x3").map { Catalog.byId(it) }
    MallBg {
        Column(Modifier.fillMaxSize()) {
            // 行车态橙色 banner
            Row(
                Modifier.fillMaxWidth().background(Brush.horizontalGradient(listOf(c.driving.copy(0.30f), c.driving.copy(0.05f))))
                    .padding(horizontal = 36.dp, vertical = 18.dp), verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(c.driving.copy(0.2f)), contentAlignment = Alignment.Center) {
                    Icon(jdoIcon("bolt"), null, tint = c.driving, modifier = Modifier.size(24.dp))
                }
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f)) {
                    Text("行车态 · 仅显示常用补给 · 已默认地址与支付", color = c.driving, fontSize = 22.sp)
                    Text("停车后自动恢复完整商城 · 键盘 / 视频已关闭", color = c.textMuted, fontSize = 16.sp)
                }
                Text("23 km/h", color = c.textPrimary, fontSize = 30.sp, fontWeight = FontWeight.SemiBold, style = MonoNumber)
                Spacer(Modifier.width(16.dp))
                OutlineButton("退出行车态") { back() }
            }
            Column(Modifier.weight(1f).padding(36.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Text("早安，李先生 · 想再买点什么？", color = c.textPrimary, fontSize = 36.sp, fontWeight = FontWeight.SemiBold)
                Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                    // 再买一次 2x2
                    Column(Modifier.weight(1.4f), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                        Text("再买一次 · 一键下单", color = c.textPrimary, fontSize = 28.sp, fontWeight = FontWeight.Medium)
                        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                            RepeatCard(repeats[0], Modifier.weight(1f), nav); RepeatCard(repeats[1], Modifier.weight(1f), nav)
                        }
                        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                            RepeatCard(repeats[2], Modifier.weight(1f), nav); RepeatCard(repeats[3], Modifier.weight(1f), nav)
                        }
                    }
                    // 默认信息
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            Text("默认收货地址", color = c.textSecondary, fontSize = 20.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("车上 · 浦东张衡路停车场", color = c.textPrimary, fontSize = 24.sp)
                        }
                        GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            Text("默认支付", color = c.textSecondary, fontSize = 20.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("JDO 联名卡 · 免密 ≤ ¥500", color = c.textPrimary, fontSize = 24.sp)
                        }
                        GlassCard(Modifier.fillMaxWidth().weight(1f), corner = 24.dp) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(44.dp).clip(CircleShape).background(c.accent)) {}
                                Spacer(Modifier.width(14.dp))
                                Text("\"我要买玻璃水\"", color = c.mint, fontSize = 24.sp)
                            }
                            Spacer(Modifier.height(12.dp))
                            Text("长按方向盘语音键说出商品名", color = c.textMuted, fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RepeatCard(p: com.jdo.ivi.data.Product, modifier: Modifier, nav: (String) -> Unit) {
    val c = JdoTheme.colors
    Row(
        modifier.clip(RoundedCornerShape(28.dp)).background(c.bg2.copy(0.65f))
            .border(1.5.dp, c.borderDefault, RoundedCornerShape(28.dp)).clickable { nav(Routes.MallPay) },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        AsyncImage(p.img, null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxHeight().width(160.dp))
        Column(Modifier.weight(1f).padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(p.title, color = c.textPrimary, fontSize = 26.sp, maxLines = 2)
            Row(
                Modifier.clip(RoundedCornerShape(18.dp)).background(Brush.horizontalGradient(listOf(c.driving, Color(0xFFEA580C))))
                    .padding(horizontal = 22.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(jdoIcon("bolt"), null, tint = Color(0xFF1A0A00), modifier = Modifier.size(22.dp))
                Spacer(Modifier.width(8.dp))
                Text("一键再买 · ¥${fmtPrice(p.price)}", color = Color(0xFF1A0A00), fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
