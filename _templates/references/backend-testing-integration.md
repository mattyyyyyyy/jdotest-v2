# 后台、测试与前后端联调

本参考用于补齐从 0 项目里最容易缺失的后台可运行性文本。调研依据包括 OpenAPI、MSW、Pact、Playwright、Testcontainers、Fastify、12-Factor、OWASP API Security 和 OpenTelemetry 的官方文档。

## 必须新增的文本

```text
docs/backend-spec.md
docs/api-contracts.md
docs/testing-strategy.md
docs/integration-plan.md
```

可选机器可读契约：

```text
packages/api-contracts/openapi.yaml
```

## docs/backend-spec.md

职责：定义后台服务的运行时、模块、数据、业务规则、任务和可观测性。

必须包含：

- Runtime：语言、框架、包管理、启动命令。
- Modules：auth、user、catalog、order、payment 等业务域。
- Data Model：实体、字段、关系、索引、迁移策略。
- Business Rules：金额、库存、权限、状态流转、幂等性。
- Background Jobs：触发条件、重试、幂等、死信处理。
- Local Dependencies：数据库、缓存、队列、对象存储、第三方 mock。
- Observability：日志、metrics、traces、traceId、错误上报。

后台实现建议把 app 构建和 server listen 分开。Fastify 官方测试指南强调将应用代码与 server 启动代码分离，便于用 HTTP injection 测路由。

## docs/api-contracts.md

职责：定义前后端边界，是联调的唯一真相。

必须包含：

- Source of truth：人读文档与机器读 OpenAPI 的关系。
- Base URLs：local/staging/prod。
- Error Format：统一错误码、message、details、traceId。
- Auth：认证方式、token/session 生命周期、dev mock login。
- Endpoints：method、path、request、response、errors、auth。
- Pagination：cursor/offset、limit。
- Versioning：`/api/v1`，破坏性变更进入 `/api/v2`。

复杂 API 优先用 OpenAPI。OpenAPI 描述可被工具用于文档、client 生成、server routing 和 API testing，因此适合作为契约先行的机器可读源。

## docs/testing-strategy.md

职责：定义怎么证明系统能工作。

推荐分层：

- Unit：纯函数、状态机、权限判断、金额计算。
- Backend route/service：路由、service、repository、错误格式、鉴权。
- Integration：真实数据库、缓存、队列；用 Docker Compose 或 Testcontainers。
- Contract：OpenAPI provider validation 或 Pact consumer/provider tests。
- Frontend integration：MSW mock 成功、错误、延迟、空状态。
- E2E：Playwright 跑主链路和关键异常路径。

不要只写“需要测试”，必须写命令：

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:contract
pnpm e2e
pnpm build
```

Testcontainers 适合将数据库、消息队列等依赖作为一次性容器在测试期间创建和销毁，减少手工环境配置和不真实 mock。

## docs/integration-plan.md

职责：定义前端如何从 mock 走到真实后端。

推荐阶段：

1. Phase A: Frontend with Mock API
   - 前端用 MSW 或本地 mock server。
   - mock 数据必须按 `docs/api-contracts.md` 或 OpenAPI。
   - 覆盖 success、empty、error、slow network、auth expired。

2. Phase B: Backend API Ready
   - 后端实现契约中的接口。
   - 前端用环境变量从 mock 切到真实 API。
   - Vite/Next dev server 通过 proxy 转发 `/api`。

3. Phase C: Contract Lock
   - OpenAPI 校验请求/响应。
   - 前端 client 从 OpenAPI 生成。
   - Pact 用于多个消费者或服务间调用。

4. Phase D: E2E
   - 起数据库和后端。
   - seed 固定数据。
   - 启动前端。
   - Playwright 验证主链路。

## 推荐本地拓扑

```text
browser
  -> frontend dev server http://localhost:5173
  -> /api proxy
  -> backend http://localhost:3000
  -> database/cache/queue
```

## 安全和可观测性

API 开工文档必须覆盖：

- Broken Object Level Authorization：对象级授权，不允许只靠前端隐藏按钮。
- Broken Authentication：认证失败、token 过期、刷新、退出登录。
- Rate limiting：登录、支付、搜索、写操作。
- Input validation：请求体和 query schema。
- Mass assignment：后端白名单写入字段。
- Logging and monitoring：错误日志、traceId、关键业务事件。

OpenTelemetry 官方将 observability 数据分为 traces、metrics、logs，后台 spec 至少要说明这三类的最小采集策略。

## CI Gate

最小 CI：

```text
install
lint
typecheck
unit tests
backend route/service tests
integration tests
build
```

发布前 gate：

```text
contract verification
e2e
security checks
migration dry run
```

## 从文本推导目录

```text
services/
  api/
    src/
      modules/
      config/
      db/
      observability/
    tests/
