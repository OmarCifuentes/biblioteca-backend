import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../../users/user.model';

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email, isDeleted: false }).select('+password');
  
  if (!user) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    (error as any).statusCode = 401;
    throw error;
  }
  
  const payload = { 
    userId: String(user._id), 
    permissions: user.permissions 
  };
  
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  
  // Generar token JWT
  const token = jwt.sign(
    payload, 
    secret, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
  
  const userObject = user.toObject();
  const { password: pwd, ...userWithoutPassword } = userObject;
  
  return {
    token,
    user: userWithoutPassword
  };
};
