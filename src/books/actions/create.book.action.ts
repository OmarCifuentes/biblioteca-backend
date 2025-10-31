import { Book } from '../book.model';
import { IBook } from '../../types';

interface BookData {
  title: string;
  author: string;
  genre: string;
  publisher?: string;
  publicationDate?: Date;
}

// Crea un nuevo libro en la base de datos
export const createBook = async (bookData: BookData): Promise<IBook> => {
  try {
    // Verificar si el libro ya existe (mismo título y autor)
    const existingBook = await Book.findOne({ 
      title: bookData.title, 
      author: bookData.author,
      isDeleted: false 
    });

    if (existingBook) {
      const error = new Error('Book with this title and author already exists');
      (error as any).statusCode = 409;
      throw error;
    }

    // Crear nuevo libro con isAvailable = true por defecto
    const book = await Book.create({
      ...bookData,
      isAvailable: true,
      isDeleted: false,
    });

    return book;
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
