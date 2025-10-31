import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/biblioteca';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Manejar terminación de la aplicación
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});
