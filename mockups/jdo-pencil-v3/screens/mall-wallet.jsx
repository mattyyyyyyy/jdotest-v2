/* global React, StatusBar, Dock, Icon */

const { useState: useStateWl } = React;

function MallWallet({ onNav }) {
  const [tab, setTab] = useStateWl('all');

  const stats = [
    { v: '+ ¥ 826.50', l: '本月收入',     kind: 'pos' },
    { v: '− ¥ 592.30', l: '本月支出',     kind: 'neg' },
    { v: '¥ 38.20',    l: '待入账退款',   kind: 'pending' },
    { v: '¥ 12 480',   l: '累计消费',     kind: 'total' },
  ];

  const txns = [
    { type: 'spend',  ic: 'cart',     nm: '订单支付 · JDO20260526887462',  meta: '3 件商品 · 京东自营',           amt: -234.78, time: '今天 09:24', method: 'JDO 联名卡' },
    { type: 'refund', ic: 'back',     nm: '退款入账 · JDO20260518880102',    meta: '色差较大 · 退货退款 ¥ 268',     amt: +268.00, time: '今天 08:12', method: 'JDO 联名卡' },
    { type: 'spend',  ic: 'cart',     nm: '订单支付 · JDO20260525331205',  meta: '2 件食品 · 顺丰同城',           amt: -168.00, time: '昨天 18:02', method: '车主钱包' },
    { type: 'charge', ic: 'bolt',     nm: '充电桩 · 上海·浦东·华业',         meta: '快充 47kWh · 1h 22m',         amt: -42.30,  time: '昨天 15:48', method: 'JDO 联名卡' },
    { type: 'income', ic: 'sparkles', nm: '签到奖励 · 第 12 天',              meta: '连续签到 +25 积分 +¥ 2',       amt: +2.00,   time: '昨天 09:00', method: '车主钱包' },
    { type: 'spend',  ic: 'cart',     nm: '订单支付 · JDO20260524118207',  meta: '1 件车品 · 京东快递·张江店',     amt: -79.00,  time: '5/24 14:15', method: 'JDO 联名卡' },
    { type: 'income', ic: 'star',     nm: '车主推荐奖励 · 王**',              meta: '好友首次下单 +¥ 38',           amt: +38.00,  time: '5/22 11:20', method: '车主钱包' },
    { type: 'charge', ic: 'bolt',     nm: '加油 · 中石化 · 浦东张江',         meta: '95# 38.6L · ¥ 7.42 / L',       amt: -286.41, time: '5/20 22:14', method: 'JDO 联名卡' },
    { type: 'refund', ic: 'back',     nm: '运费险理赔 · JDO...552037',       meta: '退货运费补偿',                 amt: +12.00,  time: '5/18 16:08', method: '车主钱包' },
    { type: 'income', ic: 'plus',     nm: '充值入账 · 微信支付',              meta: '车主钱包充值',                amt: +500.00, time: '5/15 09:48', method: '车主钱包' },
  ];

  const tabs = [
    { id: 'all',    name: '全部',   n: txns.length },
    { id: 'spend',  name: '支出',   n: txns.filter((t) => t.amt < 0).length },
    { id: 'income', name: '收入',   n: txns.filter((t) => t.amt > 0).length },
    { id: 'charge', name: '加油 / 充电', n: txns.filter((t) => t.type === 'charge').length },
    { id: 'refund', name: '退款',   n: txns.filter((t) => t.type === 'refund').length },
  ];
  const filtered = tab === 'all' ? txns
    : tab === 'spend' ? txns.filter((t) => t.amt < 0 && t.type !== 'charge')
    : tab === 'income' ? txns.filter((t) => t.amt > 0 && t.type !== 'refund')
    : tab === 'charge' ? txns.filter((t) => t.type === 'charge')
    : txns.filter((t) => t.type === 'refund');

  const actions = [
    { ic: 'plus',     nm: '充值',    desc: '微信 / 支付宝 / 银联' },
    { ic: 'back',     nm: '提现',    desc: '到 JDO 联名卡',         },
    { ic: 'sparkles', nm: '兑积分', desc: '¥ 1 = 100 积分',         },
    { ic: 'bolt',     nm: '充电 / 加油', desc: '车机直付 · 95 折',     },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-profile')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">车主钱包</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">钱包概览</span>
            <span className="subbar-tab" onClick={() => onNav('mall-coupons')}>优惠券</span>
            <span className="subbar-tab" onClick={() => onNav('mall-points')}>积分</span>
            <span className="subbar-tab">银行卡</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="安全中心"><Icon name="settings" size={28} /></button>
            <button className="mall-iconbtn" title="账单导出"><Icon name="package" size={28} /></button>
          </div>
        </div>

        <div className="wallet-body">
          <div className="wallet-left">
            {/* Hero card */}
            <div className="wallet-card">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', position: 'relative' }}>
                <div>
                  <div className="label">车主钱包余额</div>
                  <div className="wallet-balance"><span className="sym">¥</span>234.50</div>
                  <div className="row" style={{ marginTop: 2 }}>
                    <span style={{ opacity: 0.85 }}>到账中 ¥ 38.20</span>
                    <span style={{ opacity: 0.6 }}>· 累计消费 ¥ 12 480</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
                  <div className="row">
                    <div className="glyph">JD</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>JDO 联名卡 · 已绑定</span>
                      <span style={{ opacity: 0.7, fontFamily: 'var(--font-mono)', fontSize: 18 }}>**** **** **** 4521</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="wallet-actions">
              {actions.map((a) => (
                <div key={a.nm} className="wallet-act">
                  <div className="ic"><Icon name={a.ic} size={28} sw={1.5} /></div>
                  <div className="nm">{a.nm}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 17 }}>{a.desc}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="wallet-stats">
              {stats.map((s, i) => (
                <div key={i} className="wallet-stat">
                  <div className="v" style={{
                    color: s.kind === 'pos' ? 'var(--color-success)' :
                           s.kind === 'neg' ? 'var(--color-error)'   :
                           s.kind === 'pending' ? 'var(--color-driving)' :
                           'var(--color-text-primary)'
                  }}>{s.v}</div>
                  <div className="l">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="txn-card" style={{ background: 'linear-gradient(135deg, rgba(214,188,138,0.12), rgba(214,188,138,0.02))', borderColor: 'rgba(214,188,138,0.30)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="ic" style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(214,188,138,0.20)', color: 'var(--color-gold)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="star" size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 400 }}>JDO 联名卡 · 黄金车主</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 17 }}>本月返现 ¥ 24 · 累计返 ¥ 1 248 · 充电桩 95 折</div>
                </div>
                <div style={{ color: 'var(--color-gold)', fontSize: 22 }}>账单详情 →</div>
              </div>
            </div>
          </div>

          {/* Right: transactions */}
          <div className="txn-card" style={{ overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <h4>
              交易明细
              <span className="sub">最近 30 天 · <span>导出</span></span>
            </h4>

            <div className="chips-row" style={{ flexShrink: 0 }}>
              {tabs.map((t) => (
                <button key={t.id} className={'chip-pill' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)} style={{ height: 44, fontSize: 18 }}>
                  {t.name} <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 14, marginLeft: 4 }}>{t.n}</span>
                </button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', marginTop: 4 }}>
              {filtered.map((t, i) => (
                <div key={i} className="txn-row">
                  <div className={'ic ' + (t.amt > 0 ? (t.type === 'refund' ? 'refund' : 'income') : (t.type === 'charge' ? 'charge' : 'spend'))}>
                    <Icon name={t.ic} size={26} sw={1.5} />
                  </div>
                  <div className="info">
                    <div className="nm">{t.nm}</div>
                    <div className="meta">{t.meta} · {t.method}</div>
                  </div>
                  <div>
                    <div className={'amt ' + (t.amt > 0 ? 'pos' : 'neg')}>
                      {t.amt > 0 ? '+ ' : '− '}¥ {Math.abs(t.amt).toFixed(2)}
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-wallet" onNav={onNav} />
    </>
  );
}

window.MallWallet = MallWallet;