packages/
  api-contracts/
    openapi.yaml
  shared-types/
tools/
  seed/
  mock-server/
  e2e/
infra/
  docker-compose.yml
```

如果项目还很小，可以暂时不拆 `packages/api-contracts`，但必须先有 `docs/api-contracts.md`，避免前后端靠猜。

---

## 完整示例代码片段

### Fastify 模块结构（app / server 分离）

```ts
// services/api/src/app.ts —— 纯 app 构建，不监听端口
import Fastify from 'fastify';
import { catalogRoutes } from './modules/catalog/routes';
import { cartRoutes } from './modules/cart/routes';
import { errorHandler } from './gateway/error-handler';

export function buildApp(opts: AppOpts) {
  const app = Fastify({ logger: opts.logger });
  app.setErrorHandler(errorHandler);
  app.register(catalogRoutes, { prefix: '/api/v1' });
  app.register(cartRoutes, { prefix: '/api/v1' });
  return app;
}

// services/api/src/server.ts —— 实际启服务，仅在生产 / 本地 dev 用
import { buildApp } from './app';
const app = buildApp({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });
app.listen({ port: Number(process.env.API_PORT) || 3000, host: '0.0.0.0' });
```

测试可以 `import { buildApp }` + `app.inject()`，不用真正监听端口：

```ts
// services/api/src/modules/cart/cart.route.test.ts
import { describe, it, expect } from 'vitest';
import { buildApp } from '../../app';
import { signTestToken } from '../../test-helpers';

describe('POST /api/v1/cart/items', () => {
  const app = buildApp({ logger: false });
  const token = signTestToken({ userId: 'user-test-1' });

  it('happy path: 加购成功', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { authorization: `Bearer ${token}` },
      payload: { skuId: 'sku-1', qty: 2, idempotencyKey: 'k1' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.items).toHaveLength(1);
  });

  it('CART_QTY_INVALID: qty 越界', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { authorization: `Bearer ${token}` },
      payload: { skuId: 'sku-1', qty: 100, idempotencyKey: 'k2' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('CART_QTY_INVALID');
  });

  it('AUTH_REQUIRED: 无 token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      payload: { skuId: 'sku-1', qty: 1, idempotencyKey: 'k3' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().code).toBe('AUTH_REQUIRED');
  });
});
```

### zod schema 注入 Fastify route

```ts
// services/api/src/modules/cart/cart.schema.ts
import { z } from 'zod';

export const AddCartItemBody = z.object({
  skuId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
  idempotencyKey: z.string().min(1).max(64),
});

export const CartItemResponse = z.object({
  data: z.object({
    items: z.array(z.object({
      id: z.string(),
      skuId: z.string(),
      qty: z.number(),
      priceCents: z.number(),
    })),
    totalCents: z.number(),
  }),
  traceId: z.string(),
});

// cart.route.ts
import { AddCartItemBody, CartItemResponse } from './cart.schema';

app.post('/cart/items', {
  schema: {
    body: AddCartItemBody,
    response: { 200: CartItemResponse },
  },
  preHandler: requireAuth,
  handler: async (req, reply) => {
    const result = await cartService.addItem(req.user.id, req.body);
    return reply.send({ data: result, traceId: req.traceId });
  },
});
```

校验失败统一在 `errorHandler` 转成 `VALIDATION_FAILED` 响应。

### OpenAPI 片段（packages/api-contracts/openapi.yaml）

```yaml
openapi: 3.1.0
info:
  title: JDO API
  version: 1.0.0
servers:
  - url: http://localhost:3000/api/v1
    description: local
