import mongoose from 'mongoose';
import { Book } from '../book.model';

interface DeleteResult {
  message: string;
}

// Elimina lógicamente un libro por ID (borrado suave)
export const deleteBook = async (bookId: string, permissions: string[] = []): Promise<DeleteResult> => {
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
    
    // 4. Verificar si el usuario tiene permiso para eliminar libros
    if (!permissions.includes('disable_books')) {
      const error = new Error('You do not have permission to delete books');
      (error as any).statusCode = 403;
      throw error;
    }

    // 5. Eliminar lógicamente el libro (establecer isDeleted a true)
    const result = await Book.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    // Esto nunca debería suceder ya que ya verificamos si el libro existe
    if (!result) {
      const error = new Error('Failed to delete book');
      (error as any).statusCode = 500;
      throw error;
    }

    return { message: 'Book deleted successfully' };
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
