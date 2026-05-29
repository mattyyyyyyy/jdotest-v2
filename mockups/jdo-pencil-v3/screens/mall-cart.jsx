/* global React, StatusBar, Dock, Icon */

const { useState: useStateCart } = React;

function MallCart({ onNav }) {
  const products = window.JDO_DATA.products;
  // 真实购物车：从后端 /api/v1/cart 拉取（价格为分）
  const [items, setItems] = useStateCart([]);

  const reload = () =>
    fetch('/api/v1/cart')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  React.useEffect(() => { reload(); }, []);

  const yuan = (fen) => (fen || 0) / 100; // 分 → 元（显示）
  const fmtY = (fen) => { const y = yuan(fen); return y.toFixed(y % 1 ? 1 : 0); };

  const patch = (id, body) =>
    fetch('/api/v1/cart/items/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then((r) => r.json()).then((d) => d.items && setItems(d.items)).catch(() => {});
  const del = (id) =>
    fetch('/api/v1/cart/items/' + id, { method: 'DELETE' })
      .then((r) => r.json()).then((d) => d.items && setItems(d.items)).catch(() => {});
  const toggleAll = () => {
    const all = items.length > 0 && items.every((it) => it.selected);
    Promise.all(items.map((it) =>
      fetch('/api/v1/cart/items/' + it.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selected: !all }) })
    )).then(reload);
  };

  const selected = items.filter((it) => it.selected);
  const subtotal = selected.reduce((s, it) => s + yuan(it.price) * it.qty, 0);
  const discount = Math.round(subtotal * 0.06 * 100) / 100;
  const freight = subtotal >= 99 ? 0 : (subtotal > 0 ? 8 : 0);
  const total = subtotal - discount + freight;
  const totalQty = selected.reduce((s, it) => s + it.qty, 0);
  const allChecked = items.length > 0 && items.every((it) => it.selected);

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-home')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">购物车 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>共 {items.length} 件</span></div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">购物车</span>
            <span className="subbar-tab">收藏 18</span>
            <span className="subbar-tab">浏览历史</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="编辑">
              <Icon name="settings" size={28} />
            </button>
          </div>
        </div>

        <div className="cart-body">
          <div className="cart-list">
            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)', fontSize: 24 }}>
                购物车是空的，去逛逛吧
              </div>
            )}
            {items.map((it) => (
              <div key={it.id} className="cart-row">
                <div className={'checkbox' + (it.selected ? ' checked' : '')} onClick={() => patch(it.id, { selected: !it.selected })}>
                  {it.selected && <Icon name="plus" size={20} sw={3} stroke="#03171f" />}
                </div>
                <div className="cart-img" style={{ backgroundImage: `url(${it.img})` }} />
                <div className="cart-info">
                  <div className="cart-name">{it.title}</div>
                  <div className="cart-sku">规格 · {it.spec} · 自营</div>
                  <div className="cart-price"><span className="sym">¥</span>{fmtY(it.price)}</div>
                </div>
                <div className="qty">
                  <button onClick={() => patch(it.id, { qty: Math.max(1, it.qty - 1) })}><Icon name="chevL" size={18} /></button>
                  <span className="num">{it.qty}</span>
                  <button onClick={() => patch(it.id, { qty: it.qty + 1 })}><Icon name="plus" size={18} /></button>
                </div>
                <button className="cart-del" title="删除" onClick={() => del(it.id)}>
                  <Icon name="back" size={22} stroke="currentColor" />
                </button>
              </div>
            ))}

            {/* recommendations row */}
            <div style={{ marginTop: 12 }}>
              <div className="section-bar" style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 26 }}>常买的车主也加购了</h3>
                <span className="more" onClick={() => onNav('mall-home')}>看更多 <Icon name="chevR" size={18} /></span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {products.slice(20, 23).map((p) => (
                  <div key={p.id} className="cart-row" style={{ gridTemplateColumns: '120px 1fr auto', padding: 14 }} onClick={() => onNav('mall-detail', p.id)}>
                    <div className="cart-img" style={{ width: 120, height: 120, backgroundImage: `url(${p.img})` }} />
                    <div className="cart-info">
                      <div className="cart-name" style={{ fontSize: 20 }}>{p.title}</div>
                      <div className="cart-price" style={{ fontSize: 22 }}><span className="sym">¥</span>{p.price.toFixed(p.price % 1 ? 1 : 0)}</div>
                    </div>
                    <button className="quick-add" style={{ width: 56, height: 56, color: 'var(--color-mint)' }}
                      onClick={(e) => { e.stopPropagation(); fetch('/api/v1/cart/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: p.id, qty: 1, spec: '默认规格' }) }).then((r) => r.json()).then((d) => d.items && setItems(d.items)); }}>
                      <Icon name="plus" size={26} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-row" style={{ alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'var(--color-text-primary)', fontSize: 22 }}>
                <div className={'checkbox' + (allChecked ? ' checked' : '')} onClick={toggleAll}>
                  {allChecked && <Icon name="plus" size={20} sw={3} stroke="#03171f" />}
                </div>
                全选
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>已选 {totalQty} 件</span>
            </div>

            <div className="divider" style={{ background: 'rgba(255,255,255,0.08)' }} />

            <div className="summary-row"><span>商品金额</span><span className="v">¥ {subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>车主权益直降 <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(214,188,138,0.15)', color: 'var(--color-gold)', borderRadius: 8, fontSize: 16, marginLeft: 6 }}>VIP</span></span><span className="v" style={{ color: 'var(--color-success)' }}>− ¥ {discount.toFixed(2)}</span></div>
            <div className="summary-row"><span>运费 {freight === 0 && <span style={{ color: 'var(--color-mint)', fontSize: 18 }}>· 满 99 包邮</span>}</span><span className="v">{freight === 0 ? '免运费' : `¥ ${freight}`}</span></div>
            <div className="summary-row"><span>预估积分</span><span className="v" style={{ color: 'var(--color-gold)' }}>+ {Math.round(total)} pt</span></div>

            <div className="summary-row big">
              <span>合计</span>
              <span className="v"><span style={{ fontSize: 20, color: 'var(--color-text-muted)' }}>¥</span> {total.toFixed(2)}</span>
            </div>

            <button className="btn-big primary" onClick={() => onNav('mall-checkout')}>
              去结算 · {totalQty} 件
            </button>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 16, textAlign: 'center' }}>支付前可修改地址、配送方式与备注</div>
          </div>
        </div>
      </div>
      <Dock route="mall-cart" onNav={onNav} />
    </>
  );
}

window.MallCart = MallCart;
