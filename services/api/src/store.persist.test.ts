import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { store } from './store.js';

// 持久化（ADR-0014）：设 STORE_PERSIST_PATH 时，变更落盘 + 重启加载，数据不丢。
const TMP = path.join(os.tmpdir(), `jdo-store-persist-${process.pid}.json`);

beforeAll(() => {
  process.env.STORE_PERSIST_PATH = TMP;
});
afterEach(() => {
  if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
});
afterAll(() => {
  delete process.env.STORE_PERSIST_PATH; // 防止泄漏到其它测试文件
  if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
});

describe('store 持久化 · JSON 文件快照（ADR-0014）', () => {
  it('首次 reset → 落盘种子快照（文件被创建）', () => {
    store.reset();
    expect(fs.existsSync(TMP)).toBe(true);
    const snap = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(snap.resources.products.rows.length).toBeGreaterThan(50);
  });

  it('变更后重启（reset 触发重载）→ 新数据存活', () => {
    store.reset();
    const created = store.create('products', { title: '持久化测试品', cat: 'gear', price: 1000, onShelf: true });
    const id = created.id;
    // 模拟重启：reset() 先重新种子，再从磁盘快照覆盖（含刚写入的新品）
    store.reset();
    expect(store.get('products', id)).toBeDefined();
    expect(store.get('products', id)?.title).toBe('持久化测试品');
  });

  it('购物车/地址变更也持久化', () => {
    store.reset();
    store.cartAdd('g1', 2, '测试规格');
    store.addressAdd('u-1001', { receiver: '测试', phone: '13900000000', addr: '测试地址' });
    store.reset(); // 重启
    expect(store.cartView().some((c) => c.spec === '测试规格')).toBe(true);
    expect(store.addressesByUser('u-1001').some((a) => a.receiver === '测试')).toBe(true);
  });

  it('快照损坏 → 回退种子，不崩（启动韧性）', () => {
    fs.writeFileSync(TMP, '{ 这不是合法 JSON');
    store.reset(); // loadFromDisk 失败 → 回退种子
    expect(store.list('products').length).toBeGreaterThan(50); // 种子仍在
  });
});
