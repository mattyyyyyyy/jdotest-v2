package com.jdo.ivi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.jdo.ivi.ui.screens.IviHomeScreen
import com.jdo.ivi.ui.screens.MallScreen
import com.jdo.ivi.ui.theme.JdoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JdoTheme {
                // 极简屏间导航（无需 nav 库）：home ↔ mall
                var screen by remember { mutableStateOf("home") }
                when (screen) {
                    "mall" -> MallScreen(onBack = { screen = "home" })
                    else -> IviHomeScreen(onOpenMall = { screen = "mall" })
                }
            }
        }
    }
}
