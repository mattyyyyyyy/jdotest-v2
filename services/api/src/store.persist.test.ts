import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { store } from './store.js';

// 持久化（ADR-0014）：设 STORE_PERSIST_PATH(.db) → SQLite 实库落盘 + 重启加载，数据不丢。
// 每个用例用独立 .db 路径（store 内部缓存连接，复用/删除同名文件会悬挂）。
let n = 0;
function freshDbPath(): string {
  n += 1;
  return path.join(os.tmpdir(), `jdo-store-${process.pid}-${n}.db`);
}
const created: string[] = [];
function use(p: string): void {
  process.env.STORE_PERSIST_PATH = p;
  created.push(p);
}
afterAll(() => {
  delete process.env.STORE_PERSIST_PATH;
  for (const p of created) {
    for (const f of [p, p + '-wal', p + '-shm']) if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

describe('store 持久化 · SQLite 实库（better-sqlite3, ADR-0014）', () => {
  it('首次 reset → 建库并落盘种子（文件创建 + 商品行入库）', () => {
    use(freshDbPath());
    store.reset();
    expect(fs.existsSync(process.env.STORE_PERSIST_PATH!)).toBe(true);
    expect(store.list('products').length).toBeGreaterThan(50);
  });

  it('变更后重启（reset 触发重载）→ 新数据存活', () => {
    use(freshDbPath());
    store.reset();
    const created = store.create('products', { title: '持久化测试品', cat: 'gear', price: 1000, onShelf: true });
    const id = created.id;
    store.reset(); // 模拟重启：先重新种子，再从 SQLite 覆盖（含新品）
    expect(store.get('products', id)?.title).toBe('持久化测试品');
  });

  it('购物车/地址/收藏变更也持久化', () => {
    use(freshDbPath());
    store.reset();
    store.cartAdd('g1', 2, '测试规格');
    store.addressAdd('u-1001', { receiver: '测试', phone: '13900000000', addr: '测试地址' });
    store.favoriteAdd('u-1001', 'e1');
    store.reset(); // 重启
    expect(store.cartView().some((c) => c.spec === '测试规格')).toBe(true);
    expect(store.addressesByUser('u-1001').some((a) => a.receiver === '测试')).toBe(true);
    expect(store.favoritesByUser('u-1001').some((f) => f.productId === 'e1')).toBe(true);
  });

  it('库文件损坏 → 回退种子，不崩（启动韧性）', () => {
    const p = freshDbPath();
    fs.writeFileSync(p, '这不是合法 SQLite 文件');
    use(p);
    store.reset(); // 打开/读取失败 → 回退种子
    expect(store.list('products').length).toBeGreaterThan(50);
  });
});
