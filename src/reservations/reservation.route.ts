import { Router } from 'express';
import { verifyToken, checkPermission } from '../middleware/auth.middleware';
import { 
  validate, 
  reserveBookValidation, 
  returnBookValidation,
  getBookHistoryValidation,
  getUserReservationsValidation 
} from '../middleware/validators';
import { 
  reserveBookController,
  returnBookController,
  getBookHistoryController,
  getUserReservationsController 
} from './reservation.controller';

const reservationRoutes = Router();

// POST /api/books/:bookId/reserve - Reservar un libro (usuario autenticado)
reservationRoutes.post(
  '/books/:bookId/reserve',
  verifyToken,
  validate(reserveBookValidation),
  reserveBookController
);

// PUT /api/reservations/:id/return - Devolver un libro (usuario autenticado)
reservationRoutes.put(
  '/reservations/:id/return',
  verifyToken,
  validate(returnBookValidation),
  returnBookController
);

// GET /api/books/:bookId/history - Obtener historial de reservas de un libro (público)
reservationRoutes.get(
  '/books/:bookId/history',
  validate(getBookHistoryValidation),
  getBookHistoryController
);

// GET /api/users/:userId/reservations - Obtener historial de reservas de un usuario (propietario o permiso modify_users)
reservationRoutes.get(
  '/users/:userId/reservations',
  verifyToken,
  validate(getUserReservationsValidation),
  getUserReservationsController
);

export default reservationRoutes;
