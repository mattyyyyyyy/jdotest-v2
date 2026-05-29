// JDO 后台 · 核心页面（看板 / 商品 / 订单）
(function () {
  const { useState, useMemo } = React;
  const Icon = window.Icon;
  const { Badge, Thumb, Field, TextInput, Textarea, MoneyInput, Select, Switch,
    ImageField, Drawer, Btn } = window;
  const { PageHead, StatusTabs, BatchBar, Table, RowActions, Pagination, KpiCard } = window;
  const J = window.JDO;
  const PAGE = 8;

  function usePager(rows) {
    const [page, setPage] = useState(1);
    const [sel, setSel] = useState(() => new Set());
    const pages = Math.max(1, Math.ceil(rows.length / PAGE));
    const p = Math.min(page, pages);
    const pageRows = rows.slice((p - 1) * PAGE, p * PAGE);
    return {
      page: p, pages, setPage, pageRows, selected: sel,
      toggle: (k) => setSel((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; }),
      toggleAll: (on) => setSel((s) => { const n = new Set(s); pageRows.forEach((r) => on ? n.add(r.id) : n.delete(r.id)); return n; }),
      clear: () => setSel(new Set()),
    };
  }

  // ════════ 运营看板 ════════
  function Dashboard() {
    return React.createElement('div', null,
      React.createElement(PageHead, { title: '运营看板' }),
      React.createElement('div', { className: 'jdo-kpi-grid' },
        J.KPI.map((k) => React.createElement(KpiCard, { key: k.label, ...k }))),
      React.createElement('div', { className: 'jdo-dash-row' },
        React.createElement(TrendCard, null),
        React.createElement(TodoCard, null)),
    );
  }

  function TrendCard() {
    const data = J.TREND;
    const W = 720, H = 220, pad = 8;
    const max = Math.max(...data), min = Math.min(...data);
    const x = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2 - 16);
    const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const area = `${line} L${x(data.length - 1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z`;
    const total = data.reduce((s, v) => s + v, 0);
    return React.createElement('div', { className: 'jdo-card jdo-trend' },
      React.createElement('div', { className: 'jdo-card-head' },
        React.createElement('div', null,
          React.createElement('div', { className: 'jdo-card-title' }, 'GMV 趋势'),
          React.createElement('div', { className: 'jdo-card-sub' }, '近 30 天 · 合计 ',
            React.createElement('span', { className: 'mono', style: { color: 'var(--txt-1)' } }, '¥' + total.toLocaleString('zh-CN')))),
        React.createElement('div', { className: 'jdo-chip-row' },
          React.createElement('span', { className: 'jdo-chip active' }, '日'),
          React.createElement('span', { className: 'jdo-chip' }, '周'),
          React.createElement('span', { className: 'jdo-chip' }, '月'))),
      React.createElement('svg', { viewBox: `0 0 ${W} ${H}`, className: 'jdo-chart', preserveAspectRatio: 'none' },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'gmvfill', x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: 'var(--brand)', stopOpacity: .28 }),
            React.createElement('stop', { offset: '100%', stopColor: 'var(--brand)', stopOpacity: 0 }))),
        React.createElement('path', { d: area, fill: 'url(#gmvfill)' }),
        React.createElement('path', { d: line, fill: 'none', stroke: 'var(--brand)', strokeWidth: 2, strokeLinejoin: 'round' }),
      ),
    );
  }

  function TodoCard() {
    return React.createElement('div', { className: 'jdo-card jdo-todo' },
      React.createElement('div', { className: 'jdo-card-head' },
        React.createElement('div', { className: 'jdo-card-title' }, '待办事项')),
      React.createElement('div', { className: 'jdo-todo-list' },
        J.TODOS.map((t, i) => React.createElement('button', { key: i, className: 'jdo-todo-item' },
          React.createElement('span', null, t.t),
          React.createElement('span', { className: 'jdo-todo-n', style: { color: `var(--${t.tone === 'amber' ? 'warn' : t.tone === 'red' ? 'err' : t.tone === 'cyan' ? 'accent' : 'brand'})` } }, t.n),
        ))),
    );
  }

  // ════════ 商品管理 ════════
  function Products() {
    const [list, setList] = useState(() => J.PRODUCTS.map((p) => ({ ...p })));
    const [tab, setTab] = useState('all');
    const [edit, setEdit] = useState(null); // product or {} for new
    const filtered = useMemo(() => list.filter((p) =>
      tab === 'all' ? true : tab === 'on' ? p.onSale : !p.onSale), [list, tab]);
    const pg = usePager(filtered);

    const tabs = [
      { value: 'all', label: '全部', count: list.length },
      { value: 'on', label: '已上架', count: list.filter((p) => p.onSale).length },
      { value: 'off', label: '已下架', count: list.filter((p) => !p.onSale).length },
    ];
    const toggleSale = (id) => setList((l) => l.map((p) => p.id === id ? { ...p, onSale: !p.onSale } : p));
    const batchSet = (on) => { setList((l) => l.map((p) => pg.selected.has(p.id) ? { ...p, onSale: on } : p)); pg.clear(); };
    const batchDel = () => { setList((l) => l.filter((p) => !pg.selected.has(p.id))); pg.clear(); };

    const columns = [
      { key: 'icon', label: '图', width: 56, render: (r) => React.createElement(Thumb, { icon: r.icon }) },
      { key: 'id', label: '商品ID', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.id) },
      { key: 'name', label: '商品名称', render: (r) => React.createElement('div', { className: 'jdo-cell-name' },
          React.createElement('span', null, r.name),
          r.tag && React.createElement('span', { className: 'jdo-minitag' }, r.tag)) },
      { key: 'cat', label: '分类', render: (r) => J.catName(r.cat) },
      { key: 'price', label: '现价', align: 'right', render: (r) => React.createElement('span', { className: 'mono', style: { color: 'var(--txt-1)', fontWeight: 600 } }, '¥' + r.price.toFixed(2)) },
      { key: 'origPrice', label: '原价', align: 'right', render: (r) => React.createElement('span', { className: 'mono jdo-dim', style: { textDecoration: 'line-through' } }, '¥' + r.origPrice.toFixed(2)) },
      { key: 'stock', label: '库存', align: 'right', render: (r) => React.createElement('span', { className: 'mono ' + (r.stock < 100 ? 'jdo-warn-txt' : '') }, r.stock) },
      { key: 'sales', label: '销量(万)', align: 'right', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.sales.toFixed(1)) },
      { key: 'onSale', label: '上架状态', render: (r) => React.createElement(Badge, {
          tone: r.onSale ? 'green' : 'gray', clickable: true, onClick: () => toggleSale(r.id),
        }, r.onSale ? '已上架' : '已下架') },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [
          { label: '编辑', onClick: () => setEdit(r) },
          { label: '删除', danger: true, onClick: () => setList((l) => l.filter((x) => x.id !== r.id)) },
        ] }) },
    ];

    return React.createElement('div', null,
      React.createElement(PageHead, {
        title: '商品管理', count: filtered.length,
        action: React.createElement(Btn, { variant: 'primary', icon: 'plus', onClick: () => setEdit({ isNew: true, icon: 'box', onSale: true }) }, '新增商品'),
      }),
      React.createElement(StatusTabs, { tabs, value: tab, onChange: (v) => { setTab(v); pg.setPage(1); } }),
      React.createElement(BatchBar, {
        count: pg.selected.size, onClear: pg.clear,
        actions: [
          { label: '批量上架', icon: 'arrowUp', onClick: () => batchSet(true) },
          { label: '批量下架', icon: 'arrowDn', onClick: () => batchSet(false) },
          { label: '批量删除', icon: 'trash', danger: true, onClick: batchDel },
        ],
      }),
      React.createElement(Table, {
        columns, rows: pg.pageRows, selectable: true,
        selected: pg.selected, onToggle: pg.toggle, onToggleAll: pg.toggleAll,
      }),
      React.createElement(Pagination, { page: pg.page, pages: pg.pages, onPage: pg.setPage }),
      React.createElement(ProductDrawer, { product: edit, onClose: () => setEdit(null),
        onSave: (p) => { if (!p.isNew) setList((l) => l.map((x) => x.id === p.id ? p : x)); setEdit(null); } }),
    );
  }

  function ProductDrawer({ product, onClose, onSave }) {
    const [form, setForm] = useState(product || {});
    React.useEffect(() => setForm(product || {}), [product]);
    if (!product) return React.createElement(Drawer, { open: false, onClose });
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    return React.createElement(Drawer, {
      open: true, onClose,
      title: product.isNew ? '新增商品' : '编辑商品',
      sub: product.isNew ? '填写商品信息后保存' : product.id,
      footer: React.createElement(React.Fragment, null,
        React.createElement(Btn, { variant: 'ghost', onClick: onClose }, '取消'),
        React.createElement(Btn, { variant: 'primary', onClick: () => onSave(form) }, '保存')),
    },
      React.createElement(Field, { label: '商品图片' },
        React.createElement(ImageField, { icon: form.icon })),
      React.createElement(Field, { label: '商品名称', required: true },
        React.createElement(TextInput, { value: form.name || '', onChange: (e) => set('name', e.target.value), placeholder: '请输入商品名称' })),
      React.createElement(Field, { label: '分类', required: true },
        React.createElement(Select, { value: form.cat || 'C01', onChange: (v) => set('cat', v),
          options: J.CATEGORIES.map((c) => ({ value: c.id, label: c.name })) })),
      React.createElement('div', { className: 'jdo-field-row' },
        React.createElement(Field, { label: '现价（元）', required: true },
          React.createElement(MoneyInput, { value: form.price ?? '', onChange: (v) => set('price', v) })),
        React.createElement(Field, { label: '原价（元）' },
          React.createElement(MoneyInput, { value: form.origPrice ?? '', onChange: (v) => set('origPrice', v) }))),
      React.createElement(Field, { label: '库存' },
        React.createElement(TextInput, { type: 'number', value: form.stock ?? '', onChange: (e) => set('stock', e.target.value) })),
      React.createElement(Field, { label: '角标文案', hint: '展示在缩略图角标，如「新品 / 热销」' },
        React.createElement(TextInput, { value: form.tag || '', onChange: (e) => set('tag', e.target.value), placeholder: '选填' })),
      React.createElement(Field, { label: '上架' },
        React.createElement(Switch, { checked: !!form.onSale, onChange: (v) => set('onSale', v), label: form.onSale ? '已上架' : '已下架' })),
    );
  }

  // ════════ 订单管理 ════════
  function Orders() {
    const [list, setList] = useState(() => J.ORDERS.map((o) => ({ ...o })));
    const [tab, setTab] = useState('all');
    const [edit, setEdit] = useState(null);
    const [detail, setDetail] = useState(null);
    const ST = J.ORDER_STATUS;
    const filtered = useMemo(() => list.filter((o) => tab === 'all' ? true : o.status === tab), [list, tab]);
    const pg = usePager(filtered);

    const tabs = [{ value: 'all', label: '全部', count: list.length }].concat(
      ['pending', 'paid', 'shipping', 'done', 'canceled', 'refunding'].map((k) => ({
        value: k, label: ST[k].label, count: list.filter((o) => o.status === k).length })));

    const columns = [
      { key: 'id', label: '订单号', render: (r) => React.createElement('button', { className: 'jdo-link', onClick: () => setDetail(r) },
          React.createElement('span', { className: 'mono' }, r.id)) },
      { key: 'user', label: '用户', render: (r) => React.createElement('div', { className: 'jdo-cell-user' },
          React.createElement('span', { className: 'jdo-avatar xs' }, r.user[0]), r.user) },
      { key: 'items', label: '商品清单', render: (r) => React.createElement('span', { className: 'jdo-dim jdo-clamp' },
          r.items.map((it) => `${it.name}×${it.qty}`).join('，')) },
      { key: 'amount', label: '金额', align: 'right', render: (r) => React.createElement('span', { className: 'mono', style: { color: 'var(--txt-1)', fontWeight: 600 } }, '¥' + r.amount.toFixed(2)) },
      { key: 'status', label: '状态', render: (r) => React.createElement(Badge, { tone: ST[r.status].tone }, ST[r.status].label) },
      { key: 'channel', label: '入口', render: (r) => React.createElement('span', { className: 'jdo-entry ' + r.channel },
          React.createElement(Icon, { name: r.channel === 'car' ? 'car' : 'phone', size: 13 }), r.channel === 'car' ? '车机' : '手机') },
      { key: 'time', label: '下单时间', render: (r) => React.createElement('span', { className: 'mono jdo-dim' }, r.time) },
      { key: 'act', label: '操作', align: 'right', render: (r) => React.createElement(RowActions, { items: [
          { label: '详情', onClick: () => setDetail(r) },
          { label: '改状态', onClick: () => setEdit(r) },
        ] }) },
    ];

    return React.createElement('div', null,
      React.createElement(PageHead, { title: '订单管理', count: filtered.length }),
      React.createElement(StatusTabs, { tabs, value: tab, onChange: (v) => { setTab(v); pg.setPage(1); } }),
      React.createElement(Table, { columns, rows: pg.pageRows }),
      React.createElement(Pagination, { page: pg.page, pages: pg.pages, onPage: pg.setPage }),
      React.createElement(OrderDrawer, { order: edit, onClose: () => setEdit(null),
        onSave: (o) => { setList((l) => l.map((x) => x.id === o.id ? o : x)); setEdit(null); } }),
      React.createElement(OrderDetail, { order: detail, onClose: () => setDetail(null) }),
    );
  }

  function OrderDrawer({ order, onClose, onSave }) {
    const [form, setForm] = useState(order || {});
    React.useEffect(() => setForm(order || {}), [order]);
    if (!order) return React.createElement(Drawer, { open: false, onClose });
    const ST = J.ORDER_STATUS;
    return React.createElement(Drawer, {
      open: true, onClose, title: '修改订单', sub: order.id,
      footer: React.createElement(React.Fragment, null,
        React.createElement(Btn, { variant: 'ghost', onClick: onClose }, '取消'),
        React.createElement(Btn, { variant: 'primary', onClick: () => onSave(form) }, '保存')),
    },
      React.createElement(Field, { label: '订单状态' },
        React.createElement(Select, { value: form.status, onChange: (v) => setForm((f) => ({ ...f, status: v })),
          options: Object.keys(ST).map((k) => ({ value: k, label: ST[k].label })) })),
      React.createElement(Field, { label: '入口渠道' },
        React.createElement(Select, { value: form.channel, onChange: (v) => setForm((f) => ({ ...f, channel: v })),
          options: [{ value: 'car', label: '车机' }, { value: 'phone', label: '手机' }] })),
    );
  }

  function OrderDetail({ order, onClose }) {
    if (!order) return React.createElement(Drawer, { open: false, onClose });
    const ST = J.ORDER_STATUS;
    const steps = [
      { k: 'pending', label: '提交订单' }, { k: 'paid', label: '完成支付' },
      { k: 'shipping', label: '商家发货' }, { k: 'done', label: '确认收货' },
    ];
    const order_seq = ['pending', 'paid', 'shipping', 'done'];
    const curIdx = order_seq.indexOf(order.status);
    return React.createElement(Drawer, { open: true, onClose, title: '订单详情', sub: order.id, width: 460 },
      React.createElement('div', { className: 'jdo-detail-status' },
        React.createElement(Badge, { tone: ST[order.status].tone }, ST[order.status].label),
        React.createElement('span', { className: 'jdo-entry ' + order.channel },
          React.createElement(Icon, { name: order.channel === 'car' ? 'car' : 'phone', size: 13 }), order.channel === 'car' ? '车机入口' : '手机入口')),
      React.createElement('div', { className: 'jdo-timeline' },
        steps.map((s, i) => React.createElement('div', { key: s.k, className: 'jdo-tl-item' + (i <= curIdx && curIdx >= 0 ? ' done' : '') },
          React.createElement('span', { className: 'jdo-tl-dot' }, i <= curIdx && curIdx >= 0 ? React.createElement(Icon, { name: 'check', size: 11, stroke: 3 }) : ''),
          React.createElement('div', null,
            React.createElement('div', { className: 'jdo-tl-label' }, s.label),
            React.createElement('div', { className: 'jdo-tl-time mono' }, i <= curIdx && curIdx >= 0 ? order.time : '—'))))),
      React.createElement('div', { className: 'jdo-detail-sec' },
        React.createElement('div', { className: 'jdo-detail-sectitle' }, '商品清单'),
        order.items.map((it, i) => React.createElement('div', { key: i, className: 'jdo-detail-item' },
          React.createElement(Thumb, { icon: it.icon, size: 36 }),
          React.createElement('div', { style: { flex: 1, minWidth: 0 } },
            React.createElement('div', { className: 'jdo-clamp' }, it.name),
            React.createElement('div', { className: 'jdo-dim', style: { fontSize: 12 } }, '×' + it.qty)),
          React.createElement('span', { className: 'mono', style: { color: 'var(--txt-1)' } }, '¥' + (it.price * it.qty).toFixed(2))))),
      React.createElement('div', { className: 'jdo-detail-total' },
        React.createElement('span', { className: 'jdo-dim' }, '实付金额'),
        React.createElement('span', { className: 'mono', style: { fontSize: 20, color: 'var(--brand)', fontWeight: 700 } }, '¥' + order.amount.toFixed(2))),
    );
  }

  Object.assign(window, { Dashboard, Products, Orders });
})();