paths:
  /cart/items:
    post:
      operationId: addCartItem
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AddCartItemBody'
      responses:
        '200':
          description: 加购成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CartResponse'
        '400':
          description: 参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                qtyInvalid:
                  value:
                    code: CART_QTY_INVALID
                    message: 数量必须在 1-99 之间
                    details: { qty: 100 }
                    traceId: 01J...
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  schemas:
    AddCartItemBody:
      type: object
      required: [skuId, qty, idempotencyKey]
      properties:
        skuId: { type: string, format: uuid }
        qty: { type: integer, minimum: 1, maximum: 99 }
        idempotencyKey: { type: string, maxLength: 64 }
    CartResponse:
      type: object
      properties:
        data:
          type: object
          properties:
            items:
              type: array
              items: { $ref: '#/components/schemas/CartItem' }
            totalCents: { type: integer }
        traceId: { type: string }
    CartItem:
      type: object
      properties:
        id: { type: string }
        skuId: { type: string }
        qty: { type: integer }
        priceCents: { type: integer }
    Error:
      type: object
      required: [code, message, traceId]
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: object }
        traceId: { type: string }
```

### MSW handler 示例（前端 mock）

```ts
// tools/mock-server/handlers/cart.ts
import { http, HttpResponse, delay } from 'msw';

let cartState = { items: [], totalCents: 0 };

export const cartHandlers = [
  http.get('/api/v1/cart', async () => {
    await delay(150); // 模拟网络
    return HttpResponse.json({ data: cartState, traceId: 'mock-trace' });
  }),

  http.post('/api/v1/cart/items', async ({ request }) => {
    const body = await request.json();
    if (body.qty > 99) {
      return HttpResponse.json(
        { code: 'CART_QTY_INVALID', message: '数量必须在 1-99 之间', details: { qty: body.qty }, traceId: 'mock-trace' },
        { status: 400 },
      );
    }
    cartState.items.push({ id: crypto.randomUUID(), skuId: body.skuId, qty: body.qty, priceCents: 9900 });
    cartState.totalCents = cartState.items.reduce((s, i) => s + i.qty * i.priceCents, 0);
    await delay(200);
    return HttpResponse.json({ data: cartState, traceId: 'mock-trace' });
  }),

  // tweaks panel 可触发的"慢网" / "错误" 场景
  http.get('/api/v1/cart/__slow', async () => {
    await delay(3000);
    return HttpResponse.json({ data: cartState, traceId: 'mock-trace' });
  }),
];
```

启用：`apps/h5/src/main.tsx` 中根据 `VITE_USE_MOCK_API` 启动 worker。

### Testcontainers Integration Test（真实 Postgres + Redis）

```ts
// services/api/test/integration/cart.spec.ts
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer } from 'testcontainers';
import { buildApp } from '../../src/app';
import { Pool } from 'pg';

describe('cart integration', () => {
  let app, pgContainer, redisContainer, pool;

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:16-alpine').start();
    redisContainer = await new GenericContainer('redis:7-alpine').withExposedPorts(6379).start();

    process.env.DATABASE_URL = pgContainer.getConnectionUri();
    process.env.REDIS_URL = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(/* migration SQL */);
    await pool.query(`INSERT INTO skus (id, ...) VALUES ('sku-1', ...)`);

    app = buildApp({ logger: false });
  }, 60_000);

  afterAll(async () => {
    await app.close();
    await pool.end();
    await pgContainer.stop();
    await redisContainer.stop();
  });

  it('加购后 Redis 立即可读，Postgres 写入审计', async () => {
    const token = signTestToken({ userId: 'user-1' });
    await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { authorization: `Bearer ${token}` },
      payload: { skuId: 'sku-1', qty: 1, idempotencyKey: 'k1' },
    });

    const cartRes = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(cartRes.json().data.items).toHaveLength(1);

    const audit = await pool.query(`SELECT * FROM cart_audit WHERE user_id = 'user-1'`);
    expect(audit.rows).toHaveLength(1);
    expect(audit.rows[0].action).toBe('add');
  });
});
```

### Playwright e2e（主链路）

```ts
// tools/e2e/specs/happy-path.spec.ts
import { test, expect } from '@playwright/test';

