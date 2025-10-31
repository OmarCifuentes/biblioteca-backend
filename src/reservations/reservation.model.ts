import mongoose, { Schema, model } from 'mongoose';
import { IReservation } from '../types';

const ReservationSchema: Schema = new Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Crear índices para consultas comunes
ReservationSchema.index({ bookId: 1 });
ReservationSchema.index({ userId: 1 });
ReservationSchema.index({ isActive: 1 });

export const Reservation = model<IReservation>('Reservation', ReservationSchema);
