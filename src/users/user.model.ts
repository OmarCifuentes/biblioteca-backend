import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // No devolver contraseña por defecto en las consultas
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        const { password, __v, ...rest } = ret;
        return rest;
      }
    },
  }
);

// Crear índice para el campo email
UserSchema.index({ email: 1 });

// Crear índice para consultas que verifican isDeleted
UserSchema.index({ isDeleted: 1 });

// Eliminar contraseña de objetos planos
UserSchema.set('toObject', {
  transform: function(doc, ret) {
    const { password, __v, ...rest } = ret;
    return rest;
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
