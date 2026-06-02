package com.jdo.ivi.data

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.jdo.ivi.R
import kotlin.concurrent.thread

/* ============================================================
   数据模型 + 数据源 — 与 web 同一后端（NetworkClient）对齐
   · seed 为内置示例（与 data.js 一致），启动即渲染；
   · Catalog.load() 后台拉 /bootstrap 覆盖为真实后端数据（分→元），
     与 web 后台完全互通。
   ============================================================ */

enum class TagKind { RED, MINT, GOLD, CYAN }

/** Coil 2 对后端内联 SVG 的 data URI 支持不稳定；使用本地占位图保证卡片可见。 */
fun imageModel(source: String): Any =
    if (source.startsWith("data:image/")) {
        R.drawable.product_placeholder
    } else {
        source
    }

/** 跨屏轻量状态：详情屏展示哪个商品（nav 为单参 String，无法带 arg）。 */
object AppState {
    var detailId by mutableStateOf("g1")
}

data class Product(
    val id: String,
    val scene: String,          // 场景/分类 id（与 Scene.id 对应）
    val img: String,
    val title: String,
    val price: Double,
    val ori: Double?,
    val tag: String?,
    val tagKind: TagKind,
    val sold: Double,           // k+
    val star: Double,
)

data class Scene(val id: String, val name: String, val icon: String)

/** 时空推荐卡（位置/时段/消耗/日历触发） */
data class HeroRec(
    val id: String,
    val icon: String,
    val tag: String,
    val title: String,
    val sub: String,
    val statValue: String,
    val statLabel: String,
    val itemIds: List<String>,
    val cta: String,
    val tone: String,           // mint / gold / cyan / blue
    val navScene: String,
)

/** 顶部轮播 banner */
data class Banner(
    val id: String,
    val tone: String,
    val title: String,
    val sub: String,
    val img: String,
)

object Catalog {

    // ── 7 大场景（左侧导航 rail，seed → API 覆盖）──
    private val seedScenes = listOf(
        Scene("energy", "能量补给", "bolt"),
        Scene("care",   "爱车养护", "wrench"),
        Scene("eat",    "一路吃喝", "cookie"),
        Scene("trip",   "远行出差", "luggage"),
        Scene("gear",   "车内好物", "car"),
        Scene("sos",    "24h 救援", "phone"),
        Scene("select", "严选好物", "sparkles"),
    )
    /** 启动即渲染；load() 后 API 覆盖。 */
    var scenes by mutableStateOf(seedScenes)
        private set

    private fun img(id: String) =
        "https://images.unsplash.com/$id?auto=format&fit=crop&w=600&q=70"

