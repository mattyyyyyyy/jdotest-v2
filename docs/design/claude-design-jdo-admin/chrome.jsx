// JDO 后台 · 框架组件（侧栏 / 顶栏 / 表格 / Tab / 批量条 / 分页 / KPI）
(function () {
  const { useState } = React;
  const Icon = window.Icon;

  // ── 导航 IA ────────────────────────────────────────
  const NAV = [
    { group: '概览', items: [{ key: 'dashboard', label: '运营看板', icon: 'dashboard' }] },
    { group: '商品', items: [
      { key: 'products', label: '商品管理', icon: 'box' },
      { key: 'categories', label: '分类管理', icon: 'grid' },
    ] },
    { group: '营销 / 内容', items: [
      { key: 'banner', label: 'Banner 横幅', icon: 'image' },
      { key: 'reco', label: '推荐位', icon: 'sparkles' },
      { key: 'coupon', label: '优惠券', icon: 'tag' },
    ] },
    { group: '交易', items: [
      { key: 'orders', label: '订单管理', icon: 'cart' },
      { key: 'aftersale', label: '售后', icon: 'refresh' },
      { key: 'logistics', label: '物流', icon: 'truck' },
    ] },
    { group: '客户', items: [
      { key: 'users', label: '用户管理', icon: 'users' },
      { key: 'reviews', label: '评价管理', icon: 'star' },
    ] },
    { group: '履约', items: [{ key: 'pickup', label: '自提点', icon: 'pin' }] },
    { group: '系统', items: [
      { key: 'accounts', label: '账号 / 角色', icon: 'shield' },
      { key: 'settings', label: '系统配置', icon: 'settings' },
    ] },
    { group: '规范', items: [{ key: 'spec', label: '组件规范', icon: 'grid' }] },
  ];
  const ALL_ITEMS = NAV.flatMap((g) => g.items);

  function Sidebar({ active, onNav }) {
    return React.createElement('aside', { className: 'jdo-sidebar' },
      React.createElement('div', { className: 'jdo-logo' },
        React.createElement('span', { className: 'jdo-logo-mark' }, '◆'),
        React.createElement('span', { className: 'jdo-logo-text' }, 'JDO ',
          React.createElement('span', { style: { color: 'var(--txt-2)', fontWeight: 500 } }, '后台')),
      ),
      React.createElement('nav', { className: 'jdo-nav' },
        NAV.map((g) => React.createElement('div', { key: g.group, className: 'jdo-nav-group' },
          React.createElement('div', { className: 'jdo-nav-grouptitle' }, g.group),
          g.items.map((it) => React.createElement('button', {
            key: it.key,
            className: 'jdo-nav-item' + (active === it.key ? ' active' : ''),
            onClick: () => onNav(it.key),
          },
            React.createElement(Icon, { name: it.icon, size: 17, stroke: active === it.key ? 1.9 : 1.6 }),
            React.createElement('span', null, it.label),
          )),
        )),
      ),
      React.createElement('div', { className: 'jdo-sidebar-foot' },
        React.createElement('div', { className: 'jdo-avatar sm' }, '运'),
        React.createElement('div', { style: { lineHeight: 1.3 } },
          React.createElement('div', { style: { fontSize: 13, color: 'var(--txt-1)', fontWeight: 600 } }, '运营 · 李娜'),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--txt-3)' } }, 'yunying01@jdo')),
      ),
    );
  }

  function Topbar({ active }) {
    const item = ALL_ITEMS.find((i) => i.key === active) || {};
    return React.createElement('header', { className: 'jdo-topbar' },
      React.createElement('div', { className: 'jdo-crumb' },
        React.createElement('span', { className: 'jdo-crumb-root' }, '后台'),
        React.createElement(Icon, { name: 'chevR', size: 13, style: { color: 'var(--txt-3)' } }),
        React.createElement('span', { className: 'jdo-crumb-cur' }, item.label || '—'),
      ),
      React.createElement('div', { className: 'jdo-topbar-right' },
        React.createElement('div', { className: 'jdo-globalsearch' },
          React.createElement(Icon, { name: 'search', size: 15, style: { color: 'var(--txt-3)' } }),
          React.createElement('input', { placeholder: '搜索订单 / 商品 / 用户…' }),
          React.createElement('kbd', null, '⌘K'),
        ),
        React.createElement('button', { className: 'jdo-iconbtn badge-dot' },
          React.createElement(Icon, { name: 'bell', size: 18 })),
        React.createElement('div', { className: 'jdo-avatar' }, '李'),
      ),
    );
  }

  // ── 页面标题行 ─────────────────────────────────────
  function PageHead({ title, count, action }) {
    return React.createElement('div', { className: 'jdo-pagehead' },
      React.createElement('div', { className: 'jdo-pagehead-left' },
        React.createElement('h1', { className: 'jdo-pagetitle' }, title),
        count != null && React.createElement('span', { className: 'jdo-count' }, '共 ', React.createElement('b', null, count), ' 条')),
      action,
    );
  }

  // ── 状态筛选 Tab（胶囊组）─────────────────────────
  function StatusTabs({ tabs, value, onChange }) {
    return React.createElement('div', { className: 'jdo-tabs' },
      tabs.map((t) => React.createElement('button', {
        key: t.value,
        className: 'jdo-tab' + (value === t.value ? ' active' : ''),
        onClick: () => onChange(t.value),
      }, t.label,
        t.count != null && React.createElement('span', { className: 'jdo-tab-count' }, t.count))));
  }

  // ── 批量操作条 ─────────────────────────────────────
  function BatchBar({ count, actions, onClear }) {
    if (!count) return null;
    return React.createElement('div', { className: 'jdo-batchbar' },
      React.createElement('span', { className: 'jdo-batch-count' }, '已选 ',
        React.createElement('b', null, count), ' 项'),
      React.createElement('div', { className: 'jdo-batch-actions' },
        actions.map((a, i) => React.createElement('button', {
          key: i, className: 'jdo-btn ghost sm' + (a.danger ? ' danger' : ''), onClick: a.onClick,
        }, a.icon && React.createElement(Icon, { name: a.icon, size: 14 }), a.label)),
        React.createElement('button', { className: 'jdo-btn link sm', onClick: onClear }, '取消选择')),
    );
  }

  // ── 数据表格 ───────────────────────────────────────
  function Table({ columns, rows, rowKey = 'id', selectable, selected, onToggle, onToggleAll, loading, empty }) {
    const allChecked = selectable && rows.length > 0 && rows.every((r) => selected.has(r[rowKey]));
    const someChecked = selectable && rows.some((r) => selected.has(r[rowKey]));
    return React.createElement('div', { className: 'jdo-tablecard' },
      React.createElement('div', { className: 'jdo-tablescroll' },
        React.createElement('table', { className: 'jdo-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              selectable && React.createElement('th', { className: 'jdo-th-check' },
                React.createElement(Check, {
                  checked: allChecked, indeterminate: someChecked && !allChecked,
                  onChange: () => onToggleAll(!allChecked),
                })),
              columns.map((c) => React.createElement('th', {
                key: c.key, style: { textAlign: c.align || 'left', width: c.width },
              }, c.label)),
            )),
          React.createElement('tbody', null,
            loading
              ? React.createElement(window.SkeletonRows, { cols: columns.length + (selectable ? 1 : 0) })
              : rows.length === 0
                ? React.createElement('tr', null, React.createElement('td', { colSpan: columns.length + (selectable ? 1 : 0) },
                    React.createElement(window.Empty, { text: empty })))
                : rows.map((r) => {
                    const k = r[rowKey];
                    const sel = selectable && selected.has(k);
                    return React.createElement('tr', { key: k, className: sel ? 'selected' : '' },
                      selectable && React.createElement('td', { className: 'jdo-th-check' },
                        React.createElement(Check, { checked: sel, onChange: () => onToggle(k) })),
                      columns.map((c) => React.createElement('td', {
                        key: c.key, style: { textAlign: c.align || 'left' },
                      }, c.render ? c.render(r) : r[c.key])),
                    );
                  }),
          ),
        )),
    );
  }

  function Check({ checked, indeterminate, onChange }) {
    return React.createElement('button', {
      type: 'button', role: 'checkbox', 'aria-checked': checked,
      className: 'jdo-check' + (checked ? ' on' : '') + (indeterminate ? ' ind' : ''),
      onClick: (e) => { e.stopPropagation(); onChange(); },
    }, (checked || indeterminate) && React.createElement(Icon, {
      name: indeterminate ? 'chevR' : 'check', size: 12, stroke: 3,
      style: indeterminate ? { transform: 'rotate(90deg)' } : null,
    }));
  }

  // ── 行操作链接 ─────────────────────────────────────
  function RowActions({ items }) {
    return React.createElement('div', { className: 'jdo-rowactions' },
      items.map((a, i) => React.createElement('button', {
        key: i, className: 'jdo-link' + (a.danger ? ' danger' : ''), onClick: a.onClick,
      }, a.label)));
  }

  // ── 分页 ───────────────────────────────────────────
  function Pagination({ page, pages, onPage }) {
    return React.createElement('div', { className: 'jdo-pagination' },
      React.createElement('span', { className: 'jdo-page-info' }, '第 ', React.createElement('b', null, page),
        ' / ', pages, ' 页'),
      React.createElement('div', { className: 'jdo-page-btns' },
        React.createElement('button', {
          className: 'jdo-pagebtn', disabled: page <= 1, onClick: () => onPage(page - 1),
        }, React.createElement(Icon, { name: 'chevL', size: 15 }), '上一页'),
        React.createElement('button', {
          className: 'jdo-pagebtn', disabled: page >= pages, onClick: () => onPage(page + 1),
        }, '下一页', React.createElement(Icon, { name: 'chevR', size: 15 }))),
    );
  }

  // ── KPI 卡片 ───────────────────────────────────────
  function KpiCard({ label, value, fmt, delta }) {
    const up = delta >= 0;
    const fmtVal = fmt === 'money'
      ? '¥' + value.toLocaleString('zh-CN')
      : value.toLocaleString('zh-CN');
    return React.createElement('div', { className: 'jdo-kpi' },
      React.createElement('div', { className: 'jdo-kpi-label' }, label),
      React.createElement('div', { className: 'jdo-kpi-value mono' }, fmtVal),
      React.createElement('div', { className: 'jdo-kpi-delta ' + (up ? 'up' : 'down') },
        React.createElement(Icon, { name: up ? 'arrowUp' : 'arrowDn', size: 12, stroke: 2.4 }),
        Math.abs(delta), '%',
        React.createElement('span', { className: 'jdo-kpi-period' }, '较上周')),
    );
  }

  Object.assign(window, {
    NAV, ALL_ITEMS, Sidebar, Topbar, PageHead, StatusTabs, BatchBar,
    Table, Check, RowActions, Pagination, KpiCard,
  });
})();
