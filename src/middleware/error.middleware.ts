import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ValidationError as ExpressValidationError } from 'express-validator';

// Definir la estructura de errores de validación de express-validator
interface ValidationError {
  msg: string;
  param: string;
  location?: string;
  value?: any;
}

// Estructura alternativa que podría usarse en algunas versiones
interface AlternativeValidationError {
  msg: string;
  path: string;
  location?: string;
  value?: any;
}

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: (ValidationError | AlternativeValidationError)[];
  keyValue?: Record<string, any>;
}

// Middleware global para manejo de errores - Captura y formatea errores, proporciona respuestas consistentes
export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Registrar error para depuración
  // Registrar error con marca de tiempo y detalles
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${err.name || 'Unknown Error'}`);
  console.error(`Status: ${err.statusCode || 500}, Message: ${err.message}`);
  
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(`Stack: ${err.stack}`);
  }

  // Estado y mensaje de error predeterminados
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails = undefined;

  // Manejar tipos específicos de errores
  if (err.name === 'ValidationError' && err instanceof MongooseError.ValidationError) {
    // Error de validación de Mongoose
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  } else if (err.name === 'CastError' && err instanceof MongooseError.CastError) {
    // Error de conversión de Mongoose (ID inválido, etc.)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // Error de clave duplicada de MongoDB
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    
    if (err.keyValue && 'title' in err.keyValue && 'author' in err.keyValue) {
      message = 'A book with this title and author already exists';
    } else if (field === 'title') {
      message = 'A book with this title already exists';
    } else {
      message = `Duplicate ${field} value entered`;
    }
    
    errorDetails = err.keyValue;
  } else if (err.name === 'JsonWebTokenError') {
    // Error de validación de JWT
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // Error de token JWT expirado
    statusCode = 401;
    message = 'Token expired';
  } else if (Array.isArray(err.errors)) {
    // Errores de Express-validator
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.errors.map(error => ({
      field: 'param' in error ? error.param : ('path' in error ? error.path : 'unknown'),
      message: error.msg
    }));
  }

  // Preparar respuesta de error
  const errorResponse: any = {
    success: false,
    message
  };

  // En desarrollo, incluir información detallada del error
  if (process.env.NODE_ENV === 'development') {
    // Incluir detalles del error y traza de pila en desarrollo
    errorResponse.error = errorDetails || err.stack;
    errorResponse.name = err.name;
    errorResponse.code = err.code;
  } else {
    // En producción, solo incluir detalles esenciales del error
    if (errorDetails && (statusCode === 400 || statusCode === 409)) {
      // Solo incluir errores de validación o detalles de conflicto en producción
      errorResponse.error = errorDetails;
    }
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

// Manejador 404 para rutas no definidas
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};
