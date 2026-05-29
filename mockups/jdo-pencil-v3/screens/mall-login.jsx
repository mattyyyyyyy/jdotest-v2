/* global React, StatusBar, Dock, Icon */

const { useState: useStateLogin } = React;

function MallLogin({ onNav }) {
  const [mode, setMode] = useStateLogin('qr');
  const [phone, setPhone] = useStateLogin('138 1234 5678');
  const [otp] = useStateLogin('8842');

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-home')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">登录 JDO 车机商城</div>
          </div>
          <div className="subbar-tabs">
            <span className={'subbar-tab' + (mode === 'qr' ? ' active' : '')} onClick={() => setMode('qr')}>车机扫码</span>
            <span className={'subbar-tab' + (mode === 'phone' ? ' active' : '')} onClick={() => setMode('phone')}>手机验证码</span>
            <span className={'subbar-tab' + (mode === 'carrier' ? ' active' : '')} onClick={() => setMode('carrier')}>车厂账号</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="客服"><Icon name="phone" size={28} /></button>
          </div>
        </div>

        <div className="login-stage">
          <div className="login-card">
            {/* LEFT: QR or phone form, swap by mode */}
            <div className="login-side" style={{ justifyContent: 'center' }}>
              {mode === 'qr' && (
                <>
                  <h3>用手机扫码登录</h3>
                  <div className="hint">打开 JDO App / 京东 App，扫一扫上方二维码，按手机提示确认即可</div>
                  <div className="qr-wrap" style={{ width: 420, height: 420 }}>
                    <div className="qr-img" />
                    <div className="qr-corner" />
                    <div className="qr-logo">JD</div>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 20, fontFamily: 'var(--font-mono)' }}>有效期 02:37 · 自动刷新</div>
                </>
              )}
              {mode === 'phone' && (
                <>
                  <h3>用手机号 + 验证码</h3>
                  <div className="hint">已绑定的手机号会自动关联订单、地址、优惠券</div>
                  <input className="input-big" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 480 }}>
                    <div className="otp-row" style={{ flex: 1 }}>
                      {otp.split('').map((c, i) => <div key={i} className={'otp-cell filled'}>{c}</div>)}
                      {[...Array(2)].map((_, i) => <div key={'b' + i} className="otp-cell" />)}
                    </div>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 20 }}>验证码已发送至 {phone} · 58s 后重发</div>
                  <button className="btn-big primary" style={{ width: '100%', maxWidth: 480, height: 80, fontSize: 24, background: 'linear-gradient(135deg,#06b6d4,#2563eb)', boxShadow: '0 8px 20px rgba(6,182,212,0.35)' }} onClick={() => onNav('mall-home')}>登录</button>
                </>
              )}
              {mode === 'carrier' && (
                <>
                  <h3>用车厂账号一键登录</h3>
                  <div className="hint">支持的品牌将在车机系统中自动出现，登录后与你的车主账号同步</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, width: '100%', maxWidth: 540 }}>
                    {['理想', '小鹏', '蔚来', '问界', '极氪', '智己'].map((b, i) => (
                      <button key={b} className="pay-method" style={{ height: 80, justifyContent: 'flex-start' }}>
                        <span className="glyph" style={{ width: 48, height: 48, borderRadius: 12, background: ['linear-gradient(135deg,#ef4444,#7c1d1d)', 'linear-gradient(135deg,#06b6d4,#0e3b6b)', 'linear-gradient(135deg,#9ca3af,#374151)', 'linear-gradient(135deg,#d6bc8a,#7c5f2a)', 'linear-gradient(135deg,#22c55e,#0a6b3a)', 'linear-gradient(135deg,#a855f7,#5b21b6)'][i], fontSize: 22 }}>{b[0]}</span>
                        <span style={{ fontSize: 22 }}>{b}车主</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>Demo 阶段为占位入口，正式上线由各车厂应用市场对接</div>
                </>
              )}
            </div>

            <div className="sep" />

            {/* RIGHT: benefits + agreement */}
            <div className="login-side" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>欢迎回到 JDO 车机商城</h3>
              <div className="hint" style={{ maxWidth: 'none' }}>登录后享受车主专属价、行车安全购物体验，订单与手机端同步</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
                {[
                  ['黄金车主直降 95 折', '车主权益日全场再叠加'],
                  ['附近自提 500m 起', '订单送达车上停车点'],
                  ['行车态安全购物', '一键再买、免密支付'],
                  ['账号多端同步', '车机 / 手机 / Pad 通用'],
                ].map(([t, d], i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 16, alignItems: 'center', padding: '14px 16px', background: 'rgba(94,234,212,0.06)', border: '1px solid rgba(94,234,212,0.20)', borderRadius: 16 }}>
                    <div className="pt-ic" style={{ background: 'rgba(94,234,212,0.15)', color: 'var(--color-mint)', width: 52, height: 52 }}>
                      <Icon name={['star', 'location', 'car', 'phone'][i]} size={24} sw={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 300 }}>{t}</div>
                      <div style={{ fontSize: 18, color: 'var(--color-text-muted)' }}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-muted)', fontSize: 18, marginTop: 8 }}>
                <div className="checkbox checked" style={{ width: 28, height: 28, borderRadius: 8 }}>
                  <Icon name="plus" size={16} sw={3} stroke="#03171f" />
                </div>
                我已阅读并同意 <span style={{ color: 'var(--color-mint)' }}>《JDO 车机用户协议》</span> 与 <span style={{ color: 'var(--color-mint)' }}>《隐私政策》</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-login" onNav={onNav} />
    </>
  );
}

window.MallLogin = MallLogin;
