/* global React, StatusBar, Dock, Icon */

const { useState: useStateAs } = React;

function MallAftersale({ onNav }) {
  const products = window.JDO_DATA.products;
  const [active, setActive] = useStateAs(0);
  const [tab, setTab] = useStateAs('all');
  const [type, setType] = useStateAs('refund');

  const cases = [
    {
      id: 'AS20260526001',
      orderId: 'JDO20260524118207',
      status: 'review', statusText: '审核中', step: 1,
      reason: '味道与描述不符 · 申请仅退款',
      amount: 79.0,
      pid: 'e5',
      open: '2 小时前',
      desc: '车主反馈香味较弱，不符合详情页"持久 60 天"描述',
    },
    {
      id: 'AS20260520087',
      orderId: 'JDO20260520772091',
      status: 'shipping', statusText: '待商家收货', step: 2,
      reason: '尺寸不合适 · 申请退货退款',
      amount: 199.0,
      pid: 'x4',
      open: '昨天 14:28',
      desc: '已上传退货物流单号 SF1023****56 · 顺丰',
    },
    {
      id: 'AS20260515209',
      orderId: 'JDO20260514880102',
      status: 'done', statusText: '退款完成', step: 3,
      reason: '色差较大 · 申请退货退款',
      amount: 268.0,
      pid: 'c5',
      open: '5/15 16:40',
      desc: '退款已原路返回到 JDO 联名卡 · 1-3 工作日到账',
    },
    {
      id: 'AS20260510552',
      orderId: 'JDO20260509881023',
      status: 'rejected', statusText: '已驳回', step: -1,
      reason: '商家发起 · 商品需重新拍照',
      amount: 458.0,
      pid: 'g3',
      open: '5/10 11:02',
      desc: '商家要求补充开箱视频，已超时 24h 未上传 · 可重新发起',
    },
  ];

  const tabs = [
    { id: 'all',     name: '全部',   n: cases.length },
    { id: 'doing',   name: '进行中', n: 2 },
    { id: 'done',    name: '已完成', n: 1 },
    { id: 'rejected', name: '驳回', n: 1 },
  ];

  const filtered = tab === 'all' ? cases
    : tab === 'doing' ? cases.filter((c) => c.status === 'review' || c.status === 'shipping')
    : tab === 'done' ? cases.filter((c) => c.status === 'done')
    : cases.filter((c) => c.status === 'rejected');

  const cur = filtered[active] || cases[0];
  const product = products.find((p) => p.id === cur.pid);

  const types = [
    { id: 'refund',     icon: 'package', name: '仅退款',      desc: '未发货 / 已收到货' },
    { id: 'returnAndRefund', icon: 'back', name: '退货退款', desc: '已收到货' },
    { id: 'exchange',   icon: 'settings', name: '换货',        desc: '商品有问题' },
    { id: 'repair',     icon: 'phone',    name: '上门维修',     desc: '大件商品' },
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
            <div className="mall-titlebar">售后服务 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>4 笔申请</span></div>
          </div>
          <div className="subbar-tabs">
            {tabs.map((t) => (
              <span key={t.id} className={'subbar-tab' + (tab === t.id ? ' active' : '')} onClick={() => { setTab(t.id); setActive(0); }}>
                {t.name} <span className="badge">{t.n}</span>
              </span>
            ))}
          </div>
          <div className="mall-actions">
            <button className="spec-opt" style={{ height: 56 }}>
              <Icon name="phone" size={20} sw={1.5} /> 客服 4006 000 666
            </button>
            <button className="mall-iconbtn" title="规则"><Icon name="settings" size={28} /></button>
          </div>
        </div>

        <div className="aftersale-body">
          <div className="aftersale-left">
            {filtered.map((c, i) => (
              <div key={c.id} className={'aftersale-card' + (active === i ? ' active' : '')} onClick={() => setActive(i)}>
                <div className="as-head">
                  <span className="as-no">{c.id} · 订单 {c.orderId.slice(-6)}</span>
                  <span className={'as-status ' + c.status}>
                    <span className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
                    {c.statusText}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="order-thumb" style={{ width: 80, height: 80, backgroundImage: `url(${products.find((p) => p.id === c.pid)?.img})` }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{products.find((p) => p.id === c.pid)?.title}</div>
                    <div className="as-reason">{c.reason}</div>
                  </div>
                  <div className="as-amount" style={{ color: c.status === 'done' ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                    <span style={{ fontSize: 16, color: 'var(--color-text-muted)' }}>¥</span> {c.amount.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: 18 }}>
                  <span>{c.open} 申请</span>
                  <span style={{ color: 'var(--color-mint)' }}>查看详情 →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="aftersale-right">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div className={'as-status ' + cur.status} style={{ fontSize: 32 }}>{cur.statusText}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 18, marginTop: 4, fontFamily: 'var(--font-mono)' }}>申请号 {cur.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="as-amount" style={{ fontSize: 32 }}><span style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>¥</span> {cur.amount.toFixed(2)}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>退款金额</div>
              </div>
            </div>

            {/* Stepper */}
            <div className="stepper">
              {['提交申请', '商家审核', '退货 / 收货', '退款完成'].map((s, i) => {
                const done = cur.step > i;
                const now = cur.step === i;
                return (
                  <React.Fragment key={s}>
                    <div className={'step ' + (done ? 'done' : (now ? 'active' : ''))}>
                      <div className="dot">{done ? '✓' : i + 1}</div>
                      <div className="label">{s}</div>
                    </div>
                    {i < 3 && <div className={'bar' + (done ? ' done' : '')} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Product */}
            <div className="address-card" style={{ background: 'rgba(20, 22, 26, 0.55)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="order-thumb" style={{ width: 88, height: 88, backgroundImage: `url(${product?.img})`, border: 'none', borderRadius: 14 }} />
              <div className="a-info">
                <div className="a-name" style={{ fontSize: 22 }}>{product?.title}</div>
                <div className="a-addr">规格 · 木质香调 · × 1 · ¥ {product?.price.toFixed(product.price % 1 ? 1 : 0)}</div>
              </div>
              <div className="change" style={{ color: 'var(--color-mint)' }}>订单 {cur.orderId.slice(-6)} <Icon name="chevR" size={20} /></div>
            </div>

            {/* Type selector */}
            <div className="spec-block">
              <div className="spec-label">售后类型</div>
              <div className="as-type-grid">
                {types.map((t) => (
                  <div key={t.id} className={'as-type' + (type === t.id ? ' active' : '')} onClick={() => setType(t.id)}>
                    <div className="ic"><Icon name={t.icon} size={26} sw={1.5} /></div>
                    <div className="nm">{t.name}</div>
                    <div className="desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="spec-block">
              <div className="spec-label">详细原因</div>
              <div className="field" style={{ height: 'auto', padding: '14px 22px', alignItems: 'flex-start' }}>
                <Icon name="settings" size={20} sw={1.5} />
                <div style={{ flex: 1, fontWeight: 300, color: 'var(--color-text-primary)' }}>
                  {cur.desc}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="spec-block">
              <div className="spec-label">凭证图片</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[product?.img, product?.img].map((src, i) => (
                  <div key={i} style={{ width: 132, height: 132, borderRadius: 14, backgroundImage: `url(${src})`, backgroundSize: 'cover', border: '1px solid rgba(255,255,255,0.10)' }} />
                ))}
                <div style={{ width: 132, height: 132, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)', cursor: 'pointer', flexDirection: 'column', gap: 6 }}>
                  <Icon name="plus" size={28} sw={1.5} />
                  <span style={{ fontSize: 16 }}>停车后上传</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {cur.status === 'review' && (
                <>
                  <button className="spec-opt" style={{ flex: 1, justifyContent: 'center', height: 72, fontSize: 22 }}>撤销申请</button>
                  <button className="btn-big primary" style={{ flex: 1, height: 72, fontSize: 22, background: 'linear-gradient(135deg,#06b6d4,#2563eb)', boxShadow: '0 8px 20px rgba(6,182,212,0.30)' }}>催商家审核</button>
                </>
              )}
              {cur.status === 'shipping' && (
                <>
                  <button className="spec-opt" style={{ flex: 1, justifyContent: 'center', height: 72, fontSize: 22 }}>查看物流</button>
                  <button className="btn-big primary" style={{ flex: 1, height: 72, fontSize: 22 }} onClick={() => onNav('mall-tracking')}>修改运单</button>
                </>
              )}
              {cur.status === 'done' && (
                <button className="btn-big primary" style={{ flex: 1, height: 72, fontSize: 22 }} onClick={() => onNav('mall-home')}>再买一次</button>
              )}
              {cur.status === 'rejected' && (
                <>
                  <button className="spec-opt" style={{ flex: 1, justifyContent: 'center', height: 72, fontSize: 22 }}>联系商家</button>
                  <button className="btn-big primary" style={{ flex: 1, height: 72, fontSize: 22 }}>重新发起申请</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-aftersale" onNav={onNav} />
    </>
  );
}

window.MallAftersale = MallAftersale;
