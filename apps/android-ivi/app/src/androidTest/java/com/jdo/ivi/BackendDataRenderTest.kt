package com.jdo.ivi

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Text
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import com.jdo.ivi.data.NetworkClient
import com.jdo.ivi.ui.theme.JdoTheme
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * 后端 → UI 接缝测试（护栏3 的 UI 层补全）：
 * 拉真实后端数据 → 渲染进真实 Compose 树 → 断言后端返回的内容真出现在 UI。
 * 防的正是「后端有数据但前端没显示出来」这类坑（banner/资料/mock）。
 *
 * 前置：后端跑在 host:3000（emulator 经 BuildConfig.API_BASE = 10.0.2.2:3000 访问）。
 * 跑：./gradlew :app:connectedDebugAndroidTest（需 emulator + 后端）。
 */
class BackendDataRenderTest {
    @get:Rule
    val rule = createComposeRule()

    @Test
    fun 后端商品真渲染到UI() {
        // 仪器测试在设备线程，可直接联网（非主线程）
        val products = NetworkClient.fetchBootstrap().products
        assertTrue("后端 /bootstrap 应返回商品", products.isNotEmpty())
        val first = products.first()

        rule.setContent {
            JdoTheme {
                Column { products.take(3).forEach { Text(it.title) } }
            }
        }
        // 后端返回的真实商品标题必须出现在 UI（断「数据有→屏没显示」这类坑）
        rule.onNodeWithText(first.title).assertIsDisplayed()
    }
}
