// 后台 API 封装：复用 services/api 的 /api/v1/admin/*（与内嵌 SPA 同一后端）。
const BASE = '/api/v1';

let token: string | null = null;
export function setToken(t: string | null): void {
  token = t;
}
export function getToken(): string | null {
  return token;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    throw new Error(err.message ?? err.code ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface ResourceDef {
  key: string;
  label: string;
  columns: Array<{ k: string; label: string; type: string }>;
  fields: Array<{ k: string; label: string; type: string }>;
}

export interface LoginResult {
  accessToken: string;
  admin: { id: string; account: string; role: string };
  permissions: string[];
}

export const api = {
  login: (account: string, password: string) =>
    req<LoginResult>('POST', '/admin/auth/login', { account, password }),
  resources: () => req<{ items: ResourceDef[] }>('GET', '/admin/resources'),
  list: (resource: string) => req<{ items: Array<Record<string, unknown>> }>('GET', `/admin/${resource}`),
};
