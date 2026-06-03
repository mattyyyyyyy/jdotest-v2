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
data class ApiBanner(val id: String, val title: String, val sub: String, val tone: String, val img: String)
data class ApiHero(
    val id: String, val kind: String, val icon: String, val tag: String,
    val title: String, val sub: String,
    val statValue: String, val statLabel: String,
    val itemIds: List<String>, val cta: String, val tone: String, val navScene: String,
)
data class Bootstrap(val categories: List<ApiCategory>, val products: List<ApiProduct>, val banners: List<ApiBanner>, val heroRecs: List<ApiHero>)
/** 购物车行（price 单位「分」）。 */
data class CartItem(val id: String, val productId: String, val title: String, val img: String, val priceFen: Int, val qty: Int, val selected: Boolean, val spec: String)
/** 订单（totalAmount 单位「分」）。 */
data class ApiOrder(val id: String, val status: String, val totalFen: Int, val itemTitles: List<String>, val channel: String, val createdAt: String)
/** 车主资料（balance/points 来自 /me 或 /me/wallet）。 */
data class ApiMe(val id: String, val name: String, val phone: String, val points: Int, val balance: Int)
/** 优惠券（type: fixed 满减(amount 分) / discount 折扣(amount=折数*10)；threshold 门槛分）。 */
data class ApiCoupon(val id: String, val name: String, val type: String, val amount: Int, val threshold: Int, val stock: Int)
/** 收藏（join 商品，price 分）。 */
data class ApiFavorite(val productId: String, val title: String, val img: String, val priceFen: Int, val onShelf: Boolean)
/** 收货地址。 */
data class ApiAddress(val id: String, val receiver: String, val phone: String, val addr: String, val isDefault: Boolean)

/**
 * 与 web 后台同一后端（services/api，经 cloudflared 公网隧道）。
 * 仅用 JDK 内置 HttpURLConnection + org.json，不引第三方网络库。
 */
object NetworkClient {
    private val BASE = BuildConfig.API_BASE

    /** HTTP 错误时抛出包含状态码和响应体的异常。 */
    class HttpException(val code: Int, val body: String) :
        RuntimeException("HTTP $code: ${body.take(200)}")

    // 车主 token（个人中心 /me* 需鉴权；UserState.load 经 mock-login 获取）。
    @Volatile private var token: String? = null

