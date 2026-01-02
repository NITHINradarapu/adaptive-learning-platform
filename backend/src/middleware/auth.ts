import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

/**
 * Passport JWT Authentication Middleware
 * Protects routes by verifying JWT tokens
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
      return;
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: info?.message || 'Invalid or expired token'
      });
      return;
    }
    
    // Attach user to request with the expected format
    (req as any).user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  })(req, res, next);
};

/**
 * Role-based Authorization Middleware
 * Checks if authenticated user has required role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as AuthUser | undefined;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }
    
    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
      return;
    }
    
    next();
  };
};
