plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    jacoco // 单测覆盖率（TDD 的牙齿，限定 data 纯逻辑层）
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
        getByName("debug") {
            enableUnitTestCoverage = true // 让 testDebugUnitTest 产出 jacoco exec
        }
    }
}

// ── JaCoCo：单测覆盖率门槛（TDD 的牙齿）──
// Android 可单测的纯逻辑面很小（Catalog 过滤/查找 + fmtPrice），所以**限定 data 层**，
// 不把 Compose UI（靠仪器测试覆盖）算进来，否则门槛会被海量 UI 拉到接近 0、失去意义。
jacoco { toolVersion = "0.8.12" }

// 限定到纯逻辑类（当前 JVM 单测真正覆盖的范围）
val coveredLogicClasses = listOf("**/data/Catalog*.class")

tasks.register<JacocoReport>("jacocoUnitReport") {
    dependsOn("testDebugUnitTest")
    group = "verification"
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
    classDirectories.setFrom(
        fileTree(layout.buildDirectory.dir("tmp/kotlin-classes/debug")) { include(coveredLogicClasses) },
    )
    sourceDirectories.setFrom(files("src/main/java"))
    executionData.setFrom(
        fileTree(layout.buildDirectory) { include("**/testDebugUnitTest.exec", "**/*UnitTest.exec") },
    )
}

tasks.register<JacocoCoverageVerification>("jacocoUnitVerification") {
    dependsOn("jacocoUnitReport")
    group = "verification"
    classDirectories.setFrom(
        fileTree(layout.buildDirectory.dir("tmp/kotlin-classes/debug")) { include(coveredLogicClasses) },
    )
    sourceDirectories.setFrom(files("src/main/java"))
    executionData.setFrom(
        fileTree(layout.buildDirectory) { include("**/testDebugUnitTest.exec", "**/*UnitTest.exec") },
    )
    violationRules {
        rule {
            limit {
                counter = "LINE"
                // 基线（2026-06-03）：data/Catalog 行覆盖 63.2%（60/95）。门槛 0.60，只升不降。
                // 可临时覆盖验证牙齿：-PjacocoMin=0.80
                minimum = ((project.findProperty("jacocoMin") as String?) ?: "0.60").toBigDecimal()
            }
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
