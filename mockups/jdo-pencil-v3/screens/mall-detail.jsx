/* global React, StatusBar, Dock, Icon */

const { useState: useStateMD } = React;

function MallDetail({ onNav, productId = 'g1' }) {
  const products = window.JDO_DATA.products;
  const cats = window.JDO_DATA.categories;
  const p = products.find((x) => x.id === productId) || products[0];

  const [thumb, setThumb] = useStateMD(0);
  const [color, setColor] = useStateMD('jet');
  const [size, setSize] = useStateMD('M');
  const [qty, setQty] = useStateMD(1);

  // Pick a few related images from the same category as additional thumbs
  const thumbs = [
    p.img,
    ...products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 3).map((x) => x.img),
  ];

  const colors = [
    { id: 'jet',  name: '曜石黑' },
    { id: 'snow', name: '极光白' },
    { id: 'mint', name: '薄荷绿' },
  ];
  const sizes = [
    { id: 'S',  ok: true },
    { id: 'M',  ok: true },
    { id: 'L',  ok: true },
    { id: 'XL', ok: false },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-category')}>
              <Icon name="back" size={28} />
            </button>
            <div className="crumb">
              首页 <Icon name="chevR" size={16} /> {cats.find((c) => c.id === p.cat)?.name || ''} <Icon name="chevR" size={16} /> <span className="cur">商品详情</span>
            </div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">商品</span>
            <span className="subbar-tab">规格参数</span>
            <span className="subbar-tab" onClick={() => onNav('mall-reviews')}>车主评价 <span className="badge">4.8</span></span>
            <span className="subbar-tab">购买须知</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="搜索" onClick={() => onNav('mall-search')}><Icon name="search" size={28} /></button>
            <button className="mall-iconbtn" title="收藏"><Icon name="star" size={28} /></button>
            <button className="mall-iconbtn" title="购物车" onClick={() => onNav('mall-cart')}>
              <Icon name="bag" size={28} />
              <span className="badge">3</span>
            </button>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-left">
            <div className="detail-mainimg" style={{ backgroundImage: `url(${thumbs[thumb]})` }}>
              <div className="badge-row">
                <span className="bdg"><Icon name="bolt" size={18} /> 限时秒杀</span>
                <span className="bdg cyan">车主推荐</span>
              </div>
            </div>
            <div className="detail-thumbs">
              {thumbs.map((src, i) => (
                <div
                  key={i}
                  className={'detail-thumb' + (thumb === i ? ' active' : '')}
                  style={{ backgroundImage: `url(${src})` }}
                  onClick={() => setThumb(i)}
                />
              ))}
              <div className="detail-thumb" style={{ display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 20, color: 'var(--color-text-muted)' }}>+6 张</span>
              </div>
            </div>
          </div>

          <div className="detail-right">
            <div className="detail-title">{p.title}</div>
            <div className="detail-subtitle">京东自营 · JDO 直配 · 7 天无忧退换</div>

            <div className="detail-pricebar">
              <span className="cur"><span className="sym">¥</span>{p.price.toFixed(p.price % 1 ? 1 : 0)}</span>
              {p.ori > 0 && <>
                <span className="ori">¥{p.ori}</span>
                <span className="deal">直降 {Math.round((1 - p.price / p.ori) * 100)}%</span>
              </>}
              <span className="timer">
                距结束
                <span className="seg">00</span>:
                <span className="seg">42</span>:
                <span className="seg">17</span>
              </span>
            </div>

            <div className="detail-stats">
              <span><Icon name="star" size={18} sw={1.5} /> {p.star} 分</span>
              <span>已售 {p.sold}k+</span>
              <span>30 天 1.2 万人浏览</span>
            </div>

            <div className="spec-block">
              <div className="spec-label">颜色 · {colors.find((c) => c.id === color)?.name}</div>
              <div className="spec-options">
                {colors.map((c) => (
                  <span
                    key={c.id}
                    className={'spec-opt' + (color === c.id ? ' active' : '')}
                    onClick={() => setColor(c.id)}
                  >{c.name}</span>
                ))}
              </div>
            </div>

            <div className="spec-block">
              <div className="spec-label">规格</div>
              <div className="spec-options">
                {sizes.map((s) => (
                  <span
                    key={s.id}
                    className={'spec-opt' + (size === s.id ? ' active' : '') + (!s.ok ? ' disabled' : '')}
                    onClick={() => s.ok && setSize(s.id)}
                  >{s.id}</span>
                ))}
              </div>
            </div>

            <div className="spec-block">
              <div className="spec-label">数量 · 库存 86 件</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><Icon name="chevL" size={20} /></button>
                  <span className="num">{qty}</span>
                  <button onClick={() => setQty(qty + 1)}><Icon name="plus" size={20} /></button>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>累计已购 1 次 · 上次于 30 天前</span>
              </div>
            </div>

            <div className="pickup">
              <div className="row" style={{ color: 'var(--color-text-secondary)' }}>
                <Icon name="location" size={20} sw={1.5} />
                <span>配送至 <span style={{ color: 'var(--color-text-primary)' }}>上海市 · 浦东新区 · 张江</span></span>
                <span style={{ marginLeft: 'auto', color: 'var(--color-mint)' }}>切换</span>
              </div>
              <div className="row">
                <span className="name">附近自提点 · 京东快递·张江店</span>
                <span className="dist">280 m</span>
              </div>
              <div className="row" style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>
                <span>今日 09:00–22:00 营业 · 预计 30 分钟可取</span>
              </div>
            </div>

            <div className="detail-cta">
              <button className="btn-big outline" onClick={() => onNav('mall-cart')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="bag" size={22} /> 加入购物车
                </span>
              </button>
              <button className="btn-big primary" onClick={() => onNav('mall-checkout')}>立即购买</button>
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-detail" onNav={onNav} />
    </>
  );
}

window.MallDetail = MallDetail;
