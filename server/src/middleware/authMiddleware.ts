import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';
      };
    }
  }
}

// Interface for JWT payload
interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';
  iat: number;
  exp: number;
}

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Optional: Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
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

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ 
        success: false,
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ 
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require authentication
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
      // No token provided, continue without authentication
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
export const requireRole = (...allowedRoles: ('ORGANIZER' | 'ATTENDEE' | 'ADMIN')[]) => {
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
 * Admin-only middleware
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
 * Organizer-only middleware
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
      select: { 
        id: true,
        organizerId: true,
        title: true
      }
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
        message: 'Access denied. You can only modify your own events',
        code: 'EVENT_OWNERSHIP_REQUIRED'
      });
      return;
    }

    // Attach event to request for potential use in handlers
    (req as any).event = event;
    next();
  } catch (error) {
    console.error('Event ownership validation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ownership validation failed',
      code: 'OWNERSHIP_CHECK_ERROR'
    });
  }
};

/**
 * Helper function to generate JWT tokens
 */
export const generateAuthToken = (user: {
  id: string;
  email: string;
  name: string;
  role: 'ORGANIZER' | 'ATTENDEE' | 'ADMIN';
}): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'conference-manager',
      audience: 'conference-manager-users'
    }
  );
};

/**
 * Helper function to verify and decode JWT tokens
 */
export const verifyAuthToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Export prisma instance for use in other modules
export { prisma };