import mongoose from 'mongoose';
import { Book } from '../book.model';
import { IBook } from '../../types';

// Obtiene un libro por ID
export const readBook = async (bookId: string): Promise<IBook> => {
  try {
    // Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const error = new Error('Invalid book ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // Buscar libro por ID donde isDeleted sea falso
    const book = await Book.findOne({ 
      _id: bookId, 
      isDeleted: false 
    });

    // Verificar si el libro existe
    if (!book) {
      const error = new Error('Book not found');
      (error as any).statusCode = 404;
      throw error;
    }

    return book;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
