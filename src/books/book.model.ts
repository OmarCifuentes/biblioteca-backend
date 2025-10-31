import mongoose, { Schema, model } from 'mongoose';
import { IBook } from '../types';

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      unique: true, // Añadir restricción única
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    publicationDate: {
      type: Date,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Crear índices para consultas comunes
BookSchema.index({ title: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ isDeleted: 1 });
BookSchema.index({ isAvailable: 1 });

// Crear índice único compuesto de título y autor para evitar duplicados del mismo libro
BookSchema.index({ title: 1, author: 1 }, { unique: true });

export const Book = model<IBook>('Book', BookSchema);
