import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App, fmt } from './App';

// 把 API 层 mock 掉：测组件行为，不打真实后端（单测不依赖网络/后端在不在）。
vi.mock('./api', () => {
  return {
    setToken: vi.fn(),
    api: {
      login: vi.fn(),
      resources: vi.fn(),
      list: vi.fn(),
    },
  };
});
import { api, setToken } from './api';

describe('fmt · 单元格类型化格式（分→元/布尔/列表）', () => {
  it('fen：分转元保留两位', () => {
    expect(fmt('fen', 1999)).toBe('¥19.99');
    expect(fmt('fen', 0)).toBe('¥0.00');
  });
  it('bool：真→✅ 假→—', () => {
    expect(fmt('bool', true)).toBe('✅');
    expect(fmt('bool', false)).toBe('—');
  });
  it('list：数组用 / 连接', () => {
    expect(fmt('list', ['A', 'B'])).toBe('A / B');
  });
  it('default：原样转字符串', () => {
    expect(fmt('text', '玻璃水')).toBe('玻璃水');
  });
  it('null/undefined：渲染占位破折号（不崩）', () => {
    const { container } = render(<>{fmt('text', null)}</>);
    expect(container.textContent).toBe('—');
  });
});

describe('App · 登录 → 控制台流程', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初始渲染登录页（标题 + 登录按钮）', () => {
    render(<App />);
    expect(screen.getByText('JDO 后台管理')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('登录成功 → 进入控制台，显示角色 + 资源导航 + 数据行', async () => {
    vi.mocked(api.login).mockResolvedValue({
      accessToken: 'tok-1',
      admin: { id: 'a1', account: 'admin', role: 'admin' },
      permissions: [],
    });
    vi.mocked(api.resources).mockResolvedValue({
      items: [{ key: 'products', label: '商品', columns: [{ k: 'title', label: '名称', type: 'text' }], fields: [] }],
    });
    vi.mocked(api.list).mockResolvedValue({ items: [{ id: 'p1', title: '车载香薰' }] });

    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    // 登录调用 + token 写入
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('admin', 'admin123'));
    expect(setToken).toHaveBeenCalledWith('tok-1');

    // 控制台渲染：角色、资源 tab、后端返回的数据行
    expect(await screen.findByText('角色：admin')).toBeInTheDocument();
    expect(await screen.findByText('车载香薰')).toBeInTheDocument();
  });

  it('登录失败 → 显示错误信息，不进控制台', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('账号或密码错误'));
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: '登录' }));

    expect(await screen.findByText('账号或密码错误')).toBeInTheDocument();
    expect(screen.queryByText(/角色：/)).not.toBeInTheDocument();
  });
});
