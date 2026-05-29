/* global React, StatusBar, Dock, Icon */

const { useState: useStateAddr } = React;

function MallAddresses({ onNav }) {
  const [selected, setSelected] = useStateAddr('home');
  const [pickup, setPickup]     = useStateAddr('pk1');

  const addrs = [
    { id: 'home',    icon: 'home',    iconClass: 'home',     name: '李先生', phone: '138 **** 6789',
      tag: '家 · 默认', isDefault: true,
      addr: '上海市 浦东新区 张江路 1888 弄 6 号', district: '浦东新区 · 5km',
    },
    { id: 'company', icon: 'company', iconClass: 'company',  name: '李先生', phone: '138 **** 6789',
      tag: '公司', isDefault: false,
      addr: '上海市 黄浦区 南京东路 666 号 · 创智 28F', district: '黄浦区 · 18km',
    },
    { id: 'car',     icon: 'car',     iconClass: 'car',      name: '当前位置', phone: '实时定位',
      tag: '车上', isDefault: false,
      addr: '上海市 浦东 · 浦东张衡路停车场 · A 区 28 号位', district: '车机实时 · 0km',
    },
    { id: 'parent',  icon: 'home',    iconClass: 'home',     name: '李奶奶', phone: '139 **** 0023',
      tag: '父母家', isDefault: false,
      addr: '江苏省 苏州市 工业园区 现代大道 100 弄', district: '苏州 · 92km',
    },
  ];

  const pickups = [
    { id: 'pk1', name: '京东快递·张江店',  meta: '今日 09:00–22:00 · 已开放', dist: '280 m',  top: '48%', left: '38%' },
    { id: 'pk2', name: '便利店·罗森张江',   meta: '24h 营业 · 1 单待取',        dist: '420 m',  top: '32%', left: '55%' },
    { id: 'pk3', name: '丰巢·张江高科地铁', meta: '24h · 自助柜 28/64 可用',   dist: '680 m',  top: '70%', left: '68%' },
    { id: 'pk4', name: '京东自提点·张衡路', meta: '08:00–21:00 · 大件可取',    dist: '1.1 km', top: '22%', left: '78%' },
    { id: 'pk5', name: '小区物业·浦东 6 号', meta: '工作日 · 09:00–18:00',     dist: '1.4 km', top: '60%', left: '20%' },
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
            <div className="mall-titlebar">收货地址</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">我的地址 · {addrs.length}</span>
            <span className="subbar-tab">附近自提点 · {pickups.length}</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="新建（行车态禁用）" style={{ opacity: 0.4 }}><Icon name="plus" size={28} /></button>
            <button className="mall-iconbtn" title="刷新"><Icon name="search" size={28} /></button>
          </div>
        </div>

        <div className="addr-body">
          <div className="addr-list">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px' }}>
              <h3 style={{ fontSize: 26, fontWeight: 500 }}>我的地址簿</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>停车后可新增 / 编辑</span>
            </div>
            {addrs.map((a) => (
              <div key={a.id} className={'addr-item' + (selected === a.id ? ' selected' : '')} onClick={() => setSelected(a.id)}>
                <div className="head">
                  <div className={'ico ' + a.iconClass}><Icon name={a.icon} size={28} sw={1.5} /></div>
                  <span className="nm">{a.name}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 20 }}>{a.phone}</span>
                  <span className={'tag' + (a.isDefault ? ' default' : '')} style={!a.isDefault ? { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.08)' } : null}>{a.tag}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-mint)', fontSize: 22 }}>{selected === a.id ? '✓ 当前' : '使用'}</span>
                </div>
                <div className="det">{a.addr}</div>
                <div className="row2">
                  <Icon name="location" size={18} sw={1.5} stroke="var(--color-text-muted)" />
                  <span>{a.district}</span>
                  <div className="actions">
                    <span>编辑</span>
                    <span style={{ color: 'var(--color-error)' }}>删除</span>
                    {!a.isDefault && <span>设为默认</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pickup-panel">
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 style={{ fontSize: 26, fontWeight: 500 }}>附近自提点</h3>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 18, marginTop: 2 }}>500m 内 18 家可用 · 基于车辆当前定位</div>
              </div>
              <button className="spec-opt" style={{ height: 56 }}>
                <Icon name="location" size={20} sw={1.5} /> 重新定位
              </button>
            </div>

            <div className="pickup-map">
              {/* you */}
              <div className="map-pin you" style={{ top: '50%', left: '50%' }}>
                <div className="head"><span><Icon name="car" size={24} sw={2} stroke="#fff" /></span></div>
                <div className="lbl">您在这里 · 张衡路停车场</div>
              </div>
              {/* pins */}
              {pickups.map((p, i) => (
                <div
                  key={p.id}
                  className="map-pin"
                  style={{ top: p.top, left: p.left, cursor: 'pointer', zIndex: pickup === p.id ? 10 : 1 }}
                  onClick={() => setPickup(p.id)}
                >
                  <div className="head" style={pickup === p.id ? { boxShadow: '0 6px 16px rgba(0,0,0,0.40), 0 0 30px rgba(94,234,212,0.80)', transform: 'rotate(-45deg) scale(1.15)' } : null}>
                    <span>{i + 1}</span>
                  </div>
                  {pickup === p.id && <div className="lbl">{p.name} · {p.dist}</div>}
                </div>
              ))}

              {/* compass */}
              <div style={{ position: 'absolute', top: 16, right: 16, width: 56, height: 56, borderRadius: '50%', background: 'rgba(20,22,26,0.70)', backdrop: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', color: 'var(--color-text-primary)' }}>
                <Icon name="compass" size={28} sw={1.5} />
              </div>
              <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['+', '−'].map((s, i) => (
                  <button key={s + i} style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-primary)', fontSize: 24, fontWeight: 500 }}>{s}</button>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '8px 14px', background: 'rgba(20,22,26,0.70)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: 'var(--color-text-muted)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
                500 m · 比例尺
              </div>
            </div>

            <div className="pickup-list">
              {pickups.map((p, i) => (
                <div key={p.id} className={'pickup-row' + (pickup === p.id ? ' active' : '')} onClick={() => setPickup(p.id)}>
                  <div className="ico"><span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: pickup === p.id ? 'var(--color-mint)' : 'inherit' }}>{i + 1}</span></div>
                  <div>
                    <div className="nm">{p.name}</div>
                    <div className="mt">{p.meta}</div>
                  </div>
                  <div className="dist">{p.dist}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-addresses" onNav={onNav} />
    </>
  );
}

window.MallAddresses = MallAddresses;
