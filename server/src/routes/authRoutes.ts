import express from 'express';
import { z } from 'zod';
import { comparePassword, hashPassword } from '../utils/hash';
import prisma from '../utils/prisma';
import { signAccessToken } from '../utils/jwt';
import { createRefreshTokenForUser, verifyAndRotateRefreshCookie, revokeRefreshCookie } from '../services/authService';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  roles: z.array(z.enum(['attendee', 'presenter', 'organizer', 'admin'])).default(['attendee'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function setRefreshCookie(res: express.Response, value: string) {
  res.cookie('jid', value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

// Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed, roles: data.roles },
      select: { id: true, email: true, name: true, roles: true, createdAt: true }
    });

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.status(201).json({ success: true, message: 'User created successfully', data: { user, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Register (role-scoped)
router.post('/register/attendee', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.omit({ roles: true }).parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed, roles: ['attendee'] },
      select: { id: true, email: true, name: true, roles: true, createdAt: true }
    });

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.status(201).json({ success: true, message: 'Attendee registered', data: { user, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    console.error('Attendee register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/register/organizer', authLimiter, async (req, res) => {
  try {
    const data = registerSchema.omit({ roles: true }).parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    // Optionally: validate invitation code here

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed, roles: ['organizer'] },
      select: { id: true, email: true, name: true, roles: true, createdAt: true }
    });

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.status(201).json({ success: true, message: 'Organizer registered', data: { user, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    console.error('Organizer register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name, roles: user.roles, createdAt: user.createdAt },
        accessToken
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login (role-enforced)
router.post('/login/attendee', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.roles.includes('attendee')) {
      return res.status(403).json({ success: false, message: 'This account is not an attendee', code: 'ROLE_MISMATCH' });
    }

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.json({ success: true, message: 'Login successful', data: { user: { id: user.id, email: user.email, name: user.name, roles: user.roles, createdAt: user.createdAt }, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    console.error('Attendee login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/login/organizer', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!(user.roles.includes('organizer') || user.roles.includes('admin'))) {
      return res.status(403).json({ success: false, message: 'This account is not an organizer', code: 'ROLE_MISMATCH' });
    }

    const accessToken = signAccessToken({ userId: user.id, roles: user.roles });
    const { cookieValue } = await createRefreshTokenForUser(user.id);
    setRefreshCookie(res, cookieValue);

    res.json({ success: true, message: 'Login successful', data: { user: { id: user.id, email: user.email, name: user.name, roles: user.roles, createdAt: user.createdAt }, accessToken } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    console.error('Organizer login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Refresh (httpOnly cookie rotation)
router.post('/refresh', async (req, res) => {
  try {
    const cookie = req.cookies?.jid as string | undefined;
    if (!cookie) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const result = await verifyAndRotateRefreshCookie(cookie);
    if (!result.valid) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

    setRefreshCookie(res, result.newCookieValue);
    const accessToken = signAccessToken({ userId: result.userId, roles: result.roles });

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// Logout (revoke refresh cookie)
router.post('/logout', async (req, res) => {
  try {
    const cookie = req.cookies?.jid as string | undefined;
    if (cookie) await revokeRefreshCookie(cookie);
    res.clearCookie('jid', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update role -> admin only
router.patch('/update-role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const role = req.body?.role as string | undefined;
    if (!role || !['organizer', 'attendee', 'presenter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false, message: 'Valid role is required (organizer, attendee, presenter, admin)', code: 'INVALID_ROLE'
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { roles: [role as any] },
      select: { id: true, email: true, name: true, roles: true, createdAt: true }
    });

    res.json({ success: true, message: 'User roles updated successfully', data: { user: updated } });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role', code: 'UPDATE_ROLE_ERROR' });
  }
});

export default router;