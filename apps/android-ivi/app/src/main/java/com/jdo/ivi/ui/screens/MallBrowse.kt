package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.AppState
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.ui.components.*
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme

/* ============================================================
   03 分类/搜索结果 · 04 搜索 · 19 收藏 & 浏览历史
   ============================================================ */

/* ── 03 分类结果（场景 rail + 排序 + 网格）── */
@Composable
fun MallCategoryScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var scene by remember { mutableStateOf("energy") }
    var sort by remember { mutableStateOf("rec") }
    var list = Catalog.byScene(scene)
    list = when (sort) {
        "price-asc" -> list.sortedBy { it.price }
        "price-desc" -> list.sortedByDescending { it.price }
        "sales" -> list.sortedByDescending { it.sold }
        else -> list
    }
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar(Catalog.scenes.first { it.id == scene }.name, back) {
                IconBtn("cart", "3") { nav(Routes.MallCart) }
            }
            Row(Modifier.fillMaxSize()) {
                NavRail(scene, { scene = it })
                Column(Modifier.weight(1f).padding(horizontal = 32.dp, vertical = 20.dp)) {
                    // 排序栏
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        SortItem("综合", sort == "rec") { sort = "rec" }
                        Spacer(Modifier.width(28.dp))
                        SortItem("销量", sort == "sales") { sort = "sales" }
                        Spacer(Modifier.width(28.dp))
                        SortItem("价格 ↑", sort == "price-asc") { sort = "price-asc" }
                        Spacer(Modifier.width(28.dp))
                        SortItem("价格 ↓", sort == "price-desc") { sort = "price-desc" }
                        Spacer(Modifier.weight(1f))
                        Text("共 ${list.size} 件 · 自营优先", color = c.textMuted, fontSize = 18.sp)
                    }
                    Spacer(Modifier.height(16.dp))
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(4),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        items(list, key = { it.id }) { p -> ProductCard(p) { nav(Routes.MallDetail) } }
                    }
                }
            }
        }
    }
}

@Composable
private fun SortItem(label: String, active: Boolean, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Text(
        label, color = if (active) c.mint else c.textSecondary,
        fontSize = 22.sp, fontWeight = FontWeight.SemiBold,
        modifier = Modifier.clickable(onClick = onClick),
    )
}

/* ── 04 搜索（热词 + 历史 + 实时联想）── */
@Composable
fun MallSearchScreen(nav: (String) -> Unit, back: () -> Unit) {
    val c = JdoTheme.colors
    var q by remember { mutableStateOf("玻璃水") }
    val hots = listOf("玻璃水", "车载香薰", "行车记录仪", "车充 100W", "车载吸尘器", "降噪耳机", "行车零食", "TPE 脚垫")
    val history = listOf("玻璃水 6 瓶", "充电桩 速锐", "车载香薰", "蓝牙音箱", "冬季睡袋", "后视镜防眩光")
    val sugg = Catalog.products.filter { it.scene == "energy" || it.scene == "gear" }.take(6)
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("搜索", back) { IconBtn("cart", "3") { nav(Routes.MallCart) } }
            Row(Modifier.weight(1f).padding(36.dp), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                Column(Modifier.weight(1.4f)) {
                    SectionBar("\"$q\" 实时建议", "${sugg.size} 个匹配")
                    Spacer(Modifier.height(14.dp))
                    sugg.forEach { p ->
                        GlassCard(Modifier.fillMaxWidth().padding(bottom = 10.dp), corner = 16.dp,
                            padding = PaddingValues(horizontal = 20.dp, vertical = 16.dp)) {
                            Row(
                                Modifier.fillMaxWidth().clickable {
                                    AppState.detailId = p.id
                                    nav(Routes.MallDetail)
                                },
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(p.title, color = c.textPrimary, fontSize = 20.sp, modifier = Modifier.weight(1f))
                                Text("¥${fmtPrice(p.price)}", color = c.mint, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
                Column(Modifier.weight(1f)) {
                    SectionBar("车主热搜榜", "24h 内")
                    Spacer(Modifier.height(14.dp))
                    Row(Modifier.horizontalScroll(rememberScrollState())) {}
                    FlowChips(hots) { q = it }
                    Spacer(Modifier.height(28.dp))
                    SectionBar("历史搜索")
                    Spacer(Modifier.height(14.dp))
                    FlowChips(history) { q = it }
                }
            }
        }
    }
}

@Composable
private fun FlowChips(items: List<String>, onClick: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { Chip(it) { onClick(it) } }
            }
        }
    }
}

/* ── 19 收藏 & 浏览历史 ── */
@Composable
fun MallFavoritesScreen(nav: (String) -> Unit, back: () -> Unit) {
    var tab by remember { mutableStateOf("fav") }
    val favs = Catalog.products.take(12)
    MallBg {
        Column(Modifier.fillMaxSize()) {
            StatusBar()
            SubBar("收藏 & 浏览历史", back) { IconBtn("search") {} }
            Row(Modifier.padding(horizontal = 36.dp, vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Chip("我的收藏 ${favs.size}", tab == "fav") { tab = "fav" }
                Chip("浏览记录 108", tab == "hist") { tab = "hist" }
            }
            LazyVerticalGrid(
                columns = GridCells.Fixed(5),
                modifier = Modifier.weight(1f).padding(horizontal = 36.dp),
                horizontalArrangement = Arrangement.spacedBy(18.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp),
            ) {
                items(favs, key = { it.id }) { p -> ProductCard(p) { nav(Routes.MallDetail) } }
            }
            Spacer(Modifier.height(20.dp))
        }
    }
}
