import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { createBook } from './actions/create.book.action';
import { readBook } from './actions/read.book.action';
import { listBooks } from './actions/list.books.action';
import { updateBook } from './actions/update.book.action';
import { deleteBook } from './actions/delete.book.action';

export const createBookController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar permisos
    if (!req.user || !req.user.permissions.includes('create_books')) {
      const error = new Error('You do not have permission to create books');
      (error as any).statusCode = 403;
      throw error;
    }

    const bookData = req.body;

    // Crear libro
    const book = await createBook(bookData);

    // Enviar respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    next(error);
  }
};

export const readBookController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookId = req.params.id;

    // Obtener libro por ID
    const book = await readBook(bookId);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    next(error);
  }
};


export const listBooksController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer parámetros de consulta
    const {
      genre,
      author,
      title,
      publisher,
      available,
      includeDeleted,
      page = '1',
      limit = '10'
    } = req.query;

    // Analizar filtros
    const filters: any = {};

    if (genre) filters.genre = genre as string;
    if (author) filters.author = author as string;
    if (title) filters.title = title as string;
    if (publisher) filters.publisher = publisher as string;
    
    // Manejar rango de fecha de publicación con notación de corchetes
    filters.publicationDate = {};
    if (req.query['publicationDate[gte]']) {
      filters.publicationDateGte = new Date(req.query['publicationDate[gte]'] as string);
    }
    
    if (req.query['publicationDate[lte]']) {
      filters.publicationDateLte = new Date(req.query['publicationDate[lte]'] as string);
    }
    
    // Limpiar si no hay filtros de fecha
    if (!filters.publicationDateGte && !filters.publicationDateLte) {
      delete filters.publicationDate;
    }
    
    // Filtros booleanos
    if (available !== undefined) {
      filters.available = available === 'true';
    }
    
    if (includeDeleted !== undefined) {
      filters.includeDeleted = includeDeleted === 'true';
    }

    // Analizar paginación
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    // Obtener lista de libros
    const result = await listBooks(filters, pageNum, limitNum);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};


export const updateBookController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar autenticación
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      throw error;
    }

    const bookId = req.params.id;
    const updateData = req.body;
    const permissions = req.user.permissions || [];

    // Actualizar libro - la verificación de permisos se maneja en la acción
    const updatedBook = await updateBook(bookId, updateData, permissions);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
};


export const deleteBookController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verificar autenticación
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      throw error;
    }

    const bookId = req.params.id;
    const permissions = req.user.permissions || [];

    // Eliminar libro - la verificación de permisos se maneja en la acción
    const result = await deleteBook(bookId, permissions);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
