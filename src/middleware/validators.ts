import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Middleware para validar peticiones usando reglas de express-validator y devolver errores estandarizados
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Verificar errores de validación
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Si hay errores de validación, formatearlos y devolverlos
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  };
};

// Valida que un parámetro sea un ObjectId válido de MongoDB
export const validateMongoId = (paramName: string = 'id') => {
  return param(paramName)
    .trim()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${paramName} format`);
      }
      return true;
    });
};

// ====== VALIDACIONES DE AUTENTICACIÓN ======

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// ====== VALIDACIONES DE USUARIO ======

export const getUserValidation = [
  validateMongoId('id')
];

export const updateUserValidation = [
  validateMongoId('id'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  // Prevenir actualización de campos protegidos
  body('password')
    .not().exists()
    .withMessage('Cannot update password through this endpoint'),
  body('permissions')
    .not().exists()
    .withMessage('Cannot update permissions through this endpoint'),
  body('isDeleted')
    .not().exists()
    .withMessage('Cannot update deletion status through this endpoint')
];

export const deleteUserValidation = [
  validateMongoId('id')
];

// ====== VALIDACIONES DE LIBROS ======

export const createBookValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .trim(),
  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .trim(),
  body('publisher')
    .optional()
    .trim(),
  body('publicationDate')
    .optional()
    .isISO8601()
    .withMessage('Publication date must be a valid date')
];

export const getBookValidation = [
  validateMongoId('id')
];

export const updateBookValidation = [
  validateMongoId('id'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Title must be at least 2 characters long'),
  body('author')
    .optional()
    .trim(),
  body('genre')
    .optional()
    .trim(),
  body('publisher')
    .optional()
    .trim(),
  body('publicationDate')
    .optional()
    .isISO8601()
    .withMessage('Publication date must be a valid date'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean value'),
  // Prevenir actualización de campos protegidos
  body('isDeleted')
    .not().exists()
    .withMessage('Cannot update deletion status through this endpoint')
];

export const deleteBookValidation = [
  validateMongoId('id')
];

export const listBooksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('genre')
    .optional()
    .trim(),
  query('author')
    .optional()
    .trim(),
  query('title')
    .optional()
    .trim(),
  query('publisher')
    .optional()
    .trim(),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean value'),
  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted must be a boolean value')
];

// ====== VALIDACIONES DE RESERVAS ======

export const createReservationValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid book ID format')
];

export const reserveBookValidation = [
  validateMongoId('bookId')
];

export const returnBookValidation = [
  validateMongoId('id')
];

export const getReservationValidation = [
  validateMongoId('id')
];

export const getBookHistoryValidation = [
  validateMongoId('bookId')
];

export const getUserReservationsValidation = [
  validateMongoId('userId'),
  query('status')
    .optional()
    .isIn(['active', 'returned', 'all'])
    .withMessage('Status must be one of: active, returned, all'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
