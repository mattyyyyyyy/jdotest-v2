package com.jdo.ivi

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.jdo.ivi.ui.theme.JdoTheme

/**
 * 消费端 = 原生壳 + WebView 直接加载 V3 网页（ADR-0013 方案 A）。
 * 界面 100% 复用 web（毛玻璃 / 图片 / banner / 动效全保留），数据走同一后端（网页内 api 接口）。
 */
class MainActivity : ComponentActivity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JdoTheme {
                var webView by remember { mutableStateOf<WebView?>(null) }
                BackHandler {
                    val wv = webView
                    if (wv != null && wv.canGoBack()) wv.goBack() else finish()
                }
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        WebView(ctx).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT,
                            )
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            // 用设备实际视口（不套用 meta width=2560），让网页 autofit.js 正确缩放适配
                            settings.loadWithOverviewMode = false
                            settings.useWideViewPort = false
                            settings.mediaPlaybackRequiresUserGesture = false
                            webViewClient = WebViewClient()
                            webChromeClient = WebChromeClient()
                            setBackgroundColor(0xFF0A0B0E.toInt())
                            loadUrl(BuildConfig.APP_URL)
                            webView = this
                        }
                    },
                )
            }
        }
    }
}
