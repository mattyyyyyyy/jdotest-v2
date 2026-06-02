package com.jdo.ivi.data

import com.jdo.ivi.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** 商品（price 单位「分」，与后端 store 一致）。 */
data class ApiProduct(val id: String, val title: String, val priceFen: Int, val cat: String, val tag: String)

/**
 * 与 web 后台同一后端（services/api，经 cloudflared 公网隧道）。
 * read：拉商品（后台改→这里刷出来）；write：下单（→后台订单立刻可见）。
 * 仅用 JDK 内置 HttpURLConnection + org.json，不引第三方网络库。
 */
object NetworkClient {
    private val BASE = BuildConfig.API_BASE

    fun fetchProducts(): List<ApiProduct> {
        val conn = (URL("$BASE/products").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"; connectTimeout = 15000; readTimeout = 15000
        }
        conn.inputStream.use { ins ->
            val items = JSONObject(ins.readBytes().decodeToString()).getJSONArray("items")
            val out = ArrayList<ApiProduct>(items.length())
            for (i in 0 until items.length()) {
                val o = items.getJSONObject(i)
                out.add(
                    ApiProduct(
                        id = o.optString("id"),
                        title = o.optString("title"),
                        priceFen = o.optInt("price"),
                        cat = o.optString("cat"),
                        tag = o.optString("tag", ""),
                    ),
                )
            }
            return out
        }
    }

    /** 下单 → 后台订单管理立刻可见（app→后台写互通）。返回订单 id，失败 null。 */
    fun placeOrder(title: String, priceFen: Int): String? = try {
        val conn = (URL("$BASE/orders").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"; doOutput = true; connectTimeout = 15000; readTimeout = 15000
            setRequestProperty("Content-Type", "application/json")
        }
        val body = JSONObject().put("channel", "car").put(
            "items",
            JSONArray().put(JSONObject().put("title", title).put("price", priceFen).put("qty", 1)),
        )
        conn.outputStream.use { it.write(body.toString().toByteArray()) }
        JSONObject(conn.inputStream.use { it.readBytes().decodeToString() }).optJSONObject("order")?.optString("id")
    } catch (e: Exception) {
        null
    }
}
