package com.jdo.ivi.data

import com.jdo.ivi.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** 商品（price 单位「分」，与后端 store 一致）。 */
data class ApiProduct(val id: String, val title: String, val priceFen: Int, val oriFen: Int, val cat: String, val tag: String, val sold: Double, val star: Double)
data class ApiCategory(val id: String, val name: String, val icon: String)
data class ApiBanner(val title: String, val sub: String, val tone: String)
data class Bootstrap(val categories: List<ApiCategory>, val products: List<ApiProduct>, val banners: List<ApiBanner>)

/**
 * 与 web 后台同一后端（services/api，经 cloudflared 公网隧道）。
 * read：拉 bootstrap（分类/banner/商品，后台改→刷新即出现）；write：下单（→后台订单可见）。
 * 仅用 JDK 内置 HttpURLConnection + org.json，不引第三方网络库。
 */
object NetworkClient {
    private val BASE = BuildConfig.API_BASE

    fun fetchBootstrap(): Bootstrap {
        val conn = (URL("$BASE/bootstrap").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"; connectTimeout = 15000; readTimeout = 15000
        }
        val root = JSONObject(conn.inputStream.use { it.readBytes().decodeToString() })
        return Bootstrap(
            categories = root.getJSONArray("categories").map {
                ApiCategory(it.optString("id"), it.optString("name"), it.optString("icon"))
            },
            products = root.getJSONArray("products").map {
                ApiProduct(
                    id = it.optString("id"), title = it.optString("title"),
                    priceFen = it.optInt("price"), oriFen = it.optInt("ori"),
                    cat = it.optString("cat"), tag = it.optString("tag", ""),
                    sold = it.optDouble("sold", 0.0), star = it.optDouble("star", 0.0),
                )
            },
            banners = root.getJSONArray("banners").map {
                ApiBanner(it.optString("title"), it.optString("sub"), it.optString("tone"))
            },
        )
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

private inline fun <T> JSONArray.map(f: (JSONObject) -> T): List<T> {
    val out = ArrayList<T>(length())
    for (i in 0 until length()) out.add(f(getJSONObject(i)))
    return out
}
