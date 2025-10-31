import mongoose from 'mongoose';
import { User } from '../user.model';
import { IUser } from '../../types';

// Obtiene un usuario por ID sin incluir su contraseña
export const readUser = async (userId: string): Promise<IUser> => {
  try {
    // Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // Buscar usuario por ID donde isDeleted sea falso
    const user = await User.findOne({ 
      _id: userId, 
      isDeleted: false 
    }).select('-password');

    // Verificar si el usuario existe
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return user;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
