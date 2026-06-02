# Android 原生次级页面与 V3 Web 回归审计

> 日期：2026-06-02  
> 范围：排除 IVI 首页和商城首页，检查其余 19 个 Compose 页面与 `mockups/jdo-pencil-v3/screens/` 的页面骨架、导航循环和后台同步。  
> 结论：21 条原生路由均已挂载；交易主循环已补成真实前后台闭环。部分账户与履约页仍是 V3 演示数据壳，不能误报为已同步。

## 1. 已修复的 P0 闭环

| 问题 | 原因 | 修复 |
|---|---|---|
| 支付页点击「我已支付」后仍显示待付款 | 原生端只刷新 `/orders` 并跳页，没有上报支付结果 | 新增 `POST /api/v1/payments/:orderId/confirm`，后端通过共享状态机持久化 `paid`；原生等待确认成功后再跳订单页 |
| V3 Web 对照原型点击「我已支付」也只跳页 | 原型未保存结算生成的订单号 | 结算页通过 `sessionStorage` 传递订单号，支付页调用同一 payment 确认端点 |
| 提交订单后支付页偶发拿不到订单号 | `/cart/checkout` 仍在线程执行时已跳转 | 结算成功回调后再进入支付页 |
| 商品详情「立即购买」偶发进入空结算页 | `/cart/items` 加购与结算页拉取发生竞态 | 加购成功回调后再进入结算页 |
| 行车态一键再买只跳支付页 | 未创建真实订单 | 先调用 `/orders` 建单，成功后进入支付页 |
| 订单 tab 只是外观，没有过滤 | chip 没有状态和过滤逻辑 | 按后端原始状态过滤，并按状态渲染时间线和按钮 |
| 搜索建议不可进入商品详情 | 建议行未挂点击导航 | 点击时记录商品 id 并进入详情 |

## 2. 19 个次级页面矩阵

| # | 原生路由 | V3 Web 参照 | 页面骨架 | 后台同步 | 当前结论 |
|---|---|---|---|---|---|
| 03 | `mall_category` | `mall-category.jsx` | 已对齐 rail / 排序 / 网格 | 商品由 `/bootstrap` 同步 | 已闭合 |
| 04 | `mall_search` | `mall-search.jsx` | 已对齐热词 / 历史 / 建议 | 建议基于本地 catalog | 已补详情跳转；搜索接口待接 |
| 05 | `mall_detail` | `mall-detail.jsx` | 已对齐图库 / 规格 / 数量 / CTA | 加购写 `/cart/items` | 已闭合 |
| 06 | `mall_cart` | `mall-cart.jsx` | 已对齐列表 / 数量 / 汇总 | 读写 `/cart` | 已闭合；删除入口可继续补 |
| 07 | `mall_checkout` | `mall-checkout.jsx` | 已对齐地址 / 配送 / 支付 / 清单 | 写 `/cart/checkout` | 已闭合；配送方式暂未入单 |
| 08 | `mall_pay` | `mall-pay.jsx` | 已对齐扫码支付骨架 | 写 `/payments/:id/confirm` | 已闭合；二维码仍为 demo |
| 09 | `mall_orders` | `mall-orders.jsx` | 已对齐列表 / tab / 时间线 / 动作 | 读 `/orders`，后台订单同步可见 | 已闭合 |
| 10 | `mall_profile` | `mall-profile.jsx` | 已对齐个人中心区块 | 统计仍为演示数据 | 展示壳 |
| 11 | `mall_addresses` | `mall-addresses.jsx` | 已对齐地址列表 / 自提地图骨架 | 未接地址 CRUD | 展示壳 |
| 12 | `mall_coupons` | `mall-coupons.jsx` | 已对齐优惠券卡片 / tab | 未读后台 coupons | 展示壳 |
| 13 | `mall_login` | `mall-login.jsx` | 已对齐扫码登录骨架 | 后端 QR auth 已有，原生尚未接 | 展示壳，P1 |
| 14 | `mall_driving` | `mall-driving.jsx` | 已对齐行车态补给 / 默认信息 | 一键再买已写 `/orders` | 交易已闭合；车速仍 mock |
| 15 | `mall_reviews` | `mall-reviews.jsx` | 已对齐评分 / 评价列表 | 未读后台 reviews | 展示壳 |
| 16 | `mall_points` | `mall-points.jsx` | 已对齐积分卡 / 兑换网格 | 未接积分账户 | 展示壳 |
| 17 | `mall_aftersale` | `mall-aftersale.jsx` | 已对齐售后进度 / 类型 / 商品 | 未接后台 aftersale | 展示壳，P1 |
| 18 | `mall_tracking` | `mall-tracking.jsx` | 已对齐地图 / 轨迹 / ETA | 未读后台 shipping | 展示壳，P1 |
| 19 | `mall_favorites` | `mall-favorites.jsx` | 已对齐收藏 / 浏览历史网格 | 未接收藏接口 | 展示壳 |
| 20 | `mall_wallet` | `mall-wallet.jsx` | 已对齐余额 / 快捷操作 / 明细 | 未接钱包接口 | 展示壳 |
| 21 | `mall_settings` | `mall-settings.jsx` | 已对齐设置分组与开关 | 开关仅本地状态 | 展示壳 |

## 3. 前后台同步边界

### 已真实同步

- 商品与场景：启动拉取 `/api/v1/bootstrap`，后台商品上下架和新增可反映到原生端。
- 购物车：`/api/v1/cart`、`/api/v1/cart/items`、`/api/v1/cart/items/:id`。
- 下单：`/api/v1/cart/checkout` 与 `/api/v1/orders`。
- 支付确认：`/api/v1/payments/:orderId/confirm`。
- 订单列表：`/api/v1/orders`；后台 `/api/v1/admin/orders` 读取同一份 store。

### 尚未同步

- 登录 UI 尚未调用已存在的 QR auth 接口。
- 地址、优惠券、评价、积分、售后、物流、收藏、钱包和设置页仍使用 Compose 内置演示数据。

## 4. 持续回归

运行静态契约、API 和 Android 构建：

```bash
apps/android-ivi/scripts/regression-check.sh
```

追加模拟器真实点击回归：

```bash
apps/android-ivi/scripts/regression-check.sh --emulator
```

模拟器脚本会执行：进入商城 → 打开购物车 → 去结算 → 提交订单 → 我已支付 → 断言订单页出现「待发货」→ 断言后端最新订单状态为 `PAID` → 检查 crash buffer。
