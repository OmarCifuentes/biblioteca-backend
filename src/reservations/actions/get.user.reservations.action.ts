import mongoose from 'mongoose';
import { Reservation } from '../reservation.model';
import { User } from '../../users/user.model';

interface UserReservation {
  _id: string;
  bookId: string;
  bookTitle?: string;
  reservationDate: Date;
  returnDate: Date | null;
  isActive: boolean;
}

interface UserReservationsResult {
  user: {
    _id: string;
    name: string;
  };
  reservations: UserReservation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    reservationsPerPage: number;
    totalReservations: number;
  };
}

// Obtiene el historial de reservas de un usuario específico con filtros y paginación
export const getUserReservations = async (
  userId: string,
  status: 'active' | 'returned' | 'all' = 'all',
  page: number = 1,
  limit: number = 10,
  requestingUserId: string,
  permissions: string[] = []
): Promise<UserReservationsResult> => {
  try {
    // 1. Validar si el ID proporcionado es un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error('Invalid user ID format');
      (error as any).statusCode = 400;
      throw error;
    }

    // 2. Buscar usuario y verificar si existe
    const user = await User.findOne({ 
      _id: userId,
      isDeleted: false
    }).select('-password');

    // 3. Verificar si el usuario existe
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    // 4. Verificar permisos - solo el propio usuario o usuarios con permiso modify_users pueden ver
    const isOwner = userId === requestingUserId;
    const hasPermission = permissions.includes('modify_users');
    
    if (!isOwner && !hasPermission) {
      const error = new Error('You do not have permission to view this user\'s reservations');
      (error as any).statusCode = 403;
      throw error;
    }

    // 5. Construir consulta basada en el filtro de estado
    const query: any = { userId };
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'returned') {
      query.isActive = false;
      query.returnDate = { $ne: null };
    }

    // 6. Calcular paginación
    const skip = (page - 1) * limit;

    // 7. Obtener conteo total para paginación
    const totalReservations = await Reservation.countDocuments(query);

    // 8. Obtener reservas del usuario con paginación
    const reservations = await Reservation.find(query)
      .sort({ reservationDate: -1 }) // Más recientes primero
      .skip(skip)
      .limit(limit)
      .populate('bookId', 'title'); // Obtener título del libro

    // 9. Formatear la respuesta
    const formattedReservations = reservations.map(reservation => ({
      _id: (reservation._id as any).toString(),
      bookId: (reservation.bookId as any)._id.toString(),
      bookTitle: (reservation.bookId as any).title,
      reservationDate: reservation.reservationDate,
      returnDate: reservation.returnDate,
      isActive: reservation.isActive
    }));

    return {
      user: {
        _id: (user._id as any).toString(),
        name: user.name
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
