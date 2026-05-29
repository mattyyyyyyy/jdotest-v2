/* global React, StatusBar, Dock, Icon */

const { useState: useStateOrd } = React;

function MallOrders({ onNav }) {
  const products = window.JDO_DATA.products;
  const orders = [
    {
      id: 'JDO20260526887462',
      status: 'paid', statusText: '待发货', kind: 'driving',
      items: ['g1', 'e4', 'g5'],
      total: 234.78, qty: 4,
      time: '今天 09:24',
    },
    {
      id: 'JDO20260525331205',
      status: 'shipping', statusText: '配送中', kind: 'info',
      items: ['f5', 'f7'],
      total: 168.00, qty: 4,
      time: '昨天 18:02',
    },
    {
      id: 'JDO20260524118207',
      status: 'pickup', statusText: '待自提', kind: 'driving',
      items: ['e5'],
      total: 79.00, qty: 1,
      time: '5/24 14:15',
    },
    {
      id: 'JDO20260520772091',
      status: 'done', statusText: '已完成', kind: 'success',
      items: ['x4', 'x5'],
      total: 249.80, qty: 2,
      time: '5/20 21:48',
    },
    {
      id: 'JDO20260518330612',
      status: 'done', statusText: '已完成', kind: 'success',
      items: ['g7', 'x1', 'x2'],
      total: 187.90, qty: 3,
      time: '5/18 13:12',
    },
  ];

  const [active, setActive] = useStateOrd(0);
  const [tab, setTab] = useStateOrd('all');

  const tabs = [
    { id: 'all',      name: '全部' },
    { id: 'unpaid',   name: '待付款', n: 0 },
    { id: 'paid',     name: '待发货', n: 1 },
    { id: 'shipping', name: '待收货', n: 2 },
    { id: 'review',   name: '待评价', n: 0 },
    { id: 'aftersale',name: '退换 / 售后' },
  ];

  const filtered = tab === 'all'
    ? orders
    : tab === 'unpaid' ? orders.filter((o) => o.status === 'unpaid')
    : tab === 'paid' ? orders.filter((o) => o.status === 'paid')
    : tab === 'shipping' ? orders.filter((o) => o.status === 'shipping' || o.status === 'pickup')
    : tab === 'review' ? orders.filter((o) => o.status === 'done')
    : [];

  const cur = filtered[active] || orders[0];
  const curProducts = cur.items.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  // Build timeline from status
  const tlMap = {
    paid:     [['下单成功', '今天 09:18'], ['付款完成', '今天 09:24'], ['商家备货', '预计 30 分钟内'], ['配送 / 自提', null], ['完成', null]],
    shipping: [['下单成功', '昨天 17:58'], ['付款完成', '昨天 18:02'], ['商家备货', '昨天 19:30'], ['配送中 · 骑手即将送达', '预计 30 分钟'], ['完成', null]],
    pickup:   [['下单成功', '5/24 14:10'], ['付款完成', '5/24 14:15'], ['到达自提点 · 京东·张江店', '5/24 16:30 · 取货码 8842'], ['车主取货', null], ['完成', null]],
    done:     [['下单成功', '5/20 21:30'], ['付款完成', '5/20 21:32'], ['商家发货', '5/21 09:12'], ['配送完成', '5/21 14:08'], ['订单完成', '5/21 14:09']],
  };
  const tl = tlMap[cur.status] || tlMap.paid;
  const doneIdx = cur.status === 'paid' ? 1 : cur.status === 'shipping' ? 2 : cur.status === 'pickup' ? 2 : 4;

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-profile')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">我的订单</div>
          </div>
          <div className="subbar-tabs">
            {tabs.map((t) => (
              <span key={t.id} className={'subbar-tab' + (tab === t.id ? ' active' : '')} onClick={() => { setTab(t.id); setActive(0); }}>
                {t.name}
                {t.n ? <span className="badge">{t.n}</span> : null}
              </span>
            ))}
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="搜索"><Icon name="search" size={28} /></button>
          </div>
        </div>

        <div className="orders-body">
          <div className="orders-list">
            {filtered.map((o, i) => (
              <div key={o.id} className={'order-card' + (active === i ? ' active' : '')} onClick={() => setActive(i)}>
                <div className="order-head">
                  <span className="order-no">{o.id}</span>
                  <span className={'order-status ' + (o.kind === 'success' ? 'success' : o.kind === 'info' ? 'info' : '')}>
                    {o.statusText}
                  </span>
                </div>
                <div className="order-items">
                  {o.items.map((id) => {
                    const p = products.find((x) => x.id === id);
                    return p ? <div key={id} className="order-thumb" style={{ backgroundImage: `url(${p.img})` }} /> : null;
                  })}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, marginLeft: 6 }}>
                    <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 320 }}>
                      {products.find((x) => x.id === o.items[0])?.title}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>共 {o.qty} 件 · {o.time}</div>
                  </div>
                </div>
                <div className="order-foot">
                  <span className="order-summary">{o.kind === 'success' ? '订单已签收 · 7 天内可退换' : '京东自营 · JDO 直配'}</span>
                  <span className="order-total"><span style={{ fontSize: 18, color: 'var(--color-text-muted)' }}>¥</span> {o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-detail">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div className={'order-status ' + (cur.kind === 'success' ? 'success' : cur.kind === 'info' ? 'info' : '')} style={{ fontSize: 32 }}>{cur.statusText}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 18, marginTop: 6 }}>订单号 <span style={{ fontFamily: 'var(--font-mono)' }}>{cur.id}</span></div>
              </div>
              {cur.status === 'pickup' && (
                <div style={{ textAlign: 'center', padding: '12px 20px', background: 'rgba(94,234,212,0.10)', border: '1px solid rgba(94,234,212,0.30)', borderRadius: 16 }}>
                  <div style={{ fontSize: 16, color: 'var(--color-text-secondary)' }}>取货码</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, color: 'var(--color-mint)', letterSpacing: '0.1em' }}>8842</div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline">
              {tl.map(([label, time], i) => (
                <div key={i} className={'tl-row ' + (i < doneIdx ? 'done' : i === doneIdx ? 'active' : '')}>
                  <div className="col"><div className="dot" /></div>
                  <div>
                    <div className="tl-label" style={{ color: i <= doneIdx ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{label}</div>
                    {i === doneIdx && cur.status === 'shipping' && (
                      <div className="tl-meta">骑手 张师傅 · 顺丰同城 · 13800138000</div>
                    )}
                  </div>
                  <div className="tl-time">{time || '—'}</div>
                </div>
              ))}
            </div>

            {/* items */}
            <div>
              <div style={{ fontSize: 22, color: 'var(--color-text-secondary)', marginBottom: 10 }}>商品清单</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {curProducts.map((p) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: 14, alignItems: 'center' }}>
                    <div className="order-thumb" style={{ width: 72, height: 72, backgroundImage: `url(${p.img})` }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 20, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>×1 · 自营</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>¥ {p.price.toFixed(p.price % 1 ? 1 : 0)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* address */}
            <div className="address-card" style={{ padding: '16px 20px' }}>
              <div className="pin" style={{ width: 48, height: 48 }}><Icon name="location" size={22} sw={1.5} /></div>
              <div className="a-info">
                <div className="a-name" style={{ fontSize: 22 }}>李先生 · 138****6789</div>
                <div className="a-addr" style={{ fontSize: 18 }}>{cur.status === 'pickup' ? '京东快递·张江店 · 浦东张衡路 · 280m' : '上海市 浦东新区 张江路 1888 弄 6 号'}</div>
              </div>
            </div>

            {/* actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="spec-opt" style={{ flex: 1, justifyContent: 'center', height: 64 }}>联系客服</button>
              {cur.status === 'shipping' && <button className="btn-big outline" style={{ flex: 1, height: 64, fontSize: 22 }} onClick={() => onNav('mall-tracking')}>查看物流</button>}
              {cur.status === 'paid' && <button className="btn-big outline" style={{ flex: 1, height: 64, fontSize: 22 }}>催发货</button>}
              {cur.status === 'done' && <>
                <button className="spec-opt" style={{ flex: 1, justifyContent: 'center', height: 64, fontSize: 22 }} onClick={() => onNav('mall-aftersale')}>申请售后</button>
                <button className="btn-big primary" style={{ flex: 1, height: 64, fontSize: 22 }} onClick={() => onNav('mall-home')}>再买一次</button>
              </>}
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-orders" onNav={onNav} />
    </>
  );
}

window.MallOrders = MallOrders;
