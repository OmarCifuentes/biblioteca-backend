import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import authRoutes from './auth/auth.route';
import userRoutes from './users/user.route';
import bookRoutes from './books/book.route';
import reservationRoutes from './reservations/reservation.route';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI environment variable is required');
  process.exit(1);
}

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Limitación de tasa de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // 100 peticiones por ventana de tiempo
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});
app.use(limiter);

// Ruta de verificación de salud
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Biblioteca API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', reservationRoutes); // Rutas de reservaciones con paths completos

// Manejador de 404
app.use(notFoundMiddleware);

// Manejador global de errores
app.use(errorMiddleware);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
