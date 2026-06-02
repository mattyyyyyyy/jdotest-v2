package com.jdo.ivi.data

import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import kotlin.concurrent.thread

/**
 * 消费端轻量共享状态。
 *
 * 所有 mutableStateOf 的写操作统一在主线程执行（通过 mainHandler.post），
 * 避免后台线程并发写入导致 Compose 状态损坏。
 */
object ShoppingState {
    private val mainHandler = Handler(Looper.getMainLooper())

    var cartItems by mutableStateOf<List<CartItem>>(emptyList())
        private set

    var orders by mutableStateOf<List<ApiOrder>>(emptyList())
        private set

    var lastOrderId by mutableStateOf<String?>(null)
        private set

    var lastCheckoutTotalFen by mutableStateOf(0)
        private set

    var lastError by mutableStateOf<String?>(null)
        private set

    var isLoading by mutableStateOf(false)
        private set

    fun clearError() { lastError = null }

    fun loadCart() = thread(name = "jdo-cart-load") {
        postLoading(true)
        refreshCart()
        postLoading(false)
    }

    fun addCartItem(productId: String, qty: Int = 1, spec: String = "默认规格", onSuccess: (() -> Unit)? = null) =
        thread(name = "jdo-cart-add") {
            postLoading(true)
            runCatching {
                check(NetworkClient.addCartItem(productId, qty, spec))
                mainHandler.post { cartItems = NetworkClient.getCart(); lastError = null }
            }.onSuccess { post(onSuccess) }
                .onFailure { mainHandler.post { lastError = "购物车同步失败，请稍后重试" } }
            postLoading(false)
        }

    fun updateCartItem(id: String, qty: Int? = null, selected: Boolean? = null) =
        thread(name = "jdo-cart-update") {
            runCatching {
                val updated = NetworkClient.patchCartItem(id, qty, selected)
                mainHandler.post { cartItems = updated; lastError = null }
            }.onFailure { mainHandler.post { lastError = "购物车同步失败，请稍后重试" } }
        }

    /**
     * 提交当前已选购物车项。调用后立刻进入支付页，后端建单在后台完成。
     * 支付页会显示本次金额，订单页进入时再次同步真实订单。
     */
    fun checkoutSelectedAsync(onSuccess: (() -> Unit)? = null) {
        // 先在主线程快照当前合计
        mainHandler.post {
            lastCheckoutTotalFen = cartItems.filter { it.selected }.sumOf { it.priceFen * it.qty }
        }
        thread(name = "jdo-cart-checkout") {
            postLoading(true)
            runCatching {
                val orderId = NetworkClient.checkout() ?: error("订单创建失败")
                mainHandler.post {
                    lastOrderId = orderId
                    lastError = null
                }
                refreshCart()
                refreshOrders()
            }.onSuccess { post(onSuccess) }
                .onFailure { mainHandler.post { lastError = "提交订单失败，请返回购物车重试" } }
            postLoading(false)
        }
    }

    fun placeOrderAsync(title: String, priceFen: Int, onSuccess: (() -> Unit)? = null) {
        mainHandler.post { lastCheckoutTotalFen = priceFen }
        thread(name = "jdo-order-create") {
            postLoading(true)
            runCatching {
                val orderId = NetworkClient.placeOrder(title, priceFen) ?: error("订单创建失败")
                mainHandler.post {
                    lastOrderId = orderId
                    lastError = null
                }
                refreshOrders()
            }.onSuccess { post(onSuccess) }
                .onFailure { mainHandler.post { lastError = "提交订单失败，请稍后重试" } }
            postLoading(false)
        }
    }

    fun selectOrderForPayment(id: String, totalFen: Int) {
        lastOrderId = id
        lastCheckoutTotalFen = totalFen
        lastError = null
    }

    fun confirmLastPaymentAsync(onSuccess: (() -> Unit)? = null) =
        thread(name = "jdo-payment-confirm") {
            postLoading(true)
            runCatching {
                val orderId = lastOrderId ?: error("订单仍在生成")
                NetworkClient.confirmPayment(orderId)
                mainHandler.post { lastError = null }
                refreshOrders()
            }.onSuccess { post(onSuccess) }
                .onFailure { mainHandler.post { lastError = "支付确认失败，请稍后重试" } }
            postLoading(false)
        }

    fun loadOrders() = thread(name = "jdo-orders-load") {
        postLoading(true)
        refreshOrders()
        postLoading(false)
    }

    private fun refreshCart() {
        runCatching {
            val items = NetworkClient.getCart()
            mainHandler.post { cartItems = items; lastError = null }
        }.onFailure { mainHandler.post { lastError = "购物车同步失败，请稍后重试" } }
    }

    private fun refreshOrders() {
        runCatching {
            val list = NetworkClient.fetchOrders()
            mainHandler.post { orders = list; lastError = null }
        }.onFailure { mainHandler.post { lastError = "订单同步失败，请稍后重试" } }
    }

    private fun postLoading(value: Boolean) {
        mainHandler.post { isLoading = value }
    }

    private fun post(callback: (() -> Unit)?) {
        callback?.let { mainHandler.post(it) }
    }
}
