package com.jdo.ivi.data

import com.jdo.ivi.BuildConfig
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** 商品（price/ori 单位「分」）。 */
data class ApiProduct(
    val id: String, val title: String, val priceFen: Int, val oriFen: Int,
    val cat: String, val tag: String, val sold: Double, val star: Double, val img: String,
)
data class ApiCategory(val id: String, val name: String, val icon: String)
data class ApiBanner(val title: String, val sub: String, val tone: String)
data class Bootstrap(val categories: List<ApiCategory>, val products: List<ApiProduct>, val banners: List<ApiBanner>)
/** 购物车行（price 单位「分」）。 */
data class CartItem(val id: String, val productId: String, val title: String, val img: String, val priceFen: Int, val qty: Int, val selected: Boolean, val spec: String)
/** 订单（totalAmount 单位「分」）。 */
data class ApiOrder(val id: String, val status: String, val totalFen: Int, val itemTitles: List<String>, val channel: String, val createdAt: String)

/**
 * 与 web 后台同一后端（services/api，经 cloudflared 公网隧道）。
 * 仅用 JDK 内置 HttpURLConnection + org.json，不引第三方网络库。
 */
object NetworkClient {
    private val BASE = BuildConfig.API_BASE

    private fun get(path: String): String {
        val c = (URL("$BASE$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"; connectTimeout = 15000; readTimeout = 15000
        }
        return c.inputStream.use { it.readBytes().decodeToString() }
    }

    private fun send(method: String, path: String, json: JSONObject?): String {
        val c = (URL("$BASE$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = 15000; readTimeout = 15000
            if (json != null) { doOutput = true; setRequestProperty("Content-Type", "application/json") }
        }
        if (json != null) c.outputStream.use { it.write(json.toString().toByteArray()) }
        return c.inputStream.use { it.readBytes().decodeToString() }
    }

    private fun productOf(o: JSONObject) = ApiProduct(
        id = o.optString("id"), title = o.optString("title"),
        priceFen = o.optInt("price"), oriFen = o.optInt("ori"),
        cat = o.optString("cat"), tag = o.optString("tag", ""),
        sold = o.optDouble("sold", 0.0), star = o.optDouble("star", 0.0), img = o.optString("img"),
    )

    fun fetchBootstrap(): Bootstrap {
        val root = JSONObject(get("/bootstrap"))
        return Bootstrap(
            categories = root.getJSONArray("categories").map { ApiCategory(it.optString("id"), it.optString("name"), it.optString("icon")) },
            products = root.getJSONArray("products").map { productOf(it) },
            banners = root.getJSONArray("banners").map { ApiBanner(it.optString("title"), it.optString("sub"), it.optString("tone")) },
        )
    }

    fun fetchProduct(id: String): ApiProduct? =
        JSONObject(get("/products")).getJSONArray("items").map { productOf(it) }.find { it.id == id }

    // ---------- 购物车 ----------
    private fun cartOf(json: String): List<CartItem> =
        JSONObject(json).getJSONArray("items").map {
            CartItem(
                id = it.optString("id"), productId = it.optString("productId"),
                title = it.optString("title"), img = it.optString("img"),
                priceFen = it.optInt("price"), qty = it.optInt("qty"),
                selected = it.optBoolean("selected"), spec = it.optString("spec"),
            )
        }

    fun fetchOrders(): List<ApiOrder> = JSONObject(get("/orders")).getJSONArray("items").map {
        ApiOrder(
            id = it.optString("id"), status = it.optString("status"), totalFen = it.optInt("totalAmount"),
            itemTitles = (it.optJSONArray("itemTitles") ?: org.json.JSONArray()).let { a -> (0 until a.length()).map { i -> a.optString(i) } },
            channel = it.optString("channel"), createdAt = it.optString("createdAt"),
        )
    }

    fun getCart(): List<CartItem> = cartOf(get("/cart"))
    fun addCartItem(productId: String, qty: Int, spec: String): Boolean = try {
        send("POST", "/cart/items", JSONObject().put("productId", productId).put("qty", qty).put("spec", spec)); true
    } catch (e: Exception) { false }
    fun patchCartItem(id: String, qty: Int? = null, selected: Boolean? = null): List<CartItem> {
        val b = JSONObject(); qty?.let { b.put("qty", it) }; selected?.let { b.put("selected", it) }
        return cartOf(send("PATCH", "/cart/items/$id", b))
    }
    fun deleteCartItem(id: String): List<CartItem> = cartOf(send("DELETE", "/cart/items/$id", null))
    /** 结算购物车已选项 → 建单（走状态机）→ 后台订单可见。返回订单 id。 */
    fun checkout(): String? = try {
        JSONObject(send("POST", "/cart/checkout", JSONObject().put("channel", "car"))).optJSONObject("order")?.optString("id")
    } catch (e: Exception) { null }

    /** 直接下单（首页快捷）。 */
    fun placeOrder(title: String, priceFen: Int): String? = try {
        val body = JSONObject().put("channel", "car").put(
            "items", JSONArray().put(JSONObject().put("title", title).put("price", priceFen).put("qty", 1)),
        )
        JSONObject(send("POST", "/orders", body)).optJSONObject("order")?.optString("id")
    } catch (e: Exception) { null }
}

private inline fun <T> JSONArray.map(f: (JSONObject) -> T): List<T> {
    val out = ArrayList<T>(length())
    for (i in 0 until length()) out.add(f(getJSONObject(i)))
    return out
}
