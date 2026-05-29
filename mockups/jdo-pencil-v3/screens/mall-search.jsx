/* global React, StatusBar, Dock, Icon, ProductCard */

const { useState: useStateSr, useEffect: useEffectSr } = React;

function MallSearch({ onNav }) {
  const products = window.JDO_DATA.products;
  const [q, setQ] = useStateSr('');
  const [searched, setSearched] = useStateSr('');
  const inputRef = React.useRef(null);

  const hots = [
    { n: '玻璃水',          tag: '车主必备', kind: 'mint',  cnt: '12.8w' },
    { n: '车载香薰',         tag: '热', kind: 'red',         cnt: '8.6w' },
    { n: '行车记录仪',       tag: '黑科技', kind: 'mint',     cnt: '5.4w' },
    { n: '车充 100W',        tag: '新', kind: 'mint',         cnt: '4.2w' },
    { n: '车载吸尘器',       tag: '会员', kind: 'gold',       cnt: '3.8w' },
    { n: '降噪耳机',          tag: '直降', kind: 'red',         cnt: '3.1w' },
    { n: '行车零食',          tag: null, kind: null,           cnt: '2.7w' },
    { n: 'TPE 脚垫',          tag: null, kind: null,           cnt: '2.0w' },
    { n: '车载储物盒',        tag: null, kind: null,           cnt: '1.8w' },
    { n: 'HUD 抬头显示',      tag: '新', kind: 'mint',          cnt: '1.5w' },
  ];

  const history = ['玻璃水 6 瓶', '充电桩 速锐', '车载香薰', 'JBL 蓝牙音箱', '冬季睡袋', '后视镜防眩光', '茶杯架'];

  // Suggestions match q (live, before search)
  const sugg = q.length > 0
    ? products.filter((p) => p.title.includes(q.replace(/水|的|车|载/g, ''))).slice(0, 6)
    : [];

  // Search results (after clicking search)
  const results = searched.length > 0
    ? products.filter((p) => p.title.includes(searched) || (p.cat && p.cat.includes(searched)))
    : [];

  const doSearch = () => { if (q.trim()) setSearched(q.trim()); };

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-home')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">搜索</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">综合</span>
            <span className="subbar-tab" onClick={() => onNav('mall-category')}>商品</span>
            <span className="subbar-tab">店铺</span>
            <span className="subbar-tab">服务</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="客服"><Icon name="phone" size={28} /></button>
            <button className="mall-iconbtn" title="购物车" onClick={() => onNav('mall-cart')}>
              <Icon name="bag" size={28} />
              <span className="badge">3</span>
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 36px 0' }}>
          <div className="search-input-wrap">
            <input
              ref={inputRef}
              className="search-input-big"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="搜索车品 · 数码 · 食品 · 生活"
            />
            <button className="search-input-mic" title="语音搜索">
              <Icon name="mic" size={28} sw={2} />
            </button>
            <button className="search-go-btn" onClick={doSearch}>
              <Icon name="search" size={28} sw={2} stroke="#03171f" />
            </button>
          </div>
        </div>

        <div className="search-body" style={{ paddingTop: 16 }}>
          {searched ? (
            /* ── Search results ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', padding: '0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h3 style={{ fontSize: 28, fontWeight: 500 }}>搜索结果</h3>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 20 }}>「{searched}」· {results.length} 件商品</span>
                <span style={{ marginLeft: 'auto', color: 'var(--color-mint)', fontSize: 20, cursor: 'pointer' }} onClick={() => { setSearched(''); setQ(''); }}>重新搜索</span>
              </div>
              <div className="prod-grid" style={{ '--cols': 4 }}>
                {results.map((p) => <ProductCard key={p.id} p={p} onNav={onNav} />)}
              </div>
              {results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)', fontSize: 24 }}>
                  没有找到「{searched}」相关商品
                </div>
              )}
            </div>
          ) : (
            /* ── Default: suggestions + hot ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingRight: 6 }}>
            {/* Voice tip */}
            <div className="voice-tip">
              <div className="orb" />
              <div className="copy">
                <div className="t">"我要买玻璃水" · 长按方向盘语音键直接说</div>
                <div className="s">行车态下推荐用语音搜索，无需键盘输入</div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="search-section">
              <h4>
                "{q}" 实时建议
                <span className="sub">{sugg.length} 个匹配</span>
              </h4>
              <div className="sugg-list">
                {sugg.map((p, i) => {
                  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const matched = p.title.replace(new RegExp(`(${escaped})`, 'g'), '<b>$1</b>');
                  return (
                    <div key={p.id} className={'sugg-row' + (i === 0 ? ' match' : '')} onClick={() => onNav('mall-detail')}>
                      <div className="ico"><Icon name="search" size={22} sw={1.5} /></div>
                      <div className="name" dangerouslySetInnerHTML={{ __html: matched }} />
                      <div className="count">¥{p.price.toFixed(p.price % 1 ? 1 : 0)} · {p.sold}k+ 已售</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            <div className="search-section">
              <h4>
                历史搜索
                <span className="sub">最近 30 天</span>
                <span className="clear">清空</span>
              </h4>
              <div className="history-chips">
                {history.map((h) => (
                  <span key={h} className="chip-pill" onClick={() => setQ(h)}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
            </div>
            )}

          {/* Right: hot ranking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
            <div className="search-section">
              <h4>
                车主热搜榜
                <span className="sub">基于过去 24h 车主搜索 · 09:00 更新</span>
              </h4>
              <div className="hot-grid">
                {hots.map((h, i) => (
                  <div key={h.n} className="hot-row" onClick={() => setQ(h.n)}>
                    <span className="hot-rank">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="hot-name">{h.n}</div>
                      <div className="hot-meta">{h.cnt} 车主在搜</div>
                    </div>
                    {h.tag ? <span className={'hot-badge ' + h.kind}>{h.tag}</span> : <span />}
                    <Icon name="chevR" size={20} stroke="var(--color-text-muted)" />
                  </div>
                ))}
              </div>
            </div>

            <div className="search-section">
              <h4>找不到？试试这些</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {['加油卡充值', '高速 ETC', '电池保养', '美容洗车', '保险续保', '违章查询', '附近充电桩', '故障代码'].map((s) => (
                  <span key={s} className="chip-pill" onClick={() => setQ(s)}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-search" onNav={onNav} />
    </>
  );
}

window.MallSearch = MallSearch;
