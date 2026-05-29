/**
 * 订单状态机 · 单一真相
 *
 * 对应 spec：openspec/specs/order/spec.md（Requirement: 订单状态机）
 * 图示：docs/feature-spec.md §四 订单状态机汇总
 *
 * 设计：纯函数 transition(state, event) → Result。
 * 前后端共用同一份；禁止前端直接 set 状态（spec MUST NOT）。
 */

export const ORDER_STATES = [
  'DRAFT',
  'PENDING_PAYMENT',
  'PAID',
  'SHIPPING',
  'COMPLETED',
  'CANCELED',
  'EXPIRED',
  'REFUNDING',
  'REFUNDED',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export const ORDER_EVENTS = [
  'submit',
  'paid',
  'prepared',
  'delivered',
  'refundReq',
  'refunded',
  'cancel',
  'expire',
] as const;

export type OrderEvent = (typeof ORDER_EVENTS)[number];

/**
 * 合法转换表。来源于 feature-spec §四：
 *   DRAFT --submit--> PENDING_PAYMENT --paid--> PAID --prepared--> SHIPPING
 *     --delivered--> COMPLETED --refundReq--> REFUNDING --refunded--> REFUNDED
 *   DRAFT/PENDING_PAYMENT --cancel--> CANCELED
 *   PENDING_PAYMENT --expire--> EXPIRED
 */
const TRANSITIONS: Record<OrderState, Partial<Record<OrderEvent, OrderState>>> = {
  DRAFT: { submit: 'PENDING_PAYMENT', cancel: 'CANCELED' },
  PENDING_PAYMENT: { paid: 'PAID', cancel: 'CANCELED', expire: 'EXPIRED' },
  PAID: { prepared: 'SHIPPING' },
  SHIPPING: { delivered: 'COMPLETED' },
  COMPLETED: { refundReq: 'REFUNDING' },
  REFUNDING: { refunded: 'REFUNDED' },
  // 终态：无出边
  CANCELED: {},
  EXPIRED: {},
  REFUNDED: {},
};

export type TransitionResult =
  | { ok: true; state: OrderState }
  | { ok: false; reason: 'InvalidTransition'; from: OrderState; event: OrderEvent };

/** 纯函数：给定当前态 + 事件，返回新态或 InvalidTransition。 */
export function transition(state: OrderState, event: OrderEvent): TransitionResult {
  const next = TRANSITIONS[state][event];
  if (next === undefined) {
    return { ok: false, reason: 'InvalidTransition', from: state, event };
  }
  return { ok: true, state: next };
}

/** 抛错版，便于后端 service 层链式调用（非法转换抛 InvalidTransitionError）。 */
export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: OrderState,
    public readonly event: OrderEvent,
  ) {
    super(`Invalid order transition: ${from} --${event}-->`);
    this.name = 'InvalidTransitionError';
  }
}

export function applyTransition(state: OrderState, event: OrderEvent): OrderState {
  const r = transition(state, event);
  if (!r.ok) throw new InvalidTransitionError(state, event);
  return r.state;
}

/** 是否终态（无任何合法出边）。 */
export function isTerminal(state: OrderState): boolean {
  return Object.keys(TRANSITIONS[state]).length === 0;
}

/** 当前态下所有合法事件。 */
export function allowedEvents(state: OrderState): OrderEvent[] {
  return Object.keys(TRANSITIONS[state]) as OrderEvent[];
}
