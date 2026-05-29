/* global React, StatusBar, Dock, Icon, ProductCard */

const { useState: useStateMC } = React;

function MallCategory({ onNav, cols, initialCat = 'energy' }) {
  const [activeCat, setActiveCat] = useStateMC(initialCat);
  const [sort, setSort] = useStateMC('rec');
  const [filter, setFilter] = useStateMC('all');
  const cats = window.JDO_DATA.categories;
  const products = window.JDO_DATA.products;

  let list = products.filter((p) => p.cat === activeCat);
  if (filter === 'flash') list = list.filter((p) => p.tagKind === 'red');
  if (filter === 'new') list = list.filter((p) => p.tagKind === 'cyan');
  if (filter === 'member') list = list.filter((p) => p.tagKind === 'gold');

  if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  if (sort === 'sales') list = [...list].sort((a, b) => b.sold - a.sold);

  const sub = [
  { id: 'all', name: '全部' },
  { id: 'flash', name: '秒杀' },
  { id: 'new', name: '新品' },
  { id: 'member', name: '会员价' },
  { id: 'gift', name: '送礼推荐' },
  { id: 'pickup', name: '附近自提' }];


  const activeName = cats.find((c) => c.id === activeCat)?.name || '';

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        {/* Top bar w/ back */}
        <div className="mall-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-home')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-search" style={{ minWidth: 480 }}>
              <Icon name="search" size={26} />
              <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>{activeName}</span>
              <Icon name="mic" size={26} />
            </div>
          </div>
          <div className="mall-tabs">
            <span className="mall-tab active">分类</span>
            <span className="mall-tab" onClick={() => onNav('mall-home')}>首页</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="购物车">
              <Icon name="bag" size={28} />
              <span className="badge">3</span>
            </button>
            <button className="mall-iconbtn" title="我的">
              <Icon name="user" size={28} />
            </button>
          </div>
        </div>

        <div className="mall-body">
          <div className="mall-rail" style={{ fontWeight: "500" }}>
            {cats.map((c) =>
            <button
              key={c.id}
              className={'rail-tile' + (activeCat === c.id ? ' active' : '')}
              onClick={() => setActiveCat(c.id)}>
              
                <span className="ricon"><Icon name={c.icon} size={48} sw={1.5} /></span>
                <span className="rname">{c.name}</span>
              </button>
            )}
          </div>

          <div className="mall-content">
            {/* Filter chips */}
            <div className="chips-row">
              {sub.map((s) =>
              <button
                key={s.id}
                className={'chip-pill' + (filter === s.id ? ' active' : '')}
                onClick={() => setFilter(s.id)}>
                
                  {s.name}
                </button>
              )}
            </div>

            {/* Sort bar */}
            <div className="sort-bar">
              <span className={'sort-item' + (sort === 'rec' ? ' active' : '')} onClick={() => setSort('rec')}>
                综合
              </span>
              <span className={'sort-item' + (sort === 'sales' ? ' active' : '')} onClick={() => setSort('sales')}>
                销量
              </span>
              <span className={'sort-item' + (sort === 'price-asc' ? ' active' : '')} onClick={() => setSort('price-asc')}>
                价格 ↑
              </span>
              <span className={'sort-item' + (sort === 'price-desc' ? ' active' : '')} onClick={() => setSort('price-desc')}>
                价格 ↓
              </span>
              <span className="sort-grow" />
              <span className="result-meta">共 {list.length} 件 · 自营优先</span>
              <span className="sort-item">
                <Icon name="filter" size={20} /> 筛选
              </span>
            </div>

            <div className="prod-scroll">
              <div className="prod-grid" style={{ '--cols': cols }}>
                {list.length === 0 ?
                <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 22 }}>
                    没有符合条件的商品，试试切换筛选或分类
                  </div> :
                list.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dock route="mall-category" onNav={onNav} />
    </>);

}

window.MallCategory = MallCategory;