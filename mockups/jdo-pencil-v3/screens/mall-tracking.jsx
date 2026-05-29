/* global React, StatusBar, Dock, Icon */

function MallTracking({ onNav }) {
  const products = window.JDO_DATA.products;
  const items = ['f5', 'f7'].map((id) => products.find((p) => p.id === id));

  const timeline = [
    { label: '订单提交',  meta: '上海·浦东 JDO 车机',           time: '昨天 17:58', state: 'done' },
    { label: '付款完成',  meta: 'JDO 联名卡 · **** 4521',        time: '昨天 18:02', state: 'done' },
    { label: '商家备货',  meta: 'JDO 浦东仓 · A 区货架',         time: '昨天 19:30', state: 'done' },
    { label: '已揽收',    meta: '顺丰同城 · 张师傅',              time: '今天 08:14', state: 'done' },
    { label: '配送中 · 即将送达',  meta: '距离车辆 480m · ETA 8 分钟',  time: '刚刚',   state: 'now' },
    { label: '签收完成',  meta: '骑手亲自送至车辆',               time: '—',          state: '' },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-orders')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">物流详情 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>JDO20260525331205</span></div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">运输轨迹</span>
            <span className="subbar-tab">订单详情</span>
            <span className="subbar-tab">骑手 / 客服</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="刷新"><Icon name="search" size={28} /></button>
            <button className="spec-opt" style={{ height: 56 }}>
              <Icon name="phone" size={20} sw={1.5} /> 一键联系
            </button>
          </div>
        </div>

        <div className="tracking-body">
          {/* Map */}
          <div className="tracking-map">
            {/* route svg */}
            <div className="tracking-route">
              <svg viewBox="0 0 800 600" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="60%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <path
                  d="M 90 480 C 200 380, 280 320, 360 260 S 540 200, 620 130"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="6"
                  strokeDasharray="4 12"
                />
                <path
                  d="M 90 480 C 200 380, 280 320, 360 260"
                  fill="none"
                  stroke="url(#route)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Overlay chips */}
            <div className="tracking-overlay">
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="tracking-chip green">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
                  实时追踪中 · 每 5 秒更新
                </span>
                <span className="tracking-chip">顺丰同城 · 同城速达</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text-primary)' }}>+</button>
                <button style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text-primary)' }}>−</button>
                <button style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text-primary)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="compass" size={22} sw={1.5} />
                </button>
              </div>
            </div>

            {/* Pins */}
            <div className="t-pin warehouse" style={{ top: '85%', left: '12%' }}>
              <div className="head"><span style={{ fontSize: 16 }}>仓</span></div>
              <div className="lbl">JDO 浦东仓 · 张江</div>
            </div>
            <div className="t-pin moving" style={{ top: '50%', left: '46%' }}>
              <div className="head"><span><Icon name="package" size={24} sw={2} stroke="#03171f" /></span></div>
              <div className="lbl">骑手 张师傅 · 480m</div>
            </div>
            <div className="t-pin you" style={{ top: '22%', left: '78%' }}>
              <div className="head"><span><Icon name="car" size={24} sw={2} stroke="#fff" /></span></div>
              <div className="lbl">您在这里 · 张衡路停车场</div>
            </div>

            {/* Driver card */}
            <div className="driver-card">
              <div className="driver-avatar">张</div>
              <div>
                <div className="driver-name">张师傅 · 顺丰同城</div>
                <div className="driver-meta">沪 A·D8842 · 5 年同城 · ★ 4.96 / 5</div>
              </div>
              <button className="driver-action" title="发消息"><Icon name="phone" size={26} sw={1.5} /></button>
              <button className="driver-action primary" title="一键呼叫"><Icon name="phone" size={26} sw={2} stroke="#03171f" /></button>
            </div>

            {/* Scale */}
            <div style={{ position: 'absolute', bottom: 120, right: 18, padding: '8px 14px', background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: 'var(--color-text-muted)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
              500 m · 比例尺
            </div>
          </div>

          {/* Right column */}
          <div className="tracking-right">
            <div className="tracking-status">
              <span className="badge">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
                配送中 · 即将送达
              </span>
              <div>
                <div className="eta">8<span className="unit">分钟</span> <span style={{ fontSize: 36, color: 'var(--color-text-muted)', fontWeight: 300, marginLeft: 12 }}>· 距离 480 m</span></div>
                <div className="place" style={{ marginTop: 6 }}>骑手已抵达 · 浦东张衡路</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                {['送至车辆停车点', '车主到岗扫码取', '联系副驾代收'].map((t) => (
                  <span key={t} style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.25)', fontSize: 18, color: 'var(--color-mint)' }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="tl-feed">
              <div style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>实时轨迹</div>
              {timeline.map((t, i) => (
                <div key={i} className={'tl-feed-row ' + t.state}>
                  <div className="col"><div className="dot" /></div>
                  <div>
                    <div className="label">{t.label}</div>
                    <div className="meta">{t.meta}</div>
                  </div>
                  <div className="time">{t.time}</div>
                </div>
              ))}
            </div>

            <div className="profile-section" style={{ padding: '18px 22px', gap: 10 }}>
              <h4 style={{ fontSize: 22 }}>本单商品 · {items.length} 件</h4>
              {items.map((p) => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'center' }}>
                  <div className="order-thumb" style={{ width: 60, height: 60, backgroundImage: `url(${p.img})` }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>规格 · 默认 · × 1</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500 }}>¥ {p.price.toFixed(p.price % 1 ? 1 : 0)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-tracking" onNav={onNav} />
    </>
  );
}

window.MallTracking = MallTracking;
