package com.jdo.ivi.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.VolumeUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

/* ============================================================
   图标映射 — 原型用线稿图标，这里映射到 material-icons-extended
   的 Outlined 集（线稿风），保持一致观感。
   ============================================================ */
fun jdoIcon(name: String): ImageVector = when (name) {
    "search"     -> Icons.Outlined.Search
    "home"       -> Icons.Outlined.Home
    "company"    -> Icons.Outlined.Apartment
    "bolt"       -> Icons.Outlined.Bolt
    "car"        -> Icons.Outlined.DirectionsCar
    "compass"    -> Icons.Outlined.Explore
    "phone"      -> Icons.Outlined.Call
    "music"      -> Icons.Outlined.MusicNote
    "volume"     -> Icons.AutoMirrored.Outlined.VolumeUp
    "chevL"      -> Icons.Outlined.ChevronLeft
    "chevR"      -> Icons.Outlined.ChevronRight
    "bluetooth"  -> Icons.Outlined.Bluetooth
    "wifi"       -> Icons.Outlined.Wifi
    "cloud"      -> Icons.Outlined.Cloud
    "sunCloud"   -> Icons.Outlined.WbCloudy
    "play"       -> Icons.Outlined.PlayArrow
    "pause"      -> Icons.Outlined.Pause
    "prev"       -> Icons.Outlined.SkipPrevious
    "next"       -> Icons.Outlined.SkipNext
    "plus"       -> Icons.Outlined.Add
    "cart"       -> Icons.Outlined.ShoppingCart
    "star"       -> Icons.Outlined.Star
    "user"       -> Icons.Outlined.Person
    "settings"   -> Icons.Outlined.Settings
    "mic"        -> Icons.Outlined.Mic
    "sort"       -> Icons.Outlined.SwapVert
    "filter"     -> Icons.Outlined.FilterList
    "battery"    -> Icons.Outlined.BatteryChargingFull
    "location"   -> Icons.Outlined.LocationOn
    "package"    -> Icons.Outlined.Inventory2
    "back"       -> Icons.AutoMirrored.Outlined.ArrowBack
    "sparkles"   -> Icons.Outlined.AutoAwesome
    "headphones" -> Icons.Outlined.Headphones
    "cookie"     -> Icons.Outlined.Cookie
    "leaf"       -> Icons.Outlined.Spa
    "shirt"      -> Icons.Outlined.Checkroom
    "dumbbell"   -> Icons.Outlined.FitnessCenter
    "luggage"    -> Icons.Outlined.Luggage
    "book"       -> Icons.Outlined.MenuBook
    "baby"       -> Icons.Outlined.ChildCare
    "wrench"     -> Icons.Outlined.Build
    else         -> Icons.Outlined.Circle
}
