/* global React, StatusBar, Dock, Icon */

const { useState: useStatePay, useEffect: useEffectPay } = React;

function MallPay({ onNav }) {
  const [method, setMethod] = useStatePay('qrcode');
  const [seconds, setSeconds] = useStatePay(180);

  useEffectPay(() => {
    if (method !== 'qrcode') return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [method]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const methods = [
    { id: 'qrcode',  name: '车机扫码',     glyph: 'QR', g: 'linear-gradient(135deg,#06b6d4,#1e3a8a)' },
    { id: 'wechat',  name: '微信支付',     glyph: '微', g: 'linear-gradient(135deg,#22c55e,#0a8c4a)' },
    { id: 'alipay',  name: '支付宝',       glyph: '支', g: 'linear-gradient(135deg,#1677ff,#0a3a8c)' },
    { id: 'unionpay',name: '银联云闪付',   glyph: '银', g: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
    { id: 'card',    name: '车厂联名卡',   glyph: 'JD', g: 'linear-gradient(135deg,#d6bc8a,#a07d3c)' },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-checkout')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">扫码支付</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab"><span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--color-mint)', color: '#03171f', fontSize: 16, fontWeight: 500 }}>✓</span> 购物车</span>
            <Icon name="chevR" size={18} stroke="var(--color-text-muted)" />
            <span className="subbar-tab"><span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--color-mint)', color: '#03171f', fontSize: 16, fontWeight: 500 }}>✓</span> 确认订单</span>
            <Icon name="chevR" size={18} stroke="var(--color-text-muted)" />
            <span className="subbar-tab active">支付</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="客服"><Icon name="phone" size={28} /></button>
          </div>
        </div>

        <div className="pay-stage">
          <div className="pay-card">
            <div className="qr-wrap">
              <div className="qr-img" />
              <div className="qr-corner" />
              <div className="qr-logo">JD</div>
            </div>

            <div className="pay-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(94,234,212,0.12)', color: 'var(--color-mint)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="package" size={28} sw={1.5} />
                </div>
                <div>
                  <div style={{ fontSize: 22, color: 'var(--color-text-secondary)' }}>订单号 · JDO20260526887462</div>
                  <div style={{ fontSize: 20, color: 'var(--color-text-muted)', marginTop: 2 }}>3 件商品 · 京东快递·张江店 自提</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 22, color: 'var(--color-text-secondary)' }}>应付金额</div>
                <div className="pay-amount"><span className="sym">¥</span>234.78</div>
              </div>

              <div className="pay-status">
                <span className="dot" />
                等待手机扫码支付 · 剩余 <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 4 }}>{mm}:{ss}</span>
              </div>

              <div>
                <div style={{ fontSize: 20, color: 'var(--color-text-secondary)', marginBottom: 12 }}>切换支付方式</div>
                <div className="pay-method-row">
                  {methods.map((m) => (
                    <div key={m.id} className={'pay-method' + (method === m.id ? ' active' : '')} onClick={() => setMethod(m.id)}>
                      <span className="glyph" style={{ background: m.g, color: '#fff' }}>{m.glyph}</span>
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                <button className="btn-big outline" style={{ flex: 1 }} onClick={() => onNav('mall-checkout')}>取消支付</button>
                <button className="btn-big primary" style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #2563eb)', boxShadow: '0 8px 20px rgba(6,182,212,0.35)' }} onClick={() => onNav('mall-orders')}>
                  我已支付 →
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)', fontSize: 18, marginTop: 4 }}>
                <Icon name="settings" size={18} sw={1.5} />
                行车安全：车机不输入密码，所有支付走手机扫码或免密协议
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-pay" onNav={onNav} />
    </>
  );
}

window.MallPay = MallPay;
