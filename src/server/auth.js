import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { database } from './database.js';

export const SESSION_COOKIE = 'pakmoo_session';
export const SESSION_DURATION = 60 * 60 * 8;
export function hashToken(value) { return createHash('sha256').update(value).digest('hex'); }
export function getSession(token) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return database().prepare(`SELECT admins.id, admins.username FROM sessions
    JOIN admins ON admins.id = sessions.admin_id WHERE token_hash = ? AND expires_at > ?`)
    .get(hashToken(token), Date.now()) || null;
}
export async function currentAdmin() {
  return getSession((await cookies()).get(SESSION_COOKIE)?.value);
}
export function login(username, password) {
  const db = database();
  const key = String(username).toLowerCase().trim().slice(0, 120);
  const attempts = db.prepare('SELECT * FROM login_attempts WHERE username = ?').get(key);
  if (attempts?.reset_at > Date.now() && attempts.attempts >= 8) {
    return { error: 'Too many attempts. Please try again in 15 minutes.', status: 429 };
  }
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(key);
  const candidate = scryptSync(String(password).slice(0, 256), admin?.salt || 'missing-account-salt', 64);
  const expected = admin ? Buffer.from(admin.password_hash, 'hex') : Buffer.alloc(64);
  if (!admin || !timingSafeEqual(candidate, expected)) {
    const count = attempts?.reset_at > Date.now() ? attempts.attempts + 1 : 1;
    db.prepare(`INSERT INTO login_attempts(username, attempts, reset_at) VALUES(?,?,?)
      ON CONFLICT(username) DO UPDATE SET attempts=excluded.attempts, reset_at=excluded.reset_at`)
      .run(key, count, attempts?.reset_at > Date.now() ? attempts.reset_at : Date.now() + 900000);
    return { error: 'Invalid username or password.', status: 401 };
  }
  db.prepare('DELETE FROM login_attempts WHERE username = ?').run(key);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions(token_hash,admin_id,expires_at) VALUES(?,?,?)')
    .run(hashToken(token), admin.id, Date.now() + SESSION_DURATION * 1000);
  return { token, admin: { username: admin.username, name: 'PAKMOO Admin', email: 'admin@pakmoo.com' } };
}
export function sessionCookie(token, request, maxAge = SESSION_DURATION) {
  return { name: SESSION_COOKIE, value: token, httpOnly: true, sameSite: 'lax',
    secure: new URL(request.url).protocol === 'https:', path: '/', maxAge };
}
