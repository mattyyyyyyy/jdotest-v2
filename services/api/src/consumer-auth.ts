/**
 * 车主（消费端）鉴权 + 车机扫码登录会话（openspec/specs/auth-qr）。
 * 与 admin **物理隔离**：独立 secret（JWT_ACCESS_SECRET）+ token typ 'user'/'user-refresh'。
 * Demo：内存会话表 + Node 内置 crypto HMAC token（生产换 Redis(TTL) + KMS，接口不变）。
 */
import crypto from 'node:crypto';

const SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-only-user-secret-change-in-prod';
export const ACCESS_TTL = 15 * 60; // 15min
export const REFRESH_TTL = 7 * 24 * 60 * 60; // 7d
export const QR_TTL = 120; // 二维码会话有效期（秒）

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}
function b64url(s: string): string {
  return Buffer.from(s).toString('base64url');
}

export interface UserToken { sub: string; name: string; typ: 'user' | 'user-refresh'; iat: number; exp: number }

export function signToken(claims: { sub: string; name: string }, typ: 'user' | 'user-refresh', ttlSec: number, now: number): string {
  const payload = { ...claims, typ, iat: now, exp: now + ttlSec };
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  return `${head}.${body}.${sign(`${head}.${body}`)}`;
}

export function verifyToken(token: string | undefined, expectedTyp: 'user' | 'user-refresh', now = Math.floor(Date.now() / 1000)): UserToken | null {
  if (!token) return null;
  const seg = token.split('.');
  if (seg.length !== 3) return null;
  const [head, body, sig] = seg;
  if (head === undefined || body === undefined || sig === undefined) return null;
  if (sign(`${head}.${body}`) !== sig) return null;
  let p: UserToken;
  try {
    p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (p.typ !== expectedTyp) return null;
  if (typeof p.exp !== 'number' || p.exp < now) return null;
  return p;
}

export function bearer(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  return m ? m[1] : undefined;
}

// ---------- 车机扫码登录会话 ----------
export type QrStatus = 'pending' | 'confirmed' | 'expired';
interface QrSession { id: string; status: QrStatus; userId?: string; expiresAt: number } // expiresAt: epoch ms

const sessions = new Map<string, QrSession>();

export function createSession(now = Date.now()): { sessionId: string; qrUrl: string; expiresAt: string; status: QrStatus } {
  const id = 'qr-' + crypto.randomBytes(12).toString('hex');
  const expiresAt = now + QR_TTL * 1000;
  sessions.set(id, { id, status: 'pending', expiresAt });
  return { sessionId: id, qrUrl: `jdo://login?session=${id}`, expiresAt: new Date(expiresAt).toISOString(), status: 'pending' };
}

/** 手机确认：绑定车主并置 confirmed。返回 false = 会话不存在或已过期。 */
export function confirmSession(sessionId: string, userId: string, now = Date.now()): boolean {
  const s = sessions.get(sessionId);
  if (!s || now > s.expiresAt) return false;
  s.status = 'confirmed';
  s.userId = userId;
  return true;
}

/** 查会话状态。未知 / pending 超时 → expired（不泄漏存在性）。confirmed 一旦达成不因 TTL 失效。 */
export function getSession(sessionId: string, now = Date.now()): { status: QrStatus; userId?: string } {
  const s = sessions.get(sessionId);
  if (!s || (s.status === 'pending' && now > s.expiresAt)) return { status: 'expired' };
  return s.userId === undefined ? { status: s.status } : { status: s.status, userId: s.userId };
}

// ---------- 手机号 + 短信验证码登录（add-auth-login）----------
// Demo：内存验证码表 + 频控；生产换真实短信渠道 + Redis(TTL)，接口不变。
export const SMS_CODE_TTL = 5 * 60; // 验证码有效期（秒）
const SMS_REQ_WINDOW_MS = 60_000; // 同号 60s 内最多请求一次
interface SmsEntry { code: string; expiresAt: number; lastSentAt: number } // epoch ms
const smsCodes = new Map<string, SmsEntry>();

/** 下发验证码。返回 code（Demo 直出，便于联调；生产改为只发短信不回传）。频控触发返回 null。 */
export function issueSmsCode(phone: string, now = Date.now()): { code: string; expiresAt: number } | null {
  const prev = smsCodes.get(phone);
  if (prev && now - prev.lastSentAt < SMS_REQ_WINDOW_MS) return null; // 频控：60s 一次
  const code = (crypto.randomInt(0, 1_000_000)).toString().padStart(6, '0');
  const expiresAt = now + SMS_CODE_TTL * 1000;
  smsCodes.set(phone, { code, expiresAt, lastSentAt: now });
  return { code, expiresAt };
}

/** 校验验证码：成功即消费（一次性），错误/过期/无记录返回 false。 */
export function verifySmsCode(phone: string, code: string, now = Date.now()): boolean {
  const e = smsCodes.get(phone);
  if (!e || now > e.expiresAt) return false;
  if (e.code !== code) return false;
  smsCodes.delete(phone); // 一次性消费，防重放
  return true;
}

/** 测试用：清空会话 + 验证码 */
export function __reset(): void {
  sessions.clear();
  smsCodes.clear();
}
