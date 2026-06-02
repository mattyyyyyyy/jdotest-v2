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
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" // 仪器测试运行器（否则 androidTest 不被发现）
        // 后端基址：cloudflared 公网隧道 → 本机 services/api（与 web 后台同一后端）。
        // 隧道重启地址会变，改这里重打包即可；或后续做成运行时可配置。
        buildConfigField("String", "API_BASE", "\"http://10.0.2.2:3000/api/v1\"")
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
    // 精致线框图标（Material Outlined，替代 emoji）
    implementation("androidx.compose.material:material-icons-extended")
    // 网络图片（商品图 Unsplash https / data-uri），Coil 2
    implementation("io.coil-kt:coil-compose:2.7.0")
    // 导航（原型用 NavHost；21 屏路由）
    implementation("androidx.navigation:navigation-compose:2.9.0")

    // 测试依赖
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2026.05.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
