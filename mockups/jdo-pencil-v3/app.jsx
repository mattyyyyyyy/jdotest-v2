/* global React, ReactDOM, IVIHome, MallHome, MallCategory, MallDetail, MallCart, MallCheckout, MallPay, MallOrders, MallProfile, MallLogin, MallDriving, MallSearch, MallAddresses, MallCoupons, MallReviews, MallPoints, MallAftersale, MallTracking, MallFavorites, MallWallet, MallSettings, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect */

const { useState: useStateApp, useEffect: useEffectApp, useRef } = React;

const APP_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "cols": 4,
  "initialScreen": "ivi"
}/*EDITMODE-END*/;

const ROUTES = [
  { id: 'ivi',            label: '01 · 车机首页' },
  { id: 'mall-home',      label: '02 · 商城首页' },
  { id: 'mall-category',  label: '03 · 分类 / 搜索' },
  { id: 'mall-search',    label: '04 · 搜索（热词 / 联想）' },
  { id: 'mall-detail',    label: '05 · 商品详情' },
  { id: 'mall-cart',      label: '06 · 购物车' },
  { id: 'mall-checkout',  label: '07 · 确认订单' },
  { id: 'mall-pay',       label: '08 · 扫码支付' },
  { id: 'mall-orders',    label: '09 · 我的订单' },
  { id: 'mall-profile',   label: '10 · 我的' },
  { id: 'mall-addresses', label: '11 · 收货地址 + 自提点' },
  { id: 'mall-coupons',   label: '12 · 优惠券中心' },
  { id: 'mall-login',     label: '13 · 登录' },
  { id: 'mall-driving',   label: '14 · 行车态首页' },
  { id: 'mall-reviews',   label: '15 · 商品评价' },
  { id: 'mall-points',    label: '16 · 积分商城' },
  { id: 'mall-aftersale', label: '17 · 售后服务' },
  { id: 'mall-tracking',  label: '18 · 物流详情' },
  { id: 'mall-favorites', label: '19 · 收藏 & 浏览历史' },
  { id: 'mall-wallet',    label: '20 · 车主钱包' },
  { id: 'mall-settings',  label: '21 · 设置中心' },
];

function App() {
  const [t, setTweak] = useTweaks(APP_DEFAULTS);
  const validInitial = ROUTES.find((r) => r.id === APP_DEFAULTS.initialScreen)?.id || 'ivi';
  const [route, setRoute] = useStateApp(validInitial);

  const [enteringMall, setEnteringMall] = useStateApp(false);

  // Reset entering flag after animation finishes (550ms = 500ms anim + small buffer)
  React.useEffect(() => {
    if (enteringMall) {
      const t = setTimeout(() => setEnteringMall(false), 550);
      return () => clearTimeout(t);
    }
  }, [enteringMall]);

  useEffectApp(() => {
    const canvas = document.querySelector('.canvas');
    if (canvas) canvas.setAttribute('data-theme', t.theme);
    document.documentElement.setAttribute('data-theme', t.theme);
  }, [t.theme]);

  // Set entering flag synchronously *before* the route change paints — so the
  // canvas already has data-entering="mall" on the very first frame of the new
  // mall content. Otherwise mall renders normal for 1 frame, then the CSS
  // animation kicks in by jumping back to translateY(40%) — visually a
  // "exit-then-enter" stutter, then on subsequent navs a "slide-down vanish".
  const onNav = (next) => {
    const isMallNow = route.startsWith('mall');
    const isMallNext = next.startsWith('mall');
    if (!isMallNow && isMallNext) {
      setEnteringMall(true);   // batched with setRoute below in React 18+
    } else if (isMallNow && !isMallNext) {
      setEnteringMall(false);
    }
    setRoute(next);
  };

  const cur = ROUTES.find((r) => r.id === route)?.label || '01 IVI Home';

  return (
    <div
      className="canvas"
      data-theme={t.theme}
      data-mode={route === 'mall-driving' ? 'driving' : 'parked'}
      data-screen-label={cur.replace(' · ', ' ')}
      data-area={route === 'ivi' ? 'home' : 'mall'}
      data-entering={enteringMall ? 'mall' : undefined}
    >
      {route === 'ivi'            && <IVIHome onNav={onNav} />}
      {route === 'mall-home'      && <MallHome onNav={onNav} cols={t.cols} />}
      {route === 'mall-category'  && <MallCategory onNav={onNav} cols={t.cols} />}
      {route === 'mall-search'    && <MallSearch onNav={onNav} />}
      {route === 'mall-detail'    && <MallDetail onNav={onNav} />}
      {route === 'mall-cart'      && <MallCart onNav={onNav} />}
      {route === 'mall-checkout'  && <MallCheckout onNav={onNav} />}
      {route === 'mall-pay'       && <MallPay onNav={onNav} />}
      {route === 'mall-orders'    && <MallOrders onNav={onNav} />}
      {route === 'mall-profile'   && <MallProfile onNav={onNav} />}
      {route === 'mall-addresses' && <MallAddresses onNav={onNav} />}
      {route === 'mall-coupons'   && <MallCoupons onNav={onNav} />}
      {route === 'mall-login'     && <MallLogin onNav={onNav} />}
      {route === 'mall-driving'   && <MallDriving onNav={onNav} />}
      {route === 'mall-reviews'   && <MallReviews onNav={onNav} />}
      {route === 'mall-points'    && <MallPoints onNav={onNav} />}
      {route === 'mall-aftersale' && <MallAftersale onNav={onNav} />}
      {route === 'mall-tracking'  && <MallTracking onNav={onNav} />}
      {route === 'mall-favorites' && <MallFavorites onNav={onNav} />}
      {route === 'mall-wallet'    && <MallWallet onNav={onNav} />}
      {route === 'mall-settings'  && <MallSettings onNav={onNav} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="主题">
          <TweakRadio
            label="配色"
            value={t.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'dark',  label: '深色' },
              { value: 'light', label: '浅色' },
            ]}
          />
        </TweakSection>
        <TweakSection label="商品网格">
          <TweakRadio
            label="每行列数"
            value={String(t.cols)}
            onChange={(v) => setTweak('cols', Number(v))}
            options={[
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' },
            ]}
          />
        </TweakSection>
        <TweakSection label="行车态演示">
          <TweakRadio
            label="状态"
            value={route === 'mall-driving' ? 'driving' : 'parked'}
            onChange={(v) => setRoute(v === 'driving' ? 'mall-driving' : 'mall-home')}
            options={[
              { value: 'parked',   label: '停车态' },
              { value: 'driving',  label: '行车态' },
            ]}
          />
        </TweakSection>
        <TweakSection label="跳转">
          <TweakSelect
            label="当前页面"
            value={route}
            onChange={(v) => setRoute(v)}
            options={ROUTES.map((r) => ({ value: r.id, label: r.label }))}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
