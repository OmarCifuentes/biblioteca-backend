import { Book } from '../book.model';

interface ListFilters {
  genre?: string;
  author?: string;
  title?: string;
  publisher?: string;
  publicationDateGte?: Date;
  publicationDateLte?: Date;
  available?: boolean;
  includeDeleted?: boolean;
}

interface PaginationResult {
  books: Array<{ _id: string; title: string }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    booksPerPage: number;
    totalBooks: number;
  };
}

// Lista libros con filtros y paginación - Soporta búsqueda por texto, fechas, disponibilidad y estado de borrado
export const listBooks = async (
  filters: ListFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult> => {
  try {
    // Construir consulta dinámica
    const query: any = {};

    // Por defecto, excluir libros eliminados a menos que includeDeleted sea true
    if (!filters.includeDeleted) {
      query.isDeleted = false;
    }

    // Aplicar filtros si están presentes - Filtros de texto con coincidencia parcial insensible a mayúsculas
    if (filters.author) {
      query.author = { $regex: filters.author, $options: 'i' };
    }

    if (filters.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }

    if (filters.publisher) {
      query.publisher = { $regex: filters.publisher, $options: 'i' };
    }
    
    // Filtro de género (coincidencia exacta, insensible a mayúsculas)
    if (filters.genre) {
      query.genre = { $regex: `^${filters.genre}$`, $options: 'i' };
    }

    if (filters.publicationDateGte || filters.publicationDateLte) {
      query.publicationDate = {};
      
      if (filters.publicationDateGte) {
        query.publicationDate.$gte = filters.publicationDateGte;
      }
      
      if (filters.publicationDateLte) {
        query.publicationDate.$lte = filters.publicationDateLte;
      }
    }

    if (filters.available !== undefined) {
      query.isAvailable = filters.available;
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener conteo total para paginación
    const totalBooks = await Book.countDocuments(query);

    // Obtener libros con paginación - solo devolver _id y título
    const books = await Book.find(query)
      .select('_id title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Más recientes primero

    // Calcular total de páginas
    const totalPages = Math.ceil(totalBooks / limit);

    return {
      books: books.map(book => ({
        _id: (book._id as any).toString(),
        title: book.title
      })),
      pagination: {
        currentPage: page,
        totalPages,
        booksPerPage: limit,
        totalBooks
      }
    };
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
