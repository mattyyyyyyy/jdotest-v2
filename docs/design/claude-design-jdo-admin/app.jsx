// JDO 后台 · 应用入口
(function () {
  const { useState, useEffect } = React;
  const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "accent": "#3B82F6",
    "density": "regular"
  }/*EDITMODE-END*/;

  const PAGES = {
    dashboard: 'Dashboard', products: 'Products', categories: 'Categories',
    banner: 'Banners', reco: 'Recos', coupon: 'Coupons',
    orders: 'Orders', aftersale: 'Aftersale', logistics: 'Logistics',
    users: 'Users', reviews: 'Reviews', pickup: 'Pickup',
    accounts: 'Accounts', settings: 'Settings', spec: 'Spec',
  };

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [active, setActive] = useState('dashboard');

    useEffect(() => {
      const r = document.documentElement;
      r.setAttribute('data-theme', t.theme);
      r.setAttribute('data-density', t.density);
      r.style.setProperty('--brand', t.accent);
    }, [t.theme, t.density, t.accent]);

    const PageComp = window[PAGES[active]] || window.Dashboard;

    return React.createElement('div', { className: 'jdo-app' },
      React.createElement(window.Sidebar, { active, onNav: setActive }),
      React.createElement('div', { className: 'jdo-main' },
        React.createElement(window.Topbar, { active }),
        React.createElement('main', { className: 'jdo-content' },
          React.createElement('div', { className: 'jdo-content-inner', key: active },
            React.createElement(PageComp, null))),
      ),
      React.createElement(TweaksPanel, null,
        React.createElement(TweakSection, { label: '主题' }),
        React.createElement(TweakRadio, { label: '配色模式', value: t.theme, options: ['dark', 'light'], onChange: (v) => setTweak('theme', v) }),
        React.createElement(TweakColor, { label: '品牌强调色', value: t.accent,
          options: ['#3B82F6', '#06B6D4', '#8B5CF6', '#22C55E', '#F59E0B'], onChange: (v) => setTweak('accent', v) }),
        React.createElement(TweakSection, { label: '密度' }),
        React.createElement(TweakRadio, { label: '表格密度', value: t.density, options: ['compact', 'regular', 'comfy'], onChange: (v) => setTweak('density', v) }),
      ),
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
