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
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.ui.components.AvatarBadge
import com.jdo.ivi.ui.components.jdoIcon
import com.jdo.ivi.ui.nav.Routes
import com.jdo.ivi.ui.theme.JdoTheme
import com.jdo.ivi.ui.theme.RadiusPill

/* ============================================================
   商城公共骨架：顶栏 / 导航 rail / 二级标题栏 / 图标按钮
   ============================================================ */

@Composable
fun MallTopBar(nav: (String) -> Unit, activeTab: String = "mall") {
    val c = JdoTheme.colors
    Row(
        Modifier.fillMaxWidth().height(96.dp)
            .border(1.dp, c.borderSubtle).padding(horizontal = 36.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 搜索框（胶囊）
        Row(
            Modifier.width(560.dp).height(60.dp).clip(RoundedCornerShape(RadiusPill))
                .background(c.bg2.copy(0.5f)).border(1.dp, c.borderDefault, RoundedCornerShape(RadiusPill))
                .clickable { nav(Routes.MallSearch) }.padding(horizontal = 22.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(jdoIcon("mic"), null, tint = c.textSecondary, modifier = Modifier.size(24.dp))
            Spacer(Modifier.width(12.dp))
            Text("试试说\"我要买玻璃水\"", color = c.textSecondary, fontSize = 18.sp, modifier = Modifier.weight(1f))
            Icon(jdoIcon("search"), null, tint = c.textSecondary, modifier = Modifier.size(24.dp))
        }
        Spacer(Modifier.weight(1f))
        Tab("商城", activeTab == "mall") {}
        Spacer(Modifier.width(28.dp))
        Tab("我的", activeTab == "mine") { nav(Routes.MallProfile) }
        Spacer(Modifier.weight(1f))
        IconBtn("cart", badge = "3") { nav(Routes.MallCart) }
        Spacer(Modifier.width(16.dp))
        IconBtn("settings") { nav(Routes.MallSettings) }
    }
}

@Composable
private fun Tab(label: String, active: Boolean, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable(onClick = onClick)) {
        Text(label, color = if (active) c.textPrimary else c.textMuted, fontSize = 26.sp, fontWeight = FontWeight.SemiBold)
        if (active) {
            Spacer(Modifier.height(6.dp))
            Box(Modifier.width(32.dp).height(4.dp).clip(RoundedCornerShape(2.dp)).background(c.mint))
        }
    }
}

@Composable
fun IconBtn(name: String, badge: String? = null, onClick: () -> Unit) {
    val c = JdoTheme.colors
    Box {
        Box(
            Modifier.size(60.dp).clip(RoundedCornerShape(18.dp)).background(c.bg2.copy(0.5f))
                .border(1.dp, c.borderDefault, RoundedCornerShape(18.dp)).clickable(onClick = onClick),
            contentAlignment = Alignment.Center,
        ) { Icon(jdoIcon(name), name, tint = c.textPrimary, modifier = Modifier.size(28.dp)) }
        if (badge != null) {
            Box(
                Modifier.align(Alignment.TopEnd).offset(6.dp, (-6).dp).size(24.dp).clip(CircleShape)
                    .background(c.error), contentAlignment = Alignment.Center,
            ) { Text(badge, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold) }
        }
    }
}

/** 左侧 7 大场景导航 rail */
@Composable
fun NavRail(active: String, onSelect: (String) -> Unit, modifier: Modifier = Modifier) {
    val c = JdoTheme.colors
    Column(
        modifier.width(180.dp).fillMaxHeight().verticalScroll(rememberScrollState())
            .border(1.dp, c.borderSubtle),
    ) {
        Catalog.scenes.forEach { s ->
            val sel = s.id == active
            Column(
                Modifier.fillMaxWidth().clickable { onSelect(s.id) }.padding(vertical = 18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Box(
                    Modifier.width(96.dp).height(52.dp).clip(RoundedCornerShape(RadiusPill))
                        .background(if (sel) c.mint.copy(0.15f) else Color.Transparent),
                    contentAlignment = Alignment.Center,
                ) { Icon(jdoIcon(s.icon), s.name, tint = if (sel) c.mint else c.textSecondary, modifier = Modifier.size(30.dp)) }
                Spacer(Modifier.height(6.dp))
                Text(s.name, color = if (sel) c.textPrimary else c.textSecondary, fontSize = 18.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

/** 二级页标题栏（返回 + 标题 + 右侧动作） */
@Composable
fun SubBar(title: String, onBack: () -> Unit, actions: @Composable RowScope.() -> Unit = {}) {
    val c = JdoTheme.colors
    Row(
        Modifier.fillMaxWidth().height(96.dp).border(1.dp, c.borderSubtle).padding(horizontal = 36.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconBtn("back") { onBack() }
        Spacer(Modifier.width(18.dp))
        Text(title, color = c.textPrimary, fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.weight(1f))
        actions()
    }
}

/** 简易页脚标语（保留品牌一致性） */
@Composable
fun MallBg(content: @Composable BoxScope.() -> Unit) {
    Box(Modifier.fillMaxSize().background(JdoTheme.colors.bg0), content = content)
}
