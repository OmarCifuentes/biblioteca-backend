import mongoose from 'mongoose';
import { Book } from '../../books/book.model';
import { Reservation } from '../reservation.model';
import { IReservation } from '../../types';

interface ReservationResult {
  message: string;
  reservation: {
    _id: string;
    bookId: string;
    userId: string;
    reservationDate: Date;
  };
}

// Reserva un libro para un usuario usando una transacción para garantizar consistencia de datos
export const reserveBook = async (
  bookId: string,
  userId: string
): Promise<ReservationResult> => {
  // Crear sesión para la transacción
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      const error = new Error('Invalid book ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // 2. Buscar libro y verificar si existe y está disponible
    const book = await Book.findOne({ 
      _id: bookId, 
      isDeleted: false 
    }).session(session);

    // 3. Verificar si el libro existe
    if (!book) {
      const error = new Error('Book not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // 4. Verificar si el libro está disponible
    if (!book.isAvailable) {
      const error = new Error('Book is not available for reservation');
      (error as any).statusCode = 400;
      throw error;
    }

    // 5. Crear reserva
    const reservation = new Reservation({
      bookId,
      userId,
      reservationDate: new Date(),
      returnDate: null,
      isActive: true
    });

    await reservation.save({ session });

    // 6. Actualizar disponibilidad del libro
    book.isAvailable = false;
    await book.save({ session });

    // Confirmar la transacción
    await session.commitTransaction();
    session.endSession();

    return {
      message: "Libro reservado exitosamente",
      reservation: {
        _id: (reservation._id as any).toString(),
        bookId: (reservation.bookId as any).toString(),
        userId: (reservation.userId as any).toString(),
        reservationDate: reservation.reservationDate
      }
    };
  } catch (error) {
    // Abortar transacción en caso de error
    await session.abortTransaction();
    session.endSession();
    
    // Relanzar el error para que sea manejado por el controlador
    throw error;
  }
};
