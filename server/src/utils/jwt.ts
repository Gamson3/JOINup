import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);

export function signAccessToken(payload: { userId: number; roles: string[] }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function verifyAccessToken(token: string) {
  try { return jwt.verify(token, ACCESS_SECRET) as any; } catch { return null; }
}

export function createRefreshTokenPlain() {
  return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(plain: string) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export function refreshExpiresAt() {
  return new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
}