/* global React, StatusBar, Dock, Icon */

function IVIHome({ onNav }) {
  return (
    <>
      <StatusBar />

      {/* Car render placeholder */}
      <div className="car-stage">
        <div className="car-render">
          <div className="car-placeholder">
            <svg className="car-glyph" viewBox="0 0 520 200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M40 130 c20 -50 70 -70 130 -72 h180 c60 2 110 22 130 72" />
              <path d="M40 130 c-5 5 -10 14 -10 22 v18 c0 5 4 8 8 8 h32 c5 0 8 -3 8 -8 v-4 h324 v4 c0 5 3 8 8 8 h32 c4 0 8 -3 8 -8 v-18 c0 -8 -5 -17 -10 -22" />
              <circle cx="120" cy="160" r="22" />
              <circle cx="400" cy="160" r="22" />
              <path d="M170 60 l20 30 M350 60 l-20 30 M210 50 h100" opacity="0.4" />
            </svg>
            <div>
              <div className="label">车型 3D 渲染占位</div>
              <div className="hint">替换为你的车型 PNG（建议透明背景，1500×850 左右）</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info cards */}
      <div className="ivi-bottom">
        {/* Quick actions */}
        <div className="gcard ivi-card">
          <div className="quick-grid">
            <button className="quick-tile" onClick={() => onNav('mall-home')}>
              <span className="qico"><Icon name="search" size={28} /></span>
              <span className="qlabel">搜索</span>
            </button>
            <button className="quick-tile">
              <span className="qico"><Icon name="home" size={28} /></span>
              <span className="qlabel">回家</span>
            </button>
            <button className="quick-tile">
              <span className="qico"><Icon name="company" size={28} /></span>
              <span className="qlabel">公司</span>
            </button>
            <button className="quick-tile">
              <span className="qico" style={{ color: 'var(--color-mint)' }}><Icon name="bolt" size={28} /></span>
              <span className="qlabel">充电</span>
            </button>
          </div>
        </div>

        {/* Music */}
        <div className="gcard ivi-card music-card">
          <div
            className="music-cover"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=70)' }}>
            
            <span className="tag">Jay</span>
          </div>
          <div className="music-meta">
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 20 }}>正在播放 · QQ 音乐</div>
            <div className="music-track">黑色幽默 — 周杰伦</div>
            <div className="music-progress" />
            <div className="music-controls">
              <button><Icon name="prev" size={24} /></button>
              <button className="play"><Icon name="play" size={28} /></button>
              <button><Icon name="next" size={24} /></button>
              <button className="source" title="切换音源" style={{ background: 'linear-gradient(135deg,#22c55e,#0a8c4a)', color: '#fff' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>Q</span>
              </button>
            </div>
          </div>
        </div>

        {/* Range / charging */}
        <div className="gcard ivi-card range-card">
          <div>
            <div className="ivi-card-title">续航</div>
            <div className="range-num">468<span className="unit">km</span></div>
            <div className="range-status">
              <span className="dot" /> 充电中
            </div>
            <div className="range-eta">剩余 0 小时 25 分</div>
          </div>
          <div className="battery-ring">
            <svg>
              <circle cx="66" cy="66" r="56" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
              <circle
                cx="66" cy="66" r="56"
                stroke="url(#bg-grad)"
                strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - 0.9)} />
              
              <defs>
                <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="bnum">90<span className="pct">%</span></div>
          </div>
        </div>

        {/* Weather */}
        <div className="gcard ivi-card weather-card">
          <div className="w-left">
            <div className="ivi-card-title">上海 · 浦东</div>
            <div className="w-temp">23<sup>°</sup></div>
            <div className="w-meta">多云 · 空气良</div>
            <div className="w-meta">东北风 2 级 · 湿度 62%</div>
          </div>
          <svg className="w-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="34" cy="40" r="14" fill="#fbbf24" stroke="none" />
            <path d="M28 78 c-12 0 -20 -8 -20 -18 c0 -8 5 -14 13 -16 c2 -12 12 -20 24 -20 c8 0 16 5 19 13 c10 1 16 8 16 17 c0 14 -12 24 -24 24 H28Z" fill="rgba(225,232,245,0.92)" stroke="none" />
          </svg>
        </div>
      </div>

      <Dock route="ivi" onNav={onNav} />
    </>);

}

window.IVIHome = IVIHome;