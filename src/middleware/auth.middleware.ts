import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

interface JwtPayload {
  userId: string;
  permissions: string[];
}

// Middleware para verificar token JWT y agregar datos de usuario a la solicitud
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Obtener token del encabezado
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication required. No token provided');
      (error as any).statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;
    
    // Agregar información del usuario a la solicitud
    req.user = {
      userId: decoded.userId,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const jwtError = new Error('Invalid or expired token');
      (jwtError as any).statusCode = 401;
      next(jwtError);
      return;
    }
    
    next(error);
  }
};

// Middleware para verificar si el usuario tiene el permiso requerido
export const checkPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      next(error);
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      const error = new Error(`Permission denied: ${permission} required`);
      (error as any).statusCode = 403;
      next(error);
      return;
    }

    next();
  };
};
