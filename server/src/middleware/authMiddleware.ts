import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        roles: ('attendee' | 'presenter' | 'organizer' | 'admin')[];
      };
    }
  }
}

interface JWTPayload {
  userId: number;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate JWT tokens
 * Sets req.user if valid token is provided
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    // Verify token - Fix: Use correct JWT verify method
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.type !== 'access') {
      res.status(401).json({ 
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, roles: true }
    });

    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if valid token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.type !== 'access') {
      next();
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, roles: true }
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

// Role-based authorization
export const requireRole = (...allowedRoles: ('attendee' | 'presenter' | 'organizer' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }
    if (!req.user.roles.some(r => allowedRoles.includes(r))) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }
    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }
  if (!req.user.roles.includes('admin')) {
    res.status(403).json({ success: false, message: 'Admin access required', code: 'ADMIN_REQUIRED' });
    return;
  }
  next();
};

export const requireOrganizer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }
  if (!(req.user.roles.includes('organizer') || req.user.roles.includes('admin'))) {
    res.status(403).json({ success: false, message: 'Organizer access required', code: 'ORGANIZER_REQUIRED' });
    return;
  }
  next();
};

// Resource ownership middleware (Conference)
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
        return;
      }

      const resourceId = Number(req.params[resourceIdParam]);
      const userId = req.user.id;

      if (req.user.roles.includes('admin')) {
        next();
        return;
      }

      // For conferences, check organizer (createdById)
      if (req.route.path.includes('/conferences/')) {
        const conf = await prisma.conference.findUnique({
          where: { id: resourceId },
          select: { createdById: true }
        });

        if (!conf) {
          res.status(404).json({ success: false, message: 'Resource not found', code: 'RESOURCE_NOT_FOUND' });
          return;
        }

        if (conf.createdById !== userId) {
          res.status(403).json({ success: false, message: 'Access denied. You can only access your own resources', code: 'OWNERSHIP_REQUIRED' });
          return;
        }
      }

      // For user resources
      if (req.route.path.includes('/users/') || req.route.path.includes('/profile/')) {
        if (resourceId !== userId) {
          res.status(403).json({ success: false, message: 'Access denied. You can only access your own data', code: 'OWNERSHIP_REQUIRED' });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ success: false, message: 'Authorization check failed', code: 'AUTH_CHECK_ERROR' });
    }
  };
};

// Validate conference ownership
export const validateEventOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
      return;
    }

    const conferenceIdRaw = req.params.eventId || req.params.id;
    const conferenceId = Number(conferenceIdRaw);

    if (!conferenceId) {
      res.status(400).json({ success: false, message: 'Conference ID required', code: 'EVENT_ID_REQUIRED' });
      return;
    }

    if (req.user.roles.includes('admin')) {
      next();
      return;
    }

    const conf = await prisma.conference.findUnique({
      where: { id: conferenceId },
      select: { createdById: true }
    });

    if (!conf) {
      res.status(404).json({ success: false, message: 'Conference not found', code: 'EVENT_NOT_FOUND' });
      return;
    }

    if (conf.createdById !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied. You can only manage your own conferences', code: 'EVENT_OWNERSHIP_REQUIRED' });
      return;
    }

    next();
  } catch (error) {
    console.error('Conference ownership validation error:', error);
    res.status(500).json({ success: false, message: 'Conference ownership validation failed', code: 'EVENT_OWNERSHIP_CHECK_ERROR' });
  }
};