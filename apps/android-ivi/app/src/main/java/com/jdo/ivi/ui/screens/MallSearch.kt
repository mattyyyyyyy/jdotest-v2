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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.ApiProduct
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.components.ProductImage
import com.jdo.ivi.ui.components.SubBar
import com.jdo.ivi.ui.components.yuan
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import kotlin.concurrent.thread

@Composable
fun MallSearch(onNav: (String, String?) -> Unit, onBack: () -> Unit) {
    var all by remember { mutableStateOf<List<ApiProduct>>(emptyList()) }
    var q by remember { mutableStateOf("") }

    LaunchedEffect(Unit) { thread { all = NetworkClient.fetchBootstrap().products } }

    val hots = listOf("玻璃水", "车载香薰", "行车记录仪", "车充", "车载吸尘器", "降噪耳机", "脚垫", "充电桩", "油卡", "保养")
    val history = listOf("玻璃水", "充电桩", "车载香薰", "蓝牙音箱", "后视镜", "脚垫")
    val results = if (q.isNotBlank()) all.filter { it.title.contains(q) || it.cat.contains(q) } else emptyList()

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        SubBar("搜索", onBack = onBack) {
            com.jdo.ivi.ui.components.Chip("🛒", JdoColors.Bg2, JdoColors.TextPrimary) { onNav("mall-cart", null) }
        }
        // 搜索框
        Row(modifier = Modifier.fillMaxWidth().padding(JdoDimens.Space5), verticalAlignment = Alignment.CenterVertically) {
            Row(
                modifier = Modifier.weight(1f).clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Bg2)
                    .border(1.dp, JdoColors.BorderDefault, RoundedCornerShape(JdoDimens.RadiusPill)).padding(horizontal = JdoDimens.Space4, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("🔍", fontSize = 20.sp)
                Spacer(Modifier.width(JdoDimens.Space3))
                Box(modifier = Modifier.weight(1f)) {
                    if (q.isEmpty()) Text("搜索车品 · 数码 · 食品 · 生活", color = JdoColors.TextMuted, fontSize = 18.sp)
                    BasicTextField(
                        value = q, onValueChange = { q = it },
                        textStyle = TextStyle(color = JdoColors.TextPrimary, fontSize = 18.sp),
                        cursorBrush = SolidColor(JdoColors.Mint),
                        singleLine = true, modifier = Modifier.fillMaxWidth(),
                    )
                }
                if (q.isNotEmpty()) Text("✕", color = JdoColors.TextMuted, fontSize = 18.sp, modifier = Modifier.clickable { q = "" })
            }
        }

        if (q.isNotBlank()) {
            // 结果
            Text("搜索结果「$q」· ${results.size} 件", color = JdoColors.TextSecondary, fontSize = 18.sp, modifier = Modifier.padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space2))
            if (results.isEmpty()) Box(Modifier.fillMaxSize(), Alignment.Center) { Text("没有找到「$q」相关商品", color = JdoColors.TextMuted, fontSize = 20.sp) }
            else LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space3),
                verticalArrangement = Arrangement.spacedBy(JdoDimens.Space3),
                modifier = Modifier.fillMaxSize().padding(horizontal = JdoDimens.Space5),
            ) { items(results) { p -> ResultCard(p) { onNav("mall-detail", p.id) } } }
        } else {
            // 热搜 + 历史
            Row(modifier = Modifier.fillMaxSize().padding(horizontal = JdoDimens.Space5), horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space6)) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("历史搜索", color = JdoColors.TextSecondary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                    ChipFlow(history) { q = it }
                    Spacer(Modifier.height(JdoDimens.Space5))
                    Text("找不到？试试这些", color = JdoColors.TextSecondary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                    ChipFlow(listOf("加油卡充值", "高速 ETC", "电池保养", "美容洗车", "保险续保", "附近充电桩")) { q = it }
                }
                Column(modifier = Modifier.weight(1f).fillMaxHeight()) {
                    Text("车主热搜榜", color = JdoColors.TextSecondary, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = JdoDimens.Space2))
                    hots.forEachIndexed { i, h ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().clickable { q = h }.padding(vertical = 8.dp)) {
                            Text((i + 1).toString().padStart(2, '0'), color = if (i < 3) JdoColors.Driving else JdoColors.TextMuted, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.width(36.dp))
                            Text(h, color = JdoColors.TextPrimary, fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChipFlow(items: List<String>, onClick: (String) -> Unit) {
    // 简易换行 chip 行（每行 3 个）
    Column(modifier = Modifier.padding(top = JdoDimens.Space2)) {
        items.chunked(3).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space2), modifier = Modifier.padding(vertical = 4.dp)) {
                row.forEach { s ->
                    Box(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Bg2).clickable { onClick(s) }.padding(horizontal = JdoDimens.Space4, vertical = 8.dp)) {
                        Text(s, color = JdoColors.TextSecondary, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun ResultCard(p: ApiProduct, onClick: () -> Unit) {
    Column(modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusLg)).background(JdoColors.Bg2).clickable { onClick() }.padding(JdoDimens.Space3)) {
        ProductImage(p.img, Modifier.fillMaxWidth().height(80.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd)))
        Text(p.title, color = JdoColors.TextPrimary, fontSize = 14.sp, maxLines = 2, modifier = Modifier.padding(top = JdoDimens.Space2))
        Text(yuan(p.priceFen), color = JdoColors.Mint, fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp))
    }
}
