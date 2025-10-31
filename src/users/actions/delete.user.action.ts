import mongoose from 'mongoose';
import { User } from '../user.model';

interface DeleteResult {
  message: string;
}

// Elimina lógicamente un usuario por ID (borrado suave)
export const deleteUser = async (
  userId: string,
  requestingUserId: string,
  permissions: string[]
): Promise<DeleteResult> => {
  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB
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

    // 4. Verificar permisos
    if (userId !== requestingUserId && !permissions.includes('disable_users')) {
      const error = new Error('You do not have permission to delete this user');
      (error as any).statusCode = 403;
      throw error;
    }

    // 5. Eliminar lógicamente al usuario (establecer isDeleted a true)
    const result = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    // Esto nunca debería suceder ya que ya verificamos si el usuario existe
    if (!result) {
      const error = new Error('Failed to delete user');
      (error as any).statusCode = 500;
      throw error;
    }

    return { message: 'User deleted successfully' };
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
