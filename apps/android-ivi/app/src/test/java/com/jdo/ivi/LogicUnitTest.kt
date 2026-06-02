package com.jdo.ivi

import com.jdo.ivi.data.Catalog
import com.jdo.ivi.ui.components.fmtPrice
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * JVM 单测（无需 emulator，./gradlew testDebugUnitTest）。
 * 覆盖消费端纯逻辑：价格格式化 + Catalog 过滤/查找（基于种子数据）。
 */
class LogicUnitTest {
    @Test
    fun fmtPrice_整数不带小数() {
        assertEquals("97", fmtPrice(97.0))
        assertEquals("88", fmtPrice(88.0))
        assertEquals("0", fmtPrice(0.0))
    }

    @Test
    fun fmtPrice_小数保留一位() {
        assertEquals("12.5", fmtPrice(12.5))
        assertEquals("9.9", fmtPrice(9.9))
    }

    @Test
    fun catalog_byScene_只返回同场景且非空() {
        val scene = Catalog.products.first().scene
        val list = Catalog.byScene(scene)
        assertTrue("种子里该场景应有商品", list.isNotEmpty())
        assertTrue("全部命中同一场景", list.all { it.scene == scene })
    }

    @Test
    fun catalog_byId_命中返回对应_未命中回退不崩() {
        val p = Catalog.products.first()
        assertEquals(p.id, Catalog.byId(p.id).id)
        assertNotNull("未知 id 回退首个，不抛异常", Catalog.byId("__nonexistent__"))
    }
}
