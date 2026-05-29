/* global React, StatusBar, Dock, Icon */

const { useState: useStatePt } = React;

function MallPoints({ onNav }) {
  const u = (id, w = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  const [cat, setCat] = useStatePt('all');
  const [exchanging, setExchanging] = useStatePt(null);

  const cats = [
    { id: 'all',     name: '全部',   n: 124 },
    { id: 'coupon',  name: '优惠券', n: 18  },
    { id: 'gift',    name: '车主礼品', n: 42 },
    { id: 'physical',name: '实物兑换', n: 38 },
    { id: 'digital', name: '会员充值', n: 16 },
    { id: 'charity', name: '车主公益', n: 10 },
  ];

  const items = [
    { cat: 'coupon',   pts: 500,  cash: 0,   name: '¥ 30 全场无门槛券',        img: u('photo-1607860108855-64acf2078ed9', 400), stock: 1280, stockKind: 'normal',  pctBar: 0.42 },
    { cat: 'gift',     pts: 2800, cash: 19,  name: '车载香薰补充装 木质 30ml', img: u('photo-1503376780353-7e6692767b70', 400), stock: 86,  stockKind: 'normal',  pctBar: 0.34 },
    { cat: 'physical', pts: 8800, cash: 19,  name: 'JDO 周边马克杯 双层保温',  img: u('photo-1559056199-641a0ac8b55e', 400),    stock: 12,  stockKind: 'low',     pctBar: 0.94 },
    { cat: 'gift',     pts: 1200, cash: 0,   name: '车主洗车专享券 一次',      img: u('photo-1605559424843-9e4c228bf1c2', 400), stock: 458, stockKind: 'normal',  pctBar: 0.18 },
    { cat: 'digital',  pts: 4500, cash: 9,   name: '腾讯视频车机专享 月卡',    img: u('photo-1611162616475-46b635cb6868', 400), stock: 220, stockKind: 'normal',  pctBar: 0.50 },
    { cat: 'physical', pts: 12800,cash: 99,  name: '车载小米吸尘器 60W',       img: u('photo-1572569511254-d8f925fe2cbb', 400), stock: 6,   stockKind: 'low',     pctBar: 0.96 },
    { cat: 'coupon',   pts: 1500, cash: 0,   name: '加油立减 ¥ 20 券',         img: u('photo-1545459720-aac8509eb02c', 400),    stock: 360, stockKind: 'normal',  pctBar: 0.28 },
    { cat: 'physical', pts: 3600, cash: 0,   name: 'JDO 限定挂件 钥匙扣',      img: u('photo-1583947215259-38e31be8751f', 400), stock: 188, stockKind: 'normal',  pctBar: 0.42 },
    { cat: 'charity', pts:  300, cash: 0,   name: '为山区车主捐 1 度公益电',  img: u('photo-1497436072909-60f360e1d4b1', 400), stock: 999, stockKind: 'normal',  pctBar: 0.12 },
    { cat: 'gift',     pts: 600,  cash: 0,   name: '玻璃水补充包 4L',          img: u('photo-1607860108855-64acf2078ed9', 400), stock: 720, stockKind: 'normal',  pctBar: 0.22 },
    { cat: 'digital',  pts: 9800, cash: 49,  name: 'JDO 车主联名 PLUS 季卡',  img: u('photo-1593642632559-0c6d3fc62b89', 400), stock: 88,  stockKind: 'normal',  pctBar: 0.66 },
    { cat: 'physical', pts: 28000,cash: 199, name: '便携车载冰箱 18L 静音',    img: u('photo-1556228852-80b6e5eeff06', 400),    stock: 2,   stockKind: 'low',     pctBar: 0.99 },
  ];

  const list = cat === 'all' ? items : items.filter((it) => it.cat === cat);

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-profile')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">积分商城 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>· 黄金车主双倍积分中</span></div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">兑换好物</span>
            <span className="subbar-tab">积分明细</span>
            <span className="subbar-tab">兑换记录</span>
            <span className="subbar-tab">赚积分</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="规则"><Icon name="settings" size={28} /></button>
          </div>
        </div>

        <div className="coupon-body" style={{ paddingTop: 24 }}>
          {/* Hero */}
          <div className="points-hero">
            <div className="points-card">
              <span className="level-tag"><Icon name="star" size={18} stroke="#2a1d05" fill="#2a1d05" /> 黄金车主 · Lv.4</span>
              <div className="label">JDO 车主积分</div>
              <div className="points-amount">8 248 <span className="unit">分</span></div>
              <div className="points-stats">
                <div className="stat">
                  <div className="v">+ 142</div>
                  <div>本周新增</div>
                </div>
                <div className="stat">
                  <div className="v">324</div>
                  <div>6/30 到期</div>
                </div>
                <div className="stat">
                  <div className="v">1 752</div>
                  <div>距离铂金</div>
                </div>
                <div className="stat">
                  <div className="v">12 080</div>
                  <div>累计获得</div>
                </div>
              </div>
            </div>
            <div className="points-side">
              <div className="points-side-card">
                <div className="l">购物赚积分</div>
                <div className="v">1 : 1 <span className="delta">× 2 倍中</span></div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>消费 ¥ 1 = 2 积分 · 黄金权益</div>
              </div>
              <div className="points-side-card">
                <div className="l">签到 / 任务</div>
                <div className="v">+ 25 <span className="delta">今日已领</span></div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>连续 12 天 · 第 14 天 +50</div>
              </div>
              <div className="points-side-card">
                <div className="l">充电赚积分</div>
                <div className="v">+ 80 <span className="delta">本月 4 次</span></div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>每次车机充电桩任务 +20</div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="points-tabs">
            {cats.map((c) => (
              <button key={c.id} className={'chip-pill' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>
                {c.name} <span style={{ marginLeft: 6, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{c.n}</span>
              </button>
            ))}
            <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 20, alignSelf: 'center' }}>
              <Icon name="sort" size={20} sw={1.5} stroke="currentColor" /> 推荐
            </span>
          </div>

          {/* Grid */}
          <div className="points-grid">
            {list.map((it, i) => (
              <div key={i} className="points-item">
                <div className="points-img" style={{ backgroundImage: `url(${it.img})` }}>
                  <span className={'stock' + (it.stockKind === 'low' ? ' low' : '')}>仅剩 {it.stock}</span>
                </div>
                <div className="points-info">
                  <div className="points-name">{it.name}</div>
                  <div className="points-cost">
                    <span className="pts">{it.pts.toLocaleString()}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>积分</span>
                    {it.cash > 0 && <><span className="plus">+</span><span className="cash">¥ {it.cash}</span></>}
                  </div>
                  <div className="points-bar"><div className="fill" style={{ width: (it.pctBar * 100) + '%' }} /></div>
                  <div className="points-meta">
                    <span>已兑换 {Math.round(it.pctBar * 1000)} 份</span>
                    {8248 >= it.pts ? (
                      <button className="points-exchange-btn" onClick={(e) => { e.stopPropagation(); setExchanging(it); }}>立即兑换</button>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>还差 {(it.pts - 8248).toLocaleString()} 分</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {exchanging && (
        <div className="points-overlay" onClick={() => setExchanging(null)}>
          <div className="points-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>确认兑换</h3>
            <div className="points-confirm-name">{exchanging.name}</div>
            <div className="points-confirm-cost">
              <span className="pts">{exchanging.pts.toLocaleString()}</span> 积分
              {exchanging.cash > 0 && <> + <span className="cash">¥ {exchanging.cash}</span></>}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>兑换后积分余额：{(8248 - exchanging.pts).toLocaleString()} 分</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="spec-opt" style={{ flex: 1, height: 64, justifyContent: 'center' }} onClick={() => setExchanging(null)}>取消</button>
              <button className="btn-big primary" style={{ flex: 1, height: 64 }} onClick={() => setExchanging(null)}>确认兑换</button>
            </div>
          </div>
        </div>
      )}
      <Dock route="mall-points" onNav={onNav} />
    </>
  );
}

window.MallPoints = MallPoints;
