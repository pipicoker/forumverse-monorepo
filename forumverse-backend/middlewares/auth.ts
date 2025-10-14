import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';


declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}
const prisma = new PrismaClient();


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Debug logging - log everything to see what's happening
  console.log('[Auth Middleware] Request:', {
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    hasAuthHeader: !!authHeader,
    authHeaderStart: authHeader ? authHeader.substring(0, 30) + '...' : 'NONE',
    hasToken: !!token,
  });
  
  if (!token) {
    console.log('[Auth Middleware] ❌ No token found, returning 401');
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.log('[Auth Middleware] ❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    console.log('[Auth Middleware] ✅ Token verified successfully');
    req.user = user;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId }
      });
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};