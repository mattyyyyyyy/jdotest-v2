package com.jdo.ivi

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.jdo.ivi.ui.components.PrimaryButton
import com.jdo.ivi.ui.theme.JdoTheme
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

/**
 * Compose UI 仪器测试（需 emulator：./gradlew connectedDebugAndroidTest）。
 * 验证主按钮渲染文案 + 点击回调触发。
 */
class PrimaryButtonTest {
    @get:Rule
    val rule = createComposeRule()

    @Test
    fun primaryButton_显示文案且点击触发回调() {
        var clicked = false
        rule.setContent {
            JdoTheme {
                PrimaryButton("立即购买", onClick = { clicked = true })
            }
        }
        rule.onNodeWithText("立即购买").assertIsDisplayed()
        rule.onNodeWithText("立即购买").performClick()
        assertTrue("点击应触发 onClick", clicked)
    }
}
