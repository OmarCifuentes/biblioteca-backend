import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  permissions: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBook extends Document {
  title: string;
  author: string;
  genre: string;
  publisher: string;
  publicationDate: Date;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservation extends Document {
  userId: string;
  bookId: string;
  reservationDate: Date;
  returnDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}
