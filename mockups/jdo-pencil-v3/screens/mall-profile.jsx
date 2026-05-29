/* global React, StatusBar, Dock, Icon */

function MallProfile({ onNav }) {
  const quickTiles = [
    { id: 'unpaid',  label: '待付款',   icon: 'package',  badge: 0,    nav: 'mall-orders' },
    { id: 'paid',    label: '待发货',   icon: 'package',  badge: 1,    nav: 'mall-orders' },
    { id: 'ship',    label: '待收货',   icon: 'package',  badge: 2,    nav: 'mall-orders' },
    { id: 'review',  label: '待评价',   icon: 'star',     badge: 0,    nav: 'mall-orders' },
    { id: 'after',   label: '退换 / 售后', icon: 'back', badge: 0, nav: 'mall-aftersale' },
  ];

  const services = [
    { id: 'fav',     label: '我的收藏',   icon: 'star',      v: '32 件',         nav: 'mall-favorites' },
    { id: 'history', label: '浏览记录',   icon: 'search',    v: '108 件',         nav: 'mall-favorites', favTab: 'hist' },
    { id: 'coupon',  label: '优惠券',     icon: 'bolt',      v: '6 张可用',     nav: 'mall-coupons'  },
    { id: 'points',  label: '积分商城',   icon: 'sparkles',  v: '8 248 分',       nav: 'mall-points'   },
    { id: 'wallet',  label: '车主钱包',   icon: 'package',   v: '¥ 234.50',      nav: 'mall-wallet'   },
    { id: 'card',    label: 'JDO 联名卡', icon: 'package',   v: '已绑定 · 享 95 折', nav: 'mall-wallet'   },
  ];

  const menu = [
    { id: 'address', label: '收货地址',    v: '3 个', icon: 'location', nav: 'mall-addresses' },
    { id: 'cars',    label: '我的车辆',    v: 'JDO X1 · 沪 A · 1234',  icon: 'car',     nav: 'mall-settings' },
    { id: 'safety',  label: '行车安全',    v: '行车态自动启用 · ✓', icon: 'settings', nav: 'mall-driving' },
    { id: 'sound',   label: '通知与声音',  v: '订单 / 物流 / 优惠',  icon: 'volume',   nav: 'mall-settings' },
    { id: 'theme',   label: '主题与显示',  v: '深色 · 跟随系统',     icon: 'settings', nav: 'mall-settings' },
    { id: 'help',    label: '帮助与客服',  v: '4006 000 666',        icon: 'phone',     nav: 'mall-settings' },
    { id: 'about',   label: '关于 JDO',   v: 'v1.0.0',               icon: 'settings',  nav: 'mall-settings' },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-home')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">我的</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab" onClick={() => onNav('mall-home')}>商城</span>
            <span className="subbar-tab active">我的</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="设置" onClick={() => onNav('mall-settings')}><Icon name="settings" size={28} /></button>
            <button className="mall-iconbtn" title="消息">
              <Icon name="phone" size={28} />
              <span className="badge">5</span>
            </button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-left">
            {/* Header */}
            <div className="profile-header">
              <div className="profile-avatar">李</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="profile-name">李先生 <span style={{ marginLeft: 12, color: 'var(--color-text-muted)', fontSize: 22, fontWeight: 300 }}>138****6789</span></div>
                <div>
                  <span className="profile-tier"><Icon name="star" size={16} /> 黄金车主 · Lv.4</span>
                  <span style={{ marginLeft: 10, color: 'var(--color-text-muted)', fontSize: 18 }}>JDO X1 · 沪A·1234</span>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat"><div className="num">42</div><div className="label">订单</div></div>
                <div className="stat"><div className="num">8 248</div><div className="label">积分</div></div>
                <div className="stat"><div className="num">6</div><div className="label">优惠券</div></div>
                <div className="stat"><div className="num">¥ 234</div><div className="label">余额</div></div>
              </div>
            </div>

            {/* My orders quick */}
            <div className="profile-section">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <h4>我的订单</h4>
                <span className="more" style={{ color: 'var(--color-mint)', cursor: 'pointer', fontSize: 22 }} onClick={() => onNav('mall-orders')}>全部订单 <Icon name="chevR" size={18} /></span>
              </div>
              <div className="profile-grid">
                {quickTiles.map((t) => (
                  <div key={t.id} className="profile-tile" onClick={() => onNav(t.nav)}>
                    {t.badge > 0 && <span className="badge">{t.badge}</span>}
                    <div className="pt-ic"><Icon name={t.icon} size={28} sw={1.5} /></div>
                    <div className="pt-l">{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="profile-section">
              <h4>常用服务</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {services.map((s) => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 14, alignItems: 'center', padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }} onClick={() => { if (s.favTab) window.__JDO_FAV_TAB = s.favTab; s.nav && onNav(s.nav); }}>
                    <div className="pt-ic" style={{ background: 'rgba(94,234,212,0.10)', color: 'var(--color-mint)' }}><Icon name={s.icon} size={28} sw={1.5} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 300 }}>{s.label}</div>
                      <div style={{ fontSize: 16, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: settings list + login banner if not logged in */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="profile-section">
              <h4>会员特权</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="address-card" style={{ background: 'linear-gradient(135deg, rgba(214,188,138,0.15), rgba(214,188,138,0.04))', border: '1px solid rgba(214,188,138,0.35)' }}>
                  <div className="pin" style={{ background: 'rgba(214,188,138,0.20)', color: 'var(--color-gold)' }}>
                    <Icon name="star" size={28} />
                  </div>
                  <div className="a-info">
                    <div className="a-name">黄金车主 · 还差 2 单升级铂金</div>
                    <div className="a-addr">本月已享 ¥ 168 直降 · 双倍积分到 6/30</div>
                  </div>
                  <div className="change">权益详情 <Icon name="chevR" size={20} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {['95 折', '免运费', '专属客服'].map((t) => (
                    <div key={t} style={{ padding: '12px 14px', background: 'rgba(214,188,138,0.06)', border: '1px solid rgba(214,188,138,0.25)', borderRadius: 14, textAlign: 'center', color: 'var(--color-gold)', fontSize: 18 }}>{t}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h4>设置与服务</h4>
              <div className="profile-list">
                {menu.map((m) => (
                  <div key={m.id} className="profile-li" onClick={() => m.nav && onNav(m.nav)}>
                    <div className="pl-ic"><Icon name={m.icon} size={22} sw={1.5} /></div>
                    <div className="pl-l">{m.label}</div>
                    <div className="pl-v">{m.v}</div>
                    <div className="pl-arr"><Icon name="chevR" size={20} /></div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-big outline" style={{ height: 72, fontSize: 22 }} onClick={() => onNav('mall-login')}>退出登录 · 切换账号</button>
          </div>
        </div>
      </div>
      <Dock route="mall-profile" onNav={onNav} />
    </>
  );
}

window.MallProfile = MallProfile;
