import mongoose from 'mongoose';
import { Book } from '../book.model';
import { IBook } from '../../types';

interface UpdateData {
  title?: string;
  author?: string;
  genre?: string;
  publisher?: string;
  publicationDate?: Date;
  isAvailable?: boolean;
  [key: string]: any;
}

// Actualiza un libro por ID con verificación de permisos
export const updateBook = async (
  bookId: string,
  updateData: UpdateData,
  permissions: string[] = []
): Promise<IBook> => {
  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const error = new Error('Invalid book ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // 2. Buscar libro primero
    const book = await Book.findOne({ _id: bookId, isDeleted: false });

    // 3. Verificar si el libro existe
    if (!book) {
      const error = new Error('Book not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // 4. Verificar permisos según los campos que se están actualizando
    const sanitizedUpdateData = { ...updateData };
    const protectedFields = ['isDeleted', '_id', 'createdAt', 'updatedAt'];
    
    // Eliminar campos protegidos
    protectedFields.forEach(field => {
      if (field in sanitizedUpdateData) {
        delete sanitizedUpdateData[field];
      }
    });
    
    // Si el usuario está actualizando campos distintos a isAvailable, necesita permiso modify_books
    const isUpdatingOnlyAvailability = 
      Object.keys(sanitizedUpdateData).length === 1 && 
      'isAvailable' in sanitizedUpdateData;
    
    if (!isUpdatingOnlyAvailability && !permissions.includes('modify_books')) {
      const error = new Error('You do not have permission to modify book details');
      (error as any).statusCode = 403;
      throw error;
    }

    // Verificar si queda algún dato para actualizar después de la sanitización
    if (Object.keys(sanitizedUpdateData).length === 0) {
      const error = new Error('No valid fields to update');
      (error as any).statusCode = 400;
      throw error;
    }

    // Actualizar libro
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { $set: sanitizedUpdateData },
      { new: true, runValidators: true }
    );

    // Esto nunca debería suceder ya que ya verificamos si el libro existe
    if (!updatedBook) {
      const error = new Error('Failed to update book');
      (error as any).statusCode = 500;
      throw error;
    }

    return updatedBook;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
