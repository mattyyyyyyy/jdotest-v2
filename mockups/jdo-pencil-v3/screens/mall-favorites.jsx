/* global React, StatusBar, Dock, Icon, ProductCard */

const { useState: useStateFv, useMemo: useMemoFv, useEffect: useEffectFv } = React;

function MallFavorites({ onNav }) {
  const products = window.JDO_DATA.products;
  const [tab, setTab] = useStateFv('fav');
  const [selected, setSelected] = useStateFv(new Set());
  const [cat, setCat] = useStateFv('all');

  useEffectFv(() => {
    if (window.__JDO_FAV_TAB) {
      setTab(window.__JDO_FAV_TAB);
      delete window.__JDO_FAV_TAB;
    }
  }, []);

  const cats = [
    { id: 'all',    name: '全部' },
    { id: 'energy', name: '能量' },
    { id: 'care',   name: '养护' },
    { id: 'eat',    name: '吃喝' },
    { id: 'trip',   name: '出差' },
    { id: 'gear',   name: '车内' },
    { id: 'sos',    name: '救援' },
    { id: 'select', name: '严选' },
  ];

  const favs = useMemoFv(() => products.slice(0, 14).map((p, i) => ({
    ...p,
    drop: i % 4 === 0 ? Math.floor(Math.random() * 40 + 10) : 0,
    oos: i === 7,
    favAt: ['今天 09:20', '今天 08:42', '昨天 18:05', '昨天 12:18', '5/24 21:08', '5/23 14:30', '5/22 10:55', '5/22 09:18', '5/20 16:48', '5/19 22:12', '5/18 15:30', '5/16 11:45', '5/14 09:08', '5/12 18:22'][i],
  })), []);

  const filterFavs = cat === 'all' ? favs : favs.filter((p) => p.cat === cat);

  // History grouped by day
  const histGroups = [
    {
      day: '今天',
      when: '5/26 周二',
      products: products.slice(0, 6).map((p) => ({ ...p, viewedAt: ['09:12', '09:18', '09:24', '09:30', '09:42', '10:08'][products.slice(0, 6).indexOf(p)] })),
    },
    {
      day: '昨天',
      when: '5/25 周一',
      products: products.slice(6, 12).map((p, i) => ({ ...p, viewedAt: ['18:02', '17:48', '15:22', '14:30', '12:15', '10:08'][i] })),
    },
    {
      day: '5/24',
      when: '5/24 周日',
      products: products.slice(12, 16).map((p, i) => ({ ...p, viewedAt: ['21:32', '20:18', '15:48', '11:20'][i] })),
    },
  ];

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-profile')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">收藏 & 浏览历史</div>
          </div>
          <div className="subbar-tabs">
            <span className={'subbar-tab' + (tab === 'fav' ? ' active' : '')} onClick={() => setTab('fav')}>
              我的收藏 <span className="badge">{favs.length}</span>
            </span>
            <span className={'subbar-tab' + (tab === 'hist' ? ' active' : '')} onClick={() => setTab('hist')}>
              浏览记录 <span className="badge">108</span>
            </span>
            <span className="subbar-tab">店铺收藏 · 6</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="搜索"><Icon name="search" size={28} /></button>
            <button className="spec-opt" style={{ height: 56 }}>
              <Icon name="settings" size={20} sw={1.5} /> 管理
            </button>
          </div>
        </div>

        {tab === 'fav' && (
          <div className="fav-body">
            <div className="fav-toolbar">
              {cats.map((c) => (
                <button key={c.id} className={'chip-pill' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>
                  {c.name}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 20, alignSelf: 'center' }}>
                共 {filterFavs.length} 件 · 4 件降价中
              </span>
              <span style={{ color: 'var(--color-mint)', fontSize: 20, cursor: 'pointer', alignSelf: 'center' }}>降序 · 加入时间</span>
            </div>

            <div className="prod-grid" style={{ '--cols': 4 }}>
              {filterFavs.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} />)}
            </div>
          </div>
        )}

        {tab === 'hist' && (
          <div className="hist-list-body">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 22 }}>
              <h3 style={{ fontSize: 28, fontWeight: 500 }}>浏览记录</h3>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 20 }}>近 30 天 · 共 108 件</span>
              <span style={{ marginLeft: 'auto', color: 'var(--color-mint)', fontSize: 20, cursor: 'pointer' }}>清空全部</span>
            </div>

            {histGroups.map((g) => (
              <div key={g.day} className="hist-day">
                <div className="hist-daytitle">
                  {g.day} <span className="when">{g.when} · {g.products.length} 件</span>
                </div>
                <div className="prod-grid" style={{ '--cols': 5 }}>
                  {g.products.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dock route="mall-favorites" onNav={onNav} />
    </>
  );
}

window.MallFavorites = MallFavorites;