    private val seed = listOf(
        // 能量补给
        Product("e1","energy",img("photo-1545459720-aac8509eb02c"),"中石化 95# 加油 ¥100 油卡",97.0,100.0,"车主直降 3%",TagKind.MINT,24.6,4.9),
        Product("e2","energy",img("photo-1593941707882-a5bba14938c7"),"特来电充电桩 月度无限卡",88.0,168.0,"充电 95 折",TagKind.MINT,5.2,4.8),
        Product("e3","energy",img("photo-1648412781131-e5cdbf7a5a02"),"国家电网车主月卡 · 全国通用",188.0,268.0,"车厂联名",TagKind.CYAN,1.8,4.7),
        Product("e4","energy",img("photo-1607860108855-64acf2078ed9"),"玻璃水四季通用 防冻除胶 6 瓶/箱",29.9,59.0,"车主必备",TagKind.MINT,3.4,4.8),
        Product("e5","energy",img("photo-1597844808531-72732dee06d4"),"PD 100W 车载快充 双口 type-c",79.0,129.0,"新品",TagKind.CYAN,0.8,4.7),
        Product("e6","energy",img("photo-1593642634367-d91a135587b5"),"车载磁吸无线充 15W 桌面立架",119.0,199.0,"热销",TagKind.GOLD,1.5,4.7),
        // 爱车养护
        Product("c1","care",img("photo-1605559424843-9e4c228bf1c2"),"上门洗车 · 标准外洗一次",35.0,49.0,"60 分钟达",TagKind.MINT,12.4,4.9),
        Product("c2","care",img("photo-1492144534655-ae79c964c9d7"),"京东养车 · 内饰深度清洁",268.0,388.0,"黄金车主直减",TagKind.GOLD,0.7,4.8),
        Product("c3","care",img("photo-1542362567-b07e54358753"),"镀晶套餐 · 标准车型 · 含工时",1280.0,1880.0,"12 个月质保",TagKind.CYAN,0.3,4.9),
        Product("c5","care",img("photo-1492144534655-ae79c964c9d7"),"全包围 TPE 汽车脚垫 易清洁防滑",268.0,498.0,"热销",TagKind.GOLD,1.6,4.9),
        // 一路吃喝
        Product("f1","eat",img("photo-1565895405127-481853366cf8"),"老乡鸡速达便餐 ¥ 35 套餐",32.0,35.0,"30 分钟到车",TagKind.RED,16.8,4.7),
        Product("f2","eat",img("photo-1517248135467-4c7edcad34c4"),"瑞幸 · 4 杯豆桶套餐 · 自提",33.9,56.0,"到店即取",TagKind.MINT,22.1,4.9),
        Product("f5","eat",img("photo-1606312619070-d48b4c652a52"),"每日坚果混合装 25g×30 包",69.0,129.0,"车上零食",TagKind.MINT,8.2,4.9),
        Product("f7","eat",img("photo-1559056199-641a0ac8b55e"),"原产地咖啡豆 中度烘焙 500g",99.0,158.0,"会员",TagKind.GOLD,1.4,4.7),
        // 远行出差
        Product("t1","trip",img("photo-1436491865332-7a61a109cc05"),"上海 ⇌ 北京 · 春秋航空特价",480.0,920.0,"今日 15:30",TagKind.RED,0.4,4.6),
        Product("t2","trip",img("photo-1564501049412-61c2a3083791"),"亚朵酒店 · 浦东张江 · 标准大床",488.0,698.0,"今晚仅余 3 间",TagKind.RED,1.2,4.8),
        Product("t4","trip",img("photo-1488521787991-ed7bbaae773c"),"机场停车券 · 浦东 T2 · 24h",38.0,78.0,"出行必备",TagKind.CYAN,2.8,4.7),
        Product("t5","trip",img("photo-1553062407-98eeb64c6a62"),"20 寸登机箱 静音万向轮",399.0,699.0,"限时",TagKind.RED,0.8,4.7),
        // 车内好物
        Product("g1","gear",img("photo-1503376780353-7e6692767b70"),"车载香薰 持久固体香膏 木香调",39.0,89.0,"秒杀",TagKind.RED,1.2,4.9),
        Product("g2","gear",img("photo-1542362567-b07e54358753"),"4K 行车记录仪 前后双录 夜视",599.0,899.0,"限时",TagKind.RED,0.5,4.6),
        Product("g3","gear",img("photo-1625948515291-69613efd103f"),"AR 增强 HUD 抬头显示 即插即用",458.0,698.0,"黑科技",TagKind.CYAN,0.4,4.5),
        Product("g5","gear",img("photo-1546435770-a3e426bf472b"),"主动降噪蓝牙耳机 入耳式无线",199.0,399.0,"直降 50%",TagKind.RED,5.2,4.8),
        Product("g7","gear",img("photo-1572569511254-d8f925fe2cbb"),"10000mAh 磁吸无线快充充电宝",129.0,199.0,"车机配套",TagKind.MINT,1.8,4.7),
        // 24h 救援
        Product("s1","sos",img("photo-1494976388531-d1058494cdd8"),"24h 拖车救援 · 100km 内一次",198.0,388.0,"车主必备",TagKind.MINT,4.6,4.9),
        Product("s2","sos",img("photo-1605559424843-9e4c228bf1c2"),"搭电服务 · 30 分钟上门",68.0,128.0,"24h",TagKind.RED,2.4,4.8),
        Product("s4","sos",img("photo-1556909114-d8bb6cd6dde7"),"车主道路救援年卡 · 全险一站式",268.0,488.0,"年度",TagKind.GOLD,0.8,4.8),
        Product("s5","sos",img("photo-1623787064265-13c41efb5be9"),"应急工具箱 · 含搭电线 + 拖车带",168.0,248.0,"常备",TagKind.MINT,1.6,4.7),
        // 严选好物
        Product("x1","select",img("photo-1593642632559-0c6d3fc62b89"),"USB-C 编织数据线 60W 1.5m",19.9,49.0,"凑单",TagKind.MINT,4.5,4.9),
        Product("x3","select",img("photo-1556228852-80b6e5eeff06"),"三层抽纸 4 层加厚 27 包整箱",39.9,69.0,"日用",TagKind.MINT,6.6,4.9),
        Product("x4","select",img("photo-1571781926291-c477ebfd024b"),"声波电动牙刷 IPX7 防水 4 刷头",199.0,399.0,"直降",TagKind.RED,2.4,4.7),
        Product("x5","select",img("photo-1556228720-195a672e8a03"),"氨基酸洗发水 控油蓬松 500ml",49.9,99.0,"回购",TagKind.GOLD,3.8,4.8),
    )

