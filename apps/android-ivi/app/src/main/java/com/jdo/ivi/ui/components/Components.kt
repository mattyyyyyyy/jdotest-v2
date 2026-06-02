package com.jdo.ivi.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.jdo.ivi.R
import com.jdo.ivi.ui.theme.JdoColors
import com.jdo.ivi.ui.theme.JdoDimens
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.HazeTint
import dev.chrisbanes.haze.hazeEffect
import dev.chrisbanes.haze.hazeSource

/**
 * 液态玻璃材质（design-system §4.1）：backdrop blur(模糊壁纸源) + 暗色 tint + 内描边。
 * 用在顶栏/面板/卡片，叠在 [WallpaperBackdrop] 的壁纸上才出毛玻璃效果。
 */
fun Modifier.glass(haze: HazeState, shape: Shape, blurRadius: Dp = 24.dp, tint: Color = JdoColors.SurfaceGlass): Modifier =
    this.clip(shape)
        .hazeEffect(state = haze) {
            this.blurRadius = blurRadius
            backgroundColor = JdoColors.Bg1
            tints = listOf(HazeTint(tint))
        }
        .border(1.dp, JdoColors.BorderSubtle, shape)

/**
 * 全屏车型壁纸背景（作 haze 模糊源）+ 可调暗化遮罩。商城/IVI 共用——
 * 还原 web「整 app 铺壁纸、商城调暗、卡片玻璃透出」的观感。
 */
@Composable
fun WallpaperBackdrop(haze: HazeState, dim: Float, content: @Composable BoxScope.() -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0)) {
        Image(
            painter = painterResource(R.drawable.ivi_wallpaper_dark),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize().hazeSource(haze),
        )
        if (dim > 0f) Box(modifier = Modifier.fillMaxSize().background(JdoColors.Bg0.copy(alpha = dim)))
        content()
    }
}

/** 分 → 元，去掉无意义小数 */
fun yuan(fen: Int): String {
    val hasFrac = fen % 100 != 0
    return if (hasFrac) "¥" + (fen / 100) + "." + ((fen % 100).toString().padStart(2, '0')) else "¥" + (fen / 100)
}

/** 商品图（Coil 加载 https / data-uri；失败时深色底兜底，不白块） */
@Composable
fun ProductImage(url: String, modifier: Modifier) {
    AsyncImage(
        model = url,
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = modifier.background(JdoColors.Bg3),
    )
}

@Composable
fun Chip(text: String, bg: Color, fg: Color, onClick: () -> Unit = {}) {
    Box(
        modifier = Modifier.clip(RoundedCornerShape(JdoDimens.RadiusPill)).background(bg).clickable { onClick() }
            .padding(horizontal = JdoDimens.Space3, vertical = 8.dp),
    ) { Text(text, color = fg, fontSize = 15.sp, fontWeight = FontWeight.SemiBold) }
}

/** 顶栏：返回按钮 + 标题 + 右侧动作区 */
@Composable
fun SubBar(title: String, onBack: () -> Unit, actions: @Composable () -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth().background(JdoColors.Bg1).padding(horizontal = JdoDimens.Space5, vertical = JdoDimens.Space3),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier.size(JdoDimens.TouchMin).clip(RoundedCornerShape(JdoDimens.RadiusMd)).background(JdoColors.Bg2).clickable { onBack() },
            contentAlignment = Alignment.Center,
        ) { Text("‹", color = JdoColors.TextPrimary, fontSize = 30.sp) }
        Spacer(Modifier.width(JdoDimens.Space4))
        Text(title, color = JdoColors.TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.weight(1f))
        actions()
    }
}
