import { useEffect, useState } from 'react';
import { api, setToken, type ResourceDef } from './api';

/** 格式化单元格：分→元、布尔、图、列表。对齐内嵌 SPA 的类型化展示（data-dictionary）。 */
export function fmt(type: string, v: unknown): React.ReactNode {
  if (v == null) return <span className="muted">—</span>;
  switch (type) {
    case 'image':
      return <img src={String(v)} alt="" />;
    case 'fen':
      return `¥${(Number(v) / 100).toFixed(2)}`;
    case 'bool':
      return v ? '✅' : '—';
    case 'list':
      return Array.isArray(v) ? v.join(' / ') : String(v);
    default:
      return String(v);
  }
}

function Login({ onOk }: { onOk: (role: string) => void }) {
  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const submit = async (): Promise<void> => {
    setErr('');
    try {
      const r = await api.login(account, password);
      setToken(r.accessToken);
      onOk(r.admin.role);
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  return (
    <div className="login">
      <h1>JDO 后台管理</h1>
      <p>独立前端（ADR-0010）· 复用 /api/v1/admin/*</p>
      <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="账号" />
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="密码" />
      <button className="btn" onClick={submit}>登录</button>
      {err && <div className="err">{err}</div>}
      <p className="muted" style={{ marginTop: 16 }}>Demo：admin/admin123 · ops01/ops123 · cs01/cs123</p>
    </div>
  );
}

function Console({ role }: { role: string }) {
  const [resources, setResources] = useState<ResourceDef[]>([]);
  const [active, setActive] = useState<string>('');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.resources().then((r) => {
      setResources(r.items);
      if (r.items[0]) setActive(r.items[0].key);
    }).catch((e) => setErr((e as Error).message));
  }, []);

  useEffect(() => {
    if (!active) return;
    setErr('');
    api.list(active).then((r) => setRows(r.items)).catch((e) => setErr((e as Error).message));
  }, [active]);

  const def = resources.find((r) => r.key === active);
  return (
    <div className="shell">
      <nav className="side">
        <h1>JDO Admin</h1>
        {resources.map((r) => (
          <button key={r.key} className={r.key === active ? 'active' : ''} onClick={() => setActive(r.key)}>
            {r.label}
          </button>
        ))}
      </nav>
      <main className="main">
        <div className="topbar">
          <strong>{def?.label ?? '加载中…'}</strong>
          <span className="muted">· {rows.length} 条</span>
          <span className="role">角色：{role}</span>
        </div>
        {err && <div className="err">{err}</div>}
        {def && (
          <table>
            <thead>
              <tr>{def.columns.map((c) => <th key={c.k}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={(row.id as string) ?? i}>
                  {def.columns.map((c) => <td key={c.k}>{fmt(c.type, row[c.k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export function App() {
  const [role, setRole] = useState<string | null>(null);
  return role ? <Console role={role} /> : <Login onOk={setRole} />;
}
