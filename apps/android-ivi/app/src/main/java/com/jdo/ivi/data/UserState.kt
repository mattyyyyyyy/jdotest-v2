package com.jdo.ivi.data

import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlin.concurrent.thread

/**
 * 车主登录态 + 个人中心真实数据（接 /me、/me/wallet、/coupons、/me/favorites）。
 * 启动时 load()：Demo mock-login 拿 u-1001(车主小李) token，再拉真实资料。
 * 所有 mutableStateOf 写操作回主线程，避免后台线程并发写坏 Compose 状态。
 */
object UserState {
    private val mainHandler = Handler(Looper.getMainLooper())

    var name by mutableStateOf("车主"); private set
    var phone by mutableStateOf(""); private set
    var points by mutableStateOf(0); private set
    var balanceFen by mutableStateOf(0); private set
    var orderCount by mutableStateOf(0); private set
    var coupons by mutableStateOf<List<ApiCoupon>>(emptyList()); private set
    var favorites by mutableStateOf<List<ApiFavorite>>(emptyList()); private set
    var addresses by mutableStateOf<List<ApiAddress>>(emptyList()); private set

    fun load() = thread(name = "jdo-user-load") {
        runCatching {
            val u = NetworkClient.mockLogin()
            val me = NetworkClient.fetchMe()
            val wallet = NetworkClient.fetchWallet()
            val cps = runCatching { NetworkClient.fetchCoupons() }.getOrDefault(emptyList())
            val favs = runCatching { NetworkClient.fetchFavorites() }.getOrDefault(emptyList())
            val addrs = runCatching { NetworkClient.fetchAddresses() }.getOrDefault(emptyList())
            val orders = runCatching { NetworkClient.fetchOrders().size }.getOrDefault(0)
            mainHandler.post {
                name = me.name.ifBlank { u?.name ?: "车主" }
                phone = me.phone
                points = wallet.first
                balanceFen = wallet.second
                coupons = cps
                favorites = favs
                addresses = addrs
                orderCount = orders
            }
        }
    }

    /** 取消收藏后刷新列表。 */
    fun removeFavorite(productId: String) = thread(name = "jdo-fav-remove") {
        runCatching {
            NetworkClient.removeFavorite(productId)
            val favs = NetworkClient.fetchFavorites()
            mainHandler.post { favorites = favs }
        }
    }
}
