plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.jdo.ivi"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.jdo.ivi"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1"
        // 后端基址：cloudflared 公网隧道 → 本机 services/api（与 web 后台同一后端）。
        // 隧道重启地址会变，改这里重打包即可；或后续做成运行时可配置。
        buildConfigField("String", "API_BASE", "\"https://bristol-advantage-favourites-helen.trycloudflare.com/api/v1\"")
        // WebView 直接加载的 V3 网页（后端 /app 静态服务，经隧道）——100% 复用 web 界面
        buildConfigField("String", "APP_URL", "\"https://bristol-advantage-favourites-helen.trycloudflare.com/app/JDO%20%E8%BD%A6%E6%9C%BA%E7%94%B5%E5%95%86.html\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
    kotlinOptions {
        jvmTarget = "21"
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation(platform("androidx.compose:compose-bom:2026.05.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    // 网络图片（商品图 Unsplash https / data-uri），Coil 2
    implementation("io.coil-kt:coil-compose:2.7.0")
}
