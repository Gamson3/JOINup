import prisma from '../utils/prisma';
import { createRefreshTokenPlain, hashRefreshToken, refreshExpiresAt } from '../utils/jwt';

export async function createRefreshTokenForUser(userId: number) {
  const plain = createRefreshTokenPlain();
  const tokenHash = hashRefreshToken(plain);
  const expiresAt = refreshExpiresAt();

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt, revoked: false }
  });

  return { cookieValue: plain }; // set as httpOnly cookie
}

export async function verifyAndRotateRefreshCookie(cookieValue: string) {
  const tokenHash = hashRefreshToken(cookieValue);
  const current = await prisma.refreshToken.findFirst({
    where: { tokenHash, revoked: false },
    include: { user: true }
  });

  if (!current) return { valid: false as const };
  if (current.expiresAt < new Date()) return { valid: false as const };

  // Rotate
  const newPlain = createRefreshTokenPlain();
  const newHash = hashRefreshToken(newPlain);
  const newExpires = refreshExpiresAt();

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({ where: { id: current.id }, data: { revoked: true } });
    await tx.refreshToken.create({ data: { tokenHash: newHash, userId: current.userId, expiresAt: newExpires } });
  });

  return {
    valid: true as const,
    userId: current.userId,
    roles: current.user.roles,
    newCookieValue: newPlain
  };
}

export async function revokeRefreshCookie(cookieValue: string) {
  const tokenHash = hashRefreshToken(cookieValue);
  await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
}