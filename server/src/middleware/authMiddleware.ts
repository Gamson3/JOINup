import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN' | 'PENDING';
      };
    }
  }
}

interface JWTPayload {
  userId: string;
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 * Requires specific user roles
 */
export const requireRole = (...allowedRoles: ('ORGANIZER' | 'ATTENDEE' | 'ADMIN' | 'PENDING')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
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

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ 
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
    return;
  }

  next();
};

/**
 * Middleware to require organizer role
 */
export const requireOrganizer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }

  if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
    res.status(403).json({ 
      success: false,
      message: 'Organizer access required',
      code: 'ORGANIZER_REQUIRED'
    });
    return;
  }

  next();
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // Admin can access any resource
      if (req.user.role === 'ADMIN') {
        next();
        return;
      }

      // For events, check if user is the organizer
      if (req.route.path.includes('/events/')) {
        const event = await prisma.event.findUnique({
          where: { id: resourceId },
          select: { organizerId: true }
        });

        if (!event) {
          res.status(404).json({ 
            success: false,
            message: 'Resource not found',
            code: 'RESOURCE_NOT_FOUND'
          });
          return;
        }

        if (event.organizerId !== userId) {
          res.status(403).json({ 
            success: false,
            message: 'Access denied. You can only access your own resources',
            code: 'OWNERSHIP_REQUIRED'
          });
          return;
        }
      }

      // For user resources, check if accessing own data
      if (req.route.path.includes('/users/') || req.route.path.includes('/profile/')) {
        if (resourceId !== userId) {
          res.status(403).json({ 
            success: false,
            message: 'Access denied. You can only access your own data',
            code: 'OWNERSHIP_REQUIRED'
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Authorization check failed',
        code: 'AUTH_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware to validate event ownership for organizers
 */
export const validateEventOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const eventId = req.params.eventId || req.params.id;

    if (!eventId) {
      res.status(400).json({ 
        success: false,
        message: 'Event ID required',
        code: 'EVENT_ID_REQUIRED'
      });
      return;
    }

    // Admin can access any event
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // Check if user owns the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    if (!event) {
      res.status(404).json({ 
        success: false,
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
      return;
    }

    if (event.organizerId !== req.user.id) {
      res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only manage your own events',
        code: 'EVENT_OWNERSHIP_REQUIRED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Event ownership validation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Event ownership validation failed',
      code: 'EVENT_OWNERSHIP_CHECK_ERROR'
    });
  }
};