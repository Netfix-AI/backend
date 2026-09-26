import { Request, Response, NextFunction } from 'express';
import 'cookie-parser';
import jwt from 'jsonwebtoken';
import { supabaseService } from '../services/supabaseService.js';
import type { UserRole } from '../types/index.js';

export interface AuthenticatedUserRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    jti?: string;
  };
  admin?: {
    id: string;
    email: string;
    adminLevel: string;
  };
}

export const requireUserAuth = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.user_session || extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required. Please sign in.' },
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'netfix_ai_super_secret_jwt_key_2026_dev';
    const decoded: any = jwt.verify(token, secret);
    if (!decoded || decoded.type !== 'user') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired user session.' },
      });
    }

    // Check session revocation (Module 1 requirement)
    if (decoded.jti) {
      const isRevoked = await supabaseService.isSessionRevoked(decoded.jti);
      if (isRevoked) {
        res.clearCookie('user_session', { path: '/' });
        return res.status(401).json({
          success: false,
          error: { code: 'SESSION_REVOKED', message: 'Your session has been revoked. Please sign in again.' },
        });
      }
    }

    // Check account status (suspended or deactivated users cannot use API)
    const user = await supabaseService.getUserById(decoded.sub);
    if (user) {
      if (user.status === 'suspended' || user.status === 'deactivated' || user.is_deactivated) {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_SUSPENDED', message: 'Account status is inactive or suspended. Access denied.' },
        });
      }
    }

    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role, jti: decoded.jti };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired user session.' },
    });
  }
};

export const requireAdminAuth = (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.admin_session || extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Administrator authorization required.' },
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'netfix_ai_super_secret_jwt_key_2026_dev';
    const decoded: any = jwt.verify(token, secret);
    if (!decoded || decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_ADMIN_TOKEN', message: 'Invalid or expired admin session token.' },
      });
    }

    req.admin = { id: decoded.sub, email: decoded.email, adminLevel: decoded.adminLevel || 'SuperAdministrator' };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_ADMIN_TOKEN', message: 'Invalid or expired admin session token.' },
    });
  }
};

export const requireUserRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions to access this resource.' },
      });
    }

    next();
  };
};

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}
