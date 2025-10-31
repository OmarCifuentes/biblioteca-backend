import { Request, Response, NextFunction } from 'express';
import { registerUser } from './actions/register.auth.action';
import { loginUser } from './actions/login.auth.action';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    
    // Registrar nuevo usuario
    const user = await registerUser(email, password, name);
    
    // Enviar respuesta exitosa
    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Iniciar sesión de usuario
    const { token, user } = await loginUser(email, password);
    
    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};
