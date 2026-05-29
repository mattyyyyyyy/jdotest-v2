/* global React, StatusBar, Dock, Icon */

const { useState: useStateCp } = React;

function MallCoupons({ onNav }) {
  const [tab, setTab] = useStateCp('avail');

  const coupons = {
    avail: [
      { tone: '',     amt: 50,  min: '满 299 可用', name: '车主权益日通用券', scope: '全场可用 · 不与会员价叠加',  expire: '5/31 23:59 到期 · 5 天' },
      { tone: 'mint', amt: 20,  min: '满 99 可用',  name: '车品类目优惠券',   scope: '限玻璃水 / 香薰 / 车充等',   expire: '5/30 到期 · 4 天' },
      { tone: 'gold', amt: 30,  min: '满 199 可用', name: '黄金车主专享券',   scope: '京东自营专享 · 周一刷新',   expire: '6/15 到期 · 20 天' },
      { tone: '',     amt: 15,  min: '满 49 可用',  name: '凑单速达券',       scope: '车上送达专属 · 30 分钟内',  expire: '6/05 到期 · 10 天' },
      { tone: 'mint', amt: 100, min: '满 999 可用', name: '大件直降券',       scope: '行车记录仪 · TPE 脚垫等',   expire: '6/30 到期 · 35 天' },
      { tone: 'gold', amt: 8,   min: '满 39 可用',   name: '车上零食立减券',   scope: '坚果 · 巧克力 · 咖啡豆',      expire: '5/29 到期 · 3 天' },
    ],
    expiring: [
      { tone: '',     amt: 50, min: '满 299 可用', name: '车主权益日通用券', scope: '全场可用',                  expire: '今天 23:59 到期 · 8h' },
      { tone: 'mint', amt: 20, min: '满 99 可用',  name: '车品类目优惠券',    scope: '限玻璃水 / 香薰 / 车充等',  expire: '明天 23:59 到期 · 32h' },
      { tone: 'gold', amt: 8,  min: '满 39 可用',   name: '车上零食立减券',    scope: '坚果 · 巧克力 · 咖啡豆',     expire: '后天到期 · 56h' },
    ],
    used: [
      { tone: '',     amt: 30, min: '满 159 已用', name: '5/20 已使用', scope: '订单号 JDO...772091', expire: '5/20 21:48 使用', stamp: 'USED' },
      { tone: 'mint', amt: 15, min: '满 49 已用',  name: '5/18 已使用', scope: '订单号 JDO...330612', expire: '5/18 13:12 使用', stamp: 'USED' },
      { tone: '',     amt: 10, min: '满 39 已过期', name: '5/15 已过期', scope: '未使用 · 自动失效',     expire: '5/15 23:59 过期', stamp: 'EXPIRED' },
    ],
  };

  const tabs = [
    { id: 'avail',    name: '可使用',         n: coupons.avail.length },
    { id: 'expiring', name: '即将过期',       n: coupons.expiring.length, kind: 'warn' },
    { id: 'used',     name: '已使用 / 过期',  n: coupons.used.length },
  ];

  const list = coupons[tab];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-profile')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">优惠券中心 <span style={{ marginLeft: 10, color: 'var(--color-text-muted)', fontSize: 22, fontWeight: 300 }}>JDO 黄金车主</span></div>
          </div>
          <div className="subbar-tabs">
            {tabs.map((t) => (
              <span key={t.id} className={'subbar-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                {t.name}
                <span className="badge" style={t.kind === 'warn' ? { background: 'var(--color-driving)' } : null}>{t.n}</span>
              </span>
            ))}
          </div>
          <div className="mall-actions">
            <button className="spec-opt" style={{ height: 56 }}>
              <Icon name="bolt" size={20} sw={1.5} /> 去领券
            </button>
            <button className="mall-iconbtn" title="规则说明"><Icon name="settings" size={28} /></button>
          </div>
        </div>

        <div className="coupon-body">
          <div className="coupon-stats">
            <div className="coupon-stat">
              <div className="v" style={{ color: 'var(--color-mint)' }}>6 <span style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>张</span></div>
              <div className="l">可用券</div>
            </div>
            <div className="coupon-stat">
              <div className="v"><span style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>¥</span> 223</div>
              <div className="l">可省金额 <span className="delta">+ ¥ 38 本月新增</span></div>
            </div>
            <div className="coupon-stat">
              <div className="v" style={{ color: 'var(--color-driving)' }}>3 <span style={{ fontSize: 22, color: 'var(--color-text-muted)' }}>张</span></div>
              <div className="l">3 天内到期</div>
            </div>
            <div className="coupon-stat">
              <div className="v" style={{ color: 'var(--color-gold)' }}>¥ 168</div>
              <div className="l">本月已节省</div>
            </div>
          </div>

          <div className="chips-row">
            <button className="chip-pill active">全部品类</button>
            <button className="chip-pill">车品</button>
            <button className="chip-pill">数码</button>
            <button className="chip-pill">食品</button>
            <button className="chip-pill">生活</button>
            <button className="chip-pill">服饰</button>
            <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 20, alignSelf: 'center' }}>
              排序：到期时间 ↑
            </span>
          </div>

          <div className="coupon-list">
            {list.map((c, i) => (
              <div key={i} className={'coupon tone-' + (c.tone || 'red') + (c.stamp ? ' expired' : '')}>
                <div className="coupon-amt">
                  <div className="v"><span className="sym">¥</span>{c.amt}</div>
                  <div className="min">{c.min}</div>
                </div>
                <div className="coupon-info">
                  <div className="nm">{c.name}</div>
                  <div className="scope">{c.scope}</div>
                  <div className="expire">⏰ {c.expire}</div>
                </div>
                {c.stamp ? (
                  <span className="stamp">{c.stamp}</span>
                ) : (
                  <button className="coupon-cta" onClick={() => onNav('mall-category')}>
                    去使用 <Icon name="chevR" size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {tab === 'avail' && (
            <div className="address-card" style={{ background: 'linear-gradient(135deg, rgba(214,188,138,0.12), rgba(214,188,138,0.02))', borderColor: 'rgba(214,188,138,0.30)' }}>
              <div className="pin" style={{ background: 'rgba(214,188,138,0.20)', color: 'var(--color-gold)' }}>
                <Icon name="star" size={28} />
              </div>
              <div className="a-info">
                <div className="a-name">铂金车主权益预览</div>
                <div className="a-addr">还差 2 单 · 升级后每月额外 4 张满 199-30 券 + 双倍积分</div>
              </div>
              <div className="change" style={{ color: 'var(--color-gold)' }}>查看升级路径 <Icon name="chevR" size={20} /></div>
            </div>
          )}
        </div>
      </div>
      <Dock route="mall-coupons" onNav={onNav} />
    </>
  );
}

window.MallCoupons = MallCoupons;
