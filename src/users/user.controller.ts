import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { readUser } from './actions/read.user.action';
import { updateUser } from './actions/update.user.action';
import { deleteUser } from './actions/delete.user.action';

export const readUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Obtener usuario por ID
    const user = await readUser(userId);
    
    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    
    // Ensure user object exists in request (set by auth middleware)
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      throw error;
    }
    
    // Actualizar usuario
    const updatedUser = await updateUser(
      userId,
      updateData,
      req.user.userId,
      req.user.permissions
    );
    
    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    // Ensure user object exists in request (set by auth middleware)
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      throw error;
    }
    
    // Eliminar usuario
    const result = await deleteUser(
      userId,
      req.user.userId,
      req.user.permissions
    );
    
    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