    // 后端拉取后覆盖（可观察）；初值为 seed，启动即渲染。声明在 seed 之后避免前向引用。
    var products by mutableStateOf(seed)
        private set

    fun byId(id: String): Product = products.firstOrNull { it.id == id } ?: products.first()
    fun byScene(scene: String): List<Product> = products.filter { it.scene == scene }

    /** 启动时后台拉真实后端数据（分→元），覆盖全部 seed。失败静默（仍显示 seed）。 */
    fun load() = thread {
        try {
            val bootstrap = NetworkClient.fetchBootstrap()
            val realProducts = bootstrap.products.map { it.toProduct() }
            if (realProducts.isNotEmpty()) products = realProducts
            val realCats = bootstrap.categories.map { Scene(it.id, it.name, it.icon) }
            if (realCats.isNotEmpty()) scenes = realCats
            val realHeros = bootstrap.heroRecs.map { it.toHeroRec() }
            if (realHeros.isNotEmpty()) heroRecs = realHeros
            banners = bootstrap.banners.map { Banner(it.id, it.tone, it.title, it.sub, it.img) }
        } catch (_: Exception) { /* 离线/隧道未起：保留 seed */ }
    }

    private fun ApiProduct.toProduct() = Product(
        id = id, scene = cat, img = img, title = title,
        price = priceFen / 100.0,
        ori = if (oriFen > priceFen) oriFen / 100.0 else null,
        tag = tag.ifBlank { null },
        tagKind = tagKindOf(tag),
        sold = sold, star = star,
    )

    private fun ApiHero.toHeroRec() = HeroRec(
        id = id, icon = icon, tag = tag, title = title, sub = sub,
        statValue = statValue, statLabel = statLabel,
        itemIds = itemIds, cta = cta, tone = tone, navScene = navScene,
    )

    private fun tagKindOf(tag: String): TagKind = when {
        tag.contains("秒杀") || tag.contains("限时") || tag.contains("直降") || tag.contains("特价") || tag.contains("抢") -> TagKind.RED
        tag.contains("热销") || tag.contains("会员") || tag.contains("黑科技") || tag.contains("年度") -> TagKind.GOLD
        tag.contains("新品") || tag.contains("联名") || tag.contains("通用") || tag.contains("配套") -> TagKind.CYAN
        else -> TagKind.MINT
    }

    private val seedHeroRecs = listOf(
        HeroRec("rec-svc-area","location","前方 3 km · 服务区","张江服务区 · 8 家可自提",
            "继续直行 · 预计 4 分钟可达 · 充电桩可用 4 / 6","4 / 6","充电桩 · 实时",
            listOf("e2","f2","t4","e5"),"导航前往","mint","energy"),
        HeroRec("rec-noon","cookie","正午 11:42 · 速达","12 点前到家 · 老乡鸡 / 瑞幸 / 麦当劳",
            "基于车辆当前路径 · 预计 32 分钟后抵家","32 分钟","到家 ETA",
            listOf("f1","f2","f5","f7"),"看 28 家速达","gold","eat"),
        HeroRec("rec-low","bolt","该补给了","玻璃水还剩 1 瓶 · 上次买 28 天前",
            "基于车主常买规律 · 一键再买送上车","28 天前","上次购买",
            listOf("e4","e1","g1","g2"),"一键再买 ¥ 29.9","cyan","energy"),
        HeroRec("rec-night","sparkles","今晚 21:00 · 出差","虹桥 ⇌ 浦东 · 8 家亚朵酒店有房",
            "日历提示 · 明日 09:00 北京会议 · 同城已订","¥ 488","起 / 晚",
            listOf("t1","t2","t4","t5"),"看 12 家酒店","blue","trip"),
    )
    /** 启动即渲染；load() 后 API 覆盖。 */
    var heroRecs by mutableStateOf(seedHeroRecs)
        private set

    /** 顶部 banner（API 返回后覆盖；初始为空，不影响 seed 产品展示）。 */
    var banners by mutableStateOf(emptyList<Banner>())
        private set
}
