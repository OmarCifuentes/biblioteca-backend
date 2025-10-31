import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { reserveBook } from './actions/reserve.reservation.action';
import { returnBook } from './actions/return.reservation.action';
import { getBookHistory } from './actions/get.book.history.action';
import { getUserReservations } from './actions/get.user.reservations.action';

export const reserveBookController = async (
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

    const bookId = req.params.bookId;
    const userId = req.user.userId;

    // Reservar libro
    const result = await reserveBook(bookId, userId);

    // Enviar respuesta exitosa
    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const returnBookController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reservationId = req.params.id;
    const userId = req.user!.userId;
    const permissions = req.user!.permissions || [];

    const reservation = await returnBook(reservationId, userId, permissions);

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

export const getBookHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Obtener historial del libro
    const result = await getBookHistory(bookId, page, limit);

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReservationsController = async (
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

    const userId = req.params.userId;
    const status = (req.query.status as 'active' | 'returned' | 'all') || 'all';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const requestingUserId = req.user.userId;
    const permissions = req.user.permissions || [];

    // Obtener reservas del usuario
    const result = await getUserReservations(
      userId,
      status,
      page,
      limit,
      requestingUserId,
      permissions
    );

    // Enviar respuesta exitosa
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