    private fun get(path: String): String {
        val c = (URL("$BASE$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"; connectTimeout = 15000; readTimeout = 15000
            token?.let { setRequestProperty("Authorization", "Bearer $it") }
        }
        return readResponse(c)
    }

    private fun send(method: String, path: String, json: JSONObject?): String {
        val c = (URL("$BASE$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method; connectTimeout = 15000; readTimeout = 15000
            token?.let { setRequestProperty("Authorization", "Bearer $it") }
            if (json != null) { doOutput = true; setRequestProperty("Content-Type", "application/json") }
        }
        if (json != null) c.outputStream.use { it.write(json.toString().toByteArray()) }
        return readResponse(c)
    }

    /** 统一读取响应：2xx 走 inputStream，非 2xx 读 errorStream 并抛 HttpException。 */
    private fun readResponse(c: HttpURLConnection): String {
        val code = c.responseCode
        val stream = if (code in 200..299) c.inputStream else c.errorStream
        val body = stream?.use { it.readBytes().decodeToString() } ?: ""
        if (code !in 200..299) throw HttpException(code, body)
        return body
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
            banners = root.getJSONArray("banners").map { ApiBanner(it.optString("id", ""), it.optString("title"), it.optString("sub"), it.optString("tone"), it.optString("img")) },
            heroRecs = (root.optJSONArray("heroRecs") ?: org.json.JSONArray()).map {
                val stat = it.optJSONObject("stat")
                val itemsArr = it.optJSONArray("items") ?: org.json.JSONArray()
                val items = (0 until itemsArr.length()).map { i -> itemsArr.optString(i) }
                ApiHero(
                    id = it.optString("id"), kind = it.optString("kind", ""),
                    icon = it.optString("icon", ""), tag = it.optString("tag", ""),
                    title = it.optString("title"), sub = it.optString("sub"),
                    statValue = stat?.optString("v", "") ?: "",
                    statLabel = stat?.optString("l", "") ?: "",
                    itemIds = items, cta = it.optString("cta", ""),
                    tone = it.optString("tone", ""), navScene = it.optString("navScene", ""),
                )
            },
        )
    }

    fun fetchProduct(id: String): ApiProduct? = try {
        productOf(JSONObject(get("/products/$id")))
    } catch (_: Exception) { null }

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

    private fun orderOf(it: JSONObject) =
        ApiOrder(
            id = it.optString("id"), status = it.optString("status"), totalFen = it.optInt("totalAmount"),
            itemTitles = (it.optJSONArray("itemTitles") ?: org.json.JSONArray()).let { a -> (0 until a.length()).map { i -> a.optString(i) } },
            channel = it.optString("channel"), createdAt = it.optString("createdAt"),
        )

    fun fetchOrders(): List<ApiOrder> = JSONObject(get("/orders")).getJSONArray("items").map(::orderOf)

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

    /** Demo 支付回调确认：后端通过状态机持久化 PENDING_PAYMENT -> PAID。 */
    fun confirmPayment(orderId: String): ApiOrder =
        orderOf(JSONObject(send("POST", "/payments/$orderId/confirm", JSONObject())).getJSONObject("order"))

    // ---------- 车主登录 + 个人中心（接 /me*、/coupons）----------
    /** Demo 登录拿车主 token（u-1001 车主小李），后续 /me* 带上。 */
    fun mockLogin(): ApiMe? = try {
        val d = JSONObject(send("POST", "/auth/mock-login", JSONObject()))
        token = d.optString("accessToken").ifBlank { null }
        d.optJSONObject("user")?.let { ApiMe(it.optString("id"), it.optString("name"), it.optString("phone"), 0, 0) }
    } catch (e: Exception) { null }

    fun fetchMe(): ApiMe = JSONObject(get("/me")).let {
        ApiMe(it.optString("id"), it.optString("name"), it.optString("phone"), it.optInt("points"), it.optInt("balance"))
    }
    /** 钱包：积分 + 余额（分）。 */
    fun fetchWallet(): Pair<Int, Int> = JSONObject(get("/me/wallet")).let { Pair(it.optInt("points"), it.optInt("balance")) }
    /** 可领优惠券（后台建的真实券）。 */
    fun fetchCoupons(): List<ApiCoupon> = JSONObject(get("/coupons")).getJSONArray("items").map {
        ApiCoupon(it.optString("id"), it.optString("name"), it.optString("type"), it.optInt("amount"), it.optInt("threshold"), it.optInt("stock"))
    }
    /** 我的收藏（join 商品现状）。 */
    fun fetchFavorites(): List<ApiFavorite> = JSONObject(get("/me/favorites")).getJSONArray("items").map {
        ApiFavorite(it.optString("productId"), it.optString("title"), it.optString("img"), it.optInt("price"), it.optBoolean("onShelf"))
    }
    fun removeFavorite(productId: String): Boolean = try { send("DELETE", "/me/favorites/$productId", null); true } catch (e: Exception) { false }
    /** 我的收货地址。 */
    fun fetchAddresses(): List<ApiAddress> = JSONObject(get("/me/addresses")).getJSONArray("items").map {
        ApiAddress(it.optString("id"), it.optString("receiver"), it.optString("phone"), it.optString("addr"), it.optBoolean("isDefault"))
    }
}

private inline fun <T> JSONArray.map(f: (JSONObject) -> T): List<T> {
    val out = ArrayList<T>(length())
    for (i in 0 until length()) out.add(f(getJSONObject(i)))
    return out
}
