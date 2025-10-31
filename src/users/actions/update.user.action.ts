import mongoose from 'mongoose';
import { User } from '../user.model';
import { IUser } from '../../types';

interface UpdateData {
  name?: string;
  email?: string;
  [key: string]: any;
}

// Actualiza un usuario por ID con verificación de permisos y validación de datos
export const updateUser = async (
  userId: string,
  updateData: UpdateData,
  requestingUserId: string,
  permissions: string[]
): Promise<IUser> => {
  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB (ya hecho en el middleware de validadores)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // 2. Buscar usuario primero
    const user = await User.findOne({ _id: userId, isDeleted: false });

    // 3. Verificar si el usuario existe
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // 4. Ahora verificar permisos
    if (userId !== requestingUserId && !permissions.includes('modify_users')) {
      const error = new Error('You do not have permission to update this user');
      (error as any).statusCode = 403;
      throw error;
    }

    // 5. Eliminar campos protegidos de updateData
    const sanitizedUpdateData = { ...updateData };
    const protectedFields = ['password', 'permissions', 'isDeleted', '_id', 'createdAt', 'updatedAt'];
    
    protectedFields.forEach(field => {
      if (field in sanitizedUpdateData) {
        delete sanitizedUpdateData[field];
      }
    });

    // Verificar si queda algún dato para actualizar después de la sanitización
    if (Object.keys(sanitizedUpdateData).length === 0) {
      const error = new Error('No valid fields to update');
      (error as any).statusCode = 400;
      throw error;
    }

    // Actualizar usuario
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: sanitizedUpdateData },
      { new: true, runValidators: true }
    ).select('-password');

    // Esto nunca debería suceder ya que ya verificamos si el usuario existe
    if (!updatedUser) {
      const error = new Error('Failed to update user');
      (error as any).statusCode = 500;
      throw error;
    }

    return updatedUser;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
