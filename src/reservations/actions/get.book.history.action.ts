import mongoose from 'mongoose';
import { Reservation } from '../reservation.model';
import { Book } from '../../books/book.model';

interface ReservationHistory {
  _id: string;
  userId: string;
  userName?: string;
  reservationDate: Date;
  returnDate: Date | null;
  isActive: boolean;
}

interface BookHistoryResult {
  book: {
    _id: string;
    title: string;
    author: string;
    isAvailable: boolean;
  };
  reservations: ReservationHistory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    reservationsPerPage: number;
    totalReservations: number;
  };
}

// Obtiene el historial de reservas de un libro específico con paginación
export const getBookHistory = async (
  bookId: string,
  page: number = 1,
  limit: number = 10
): Promise<BookHistoryResult> => {
  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const error = new Error('Invalid book ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // 2. Buscar libro y verificar si existe
    const book = await Book.findOne({ 
      _id: bookId,
      isDeleted: false
    });

    // 3. Verificar si el libro existe
    if (!book) {
      const error = new Error('Book not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // 4. Calcular paginación
    const skip = (page - 1) * limit;

    // 5. Obtener conteo total para paginación
    const totalReservations = await Reservation.countDocuments({ bookId });

    // 6. Obtener reservas del libro con paginación
    const reservations = await Reservation.find({ bookId })
      .sort({ reservationDate: -1 }) // Más recientes primero
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name'); // Obtener nombre de usuario

    // 7. Formatear la respuesta
    const formattedReservations = reservations.map(reservation => ({
      _id: (reservation._id as any).toString(),
      userId: (reservation.userId as any)._id.toString(),
      userName: (reservation.userId as any).name,
      reservationDate: reservation.reservationDate,
      returnDate: reservation.returnDate,
      isActive: reservation.isActive
    }));

    return {
      book: {
        _id: (book._id as any).toString(),
        title: book.title,
        author: book.author,
        isAvailable: book.isAvailable
      },
      reservations: formattedReservations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReservations / limit),
        reservationsPerPage: limit,
        totalReservations
      }
    };
  } catch (error) {
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
