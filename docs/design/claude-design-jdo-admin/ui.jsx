// JDO 后台 · UI 基础组件
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  // ── 状态徽章（胶囊；可点切换）──────────────────────────
  const TONE = {
    green: { bg: 'rgba(34,197,94,.14)', fg: '#4ade80', dot: '#22c55e' },
    red: { bg: 'rgba(239,68,68,.14)', fg: '#f87171', dot: '#ef4444' },
    amber: { bg: 'rgba(245,158,11,.14)', fg: '#fbbf24', dot: '#f59e0b' },
    cyan: { bg: 'rgba(6,182,212,.14)', fg: '#22d3ee', dot: '#06b6d4' },
    blue: { bg: 'rgba(59,130,246,.14)', fg: '#60a5fa', dot: '#3b82f6' },
    gray: { bg: 'rgba(148,163,184,.12)', fg: '#94a3b8', dot: '#64748b' },
  };
  function Badge({ tone = 'gray', children, dot = true, clickable, onClick }) {
    const t = TONE[tone] || TONE.gray;
    return React.createElement('button', {
      type: 'button',
      onClick: clickable ? onClick : undefined,
      className: 'jdo-badge' + (clickable ? ' clickable' : ''),
      style: {
        background: t.bg, color: t.fg,
        cursor: clickable ? 'pointer' : 'default',
      },
    },
      dot && React.createElement('span', { className: 'jdo-badge-dot', style: { background: t.dot } }),
      children,
    );
  }

  // ── 商品/分类缩略图 ─────────────────────────────────
  function Thumb({ icon, size = 40, radius = 9 }) {
    const bg = (window.JDO.PROD_ART || {})[icon] || 'linear-gradient(135deg,#334155,#1e293b)';
    return React.createElement('div', {
      style: {
        width: size, height: size, borderRadius: radius, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)',
      },
    }, React.createElement(Icon, { name: icon, size: size * 0.5, stroke: 2, style: { color: 'rgba(255,255,255,.92)' } }));
  }

  // ── 表单控件 ───────────────────────────────────────
  function Field({ label, hint, children, required }) {
    return React.createElement('label', { className: 'jdo-field' },
      React.createElement('span', { className: 'jdo-field-label' },
        label, required && React.createElement('span', { style: { color: 'var(--err)' } }, ' *')),
      children,
      hint && React.createElement('span', { className: 'jdo-field-hint' }, hint),
    );
  }
  function TextInput(props) {
    return React.createElement('input', { className: 'jdo-input', ...props });
  }
  function Textarea(props) {
    return React.createElement('textarea', { className: 'jdo-input', rows: 3, ...props });
  }
  function MoneyInput({ value, onChange, unit = '元', ...rest }) {
    return React.createElement('div', { className: 'jdo-money' },
      React.createElement('span', { className: 'jdo-money-sym' }, '¥'),
      React.createElement('input', {
        className: 'jdo-input', type: 'number', value, inputMode: 'decimal',
        onChange: (e) => onChange && onChange(e.target.value), ...rest,
      }),
      React.createElement('span', { className: 'jdo-money-unit' }, unit),
    );
  }
  function Select({ value, onChange, options }) {
    return React.createElement('div', { className: 'jdo-select-wrap' },
      React.createElement('select', {
        className: 'jdo-input jdo-select', value,
        onChange: (e) => onChange && onChange(e.target.value),
      }, options.map((o) =>
        React.createElement('option', { key: o.value, value: o.value }, o.label))),
      React.createElement(Icon, { name: 'chevD', size: 14, className: 'jdo-select-caret' }),
    );
  }
  function Switch({ checked, onChange, label }) {
    return React.createElement('button', {
      type: 'button', role: 'switch', 'aria-checked': checked,
      onClick: () => onChange && onChange(!checked),
      className: 'jdo-switch' + (checked ? ' on' : ''),
    },
      React.createElement('span', { className: 'jdo-switch-knob' }),
      label && React.createElement('span', { className: 'jdo-switch-label' }, label),
    );
  }

  // ── 图片字段（上传 + 预览 + URL）────────────────────
  function ImageField({ value, icon, onPickIcon }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(value || null);
    const onFile = (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) setPreview(URL.createObjectURL(f));
    };
    return React.createElement('div', { className: 'jdo-imgfield' },
      React.createElement('div', { className: 'jdo-imgfield-preview' },
        preview
          ? React.createElement('img', { src: preview, alt: '' })
          : React.createElement(Thumb, { icon: icon || 'box', size: 88, radius: 10 }),
      ),
      React.createElement('div', { className: 'jdo-imgfield-ctrl' },
        React.createElement('input', { ref: inputRef, type: 'file', accept: 'image/*', hidden: true, onChange: onFile }),
        React.createElement('button', {
          type: 'button', className: 'jdo-btn ghost sm',
          onClick: () => inputRef.current && inputRef.current.click(),
        }, React.createElement(Icon, { name: 'upload', size: 14 }), '上传图片'),
        React.createElement('input', {
          className: 'jdo-input', placeholder: '或填写图片 URL',
          defaultValue: '', onChange: (e) => e.target.value && setPreview(e.target.value),
        }),
      ),
    );
  }

  // ── 右侧抽屉 ───────────────────────────────────────
  function Drawer({ open, title, sub, onClose, footer, children, width = 420 }) {
    useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape' && open) onClose && onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    return React.createElement('div', { className: 'jdo-drawer-root' + (open ? ' open' : ''), 'aria-hidden': !open },
      React.createElement('div', { className: 'jdo-drawer-scrim', onClick: onClose }),
      React.createElement('aside', { className: 'jdo-drawer', style: { width } },
        React.createElement('header', { className: 'jdo-drawer-head' },
          React.createElement('div', null,
            React.createElement('div', { className: 'jdo-drawer-title' }, title),
            sub && React.createElement('div', { className: 'jdo-drawer-sub' }, sub)),
          React.createElement('button', { className: 'jdo-iconbtn', onClick: onClose },
            React.createElement(Icon, { name: 'close', size: 18 }))),
        React.createElement('div', { className: 'jdo-drawer-body' }, children),
        footer && React.createElement('footer', { className: 'jdo-drawer-foot' }, footer),
      ),
    );
  }

  // ── 空 / 加载态 ────────────────────────────────────
  function Empty({ text = '暂无数据' }) {
    return React.createElement('div', { className: 'jdo-empty' },
      React.createElement(Icon, { name: 'box', size: 30, style: { opacity: .4 } }),
      React.createElement('span', null, text));
  }
  function SkeletonRows({ cols = 6, rows = 5 }) {
    return Array.from({ length: rows }).map((_, r) =>
      React.createElement('tr', { key: r, className: 'jdo-skel-row' },
        Array.from({ length: cols }).map((_, c) =>
          React.createElement('td', { key: c }, React.createElement('span', { className: 'jdo-skel' })))));
  }

  // ── 按钮 ───────────────────────────────────────────
  function Btn({ variant = 'ghost', size, icon, children, ...rest }) {
    return React.createElement('button', {
      className: ['jdo-btn', variant, size].filter(Boolean).join(' '), ...rest,
    },
      icon && React.createElement(Icon, { name: icon, size: size === 'sm' ? 14 : 16 }),
      children);
  }

  Object.assign(window, {
    Badge, Thumb, Field, TextInput, Textarea, MoneyInput, Select, Switch,
    ImageField, Drawer, Empty, SkeletonRows, Btn, TONE,
  });
})();
