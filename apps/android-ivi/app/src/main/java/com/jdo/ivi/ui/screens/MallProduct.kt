package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber
import com.jdo.ivi.ui.theme.RadiusLg

/* ============================================================
   05 商品详情 · 15 商品评价
   ============================================================ */

@Composable
fun MallDetailScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    val p = Catalog.byId("g1")
    val thumbs = listOf(p.img) + Catalog.byScene(p.scene).filter { it.id != p.id }.take(3).map { it.img }
    var thumb by remember { mutableStateOf(0) }
    var size by remember { mutableStateOf("M") }
    var qty by remember { mutableStateOf(1) }

    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("商品详情", back) { IconBtn("cart", "3") { nav(Routes.MallCart) } }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                // 左：图
                Column(Modifier.weight(1.25f)) {
                    AsyncImage(
                        thumbs[thumb], p.title, contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(28.dp)),
                    )
                    Spacer(Modifier.height(18.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        thumbs.forEachIndexed { i, src ->
                            AsyncImage(
                                src, null, contentScale = ContentScale.Crop,
                                modifier = Modifier.size(120.dp).clip(RoundedCornerShape(18.dp))
                                    .border(if (thumb == i) 2.dp else 1.dp, if (thumb == i) c.mint else c.borderDefault, RoundedCornerShape(18.dp))
                                    .clickable { thumb = i },
                            )
                        }
                    }
                }
                // 右：信息
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    Text(p.title, color = c.textPrimary, fontSize = 36.sp, fontWeight = FontWeight.Medium, lineHeight = 44.sp)
                    Text("京东自营 · JDO 直配 · 7 天无忧退换", color = c.textSecondary, fontSize = 20.sp)
                    // 价格条
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp))
                            .background(c.error.copy(0.08f)).border(1.dp, c.error.copy(0.2f), RoundedCornerShape(20.dp))
                            .padding(24.dp), verticalAlignment = Alignment.Bottom,
                    ) {
                        Text("¥", color = c.error, fontSize = 30.sp, style = MonoNumber)
                        Text(fmtPrice(p.price), color = c.error, fontSize = 56.sp, style = MonoNumber)
                        if (p.ori != null) {
                            Spacer(Modifier.width(16.dp))
                            Text("¥${fmtPrice(p.ori)}", color = c.textMuted, fontSize = 22.sp, style = MonoNumber)
                        }
                    }
                    // 规格
                    Text("规格", color = c.textSecondary, fontSize = 20.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        listOf("S", "M", "L", "XL").forEach { s ->
                            SpecOpt(s, size == s) { size = s }
                        }
                    }
                    // 数量
                    Text("数量 · 库存 86 件", color = c.textSecondary, fontSize = 20.sp)
                    Row(
                        Modifier.clip(RoundedCornerShape(16.dp)).background(c.bg2.copy(0.5f))
                            .border(1.dp, c.borderDefault, RoundedCornerShape(16.dp)),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        StepBtn("chevL") { if (qty > 1) qty-- }
                        Text("$qty", color = c.textPrimary, fontSize = 24.sp, style = MonoNumber,
                            modifier = Modifier.widthIn(min = 72.dp), )
                        StepBtn("plus") { qty++ }
                    }
                    Spacer(Modifier.weight(1f))
                    Text("车主评价 4.9 · 查看 2136 条 →", color = c.mint, fontSize = 20.sp,
                        modifier = Modifier.clickable { nav(Routes.MallReviews) })
                    // CTA
                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        OutlineButton("加入购物车", Modifier.weight(1f)) { nav(Routes.MallCart) }
                        PrimaryButton("立即购买", Modifier.weight(1f)) { nav(Routes.MallCheckout) }
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecOpt(label: String, active: Boolean, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Box(
        Modifier.heightIn(min = 56.dp).clip(RoundedCornerShape(16.dp))
            .background(if (active) c.accent.copy(0.15f) else c.bg2.copy(0.5f))
            .border(1.dp, if (active) c.accent.copy(0.5f) else c.borderDefault, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick).padding(horizontal = 28.dp),
        contentAlignment = Alignment.Center,
    ) { Text(label, color = if (active) c.mint else c.textPrimary, fontSize = 20.sp) }
}

@Composable
private fun StepBtn(icon: String, onClick: () -> Unit) {
    Box(Modifier.size(56.dp).clickable(onClick = onClick), contentAlignment = Alignment.Center) {
        Icon(jdoIcon(icon), null, tint = JdoTheme.colors.textPrimary, modifier = Modifier.size(22.dp))
    }
}

/* ── 15 商品评价 ── */
@Composable
fun MallReviewsScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    data class Rv(val name: String, val stars: Int, val content: String, val likes: Int)
    val reviews = listOf(
        Rv("李***生", 5, "夏天车里一打开就是淡淡的木香，没有酒精的冲鼻感，车主党狂喜！", 184),
        Rv("张**", 5, "回购第 4 次了，副驾后排都各放一个。挂车机上提示常买直接 1 秒下单。", 96),
        Rv("M***ty", 4, "味道很好但持久度比预期略短，客服给了张 ¥20 券，比较满意。", 28),
    )
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("车主评价", back) { IconBtn("cart", "3") { nav(Routes.MallCart) } }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                GlassCard(Modifier.width(340.dp), corner = 28.dp) {
                    Text("综合评分", color = c.textSecondary, fontSize = 18.sp)
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text("4.9", color = c.textPrimary, fontSize = 72.sp, fontWeight = FontWeight.SemiBold)
                        Text(" / 5.0", color = c.textMuted, fontSize = 24.sp)
                    }
                    Row { repeat(5) { Icon(jdoIcon("star"), null, tint = Color(0xFFF59E0B), modifier = Modifier.size(24.dp)) } }
                    Spacer(Modifier.height(8.dp))
                    Text("共 2136 条 · 98% 推荐", color = c.textMuted, fontSize = 16.sp)
                }
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    reviews.forEach { r ->
                        GlassCard(Modifier.fillMaxWidth(), corner = 24.dp) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AvatarBadge(r.name.first().toString(), 52.dp)
                                Spacer(Modifier.width(14.dp))
                                Text(r.name, color = c.textPrimary, fontSize = 22.sp, modifier = Modifier.weight(1f))
                                Row { repeat(r.stars) { Icon(jdoIcon("star"), null, tint = Color(0xFFF59E0B), modifier = Modifier.size(20.dp)) } }
                            }
                            Spacer(Modifier.height(12.dp))
                            Text(r.content, color = c.textPrimary, fontSize = 22.sp, lineHeight = 32.sp)
                            Spacer(Modifier.height(12.dp))
                            Text("有用 · ${r.likes}", color = c.textMuted, fontSize = 18.sp)
                        }
                    }
                }
            }
        }
    }
}
