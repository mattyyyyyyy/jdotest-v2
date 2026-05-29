/* global React, StatusBar, Icon */

const { useMemo: useMemoDr } = React;

function MallDriving({ onNav }) {
  const products = window.JDO_DATA.products;
  const repeats = ['e4', 'g1', 'f5', 'x3'].map((id) => products.find((p) => p.id === id));
  const repeatMeta = useMemoDr(() => repeats.map(() => ({
    daysAgo: Math.floor(Math.random() * 30) + 1,
    times: Math.floor(Math.random() * 5) + 2,
  })), []);

  return (
    <>
      <StatusBar />
      <div className="driving-banner">
        <div className="ico"><Icon name="bolt" size={26} sw={2} /></div>
        <div>
          <div style={{ fontSize: 22, color: 'var(--color-driving)' }}>行车态 · 仅显示常用补给 · 已默认地址与支付</div>
          <div style={{ fontSize: 16, color: 'var(--color-text-muted)' }}>停车后自动恢复完整商城 · 键盘 / 视频 / 自动播放已关闭</div>
        </div>
        <span style={{ marginLeft: 'auto' }} />
        <button className="voice-pill" style={{ height: 56, fontSize: 22 }}>
          <span className="orb" style={{ width: 32, height: 32 }} />
          点这说话
        </button>
        <span className="speed">23<span className="unit">km/h</span></span>
      </div>

      <div className="driving-stage">
        <div className="driving-bar">
          <div className="titlebar">
            <span className="accent">早安，李先生</span> · 想再买点什么？
          </div>
          <button className="voice-pill" onClick={() => onNav('mall-home')}>
            <span className="orb" />
            "我要买玻璃水"
          </button>
          <button className="spec-opt" style={{ height: 80, padding: '0 28px', fontSize: 22 }} onClick={() => onNav('mall-orders')}>
            <Icon name="package" size={24} sw={1.5} />
            <span style={{ marginLeft: 8 }}>待取订单 · 1</span>
          </button>
        </div>

        <div className="driving-body">
          {/* Re-buy grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 30, fontWeight: 500 }}>再买一次 · 一键下单</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 20 }}>基于你过去 30 天的复购规律</span>
            </div>
            <div className="repeat-grid" style={{ flex: 1, minHeight: 0 }}>
              {repeats.map((p, i) => (
                <div key={p.id} className="repeat-card">
                  <div className="repeat-img" style={{ backgroundImage: `url(${p.img})` }} />
                  <div className="repeat-info">
                    <div>
                      <div className="repeat-name">{p.title}</div>
                      <div className="repeat-meta">上次 {repeatMeta[i].daysAgo} 天前 · 累计已买 {repeatMeta[i].times} 次</div>
                    </div>
                    <div className="repeat-price">
                      <span className="cur"><span className="sym">¥</span>{p.price.toFixed(p.price % 1 ? 1 : 0)}</span>
                      {p.ori && <span className="ori">¥{p.ori}</span>}
                    </div>
                    <button className="repeat-cta" onClick={() => onNav('mall-pay')}>
                      <Icon name="bolt" size={22} sw={2} stroke="#1a0a00" fill="#1a0a00" />
                      一键再买 · ¥{p.price.toFixed(p.price % 1 ? 1 : 0)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: default address/payment + safety */}
          <div className="driving-side">
            <div className="driving-info-card">
              <div style={{ fontSize: 22, color: 'var(--color-text-secondary)' }}>默认收货地址</div>
              <div className="row">
                <div className="ico"><Icon name="car" size={28} sw={1.5} /></div>
                <div>
                  <div className="l">车上 · 实时定位</div>
                  <div className="v">上海市 浦东 · 浦东张衡路停车场</div>
                </div>
                <div className="change-btn">
                  <Icon name="settings" size={16} sw={1.5} />
                  <span style={{ marginLeft: 6 }}>停车后可改</span>
                </div>
              </div>
            </div>

            <div className="driving-info-card">
              <div style={{ fontSize: 22, color: 'var(--color-text-secondary)' }}>默认支付</div>
              <div className="row">
                <div className="ico gold" style={{ background: 'rgba(214,188,138,0.20)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>JD</span>
                </div>
                <div>
                  <div className="l">JDO 联名卡 · 已绑定免密 ≤ ¥ 500</div>
                  <div className="v">**** 4521 · 黄金车主 95 折叠加</div>
                </div>
                <div className="change-btn">
                  <Icon name="settings" size={16} sw={1.5} />
                  <span style={{ marginLeft: 6 }}>停车后可改</span>
                </div>
              </div>
            </div>

            <div className="driving-info-card" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.10), rgba(20,22,26,0.50))', borderColor: 'rgba(251,146,60,0.30)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="ico" style={{ background: 'rgba(251,146,60,0.20)', color: 'var(--color-driving)' }}>
                  <Icon name="bolt" size={28} sw={1.5} />
                </div>
                <div>
                  <div className="v" style={{ color: 'var(--color-driving)', marginTop: 0 }}>行车安全保障</div>
                  <div className="l" style={{ fontSize: 18 }}>键盘 · 视频 · 表单输入 · 银行卡号 自动关闭</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                {['🔒 禁键盘', '🚫 禁视频', '🚫 禁密码', '🎙 语音优先', '👤 大字号', '🛑 ≤3 步下单'].map((t) => (
                  <span key={t} style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 18, color: 'var(--color-text-secondary)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.MallDriving = MallDriving;
