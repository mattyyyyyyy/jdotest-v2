package com.jdo.ivi.ui.nav

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.jdo.ivi.ui.screens.*

/* ============================================================
   导航装配 — 所有屏共用一个 Nav(route) lambda 做跳转。
   每个屏接收 nav: (String) -> Unit；back 用 popBackStack。
   ============================================================ */
@Composable
fun JdoNavHost(onToggleTheme: () -> Unit) {
    val navController: NavHostController = rememberNavController()
    val go: (String) -> Unit = { route -> navController.navigate(route) }
    val back: () -> Unit = { if (!navController.popBackStack()) Unit }

    NavHost(navController = navController, startDestination = Routes.IviHome) {
        composable(Routes.IviHome)      { IviHomeScreen(go) }
        composable(Routes.MallHome)     { MallHomeScreen(go) }
        composable(Routes.MallCategory) { MallCategoryScreen(go, back) }
        composable(Routes.MallSearch)   { MallSearchScreen(go, back) }
        composable(Routes.MallDetail)   { MallDetailScreen(go, back) }
        composable(Routes.MallCart)     { MallCartScreen(go, back) }
        composable(Routes.MallCheckout) { MallCheckoutScreen(go, back) }
        composable(Routes.MallPay)      { MallPayScreen(go, back) }
        composable(Routes.MallOrders)   { MallOrdersScreen(go, back) }
        composable(Routes.MallProfile)  { MallProfileScreen(go, back) }
        composable(Routes.MallAddresses){ MallAddressesScreen(go, back) }
        composable(Routes.MallCoupons)  { MallCouponsScreen(go, back) }
        composable(Routes.MallLogin)    { MallLoginScreen(go, back) }
        composable(Routes.MallDriving)  { MallDrivingScreen(go, back) }
        composable(Routes.MallReviews)  { MallReviewsScreen(go, back) }
        composable(Routes.MallAftersale){ MallAftersaleScreen(go, back) }
        composable(Routes.MallTracking) { MallTrackingScreen(go, back) }
        composable(Routes.MallFavorites){ MallFavoritesScreen(go, back) }
        composable(Routes.MallSettings) { MallSettingsScreen(go, back, onToggleTheme) }
    }
}
