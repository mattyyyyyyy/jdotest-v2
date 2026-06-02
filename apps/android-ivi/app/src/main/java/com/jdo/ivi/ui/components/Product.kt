package com.jdo.ivi.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.data.Product
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.MonoNumber
import com.jdo.ivi.ui.theme.RadiusLg

/* ============================================================
   商品卡 — 与原型 .prod-card 一致
   ============================================================ */
@Composable
fun ProductCard(p: Product, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    val c = JdoTheme.colors
    val shape = RoundedCornerShape(RadiusLg)
    Column(
        modifier
            .clip(shape)
            .background(c.bg2.copy(0.5f))
            .clickable(onClick = onClick),
    ) {
        Box {
            AsyncImage(
                model = p.img, contentDescription = p.title, contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth().aspectRatio(1f),
            )
            // 角标
            if (p.tag != null) {
                val (bg, fg) = tagColors(p.tagKind, c)
                Box(
                    Modifier.padding(12.dp).clip(RoundedCornerShape(8.dp)).background(bg)
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                ) { Text(p.tag, color = fg, fontSize = 15.sp, fontWeight = FontWeight.Bold) }
            }
            // 快加按钮
            Box(
                Modifier.align(Alignment.BottomEnd).padding(12.dp)
                    .size(52.dp).clip(RoundedCornerShape(16.dp))
                    .background(Color(0xBF0F172A)).clickable {},
                contentAlignment = Alignment.Center,
            ) { Icon(jdoIcon("plus"), "加入购物车", tint = Color.White, modifier = Modifier.size(26.dp)) }
        }
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                p.title, color = c.textPrimary, fontSize = 20.sp, lineHeight = 26.sp,
                maxLines = 2, overflow = TextOverflow.Ellipsis,
                modifier = Modifier.heightIn(min = 52.dp),
            )
            Row(verticalAlignment = Alignment.Bottom) {
                Text("¥", color = c.mint, fontSize = 18.sp, style = MonoNumber)
                Text(fmtPrice(p.price), color = c.mint, fontSize = 28.sp, style = MonoNumber)
                if (p.ori != null) {
                    Spacer(Modifier.width(10.dp))
                    Text("¥${fmtPrice(p.ori)}", color = c.textMuted, fontSize = 16.sp, style = MonoNumber)
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(jdoIcon("star"), null, tint = Color(0xFFF59E0B), modifier = Modifier.size(15.dp))
                Spacer(Modifier.width(4.dp))
                Text("${p.star}", color = Color(0xFFF59E0B), fontSize = 15.sp)
                Spacer(Modifier.width(10.dp))
                Text("已售 ${p.sold}k+", color = c.textMuted, fontSize = 15.sp)
            }
        }
    }
}

fun fmtPrice(v: Double): String =
    if (v % 1.0 == 0.0) v.toInt().toString() else String.format("%.1f", v)
