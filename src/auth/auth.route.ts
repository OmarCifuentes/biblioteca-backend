import { Router } from 'express';
import { registerController, loginController } from './auth.controller';
import { validate, registerValidation, loginValidation } from '../middleware/validators';

const router = Router();

// POST /api/auth/register - Registro de usuarios
router.post(
  '/register',
  validate(registerValidation),
  registerController
);

// POST /api/auth/login - Inicio de sesión de usuarios
router.post(
  '/login',
  validate(loginValidation),
  loginController
);

export default router;
