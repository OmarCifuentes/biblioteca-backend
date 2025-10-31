import bcrypt from 'bcryptjs';
import { User } from '../../users/user.model';
import { IUser } from '../../types';

// Registra un nuevo usuario y devuelve sus datos sin la contraseña
export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<Partial<IUser>> => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      const error = new Error('Email already exists');
      (error as any).statusCode = 409; // Conflict
      throw error;
    }
    
    // Cifrar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear nuevo usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      permissions: [],
      isDeleted: false,
    });
    
    // Devolver usuario sin contraseña
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    
    return userWithoutPassword;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
