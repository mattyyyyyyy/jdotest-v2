package com.jdo.ivi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.jdo.ivi.data.Catalog
import com.jdo.ivi.ui.nav.JdoNavHost
import com.jdo.ivi.ui.theme.JdoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            // 启动即后台拉真实后端商品（与 web 后台互通）
            LaunchedEffect(Unit) { Catalog.load() }
            // 深色为默认（与原型一致）；可在设置页切换
            var dark by remember { mutableStateOf(true) }
            JdoTheme(darkTheme = dark) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    JdoNavHost(onToggleTheme = { dark = !dark })
                }
            }
        }
    }
}
