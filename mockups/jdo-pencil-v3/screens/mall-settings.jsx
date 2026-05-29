/* global React, StatusBar, Dock, Icon */

const { useState: useStateSt } = React;

function MallSettings({ onNav }) {
  const [section, setSection] = useStateSt('display');

  // Tweakable local settings (purely visual demo)
  const [theme,    setTheme]    = useStateSt('dark');
  const [fontSize, setFontSize] = useStateSt('std');
  const [driving,  setDriving]  = useStateSt(true);
  const [voice,    setVoice]    = useStateSt(true);
  const [autoPay,  setAutoPay]  = useStateSt(true);
  const [bigOrder, setBigOrder] = useStateSt(true);
  const [pushOrder, setPushOrder]   = useStateSt(true);
  const [pushPromo, setPushPromo]   = useStateSt(true);
  const [pushLogi,  setPushLogi]    = useStateSt(true);
  const [soundOrder, setSoundOrder] = useStateSt(true);
  const [doNotDisturb, setDND]      = useStateSt(false);
  const [bio,       setBio]         = useStateSt(false);
  const [autoLogin, setAutoLogin]   = useStateSt(true);

  const sections = [
    { id: 'display',  ic: 'settings', name: '主题与显示' },
    { id: 'driving',  ic: 'car',      name: '行车安全' },
    { id: 'notify',   ic: 'phone',    name: '通知与声音' },
    { id: 'account',  ic: 'user',     name: '账号与隐私' },
    { id: 'pay',      ic: 'package',  name: '支付与免密' },
    { id: 'vehicle',  ic: 'car',      name: '车辆与车厂' },
    { id: 'storage',  ic: 'package',  name: '存储与缓存' },
    { id: 'about',    ic: 'sparkles', name: '关于 JDO' },
  ];

  const Switch = ({ on, onToggle }) => (
    <div className={'settings-switch' + (on ? ' on' : '')} onClick={onToggle} />
  );
  const Radio = ({ value, options, onChange }) => (
    <div className="settings-radio-row">
      {options.map((o) => (
        <span
          key={o.value}
          className={'settings-radio' + (value === o.value ? ' active' : '')}
          onClick={() => onChange(o.value)}
        >{o.label}</span>
      ))}
    </div>
  );
  const Select = ({ value }) => (
    <div className="settings-select">
      {value} <Icon name="chevR" size={20} stroke="var(--color-text-muted)" />
    </div>
  );

  const sectionContent = {
    display: (
      <>
        <div className="settings-section">
          <h3>主题与显示</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">配色模式</div>
              <div className="d">深色推荐在夜间和长时间驾驶使用 · 浅色在强光下更易读</div>
            </div>
            <Radio value={theme} onChange={setTheme} options={[
              { value: 'dark',   label: '深色' },
              { value: 'light',  label: '浅色' },
              { value: 'auto',   label: '跟随系统' },
            ]} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">字号</div>
              <div className="d">行车态下字号会自动放大一档，确保 2s 可瞥</div>
            </div>
            <Radio value={fontSize} onChange={setFontSize} options={[
              { value: 'std', label: '标准' },
              { value: 'lg',  label: '大字号' },
              { value: 'xl',  label: '超大' },
            ]} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">液态玻璃透明度</div>
              <div className="d">设为弱可降低弱算力车机的渲染负担</div>
            </div>
            <Radio value="standard" onChange={() => {}} options={[
              { value: 'standard', label: '标准' },
              { value: 'reduced',  label: '降级' },
            ]} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">减少动态效果</div>
              <div className="d">勾选后所有非必要动画关闭 · 等同于 prefers-reduced-motion</div>
            </div>
            <Switch on={false} onToggle={() => {}} />
          </div>
        </div>
      </>
    ),
    driving: (
      <>
        <div className="settings-section" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.10), rgba(20,22,26,0.50))', borderColor: 'rgba(251,146,60,0.30)' }}>
          <h3 style={{ color: 'var(--color-driving)' }}>
            <Icon name="bolt" size={26} sw={1.5} stroke="currentColor" /> 行车安全
            <span className="sub">符合 NHTSA 2/12 · AAOS HMI 规范</span>
          </h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">车速 &gt; 5 km/h 自动进入行车态</div>
              <div className="d">来源车厂 JS Bridge · 当前为 Demo 用 mock 数据</div>
            </div>
            <Switch on={driving} onToggle={() => setDriving(!driving)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">行车态下隐藏视频与自动播放</div>
              <div className="d">符合座舱安全规范 · 强制不可关</div>
            </div>
            <Switch on={true} onToggle={() => {}} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">行车态优先语音搜索</div>
              <div className="d">长按方向盘语音键 / 唤醒词 "你好 JDO"</div>
            </div>
            <Switch on={voice} onToggle={() => setVoice(!voice)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">大件商品行车态屏蔽</div>
              <div className="d">行车态首页过滤 &gt;1500g 或体积大商品</div>
            </div>
            <Switch on={bigOrder} onToggle={() => setBigOrder(!bigOrder)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">演示用 mock 车速</div>
              <div className="d">URL 参数 ?speed=N · 当前 23 km/h 行车态</div>
            </div>
            <Select value="23 km/h · 行车态" />
          </div>
        </div>
      </>
    ),
    notify: (
      <>
        <div className="settings-section">
          <h3>推送通知</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">订单状态推送</div>
              <div className="d">下单成功 · 商家发货 · 配送中 · 已签收</div>
            </div>
            <Switch on={pushOrder} onToggle={() => setPushOrder(!pushOrder)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">物流到车通知</div>
              <div className="d">骑手抵达车辆停车点 · 自提点到货</div>
            </div>
            <Switch on={pushLogi} onToggle={() => setPushLogi(!pushLogi)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">优惠 & 营销</div>
              <div className="d">秒杀提醒 · 车主权益日 · 价格降至关注价</div>
            </div>
            <Switch on={pushPromo} onToggle={() => setPushPromo(!pushPromo)} />
          </div>
        </div>
        <div className="settings-section">
          <h3>声音</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">订单状态语音播报</div>
              <div className="d">骑手抵达时车机播报 · 行车态默认开启</div>
            </div>
            <Switch on={soundOrder} onToggle={() => setSoundOrder(!soundOrder)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">驾驶时段勿扰</div>
              <div className="d">仅订单到达与物流到车类播报会通过</div>
            </div>
            <Switch on={doNotDisturb} onToggle={() => setDND(!doNotDisturb)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">通知音量</div>
              <div className="d">独立于媒体与导航音量</div>
            </div>
            <Select value="标准 · 50%" />
          </div>
        </div>
      </>
    ),
    account: (
      <>
        <div className="settings-section">
          <h3>账号</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">手机号</div>
              <div className="d">138 **** 6789 · 已实名</div>
            </div>
            <Select value="更换号码" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">绑定的车厂账号</div>
              <div className="d">JDO X1 · 黄金车主 Lv.4 · 沪A·1234</div>
            </div>
            <Select value="管理绑定" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">微信 / 支付宝 / 银联</div>
              <div className="d">用于扫码支付与免密签约</div>
            </div>
            <Select value="3 个已绑定" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">自动登录</div>
              <div className="d">下车锁屏后保持登录 · 二次启动免扫码</div>
            </div>
            <Switch on={autoLogin} onToggle={() => setAutoLogin(!autoLogin)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">指纹 / 人脸登录</div>
              <div className="d">来自车机 IVI 系统 · 需先在车机设置中开启</div>
            </div>
            <Switch on={bio} onToggle={() => setBio(!bio)} />
          </div>
        </div>
        <div className="settings-section">
          <h3>隐私</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">个性化推荐</div>
              <div className="d">基于车主行为、车型、车位定位为你推荐商品</div>
            </div>
            <Switch on={true} onToggle={() => {}} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">车辆位置自动填入地址</div>
              <div className="d">用于附近自提与车上配送 · 不上传位置原始数据</div>
            </div>
            <Switch on={true} onToggle={() => {}} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">查看授权与导出</div>
              <div className="d">PIPL 数据可移植权 · 导出 / 删除我的数据</div>
            </div>
            <Select value="管理权限" />
          </div>
        </div>
      </>
    ),
    pay: (
      <>
        <div className="settings-section">
          <h3>免密支付</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">行车态默认免密支付</div>
              <div className="d">单笔 ≤ ¥ 500 · 每日累计 ≤ ¥ 2000</div>
            </div>
            <Switch on={autoPay} onToggle={() => setAutoPay(!autoPay)} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">默认支付方式</div>
              <div className="d">下单时优先使用 · 行车态强制使用</div>
            </div>
            <Select value="JDO 联名卡 **** 4521" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">免密单笔上限</div>
              <div className="d">单次免密最高金额 · 超出走扫码确认</div>
            </div>
            <Select value="¥ 500" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">免密每日累计上限</div>
              <div className="d">超过后强制走扫码 · 当日重置</div>
            </div>
            <Select value="¥ 2 000" />
          </div>
        </div>
        <div className="settings-section">
          <h3>支付方式优先级</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { rank: 1, n: 'JDO 联名卡', d: '黄金车主 95 折叠加 · 已绑定免密', glyph: 'JD', g: 'linear-gradient(135deg,#d6bc8a,#a07d3c)' },
              { rank: 2, n: '微信支付',   d: '已绑定 · 免密 ≤ ¥ 500',           glyph: '微', g: 'linear-gradient(135deg,#22c55e,#0a8c4a)' },
              { rank: 3, n: '支付宝',     d: '已绑定 · 免密 ≤ ¥ 1500',          glyph: '支', g: 'linear-gradient(135deg,#1677ff,#0a3a8c)' },
              { rank: 4, n: '银联云闪付', d: '未绑定 · 点击添加',                glyph: '银', g: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
            ].map((p) => (
              <div key={p.rank} className="settings-row" style={{ borderTop: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                  <div style={{ width: 36, fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--color-text-muted)', textAlign: 'center' }}>{p.rank}</div>
                  <div className="o-ico" style={{ width: 48, height: 48, borderRadius: 12, background: p.g, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, display: 'grid', placeItems: 'center' }}>{p.glyph}</div>
                  <div className="info">
                    <div className="l">{p.n}</div>
                    <div className="d">{p.d}</div>
                  </div>
                </div>
                <Icon name="sort" size={22} sw={1.5} stroke="var(--color-text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    vehicle: (
      <>
        <div className="settings-section">
          <h3>我的车辆</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">主驾车辆</div>
              <div className="d">JDO X1 SUV · 沪 A·12345 · 2025 款 续航 560 km</div>
            </div>
            <Select value="编辑" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">添加第二辆车</div>
              <div className="d">支持多车切换 · 订单与积分独立</div>
            </div>
            <Select value="添加" />
          </div>
        </div>
        <div className="settings-section">
          <h3>车厂账号</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">车厂账号一键登录</div>
              <div className="d">已开通的 7 家车厂可在登录页选择</div>
            </div>
            <Select value="管理" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">车机数据同步</div>
              <div className="d">订单 / 收藏 / 浏览 / 积分 跨设备同步</div>
            </div>
            <Switch on={true} onToggle={() => {}} />
          </div>
        </div>
      </>
    ),
    storage: (
      <>
        <div className="settings-section">
          <h3>存储与缓存</h3>
          <div className="settings-row">
            <div className="info">
              <div className="l">图片缓存</div>
              <div className="d">商品图、车主头像 · 已缓存 286 MB</div>
            </div>
            <Select value="清空缓存" />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">购物车本地备份</div>
              <div className="d">弱网 / 隧道断网时本地保存 · 联网自动同步</div>
            </div>
            <Switch on={true} onToggle={() => {}} />
          </div>
          <div className="settings-row">
            <div className="info">
              <div className="l">日志与诊断</div>
              <div className="d">出问题时一键打包发给客服</div>
            </div>
            <Select value="导出日志" />
          </div>
        </div>
      </>
    ),
    about: (
      <>
        <div className="settings-section">
          <h3>关于 JDO</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '8px 0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg, var(--color-accent), var(--color-brand-500))', display: 'grid', placeItems: 'center', boxShadow: 'var(--glow-accent)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 36, color: '#03171f' }}>JDO</span>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 500 }}>JDO 车机商城</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 20, marginTop: 4, fontFamily: 'var(--font-mono)' }}>v1.0.0 · build 2026.05.26</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>车机内嵌 H5 通用电商 · 横屏 · 行车态安全</div>
            </div>
          </div>
          {[
            { l: '版本检查',       d: '已是最新版本 · 5 月 26 日发布' },
            { l: '用户协议',       d: '《JDO 车机用户协议》' },
            { l: '隐私政策',       d: '《JDO 车主隐私政策》PIPL 合规版本' },
            { l: '车厂适配',       d: 'AAOS / HarmonyOS / QNX · 7 家已对接' },
            { l: '安全规范',       d: 'NHTSA 2/12 + AAOS HMI 触控规范' },
            { l: '帮助与客服',     d: '7×24h · 4006 000 666 · 工单平均 8 分钟响应' },
            { l: '车主公益',       d: '每单 ¥ 0.1 用于山区充电桩建设' },
          ].map((r) => (
            <div key={r.l} className="settings-row">
              <div className="info">
                <div className="l">{r.l}</div>
                <div className="d">{r.d}</div>
              </div>
              <Icon name="chevR" size={22} stroke="var(--color-text-muted)" />
            </div>
          ))}
        </div>
        <button className="btn-big outline" style={{ width: '100%', height: 80, fontSize: 24 }} onClick={() => onNav('mall-login')}>退出登录</button>
      </>
    ),
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
            <div className="mall-titlebar">设置中心</div>
          </div>
          <div className="subbar-tabs">
            <span className="subbar-tab active">{sections.find((s) => s.id === section)?.name}</span>
          </div>
          <div className="mall-actions">
            <button className="mall-iconbtn" title="搜索"><Icon name="search" size={28} /></button>
          </div>
        </div>

        <div className="settings-body">
          <div className="settings-rail">
            {sections.map((s) => (
              <div key={s.id} className={'settings-rail-item' + (section === s.id ? ' active' : '')} onClick={() => setSection(s.id)}>
                <Icon name={s.ic} size={26} sw={1.5} />
                <span>{s.name}</span>
                {section === s.id && <Icon name="chevR" size={20} stroke="var(--color-mint)" />}
              </div>
            ))}
          </div>

          <div className="settings-content">
            {sectionContent[section]}
          </div>
        </div>
      </div>
      <Dock route="mall-settings" onNav={onNav} />
    </>
  );
}

window.MallSettings = MallSettings;
