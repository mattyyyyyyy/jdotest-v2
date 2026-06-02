package com.jdo.ivi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import com.jdo.ivi.ui.screens.IviHomeScreen
import com.jdo.ivi.ui.screens.MallCart
import com.jdo.ivi.ui.screens.MallCategory
import com.jdo.ivi.ui.screens.MallCheckout
import com.jdo.ivi.ui.screens.MallDetail
import com.jdo.ivi.ui.screens.MallLogin
import com.jdo.ivi.ui.screens.MallOrders
import com.jdo.ivi.ui.screens.MallPay
import com.jdo.ivi.ui.screens.MallScreen
import com.jdo.ivi.ui.screens.MallSearch
import com.jdo.ivi.ui.screens.Placeholder
import com.jdo.ivi.ui.theme.JdoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            JdoTheme {
                // 路由栈（route, arg）；arg 用于传 productId 等跨屏参数。对齐 web 的 onNav/setRoute。
                val stack = remember { mutableStateListOf<Pair<String, String?>>("ivi" to null) }
                val nav: (String, String?) -> Unit = { r, a -> stack.add(r to a) }
                val back: () -> Unit = { if (stack.size > 1) stack.removeAt(stack.lastIndex) }
                val (route, arg) = stack.last()
                when (route) {
                    "ivi" -> IviHomeScreen(onOpenMall = { nav("mall-home", null) })
                    "mall-home" -> MallScreen(onNav = nav, onBack = back)
                    "mall-category" -> MallCategory(onNav = nav, onBack = back)
                    "mall-detail" -> MallDetail(productId = arg ?: "", onNav = nav, onBack = back)
                    "mall-cart" -> MallCart(onNav = nav, onBack = back)
                    "mall-checkout" -> MallCheckout(onNav = nav, onBack = back)
                    "mall-pay" -> MallPay(onNav = nav, onBack = back)
                    "mall-orders" -> MallOrders(onNav = nav, onBack = back)
                    "mall-search" -> MallSearch(onNav = nav, onBack = back)
                    "mall-login" -> MallLogin(onNav = nav, onBack = back)
                    else -> Placeholder(route = route, onBack = back, onHome = { nav("mall-home", null) })
                }
            }
        }
    }
}
