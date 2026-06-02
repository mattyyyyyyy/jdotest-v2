package com.jdo.ivi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.runtime.mutableIntStateOf
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
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens

/** 商品（价格单位分，与后端一致）。Demo 内嵌示例（appetize 云模拟器够不到本机 API，先用内嵌）。 */
private data class Product(val title: String, val priceFen: Int, val tag: String, val tone: Color)

private val SAMPLE = listOf(
    Product("中石化 95# 加油 ¥100 油卡", 9700, "车主直降", JdoColors.Mint),
    Product("特来电充电桩 · 月度无限卡", 8800, "充电95折", JdoColors.Mint),
    Product("玻璃水四季通用 防冻 6 瓶/箱", 2990, "车主必备", JdoColors.Brand400),
    Product("上门洗车 · 标准外洗一次", 3500, "60分钟达", JdoColors.Accent),
    Product("瑞幸 · 4 杯豆桶套餐 · 自提", 3390, "到店即取", JdoColors.Gold),
    Product("车载香薰 持久木香调", 3900, "秒杀", JdoColors.Driving),
    Product("4K 行车记录仪 前后双录", 59900, "限时", JdoColors.Driving),
    Product("24h 拖车救援 · 100km 内", 19800, "年卡", JdoColors.Gold),
)

private fun yuan(fen: Int): String = "¥" + (fen / 100) + "." + ((fen % 100).toString().padStart(2, '0'))

@Composable
fun MallScreen(onBack: () -> Unit) {
    var cart by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        // 顶栏：返回 + 标题 + 购物车计数
        Row(
            modifier = Modifier.fillMaxWidth().background(JdoColors.Bg1).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier.size(JdoDimens.TouchMin).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                    .background(JdoColors.Bg2).clickable { onBack() },
                contentAlignment = Alignment.Center,
            ) { Text("‹ 返回", color = JdoColors.TextPrimary, fontSize = 18.sp) }
            Spacer(Modifier.width(JdoDimens.Space4))
            Text("JDO 商城", color = JdoColors.TextPrimary, fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Box(
                modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Brand500)
                    .padding(horizontal = JdoDimens.Space4, vertical = 10.dp),
            ) { Text("🛒 购物车 $cart", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.SemiBold) }
        }

        // 商品网格
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            contentPadding = PaddingValues(JdoDimens.Space5),
            horizontalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
            verticalArrangement = Arrangement.spacedBy(JdoDimens.Space4),
            modifier = Modifier.fillMaxSize(),
        ) {
            items(SAMPLE) { p -> ProductCard(p) { cart++ } }
        }
    }
}

@Composable
private fun ProductCard(p: Product, onAdd: () -> Unit) {
    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(JdoDimens.RadiusLg))
            .background(JdoColors.Bg2)
            .border(1.dp, JdoColors.BorderSubtle, RoundedCornerShape(JdoDimens.RadiusLg))
            .padding(JdoDimens.Space4),
    ) {
        // 图占位（渐变 + tag）
        Box(
            modifier = Modifier.fillMaxWidth().height(90.dp).clip(RoundedCornerShape(JdoDimens.RadiusMd))
                .background(Brush.linearGradient(listOf(JdoColors.Bg3, JdoColors.Bg1))),
            contentAlignment = Alignment.TopStart,
        ) {
            Box(
                modifier = Modifier.padding(8.dp).clip(RoundedCornerShape(JdoDimens.RadiusSm)).background(p.tone)
                    .padding(horizontal = 8.dp, vertical = 3.dp),
            ) { Text(p.tag, color = JdoColors.TextInverse, fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
        }
        Spacer(Modifier.height(JdoDimens.Space3))
        Text(p.title, color = JdoColors.TextPrimary, fontSize = 17.sp, fontWeight = FontWeight.Medium, maxLines = 2)
        Spacer(Modifier.height(JdoDimens.Space2))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(yuan(p.priceFen), color = JdoColors.Mint, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Box(
                modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(JdoColors.Brand500)
                    .clickable { onAdd() }.padding(horizontal = JdoDimens.Space4, vertical = 8.dp),
            ) { Text("加入", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold) }
        }
    }
}
