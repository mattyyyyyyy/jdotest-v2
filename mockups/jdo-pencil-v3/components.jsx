/* global React */
// Shared UI: icons, StatusBar, Dock, ProductCard.
// All components exported to window for cross-file use.

const { useState, useEffect, useRef } = React;

// ─── Icon set (Lucide-style strokes) ─────────────────────────────────────
const Icon = ({ name, size = 24, stroke = 'currentColor', fill = 'none', sw = 2 }) => {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  const paths = {
    search:    <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    home:      <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></>,
    company:   <><rect x="4" y="6" width="16" height="14" rx="1.5" /><path d="M9 6V3h6v3" /><path d="M9 12h2M13 12h2M9 16h2M13 16h2" /></>,
    bolt:      <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>,
    car:       <><path d="M5 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2M15 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2" /><path d="M3 12h18M5 17h14a1 1 0 0 0 1-1v-3.5a2 2 0 0 0-.5-1.3l-2.7-3.4A2 2 0 0 0 15.2 7H8.8a2 2 0 0 0-1.6.8L4.5 11.2A2 2 0 0 0 4 12.5V16a1 1 0 0 0 1 1Z" /><circle cx="7.5" cy="14.5" r="1" /><circle cx="16.5" cy="14.5" r="1" /></>,
    compass:   <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 6-4 2 2-6 4-2Z" /></>,
    phone:     <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.18 4.18 2 2 0 0 1 4.16 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.32a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92Z" /></>,
    music:     <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
    volume:    <><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></>,
    chevL:     <><path d="m15 18-6-6 6-6" /></>,
    chevR:     <><path d="m9 18 6-6-6-6" /></>,
    bluetooth: <><path d="m7 7 10 10-5 5V2l5 5-10 10" /></>,
    wifi:      <><path d="M2 8.82A15 15 0 0 1 22 8.82" /><path d="M5 12.86a10 10 0 0 1 14 0" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" /></>,
    cloud:     <><path d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A4.5 4.5 0 0 0 6 18Z" /></>,
    sunCloud:  <><path d="M8 8.5a5 5 0 0 1 9.5 1.6A3.5 3.5 0 0 1 18 17H8a4.5 4.5 0 0 1 0-9Z" /><path d="M3 9h1M5.5 5.5l.7.7M9 4v1" /></>,
    play:      <><path d="m6 4 14 8-14 8V4Z" fill="currentColor" stroke="none" /></>,
    pause:     <><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" /></>,
    prev:      <><path d="M19 20 9 12l10-8v16Z" fill="currentColor" stroke="none" /><rect x="5" y="4" width="2" height="16" fill="currentColor" stroke="none" /></>,
    next:      <><path d="M5 4l10 8L5 20V4Z" fill="currentColor" stroke="none" /><rect x="17" y="4" width="2" height="16" fill="currentColor" stroke="none" /></>,
    plus:      <><path d="M12 5v14M5 12h14" /></>,
    cart:      <><path d="M2 4h2l3 12h12l2-8H6" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    bag:       <><path d="M5 8h14l1 14H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    star:      <><path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.8 6.2 20.8l1.1-6.4L2.6 9.8l6.5-.9L12 3Z" fill="currentColor" stroke="none" /></>,
    user:      <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    settings:  <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
    mic:       <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
    sort:      <><path d="M3 7h13M3 12h9M3 17h5" /><path d="m17 17 4-4-4-4" /></>,
    filter:    <><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" /></>,
    arrowDown: <><path d="M12 5v14M5 12l7 7 7-7" /></>,
    battery:   <><rect x="2" y="7" width="18" height="10" rx="2" /><rect x="4" y="9" width="11" height="6" rx="1" fill="currentColor" stroke="none" /><rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor" stroke="none" /></>,
    location:  <><path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>,
    package:   <><path d="m21 8-9-5-9 5v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v10" /></>,
    back:      <><path d="m19 12H5M12 19l-7-7 7-7" /></>,
    sparkles:  <><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" /><path d="M19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" /><path d="M5 4l.7 2L8 7l-2.3.7L5 10l-.7-2.3L2 7l2.3-.7L5 4Z" /></>,
    headphones:<><path d="M3 14a9 9 0 0 1 18 0v6a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" /><path d="M3 14v6a1 1 0 0 0 1 1h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3" /></>,
    cookie:    <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="8.5" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="9" r=".8" fill="currentColor" stroke="none" /><circle cx="14.5" cy="14" r=".8" fill="currentColor" stroke="none" /><circle cx="9" cy="14.5" r=".8" fill="currentColor" stroke="none" /><circle cx="12" cy="11" r=".8" fill="currentColor" stroke="none" /></>,
    leaf:      <><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-10 1 0 4 0 7 1 1 8-3 14-9 16Z" /><path d="M11 20c0-5 3-9 7-11" /></>,
    shirt:     <><path d="M20.4 6.6 16 4l-4 2-4-2-4.4 2.6L5 10h2v11h10V10h2l1.4-3.4Z" /></>,
    dumbbell:  <><path d="M6 6v12M3 9v6M21 9v6M18 6v12M5 12h14" /></>,
    luggage:   <><rect x="6" y="7" width="12" height="14" rx="2" /><path d="M10 7V4h4v3" /><path d="M9 11v6M15 11v6" /></>,
    book:      <><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H6a2 2 0 0 0-2 2V5" /><path d="M6 19h14" /></>,
    baby:      <><circle cx="12" cy="12" r="9" /><circle cx="9" cy="11" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="11" r=".8" fill="currentColor" stroke="none" /><path d="M9.5 15c1 1.5 4 1.5 5 0" /><path d="M4 8.5 6 7M20 8.5 18 7" /></>,
    wrench:    <><path d="M14.7 6.3a4.6 4.6 0 0 1 5.7 5.7l-9 9-5.7-5.7 9-9Z" /><circle cx="17" cy="9" r="1" fill="currentColor" stroke="none" /></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
};

// ─── Status Bar ──────────────────────────────────────────────────────────
function StatusBar({ time = '09:20' }) {
  return (
    <div className="statusbar">
      <div className="sb-left">
        <div className="sb-avatar"><img src="assets/jidoulogo.png" alt="JDO" /></div>
        <div className="sb-brand">JDO</div>
        <div className="sb-pill"><Icon name="battery" size={22} /> 560 km</div>
        <div className="sb-gear">D</div>
      </div>

      <div />

      <div className="sb-right">
        <Icon name="bluetooth" size={26} />
        <Icon name="wifi" size={26} />
        <div className="sb-pill">
          <Icon name="sunCloud" size={22} />
          20°C
        </div>
        <div className="sb-time">{time}</div>
      </div>
    </div>
  );
}

// ─── Dock (bottom system bar) ────────────────────────────────────────────
function Dock({ route, onNav }) {
  const apps = [
    { id: 'shop',  label: '商城', g: 'linear-gradient(135deg, #06b6d4, #2563eb)',          glyph: '🛒' },
    { id: 'map',   label: '导航', g: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',          glyph: '⌖'  },
    { id: 'music', label: '音乐', g: 'linear-gradient(135deg, #f97316, #b45309)',          glyph: '♬'  },
    { id: 'apps',  label: '应用', g: 'linear-gradient(135deg, #06b6d4, #1e3a8a)',          glyph: '▦'  },
  ];

  return (
    <div className="dock">
      <div className="dock-group">
        <button className="dock-icon" title="主页" onClick={() => onNav && onNav('ivi')}>
          <Icon name="home" />
        </button>
        <button className="dock-icon" title="车辆">
          <Icon name="car" />
        </button>
        <button className="dock-icon" title="导航">
          <Icon name="compass" />
        </button>
      </div>

      <div className="dock-center">
        <div className="dock-temp">
          <button title="降温"><Icon name="chevL" /></button>
          23°
          <button title="升温"><Icon name="chevR" /></button>
        </div>
        <div className="dock-apps">
          {apps.map(a => {
            const isInMall = route && route.startsWith('mall');
            const handleClick = () => {
              if (!onNav) return;
              if (a.id === 'shop') {
                // Toggle: in mall → 收回到 ivi; otherwise → open mall-home
                onNav(isInMall ? 'ivi' : 'mall-home');
              }
            };
            return (
              <button
                key={a.id}
                className={'dock-app' + (a.id === 'shop' && isInMall ? ' active' : '')}
                style={{ background: a.g, color: '#fff' }}
                title={a.id === 'shop' && isInMall ? a.label + '（点击收回）' : a.label}
                onClick={handleClick}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {a.glyph}
                </span>
              </button>
            );
          })}
        </div>
        <div className="dock-temp">
          <button title="降温"><Icon name="chevL" /></button>
          23°
          <button title="升温"><Icon name="chevR" /></button>
        </div>
      </div>

      <div className="dock-group">
        <button className="dock-icon" title="电话"><Icon name="phone" /></button>
        <button className="dock-icon" title="音乐"><Icon name="music" /></button>
        <button className="dock-icon" title="音量"><Icon name="volume" /></button>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────
function ProductCard({ p, onNav }) {
  const ribbonClass = ({ red: '', mint: 'cyan', gold: 'gold', cyan: 'cyan' }[p.tagKind || 'red']) || '';
  return (
    <div className="prod-card" onClick={() => onNav && onNav('mall-detail')}>
      <div className="prod-img" style={{ backgroundImage: `url(${p.img})` }}>
        {p.tag && (
          <div className={'ribbon ' + ribbonClass}>{p.tag}</div>
        )}
        <button className="quickadd" title="加入购物车" onClick={(e) => { e.stopPropagation(); onNav && onNav('mall-cart'); }}>
          <Icon name="plus" size={28} />
        </button>
      </div>
      <div className="prod-info">
        <div className="prod-title">{p.title}</div>
        <div className="prod-price">
          <span className="cur"><span className="sym">¥</span>{p.price.toFixed(p.price % 1 ? 1 : 0)}</span>
          {p.ori > 0 && <span className="ori">¥{p.ori}</span>}
        </div>
        <div className="prod-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
            <Icon name="star" size={14} /> {p.star}
          </span>
          <span className="dot" />
          <span>已售 {p.sold}k+</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, StatusBar, Dock, ProductCard });
