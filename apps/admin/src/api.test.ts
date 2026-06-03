import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, setToken, getToken } from './api';

// 测 api 封装层（路径、鉴权头、错误处理）——mock 全局 fetch，不打真实后端。
function mockFetch(status: number, json: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
    })),
  );
}

describe('api 封装层', () => {
  beforeEach(() => {
    setToken(null);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('setToken / getToken 往返', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
    setToken(null);
    expect(getToken()).toBeNull();
  });

  it('login：POST 到 /api/v1/admin/auth/login，带 body，返回 JSON', async () => {
    const result = { accessToken: 't', admin: { id: '1', account: 'admin', role: 'admin' }, permissions: [] };
    mockFetch(200, result);
    const r = await api.login('admin', 'admin123');
    expect(r).toEqual(result);
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe('/api/v1/admin/auth/login');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ account: 'admin', password: 'admin123' });
  });

  it('有 token 时请求带 Authorization 头；无 token 时不带', async () => {
    mockFetch(200, { items: [] });
    setToken('tok-9');
    await api.list('products');
    let headers = (vi.mocked(fetch).mock.calls[0]![1]?.headers ?? {}) as Record<string, string>;
    expect(headers.authorization).toBe('Bearer tok-9');

    vi.mocked(fetch).mockClear();
    setToken(null);
    await api.list('products');
    headers = (vi.mocked(fetch).mock.calls[0]![1]?.headers ?? {}) as Record<string, string>;
    expect(headers.authorization).toBeUndefined();
  });

  it('非 2xx：抛出后端 message', async () => {
    mockFetch(401, { code: 'UNAUTHENTICATED', message: '账号或密码错误' });
    await expect(api.login('x', 'y')).rejects.toThrow('账号或密码错误');
  });

  it('非 2xx 且无 message：回退 code，再回退 HTTP 状态', async () => {
    mockFetch(403, { code: 'FORBIDDEN' });
    await expect(api.resources()).rejects.toThrow('FORBIDDEN');
  });
});