test('完整购物链路：首页 → 商品 → 加购 → 结算 → 支付 → 订单', async ({ page }) => {
  await page.goto('http://localhost:5173/?speed=0'); // 强制停车态

  // 1. 首页 → 点商品
  await page.getByTestId('product-card-0').click();

  // 2. 商品详情 → 选规格 → 加购
  await page.getByText('500ml').click();
  await page.getByRole('button', { name: '加入购物车' }).click();
  await expect(page.getByTestId('toast')).toContainText('已加入购物车');

  // 3. 跳购物车
  await page.getByTestId('cart-badge').click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByTestId('cart-item')).toHaveCount(1);

  // 4. 去结算
  await page.getByRole('button', { name: '去结算' }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // 5. 选默认地址 + 支付
  await page.getByText('家').click();
  await page.getByText('微信支付').click();
  await page.getByRole('button', { name: '提交订单' }).click();

  // 6. 支付页 → mock 扫码
  await expect(page).toHaveURL(/\/pay\//);
  await page.getByTestId('mock-scan-success').click(); // demo 工具

  // 7. 跳订单详情
  await expect(page).toHaveURL(/\/orders\//);
  await expect(page.getByText('已支付 · 待发货')).toBeVisible();
});
```

```ts
// tools/e2e/specs/driving-state.spec.ts
test('行车态下 3 步完成再买一次', async ({ page }) => {
  await page.goto('http://localhost:5173/?speed=30'); // 行车态
  await expect(page).toHaveURL(/\/driving/);

  // step 1: 点"再买一次"
  await page.getByTestId('quick-buy-0').click();

  // step 2: 确认（默认地址 + 默认支付）
  await page.getByRole('button', { name: '确认下单' }).click();

  // step 3: mock 扫码
  await page.getByTestId('mock-scan-success').click();

  await expect(page.getByText('下单成功')).toBeVisible();

  // 断言：全程无键盘事件
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('INPUT');
});
```

### Docker Compose（本地依赖）

```yaml
# infra/docker-compose.yml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: jdo
      POSTGRES_PASSWORD: jdo
      POSTGRES_DB: jdo_dev
    ports: ['5432:5432']
    volumes: ['./pg-data:/var/lib/postgresql/data']
    healthcheck:
      test: ['CMD', 'pg_isready', '-U', 'jdo']
      interval: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports: ['6379:6379']
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      retries: 5

  payment-mock:
    build: ../tools/payment-mock
    ports: ['4001:4001']
    depends_on: [cache]
```

启动：`docker compose up -d`，停止：`docker compose down`。

### CI GitHub Actions（最小骨架）

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: jdo
          POSTGRES_PASSWORD: jdo
          POSTGRES_DB: jdo_test
        ports: ['5432:5432']
        options: --health-cmd "pg_isready -U jdo"
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile

      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://jdo:jdo@localhost:5432/jdo_test
          REDIS_URL: redis://localhost:6379
      - run: pnpm test:contract
      - run: pnpm test:a11y
      - run: pnpm build
      - run: pnpm size-check

  e2e:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... 起完整本地栈 + 跑 Playwright
      - run: pnpm e2e
```

### 错误格式统一处理（errorHandler）

```ts
// services/api/src/gateway/error-handler.ts
import { ZodError } from 'zod';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(public code: string, public statusCode: number, public details?: object) {
    super(code);
  }
}

export function errorHandler(err: FastifyError | AppError, req: FastifyRequest, reply: FastifyReply) {
  const traceId = req.headers['x-trace-id'] ?? req.id;

  if (err instanceof ZodError) {
    return reply.status(400).send({
      code: 'VALIDATION_FAILED',
      message: '请求参数不合法',
      details: { issues: err.issues },
      traceId,
    });
  }

  if (err instanceof AppError) {
    return reply.status(err.statusCode).send({
      code: err.code,
      message: err.message,
      details: err.details,
      traceId,
    });
  }

  req.log.error({ err, traceId }, '未捕获错误');
  return reply.status(500).send({
    code: 'INTERNAL_ERROR',
    message: '服务器内部错误',
    traceId,
  });
}
```

所有 service 抛 `AppError`：

```ts
// services/api/src/modules/cart/cart.service.ts
import { AppError } from '../../gateway/error-handler';

export async function addItem(userId: string, { skuId, qty }: AddItemInput) {
  const sku = await skuRepo.findById(skuId);
  if (!sku) throw new AppError('SKU_NOT_FOUND', 404, { skuId });
  if (sku.stock < qty) throw new AppError('SKU_OUT_OF_STOCK', 409, { skuId, stock: sku.stock });
  // ...
}
```

### 鉴权中间件 + BOLA 防护

```ts
// services/api/src/gateway/require-auth.ts
import jwt from 'jsonwebtoken';
import type { preHandlerHookHandler } from 'fastify';
import { AppError } from './error-handler';

export const requireAuth: preHandlerHookHandler = async (req) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('AUTH_REQUIRED', 401);
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { userId: string };
    req.user = { id: payload.userId };
  } catch {
    throw new AppError('AUTH_INVALID_TOKEN', 401);
  }
};

// 资源级授权
export function requireOwnership<T extends { userId: string }>(getResource: (req) => Promise<T>): preHandlerHookHandler {
  return async (req) => {
    const resource = await getResource(req);
    if (resource.userId !== req.user.id) throw new AppError('AUTH_FORBIDDEN', 403);
  };
}

// 使用：
app.get('/orders/:id', {
  preHandler: [requireAuth, requireOwnership((req) => orderService.findById(req.params.id))],
  handler: getOrderHandler,
});
```

### 限流（Redis-backed token bucket）

```ts
// services/api/src/gateway/rate-limit.ts
import type { preHandlerHookHandler } from 'fastify';
import { redis } from '../db/redis';
import { AppError } from './error-handler';

export function rateLimit(opts: { key: (req) => string; limit: number; windowSec: number }): preHandlerHookHandler {
  return async (req) => {
    const k = `rl:${opts.key(req)}`;
    const count = await redis.incr(k);
    if (count === 1) await redis.expire(k, opts.windowSec);
    if (count > opts.limit) throw new AppError('RATE_LIMITED', 429, { retryAfter: opts.windowSec });
  };
}

// 使用：
app.post('/auth/login', {
  preHandler: rateLimit({ key: (r) => `login:${r.ip}`, limit: 5, windowSec: 60 }),
  handler: loginHandler,
});

app.post('/payments', {
  preHandler: [requireAuth, rateLimit({ key: (r) => `pay:${r.user.id}`, limit: 3, windowSec: 60 })],
  handler: payHandler,
});
```

### 状态机包（独立 package，可测试）

```ts
// packages/order-state-machine/src/index.ts
export type OrderState = 'CREATED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDING' | 'REFUNDED';
export type OrderEvent = 'pay' | 'ship' | 'deliver' | 'cancel' | 'timeout' | 'refund_request' | 'refund_approve' | 'refund_reject';

const transitions: Record<OrderState, Partial<Record<OrderEvent, OrderState>>> = {
  CREATED: { pay: 'PAID', cancel: 'CANCELED', timeout: 'CANCELED' },
  PAID: { ship: 'SHIPPED', refund_request: 'REFUNDING' },
  SHIPPED: { deliver: 'DELIVERED' },
  DELIVERED: {},
  CANCELED: {},
  REFUNDING: { refund_approve: 'REFUNDED', refund_reject: 'PAID' },
  REFUNDED: {},
};

export class InvalidTransition extends Error {
  constructor(public from: OrderState, public event: OrderEvent) {
    super(`Cannot transition from ${from} via ${event}`);
  }
}

export function transition(state: OrderState, event: OrderEvent): OrderState {
  const next = transitions[state]?.[event];
  if (!next) throw new InvalidTransition(state, event);
  return next;
}
```

测试：

```ts
// packages/order-state-machine/src/index.test.ts
import { describe, it, expect } from 'vitest';
import { transition, InvalidTransition } from './index';

describe('order state machine', () => {
  it('CREATED → pay → PAID', () => {
    expect(transition('CREATED', 'pay')).toBe('PAID');
  });

  it('DELIVERED → any → throws', () => {
    expect(() => transition('DELIVERED', 'pay')).toThrow(InvalidTransition);
  });

  // ... 覆盖所有 7 状态 × 8 事件 = 56 组合
});
```

---

## 检查清单：后端 / 测试 / 联调起手是否就绪

- [ ] `docs/backend-spec.md` Runtime / Modules / Data Model / Business Rules / Jobs / Local Deps / Observability / Security 都填了
- [ ] `docs/api-contracts.md` 至少覆盖了主链路 endpoint，错误码统一一张表
- [ ] `packages/api-contracts/openapi.yaml` 与 `api-contracts.md` 一致
- [ ] `docs/testing-strategy.md` 每层填了工具 + 命令 + 期望耗时
- [ ] `docs/integration-plan.md` 4 个 phase 都有退出条件
- [ ] `infra/docker-compose.yml` 起 DB + Cache + 必要 mock
- [ ] `.env.example` 覆盖所有依赖
- [ ] `services/api/src/{app.ts, server.ts}` 分离（便于测试）
- [ ] `errorHandler` 统一错误格式
- [ ] `requireAuth` + 资源级授权（BOLA 防护）
- [ ] 限流中间件至少覆盖登录 / 支付 / sms
- [ ] CI workflow 覆盖 lint / typecheck / test / integration / contract / build
