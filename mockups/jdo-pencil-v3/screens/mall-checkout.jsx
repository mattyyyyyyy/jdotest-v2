/* global React, StatusBar, Dock, Icon */

const { useState: useStateCK } = React;

function MallCheckout({ onNav }) {
  const products = window.JDO_DATA.products;
  const items = [
    { id: 'g1', qty: 2, color: '木质香调' },
    { id: 'e4', qty: 1, color: '6 瓶 / 箱' },
    { id: 'g5', qty: 1, color: '岩石黑 · M' },
  ];
  const productOf = (id) => products.find((p) => p.id === id);

  const [addr, setAddr] = useStateCK('home');
  const [ship, setShip] = useStateCK('pickup');
  const [pay,  setPay]  = useStateCK('qrcode');

  const subtotal = items.reduce((s, it) => s + (productOf(it.id)?.price || 0) * it.qty, 0);
  const discount = Math.round(subtotal * 0.06 * 100) / 100;
  const freight = ship === 'express' ? 8 : 0;
  const total = subtotal - discount + freight;

  const addrOptions = [
    { id: 'home',    name: '李先生 · 138****6789', tag: '家', detail: '上海市 浦东新区 张江路 1888 弄 6 号 · 浦东新区' },
    { id: 'company', name: '李先生 · 138****6789', tag: '公司', detail: '上海市 黄浦区 南京东路 666 号 · 创智 28F' },
    { id: 'car',     name: '当前位置 · 自动定位', tag: '车上', detail: '上海市 浦东 · 浦东张衡路停车场 · 实时定位' },
  ];
  const shipOptions = [
    { id: 'pickup',  icon: 'location', name: '附近自提',  desc: '京东快递·张江店 · 280m · 30 分钟可取' },
    { id: 'express', icon: 'package',  name: '快递配送',  desc: '次日达 · ¥8 · 预计明天上午' },
    { id: 'tocar',   icon: 'car',      name: '送达车上',  desc: '骑手抵达停车点 · 60–90 分钟' },
  ];
  const payOptions = [
    { id: 'qrcode',  name: '车机扫码', desc: '手机扫码确认 · 推荐', glyph: 'QR', g: 'linear-gradient(135deg,#06b6d4,#1e3a8a)' },
    { id: 'wechat',  name: '微信支付', desc: '已绑定 · 免输入',     glyph: '微', g: 'linear-gradient(135deg,#22c55e,#0a8c4a)' },
    { id: 'alipay',  name: '支付宝',   desc: '已绑定 · 免密 1500',  glyph: '支', g: 'linear-gradient(135deg,#1677ff,#0a3a8c)' },
    { id: 'unionpay',name: '银联云闪付', desc: '车厂联名卡 · 95 折', glyph: '银', g: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-cart')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">确认订单 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>{items.length} 件商品</span></div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab"><span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--color-mint)', color: '#03171f', fontSize: 16, fontWeight: 500 }}>✓</span> 购物车</span>
            <Icon name="chevR" size={18} stroke="var(--color-text-muted)" />
            <span className="subbar-tab active">确认订单</span>
            <Icon name="chevR" size={18} stroke="var(--color-text-muted)" />
            <span className="subbar-tab">支付</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="客服"><Icon name="phone" size={28} /></button>
          </div>
        </div>

        <div className="detail-body" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* LEFT: address + shipping + payment + items */}
          <div className="detail-right" style={{ paddingRight: 12 }}>
            {/* Address */}
            <div className="spec-block">
              <div className="spec-label">收货地址</div>
              <div className="address-card" onClick={() => {}}>
                <div className="pin"><Icon name="location" size={28} sw={1.5} /></div>
                <div className="a-info">
                  <div className="a-name">{addrOptions.find((a) => a.id === addr)?.name}
                    <span className="tag">{addrOptions.find((a) => a.id === addr)?.tag}</span>
                  </div>
                  <div className="a-addr">{addrOptions.find((a) => a.id === addr)?.detail}</div>
                </div>
                <div className="change">切换地址 <Icon name="chevR" size={20} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {addrOptions.filter((a) => a.id !== addr).map((a) => (
                  <button key={a.id} className="spec-opt" style={{ fontSize: 20 }} onClick={() => setAddr(a.id)}>
                    {a.tag === '家' && <Icon name="home" size={18} sw={1.5} />}
                    {a.tag === '公司' && <Icon name="company" size={18} sw={1.5} />}
                    {a.tag === '车上' && <Icon name="car" size={18} sw={1.5} />}
                    <span style={{ marginLeft: 8 }}>{a.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="spec-block">
              <div className="spec-label">配送方式</div>
              <div className="opt-list">
                {shipOptions.map((s) => (
                  <div key={s.id} className={'opt-row' + (ship === s.id ? ' selected' : '')} onClick={() => setShip(s.id)}>
                    <div className="o-ico"><Icon name={s.icon} size={28} sw={1.5} /></div>
                    <div className="o-text">
                      <div className="o-name">{s.name}</div>
                      <div className="o-desc">{s.desc}</div>
                    </div>
                    <div className="o-radio" />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="spec-block">
              <div className="spec-label">支付方式</div>
              <div className="opt-list">
                {payOptions.map((p) => (
                  <div key={p.id} className={'opt-row' + (pay === p.id ? ' selected' : '')} onClick={() => setPay(p.id)}>
                    <div className="o-ico" style={{ background: p.g, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>{p.glyph}</div>
                    <div className="o-text">
                      <div className="o-name">{p.name}</div>
                      <div className="o-desc">{p.desc}</div>
                    </div>
                    <div className="o-radio" />
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div className="spec-block">
              <div className="spec-label">订单备注</div>
              <div className="field">
                <Icon name="settings" size={20} sw={1.5} />
                <span style={{ flex: 1 }}>请输入备注 · 行车态已禁用键盘，停车后填写</span>
              </div>
            </div>
          </div>

          {/* RIGHT: items + summary */}
          <div className="cart-summary" style={{ alignSelf: 'stretch' }}>
            <div className="summary-row" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>
              <span>商品清单</span>
              <span className="v" style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>{items.length} 件</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((it, i) => {
                const p = productOf(it.id);
                return (
                  <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div className="cart-img" style={{ width: 80, height: 80, backgroundImage: `url(${p.img})` }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 16, marginTop: 4 }}>{it.color} · × {it.qty}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>¥ {(p.price * it.qty).toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            <div className="divider" style={{ background: 'rgba(255,255,255,0.08)' }} />

            <div className="summary-row"><span>商品金额</span><span className="v">¥ {subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>车主权益直降</span><span className="v" style={{ color: 'var(--color-success)' }}>− ¥ {discount.toFixed(2)}</span></div>
            <div className="summary-row"><span>运费</span><span className="v">{freight === 0 ? '免运费' : `¥ ${freight}`}</span></div>

            <div className="summary-row big">
              <span>实付</span>
              <span className="v"><span style={{ fontSize: 20, color: 'var(--color-text-muted)' }}>¥</span> {total.toFixed(2)}</span>
            </div>

            <button className="btn-big primary" onClick={() => onNav('mall-pay')}>
              提交订单
            </button>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 16, textAlign: 'center' }}>提交后会生成扫码支付二维码</div>
          </div>
        </div>
      </div>
      <Dock route="mall-checkout" onNav={onNav} />
    </>
  );
}

window.MallCheckout = MallCheckout;
