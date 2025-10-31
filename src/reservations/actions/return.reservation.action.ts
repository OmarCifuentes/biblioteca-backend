import { Reservation } from '../reservation.model';
import { Book } from '../../books/book.model';
import mongoose from 'mongoose';

export const returnBook = async (
  reservationId: string, 
  userId: string,
  permissions: string[] = []
) => {
  // Buscar reserva
  const reservation = await Reservation.findById(reservationId);
  
  // Reserva no encontrada
  if (!reservation) {
    const error = new Error('Reservation not found');
    (error as any).statusCode = 404;
    throw error;
  }
  
  // Ya devuelto
  if (reservation.returnDate !== null) {
    const error = new Error('Book already returned');
    (error as any).statusCode = 400;
    throw error;
  }
  
  // Obtener userId como string (maneja tanto ObjectId como usuario poblado)
  const reservationUserId = String(
    (reservation.userId as any)._id || reservation.userId
  );
  
  // Verificar permisos: propietario o admin con modify_users
  const isOwner = reservationUserId === userId;
  const hasPermission = permissions.includes('modify_users');
  
  if (!isOwner && !hasPermission) {
    const error = new Error('You do not have permission to return this reservation');
    (error as any).statusCode = 403;
    throw error;
  }
  
  // Iniciar transacción
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Actualizar reserva
    reservation.returnDate = new Date();
    await reservation.save({ session });
    
    // Actualizar disponibilidad del libro
    await Book.findByIdAndUpdate(
      reservation.bookId,
      { isAvailable: true },
      { session }
    );
    
    await session.commitTransaction();
    
    // Poblar y devolver
    await reservation.populate('bookId userId');
    
    return reservation;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
