/* global React, StatusBar, Dock, Icon */

const { useState: useStateRv } = React;

function MallReviews({ onNav }) {
  const products = window.JDO_DATA.products;
  const p = products[0]; // detail context

  const [tag, setTag] = useStateRv('all');

  const score = 4.9;
  const breakdown = [
    { star: 5, n: 1842, pct: 0.86 },
    { star: 4, n: 218,  pct: 0.10 },
    { star: 3, n: 56,   pct: 0.03 },
    { star: 2, n: 14,   pct: 0.01 },
    { star: 1, n: 6,    pct: 0.005 },
  ];

  const tags = [
    { id: 'all',    name: '全部',         n: 2136 },
    { id: 'photo',  name: '带图',         n: 482  },
    { id: 'video',  name: '带视频',       n: 86   },
    { id: 'good',   name: '好评',         n: 2060 },
    { id: 'mid',    name: '中评',         n: 56   },
    { id: 'bad',    name: '差评',         n: 20   },
    { id: 'follow', name: '追评',         n: 142  },
  ];

  const hotTags = ['持久留香 ★ 632', '适合车上 ★ 504', '味道清新 ★ 412', '包装精致 ★ 318', '回购首选 ★ 224', '快递快 ★ 196', '没有酒精味 ★ 184'];

  const reviews = [
    {
      name: '李***生', plate: '沪 A·****34', avatar: '李', stars: 5,
      time: '2 天前 · 已使用 3 次',
      sku: '木质香调 · 默认装',
      verified: true,
      content: '夏天车里一打开就是淡淡的木香，没有酒精的冲鼻感，车主党狂喜！我开的 JDO X1，副驾说比 4S 店送的香薰好闻太多了。',
      photos: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=70',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&q=70',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=300&q=70',
      ],
      reply: '感谢车主好评！木质香调是我们和调香师反复打磨 14 版的成品，欢迎再次回购～',
      likes: 184, comments: 12,
    },
    {
      name: '张**', plate: '沪 B·****88', avatar: '张', stars: 5,
      time: '5 天前 · 已购 4 次',
      sku: '岩石黑 · 三件套',
      verified: true,
      content: '回购第 4 次了，副驾后排都各放一个。挂车机上提示「车主常买商品」直接 1 秒下单，行车态体验非常好。',
      photos: [
        'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=300&q=70',
      ],
      likes: 96, comments: 4,
    },
    {
      name: 'M***ty', plate: '苏 E·****77', avatar: 'M', stars: 4,
      time: '1 周前',
      sku: '清新海洋 · 默认装',
      verified: true,
      content: '味道很好但是持久度比预期略短，第二瓶就开始装满冰箱。客服小姐姐回复很快，给了我一张 ¥ 20 凑单券，比较满意。',
      photos: [],
      likes: 28, comments: 2,
    },
    {
      name: '王**', plate: '京 K·****12', avatar: '王', stars: 5,
      time: '2 周前',
      sku: '森林木质 · 礼盒装',
      verified: true,
      isVideo: true,
      content: '专门拍了开箱视频！包装真的精致到我以为是奢侈品。送给老公做生日礼物，他爱不释手。',
      photos: [
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=300&q=70',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=70',
      ],
      likes: 312, comments: 28,
    },
  ];

  return (
    <>
      <StatusBar />
      <div className="app-stage">
        <div className="mall-subbar">
          <div className="mall-back">
            <button className="mall-iconbtn" title="返回" onClick={() => onNav('mall-detail')}>
              <Icon name="back" size={28} />
            </button>
            <div className="mall-titlebar">车主评价 <span style={{ color: 'var(--color-text-muted)', fontWeight: 300, fontSize: 22, marginLeft: 8 }}>{p.title}</span></div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab" onClick={() => onNav('mall-detail')}>商品</span>
            <span className="subbar-tab">规格参数</span>
            <span className="subbar-tab active">车主评价 <span className="badge">4.8</span></span>
            <span className="subbar-tab">购买须知</span>
          </div>
          <div className="mall-actions">
            <button className="spec-opt" style={{ height: 56 }}>
              <Icon name="settings" size={20} sw={1.5} /> 我要评价
            </button>
            <button className="mall-iconbtn" title="购物车" onClick={() => onNav('mall-cart')}>
              <Icon name="bag" size={28} />
              <span className="badge">3</span>
            </button>
          </div>
        </div>

        <div className="review-body">
          {/* Left: score + breakdown */}
          <div className="review-summary">
            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 20 }}>综合评分</div>
              <div className="review-score">{score} <span className="max">/ 5.0</span></div>
              <div className="review-stars">
                {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={26} stroke="#f59e0b" fill="#f59e0b" />)}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 18, marginTop: 8 }}>
                共 2 136 条评价 · 98% 推荐购买
              </div>
            </div>

            <div className="review-bars">
              {breakdown.map((b) => (
                <div key={b.star} className="review-bar">
                  <span className="l">{b.star} 星 <Icon name="star" size={14} stroke="#f59e0b" fill="#f59e0b" /></span>
                  <div className="track"><div className="fill" style={{ width: (b.pct * 100) + '%' }} /></div>
                  <span className="v">{b.n}</span>
                </div>
              ))}
            </div>

            <div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 20, marginBottom: 12 }}>车主关键词</div>
              <div className="review-tags">
                {hotTags.map((t) => {
                  const [word, count] = t.split(' ★ ');
                  return (
                    <span key={t} className="review-tag">
                      {word}
                      <span className="n">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 0 0', borderTop: '1px dashed rgba(255,255,255,0.10)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: 'var(--color-text-secondary)' }}>
                <Icon name="settings" size={18} sw={1.5} />
                JDO 自营严选 · 假一赔十
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: 'var(--color-text-secondary)' }}>
                <Icon name="package" size={18} sw={1.5} />
                7 天无忧退换 · 顺丰运费险
              </div>
            </div>
          </div>

          {/* Right: filter + list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
            <div className="chips-row" style={{ flexShrink: 0 }}>
              {tags.map((t) => (
                <button key={t.id} className={'chip-pill' + (tag === t.id ? ' active' : '')} onClick={() => setTag(t.id)}>
                  {t.name} <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 16, marginLeft: 4 }}>{t.n}</span>
                </button>
              ))}
              <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: 20, alignSelf: 'center' }}>
                <Icon name="sort" size={20} sw={1.5} stroke="currentColor" /> 默认排序
              </span>
            </div>

            <div className="review-list">
              {reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-head">
                    <div className="review-avatar">{r.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="review-name">{r.name} <span style={{ color: 'var(--color-text-muted)', fontSize: 18, marginLeft: 8, fontWeight: 300 }}>{r.plate}</span></div>
                      <div className="review-meta">{r.time}</div>
                    </div>
                    <div className="review-stars" style={{ marginLeft: 'auto' }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Icon key={i} name="star" size={20} stroke={i < r.stars ? '#f59e0b' : 'rgba(255,255,255,0.10)'} fill={i < r.stars ? '#f59e0b' : 'none'} />
                      ))}
                    </div>
                    {r.verified && <span className="review-verified"><Icon name="settings" size={14} sw={2} /> 已购验证</span>}
                  </div>

                  <div className="review-spec">规格 · {r.sku}</div>
                  <div className="review-content">{r.content}</div>
                  {r.photos.length > 0 && (
                    <div className="review-photos">
                      {r.photos.map((src, j) => (
                        <div
                          key={j}
                          className={'review-photo' + (j === 0 && r.isVideo ? ' video' : '')}
                          style={{ backgroundImage: `url(${src})` }}
                        />
                      ))}
                    </div>
                  )}

                  {r.reply && (
                    <div className="review-reply">
                      <b>JDO 商家回复</b>：{r.reply}
                    </div>
                  )}

                  <div className="review-actions">
                    <span><Icon name="star" size={18} sw={1.5} /> 有用 · {r.likes}</span>
                    <span><Icon name="phone" size={18} sw={1.5} /> 回复 · {r.comments}</span>
                    <span style={{ marginLeft: 'auto' }}><Icon name="settings" size={18} sw={1.5} /> 举报</span>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 18, padding: '12px 0 8px' }}>
                — 加载更多评价 —
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dock route="mall-reviews" onNav={onNav} />
    </>
  );
}

window.MallReviews = MallReviews;
