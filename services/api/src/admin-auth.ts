/**
 * 后台员工鉴权与授权（openspec/specs/admin-auth）。
 * Demo 架构：内存 store + Node 内置 crypto（不引 bcrypt/jsonwebtoken 原生依赖）。
 *   - 密码：scrypt 加盐哈希（`scrypt$salt$hash`）
 *   - token：HMAC-SHA256 签名的紧凑 token（header.payload.sig，含 exp + typ）
 *   - RBAC：角色 → 权限点；endpoint 按 method+resource 求所需权限点
 * 真实生产应换成 KMS 托管的 secret + 成熟 JWT 库；接口语义不变。
 */
import crypto from 'node:crypto';

const SECRET = process.env.ADMIN_JWT_SECRET ?? 'dev-only-admin-secret-change-in-prod';
export const ACCESS_TTL = 15 * 60; // 15min
export const REFRESH_TTL = 7 * 24 * 60 * 60; // 7d

/** Demo 默认密码（首次登录惰性写入 passwordHash；生产应强制改密）。 */
const DEMO_PASSWORDS: Record<string, string> = { admin: 'admin123', ops01: 'ops123', cs01: 'cs123' };
export function demoPassword(account: string): string {
  return DEMO_PASSWORDS[account] ?? `${account}123`;
}

// ---------- 密码哈希（scrypt）----------
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 32);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || saltHex === undefined || hashHex === undefined) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(pw, salt, expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// ---------- 紧凑 token（HMAC 签名）----------
function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}
function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}
export interface TokenPayload { sub: string; account: string; role: string; typ: 'admin' | 'admin-refresh'; iat: number; exp: number }

export function signToken(claims: { sub: string; account: string; role: string }, typ: 'admin' | 'admin-refresh', ttlSec: number, now: number): string {
  const payload = { ...claims, typ, iat: now, exp: now + ttlSec };
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  return `${head}.${body}.${sign(`${head}.${body}`)}`;
}

/** 校验签名 + exp + typ；通过返回 payload，否则 null。now 默认当前时间。 */
export function verifyToken(token: string | undefined, expectedTyp: 'admin' | 'admin-refresh', now = Math.floor(Date.now() / 1000)): TokenPayload | null {
  if (!token) return null;
  const seg = token.split('.');
  if (seg.length !== 3) return null;
  const [head, body, sig] = seg;
  if (head === undefined || body === undefined || sig === undefined) return null;
  if (sign(`${head}.${body}`) !== sig) return null;
  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (payload.typ !== expectedTyp) return null;
  if (typeof payload.exp !== 'number' || payload.exp < now) return null;
  return payload;
}

export function bearer(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  return m ? m[1] : undefined;
}

// ---------- RBAC：角色 → 权限点 ----------
// 权限点形如 `<resource>:read` / `<resource>:write`；'*' 全权，'*:read' 全部读。
export const ROLE_PERMS: Record<string, string[]> = {
  超管: ['*'],
  运营: ['*:read', 'products:write', 'categories:write', 'banners:write', 'heroRecs:write', 'coupons:write', 'reviews:write', 'pickupPoints:write', 'config:write'],
  客服: ['*:read', 'orders:write', 'aftersale:write', 'shipping:write', 'users:write'],
  财务: ['*:read'],
};

function permMatch(granted: string, need: string): boolean {
  if (granted === '*' || granted === need) return true;
  const [gRes, gAct] = granted.split(':');
  const [nRes, nAct] = need.split(':');
  if (gRes === '*' && gAct === nAct) return true; // '*:read'
  if (gRes === nRes && gAct === '*') return true; // 'products:*'
  return false;
}
export function hasPermission(role: string, need: string): boolean {
  const perms = ROLE_PERMS[role] ?? [];
  return perms.some((g) => permMatch(g, need));
}

// ---------- 路径 → 所需权限点 ----------
export interface AdminRoute { underAdmin: boolean; isAuth: boolean; isAuthPublic: boolean; resource: string | null; id: string | null; permission: string | null; isWrite: boolean }

/** 解析 /api/v1/admin/* 请求，给出守卫决策。 */
export function parseAdminRoute(method: string, urlPath: string): AdminRoute {
  const path = urlPath.split('?')[0] ?? '';
  const prefix = '/api/v1/admin/';
  if (!path.startsWith(prefix)) return { underAdmin: false, isAuth: false, isAuthPublic: false, resource: null, id: null, permission: null, isWrite: false };
  const rest = path.slice(prefix.length).replace(/\/$/, '');
  const seg = rest.split('/');
  const isWrite = method !== 'GET' && method !== 'HEAD';

  // auth 子路由
  if (seg[0] === 'auth') {
    const action = seg[1] ?? '';
    const isAuthPublic = action === 'login' || action === 'refresh'; // 无需 token
    return { underAdmin: true, isAuth: true, isAuthPublic, resource: 'auth', id: null, permission: null, isWrite };
  }
  // 元信息 / 看板 / 配置
  if (seg[0] === 'resources') return route('resources', null, 'meta:read', isWrite);
  if (seg[0] === 'analytics') return route('analytics', null, 'analytics:read', isWrite);
  if (seg[0] === 'config') return route('config', null, isWrite ? 'config:write' : 'config:read', isWrite);

  // 通用资源 CRUD
  const resource = seg[0] ?? '';
  const id = seg[1] ?? null;
  const permission = `${resource}:${isWrite ? 'write' : 'read'}`;
  return route(resource, id, permission, isWrite);
}
function route(resource: string, id: string | null, permission: string | null, isWrite: boolean): AdminRoute {
  return { underAdmin: true, isAuth: false, isAuthPublic: false, resource, id, permission, isWrite };
}

// ---------- 登录限流（5/min/IP）----------
const LOGIN_LIMIT = 5;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();
export function rateLimited(ip: string, now = Date.now()): boolean {
  const h = hits.get(ip);
  if (!h || now > h.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  h.count += 1;
  return h.count > LOGIN_LIMIT;
}
/** 测试用：清空限流计数 */
export function __resetRateLimit(): void {
  hits.clear();
}
