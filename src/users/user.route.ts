import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { validate, getUserValidation, updateUserValidation, deleteUserValidation } from '../middleware/validators';
import { readUserController, updateUserController, deleteUserController } from './user.controller';

const router = Router();


// GET /api/users/:id - Obtener usuario por ID (privado)
router.get(
  '/:id',
  verifyToken,
  validate(getUserValidation),
  readUserController
);

// PUT /api/users/:id - Actualizar usuario (privado)
router.put(
  '/:id',
  verifyToken,
  validate(updateUserValidation),
  updateUserController
);

// DELETE /api/users/:id - Eliminar usuario (borrado lógico, privado)
router.delete(
  '/:id',
  verifyToken,
  validate(deleteUserValidation),
  deleteUserController
);

export default router;
