import { Router } from 'express';
import { verifyToken, checkPermission } from '../middleware/auth.middleware';
import { 
  validate, 
  createBookValidation, 
  getBookValidation, 
  listBooksValidation,
  updateBookValidation, 
  deleteBookValidation 
} from '../middleware/validators';
import { 
  createBookController, 
  readBookController, 
  listBooksController,
  updateBookController, 
  deleteBookController 
} from './book.controller';

const router = Router();

// POST /api/books - Crear libro (requiere permiso 'create_books')
router.post(
  '/',
  verifyToken,
  checkPermission('create_books'),
  validate(createBookValidation),
  createBookController
);

// GET /api/books/:id - Obtener libro por ID (público)
router.get(
  '/:id',
  validate(getBookValidation),
  readBookController
);

// GET /api/books - Listar libros con filtros (público)
router.get(
  '/',
  validate(listBooksValidation),
  listBooksController
);

// PUT /api/books/:id - Actualizar libro (requiere permiso 'modify_books')
router.put(
  '/:id',
  verifyToken,
  validate(updateBookValidation),
  updateBookController
);

// DELETE /api/books/:id - Eliminar libro (requiere permiso 'disable_books')
router.delete(
  '/:id',
  verifyToken,
  validate(deleteBookValidation),
  deleteBookController
);

export default router;
