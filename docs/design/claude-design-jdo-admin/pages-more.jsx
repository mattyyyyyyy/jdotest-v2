// JDO 后台 · 其余页面（用户 / 营销 / 系统 / 规范 等）
(function () {
  const { useState, useMemo } = React;
  const Icon = window.Icon;
  const { Badge, Thumb, Field, TextInput, Textarea, MoneyInput, Select, Switch,
    Drawer, Btn } = window;
  const { PageHead, StatusTabs, BatchBar, Table, RowActions, Pagination } = window;
  const J = window.JDO;
  const PAGE = 8;

  function usePager(rows) {
    const [page, setPage] = useState(1);
    const pages = Math.max(1, Math.ceil(rows.length / PAGE));
    const p = Math.min(page, pages);
    return { page: p, pages, setPage, pageRows: rows.slice((p - 1) * PAGE, p * PAGE) };
  }
  const money = (n) => React.createElement('span', { className: 'mono', style: { color: 'var(--txt-1)' } }, '¥' + Number(n).toFixed(2));
  const dim = (v) => React.createElement('span', { className: 'mono jdo-dim' }, v);

  // ════════ 用户管理 ════════
  function Users() {
    const [list, setList] = useState(() => J.USERS.map((u) => ({ ...u })));
    const [edit, setEdit] = useState(null);
    const pg = usePager(list);
    const cols = [
      { key: 'id', label: '用户ID', render: (r) => dim(r.id) },
      { key: 'phone', label: '手机号', render: (r) => React.createElement('span', { className: 'mono' }, r.phone) },
      { key: 'nick', label: '昵称', render: (r) => React.createElement('div', { className: 'jdo-cell-user' },
          React.createElement('span', { className: 'jdo-avatar xs' }, r.nick[0]), r.nick) },
      { key: 'points', label: '积分', align: 'right', render: (r) => React.createElement('span', { className: 'mono' }, r.points.toLocaleString()) },
      { key: 'balance', label: '余额', align: 'right', render: (r) => money(r.balance) },
      { key: 'banned', label: '账号状态', render: (r) => React.createElement(Badge, { tone: r.banned ? 'red' : 'green' }, r.banned ? '已封禁' : '正常') },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [{ label: '编辑', onClick: () => setEdit(r) }] }) },
    ];
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '用户管理', count: list.length }),
      React.createElement(Table, { columns: cols, rows: pg.pageRows }),
      React.createElement(Pagination, { page: pg.page, pages: pg.pages, onPage: pg.setPage }),
      React.createElement(EditDrawer, { item: edit, title: '编辑用户', sub: edit && edit.id, onClose: () => setEdit(null),
        onSave: (u) => { setList((l) => l.map((x) => x.id === u.id ? u : x)); setEdit(null); },
        fields: [
          { k: 'nick', label: '昵称', type: 'text' },
          { k: 'points', label: '积分', type: 'number' },
          { k: 'banned', label: '封禁账号', type: 'switch', onText: '已封禁', offText: '正常' },
        ] }),
    );
  }

  // ════════ 优惠券 ════════
  function Coupons() {
    const [list, setList] = useState(() => J.COUPONS.map((c) => ({ ...c })));
    const [edit, setEdit] = useState(null);
    const pg = usePager(list);
    const toggle = (id) => setList((l) => l.map((c) => c.id === id ? { ...c, on: !c.on } : c));
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'name', label: '券名' },
      { key: 'type', label: '类型', render: (r) => React.createElement(Badge, { tone: r.type === '满减' ? 'blue' : 'cyan', dot: false }, r.type) },
      { key: 'value', label: '面额', align: 'right', render: (r) => React.createElement('span', { className: 'mono' }, r.type === '满减' ? '¥' + r.value : (r.value * 10).toFixed(1) + '折') },
      { key: 'threshold', label: '门槛', align: 'right', render: (r) => dim(r.threshold ? '满¥' + r.threshold : '无门槛') },
      { key: 'left', label: '剩余张数', align: 'right', render: (r) => React.createElement('span', { className: 'mono ' + (r.left === 0 ? 'jdo-warn-txt' : '') }, r.left.toLocaleString()) },
      { key: 'on', label: '启用', render: (r) => React.createElement(Badge, { tone: r.on ? 'green' : 'gray', clickable: true, onClick: () => toggle(r.id) }, r.on ? '已启用' : '已停用') },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [
          { label: '编辑', onClick: () => setEdit(r) },
          { label: '删除', danger: true, onClick: () => setList((l) => l.filter((x) => x.id !== r.id)) }] }) },
    ];
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '优惠券', count: list.length,
        action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增优惠券') }),
      React.createElement(Table, { columns: cols, rows: pg.pageRows }),
      React.createElement(Pagination, { page: pg.page, pages: pg.pages, onPage: pg.setPage }),
      React.createElement(EditDrawer, { item: edit, title: '编辑优惠券', sub: edit && edit.id, onClose: () => setEdit(null),
        onSave: (c) => { setList((l) => l.map((x) => x.id === c.id ? c : x)); setEdit(null); },
        fields: [
          { k: 'name', label: '券名', type: 'text' },
          { k: 'type', label: '类型', type: 'select', options: [{ value: '满减', label: '满减' }, { value: '折扣', label: '折扣' }] },
          { k: 'value', label: '面额', type: 'number' },
          { k: 'threshold', label: '使用门槛（元）', type: 'number' },
          { k: 'left', label: '剩余张数', type: 'number' },
          { k: 'on', label: '启用', type: 'switch', onText: '已启用', offText: '已停用' },
        ] }),
    );
  }

  // ════════ Banner 横幅 ════════
  const BCOLOR = { blue: ['#3b82f6', '#1e40af'], emerald: ['#10b981', '#047857'] };
  function Banners() {
    const [list, setList] = useState(() => J.BANNERS.map((b) => ({ ...b })));
    const [edit, setEdit] = useState(null);
    const pg = usePager(list);
    const toggle = (id) => setList((l) => l.map((b) => b.id === id ? { ...b, on: !b.on } : b));
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'preview', label: '预览', width: 120, render: (r) => React.createElement('div', { className: 'jdo-banner-mini', style: { background: `linear-gradient(120deg, ${BCOLOR[r.color][0]}, ${BCOLOR[r.color][1]})` } }) },
      { key: 'title', label: '主标题', render: (r) => React.createElement('span', { style: { fontWeight: 600, color: 'var(--txt-1)' } }, r.title) },
      { key: 'sub', label: '副标题', render: (r) => React.createElement('span', { className: 'jdo-dim' }, r.sub) },
      { key: 'color', label: '配色', render: (r) => React.createElement('span', { className: 'jdo-colorchip' },
          React.createElement('span', { style: { background: BCOLOR[r.color][0] } }), r.color) },
      { key: 'on', label: '启用', render: (r) => React.createElement(Badge, { tone: r.on ? 'green' : 'gray', clickable: true, onClick: () => toggle(r.id) }, r.on ? '已启用' : '未启用') },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [{ label: '编辑', onClick: () => setEdit(r) }] }) },
    ];
    return React.createElement('div', null,
      React.createElement(PageHead, { title: 'Banner 横幅', count: list.length,
        action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增横幅') }),
      React.createElement(Table, { columns: cols, rows: pg.pageRows }),
      React.createElement(EditDrawer, { item: edit, title: '编辑横幅', sub: edit && edit.id, onClose: () => setEdit(null),
        onSave: (b) => { setList((l) => l.map((x) => x.id === b.id ? b : x)); setEdit(null); },
        fields: [
          { k: 'title', label: '主标题', type: 'text' },
          { k: 'sub', label: '副标题', type: 'text' },
          { k: 'color', label: '配色', type: 'select', options: [{ value: 'blue', label: 'blue 蓝' }, { value: 'emerald', label: 'emerald 翠绿' }] },
          { k: 'img', label: '图片 URL', type: 'text' },
          { k: 'on', label: '启用', type: 'switch', onText: '已启用', offText: '未启用' },
        ] }),
    );
  }

  // ════════ 推荐位 ════════
  function Recos() {
    const [list, setList] = useState(() => J.RECOS.map((r) => ({ ...r })));
    const [edit, setEdit] = useState(null);
    const toggle = (id) => setList((l) => l.map((r) => r.id === id ? { ...r, on: !r.on } : r));
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'tag', label: '角标', render: (r) => React.createElement('span', { className: 'jdo-minitag' }, r.tag) },
      { key: 'title', label: '标题', render: (r) => React.createElement('span', { style: { color: 'var(--txt-1)', fontWeight: 600 } }, r.title) },
      { key: 'sub', label: '副文', render: (r) => React.createElement('span', { className: 'jdo-dim' }, r.sub) },
      { key: 'target', label: '跳转场景', render: (r) => J.catName(r.target) },
      { key: 'on', label: '启用', render: (r) => React.createElement(Badge, { tone: r.on ? 'green' : 'gray', clickable: true, onClick: () => toggle(r.id) }, r.on ? '已启用' : '未启用') },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [{ label: '编辑', onClick: () => setEdit(r) }] }) },
    ];
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '推荐位', count: list.length,
        action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增推荐位') }),
      React.createElement(Table, { columns: cols, rows: list }),
      React.createElement(EditDrawer, { item: edit, title: '编辑推荐位', sub: edit && edit.id, onClose: () => setEdit(null),
        onSave: (r) => { setList((l) => l.map((x) => x.id === r.id ? r : x)); setEdit(null); },
        fields: [
          { k: 'tag', label: '角标', type: 'text' },
          { k: 'title', label: '标题', type: 'text' },
          { k: 'sub', label: '副文', type: 'text' },
          { k: 'target', label: '跳转场景', type: 'select', options: J.CATEGORIES.map((c) => ({ value: c.id, label: c.name })) },
          { k: 'on', label: '启用', type: 'switch', onText: '已启用', offText: '未启用' },
        ] }),
    );
  }

  // ════════ 分类管理 ════════
  function Categories() {
    const list = J.CATEGORIES;
    const cols = [
      { key: 'id', label: '分类ID', render: (r) => dim(r.id) },
      { key: 'name', label: '分类名', render: (r) => React.createElement('span', { style: { color: 'var(--txt-1)', fontWeight: 600 } }, r.name) },
      { key: 'icon', label: '图标', render: (r) => React.createElement('div', { className: 'jdo-cat-icon' },
          React.createElement(Icon, { name: r.icon, size: 16 }), React.createElement('span', { className: 'jdo-dim mono' }, r.icon)) },
      { key: 'sort', label: '排序', align: 'right', render: (r) => React.createElement('span', { className: 'mono' }, r.sort) },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '编辑' }, { label: '删除', danger: true }] }) },
    ];
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '分类管理', count: list.length,
        action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增分类') }),
      React.createElement(Table, { columns: cols, rows: list }));
  }

  // ════════ 售后 / 物流 / 评价 / 自提点 / 账号 ════════
  function Aftersale() {
    const ST = { wait: ['待审核', 'amber'], pass: ['通过', 'green'], reject: ['拒绝', 'red'] };
    const rows = J.ORDERS.slice(0, 6).map((o, i) => ({ id: 'AS' + (3001 + i), order: o.id, reason: ['七天无理由', '商品损坏', '少件漏发', '不想要了'][i % 4], st: ['wait', 'pass', 'reject', 'wait'][i % 4] }));
    const cols = [
      { key: 'id', label: '售后单号', render: (r) => dim(r.id) },
      { key: 'order', label: '关联订单', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.order) },
      { key: 'reason', label: '原因' },
      { key: 'st', label: '状态', render: (r) => React.createElement(Badge, { tone: ST[r.st][1] }, ST[r.st][0]) },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '处理' }] }) },
    ];
    return React.createElement('div', null, React.createElement(PageHead, { title: '售后', count: rows.length }),
      React.createElement(Table, { columns: cols, rows }));
  }
  function Logistics() {
    const ST = { sent: ['已揽收', 'cyan'], transit: ['运输中', 'blue'], deliver: ['派送中', 'amber'], done: ['已签收', 'green'] };
    const rows = J.ORDERS.filter((o) => ['shipping', 'done'].includes(o.status)).slice(0, 7).map((o, i) => ({ id: o.id, wb: 'SF' + (138000000000 + i * 137), st: ['sent', 'transit', 'deliver', 'done'][i % 4], track: ['【杭州转运中心】已发出', '运输途中', '【北京】派送中', '已签收，签收人：本人'][i % 4] }));
    const cols = [
      { key: 'id', label: '订单号', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.id) },
      { key: 'wb', label: '运单号', render: (r) => React.createElement('span', { className: 'mono' }, r.wb) },
      { key: 'st', label: '状态', render: (r) => React.createElement(Badge, { tone: ST[r.st][1] }, ST[r.st][0]) },
      { key: 'track', label: '最新轨迹', render: (r) => React.createElement('span', { className: 'jdo-dim jdo-clamp' }, r.track) },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '编辑' }] }) },
    ];
    return React.createElement('div', null, React.createElement(PageHead, { title: '物流', count: rows.length }),
      React.createElement(Table, { columns: cols, rows }));
  }
  function Reviews() {
    const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨帆'];
    const rows = J.PRODUCTS.slice(0, 7).map((p, i) => ({ id: 'RV' + (5001 + i), prod: p.name, icon: p.icon, score: [5, 4, 5, 3, 5, 2, 4][i], content: ['质量很好下次还来', '物流快，包装完整', '性价比高，推荐', '一般般吧', '车机下单太方便了', '和描述有差距', '不错'][i], hidden: i === 5 }));
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'prod', label: '商品', render: (r) => React.createElement('div', { className: 'jdo-cell-user' }, React.createElement(Thumb, { icon: r.icon, size: 28, radius: 7 }), React.createElement('span', { className: 'jdo-clamp', style: { maxWidth: 180 } }, r.prod)) },
      { key: 'score', label: '评分', render: (r) => React.createElement('span', { className: 'jdo-stars' }, '★★★★★'.slice(0, r.score) + '☆☆☆☆☆'.slice(0, 5 - r.score)) },
      { key: 'content', label: '内容', render: (r) => React.createElement('span', { className: 'jdo-clamp' }, r.content) },
      { key: 'hidden', label: '显示状态', render: (r) => React.createElement(Badge, { tone: r.hidden ? 'gray' : 'green' }, r.hidden ? '已隐藏' : '显示') },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '隐藏' }] }) },
    ];
    return React.createElement('div', null, React.createElement(PageHead, { title: '评价管理', count: rows.length }),
      React.createElement(Table, { columns: cols, rows }));
  }
  function Pickup() {
    const rows = [
      { id: 'SP01', name: '京东快充·望京旗舰店', addr: '北京市朝阳区望京SOHO T1', hours: '09:00–21:00', open: true },
      { id: 'SP02', name: 'JDO自提·西二旗服务区', addr: '北京市海淀区西二旗大街', hours: '07:00–23:00', open: true },
      { id: 'SP03', name: 'JDO自提·虹桥枢纽', addr: '上海市闵行区申虹路', hours: '24h', open: true },
      { id: 'SP04', name: 'JDO自提·深圳湾口岸', addr: '深圳市南山区东滨路', hours: '08:00–22:00', open: false },
    ];
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'name', label: '名称', render: (r) => React.createElement('span', { style: { color: 'var(--txt-1)', fontWeight: 600 } }, r.name) },
      { key: 'addr', label: '地址', render: (r) => React.createElement('span', { className: 'jdo-dim' }, r.addr) },
      { key: 'hours', label: '营业时间', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.hours) },
      { key: 'open', label: '营业状态', render: (r) => React.createElement(Badge, { tone: r.open ? 'green' : 'gray' }, r.open ? '营业中' : '已打烊') },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '编辑' }] }) },
    ];
    return React.createElement('div', null, React.createElement(PageHead, { title: '自提点', count: rows.length,
      action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增自提点') }),
      React.createElement(Table, { columns: cols, rows }));
  }
  function Accounts() {
    const ROLE = { '超管': 'blue', '运营': 'cyan', '客服': 'green', '财务': 'amber' };
    const cols = [
      { key: 'id', label: 'ID', render: (r) => dim(r.id) },
      { key: 'account', label: '账号', render: (r) => React.createElement('span', { className: 'mono' }, r.account) },
      { key: 'role', label: '角色', render: (r) => React.createElement(Badge, { tone: ROLE[r.role], dot: false }, r.role) },
      { key: 'act', label: '操作', align: 'right', render: () => React.createElement(RowActions, { items: [{ label: '编辑' }, { label: '删除', danger: true }] }) },
    ];
    return React.createElement('div', null, React.createElement(PageHead, { title: '账号 / 角色', count: J.ACCOUNTS.length,
      action: React.createElement(Btn, { variant: 'primary', icon: 'plus' }, '新增账号') }),
      React.createElement(Table, { columns: cols, rows: J.ACCOUNTS }));
  }

  // ════════ 系统配置 ════════
  function Settings() {
    const [speed, setSpeed] = useState(15);
    const [exitSec, setExitSec] = useState(8);
    const [degrade, setDegrade] = useState(true);
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '系统配置' }),
      React.createElement('div', { className: 'jdo-card jdo-settings' },
        React.createElement('div', { className: 'jdo-card-title', style: { marginBottom: 4 } }, '行车态规则'),
        React.createElement('div', { className: 'jdo-card-sub', style: { marginBottom: 20 } }, '车机消费端的行车态降级策略（后台仅配置，不影响后台密度）'),
        React.createElement('div', { className: 'jdo-set-row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'jdo-set-label' }, '行车态车速阈值'),
            React.createElement('div', { className: 'jdo-set-hint' }, '车速超过该值即进入行车态')),
          React.createElement('div', { className: 'jdo-set-ctrl' },
            React.createElement('input', { type: 'range', min: 0, max: 40, value: speed, onChange: (e) => setSpeed(+e.target.value), className: 'jdo-range' }),
            React.createElement('span', { className: 'jdo-set-val mono' }, speed, ' km/h'))),
        React.createElement('div', { className: 'jdo-set-row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'jdo-set-label' }, '停车退出秒数'),
            React.createElement('div', { className: 'jdo-set-hint' }, '低于阈值持续该秒数后退出行车态')),
          React.createElement('div', { className: 'jdo-set-ctrl' },
            React.createElement('input', { type: 'range', min: 1, max: 30, value: exitSec, onChange: (e) => setExitSec(+e.target.value), className: 'jdo-range' }),
            React.createElement('span', { className: 'jdo-set-val mono' }, exitSec, ' 秒'))),
        React.createElement('div', { className: 'jdo-set-row' },
          React.createElement('div', null,
            React.createElement('div', { className: 'jdo-set-label' }, '行车态降级 Banner'),
            React.createElement('div', { className: 'jdo-set-hint' }, '行车态下首页是否展示安全提示横幅')),
          React.createElement(Switch, { checked: degrade, onChange: setDegrade, label: degrade ? '已开启' : '已关闭' })),
        React.createElement('div', { className: 'jdo-set-foot' },
          React.createElement(Btn, { variant: 'primary' }, '保存配置'))),
    );
  }

  // ════════ 通用编辑抽屉（配置驱动）════════
  function EditDrawer({ item, title, sub, fields, onClose, onSave }) {
    const [form, setForm] = useState(item || {});
    React.useEffect(() => setForm(item || {}), [item]);
    if (!item) return React.createElement(Drawer, { open: false, onClose });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return React.createElement(Drawer, { open: true, onClose, title, sub,
      footer: React.createElement(React.Fragment, null,
        React.createElement(Btn, { variant: 'ghost', onClick: onClose }, '取消'),
        React.createElement(Btn, { variant: 'primary', onClick: () => onSave(form) }, '保存')),
    },
      fields.map((f) => React.createElement(Field, { key: f.k, label: f.label },
        f.type === 'switch'
          ? React.createElement(Switch, { checked: !!form[f.k], onChange: (v) => set(f.k, v), label: form[f.k] ? f.onText : f.offText })
          : f.type === 'select'
            ? React.createElement(Select, { value: form[f.k], onChange: (v) => set(f.k, v), options: f.options })
            : React.createElement(TextInput, { type: f.type === 'number' ? 'number' : 'text', value: form[f.k] ?? '', onChange: (e) => set(f.k, f.type === 'number' ? e.target.value : e.target.value) }))),
    );
  }

  // ════════ 组件规范页 ════════
  function Spec() {
    const Section = ({ title, desc, children }) => React.createElement('div', { className: 'jdo-spec-sec' },
      React.createElement('div', { className: 'jdo-spec-head' },
        React.createElement('div', { className: 'jdo-card-title' }, title),
        desc && React.createElement('div', { className: 'jdo-card-sub' }, desc)),
      React.createElement('div', { className: 'jdo-spec-demo' }, children));
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '组件规范' }),
      React.createElement('div', { className: 'jdo-spec-grid' },
        React.createElement(Section, { title: '状态徽章', desc: '胶囊 · 部分可点切换' },
          React.createElement(Badge, { tone: 'green' }, '已上架'),
          React.createElement(Badge, { tone: 'red' }, '已下架'),
          React.createElement(Badge, { tone: 'amber' }, '待支付'),
          React.createElement(Badge, { tone: 'cyan' }, '配送中'),
          React.createElement(Badge, { tone: 'blue' }, '满减'),
          React.createElement(Badge, { tone: 'gray' }, '已过期')),
        React.createElement(Section, { title: '按钮', desc: 'primary / ghost / link / danger' },
          React.createElement(Btn, { variant: 'primary' }, '主要按钮'),
          React.createElement(Btn, { variant: 'ghost' }, '次要按钮'),
          React.createElement(Btn, { variant: 'ghost', icon: 'plus' }, '带图标'),
          React.createElement(Btn, { variant: 'link' }, '文字链接'),
          React.createElement(Btn, { variant: 'ghost danger' }, '危险操作')),
        React.createElement(Section, { title: '输入控件', desc: 'input / 金额 / 下拉 / 开关' },
          React.createElement('div', { style: { display: 'grid', gap: 12, width: '100%', maxWidth: 320 } },
            React.createElement(TextInput, { placeholder: '文本输入' }),
            React.createElement(MoneyInput, { value: 89, onChange: () => {} }),
            React.createElement(Select, { value: 'C01', onChange: () => {}, options: J.CATEGORIES.map((c) => ({ value: c.id, label: c.name })) }),
            React.createElement(Switch, { checked: true, onChange: () => {}, label: '已开启' }))),
        React.createElement(Section, { title: '筛选 Tab', desc: '胶囊按钮组' },
          React.createElement(StatusTabs, { value: 'all', onChange: () => {}, tabs: [
            { value: 'all', label: '全部', count: 18 }, { value: 'on', label: '已上架', count: 14 }, { value: 'off', label: '已下架', count: 4 }] })),
        React.createElement(Section, { title: '分页', desc: '表格底部' },
          React.createElement(Pagination, { page: 1, pages: 3, onPage: () => {} })),
        React.createElement(Section, { title: '空 / 加载态' },
          React.createElement('div', { style: { display: 'flex', gap: 24, width: '100%' } },
            React.createElement('div', { style: { flex: 1, border: '1px dashed var(--border)', borderRadius: 10 } }, React.createElement(window.Empty, null)),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('table', { className: 'jdo-table', style: { width: '100%' } },
                React.createElement('tbody', null, React.createElement(window.SkeletonRows, { cols: 3, rows: 3 })))))),
      ),
    );
  }

  Object.assign(window, { Users, Coupons, Banners, Recos, Categories, Aftersale, Logistics, Reviews, Pickup, Accounts, Settings, Spec, EditDrawer });
})();
