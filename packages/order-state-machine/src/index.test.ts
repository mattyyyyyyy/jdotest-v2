import { describe, it, expect } from 'vitest';
import {
  transition,
  applyTransition,
  InvalidTransitionError,
  isTerminal,
  allowedEvents,
  ORDER_STATES,
  type OrderState,
  type OrderEvent,
} from './index.js';

describe('transition · 合法路径（feature-spec §四）', () => {
  const legal: Array<[OrderState, OrderEvent, OrderState]> = [
    ['DRAFT', 'submit', 'PENDING_PAYMENT'],
    ['DRAFT', 'cancel', 'CANCELED'],
    ['PENDING_PAYMENT', 'paid', 'PAID'],
    ['PENDING_PAYMENT', 'cancel', 'CANCELED'],
    ['PENDING_PAYMENT', 'expire', 'EXPIRED'],
    ['PAID', 'prepared', 'SHIPPING'],
    ['SHIPPING', 'delivered', 'COMPLETED'],
    ['COMPLETED', 'refundReq', 'REFUNDING'],
    ['REFUNDING', 'refunded', 'REFUNDED'],
  ];

  it.each(legal)('%s --%s--> %s', (from, event, to) => {
    const r = transition(from, event);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state).toBe(to);
  });
});

describe('transition · 非法路径返回 InvalidTransition', () => {
  it('DRAFT --paid--> 非法（越过支付提交）', () => {
    const r = transition('DRAFT', 'paid');
    expect(r).toEqual({ ok: false, reason: 'InvalidTransition', from: 'DRAFT', event: 'paid' });
  });

  it('DRAFT --deliver 越级--> 非法', () => {
    const r = transition('DRAFT', 'delivered');
    expect(r.ok).toBe(false);
  });

  it('PAID --cancel--> 非法（已支付不能直接取消，须走退款）', () => {
    expect(transition('PAID', 'cancel').ok).toBe(false);
  });
});

describe('终态没有任何出边', () => {
  const terminals: OrderState[] = ['CANCELED', 'EXPIRED', 'REFUNDED'];
  it.each(terminals)('%s 是终态', (s) => {
    expect(isTerminal(s)).toBe(true);
    expect(allowedEvents(s)).toHaveLength(0);
  });

  it('非终态有出边', () => {
    expect(isTerminal('DRAFT')).toBe(false);
    expect(allowedEvents('PENDING_PAYMENT').sort()).toEqual(['cancel', 'expire', 'paid']);
  });
});

describe('完整 happy path：下单 → 支付 → 履约 → 完成 → 退款', () => {
  it('一路走到 REFUNDED', () => {
    let s: OrderState = 'DRAFT';
    for (const e of ['submit', 'paid', 'prepared', 'delivered', 'refundReq', 'refunded'] as OrderEvent[]) {
      s = applyTransition(s, e);
    }
    expect(s).toBe('REFUNDED');
    expect(isTerminal(s)).toBe(true);
  });
});

describe('applyTransition 抛错版', () => {
  it('合法转换返回新态', () => {
    expect(applyTransition('DRAFT', 'submit')).toBe('PENDING_PAYMENT');
  });
  it('非法转换抛 InvalidTransitionError', () => {
    expect(() => applyTransition('DRAFT', 'delivered')).toThrow(InvalidTransitionError);
  });
});

describe('不变量：所有 transition 目标都是合法状态', () => {
  it('转换表不产生未知状态', () => {
    const events: OrderEvent[] = ['submit', 'paid', 'prepared', 'delivered', 'refundReq', 'refunded', 'cancel', 'expire'];
    for (const from of ORDER_STATES) {
      for (const ev of events) {
        const r = transition(from, ev);
        if (r.ok) expect(ORDER_STATES).toContain(r.state);
      }
    }
  });
});
