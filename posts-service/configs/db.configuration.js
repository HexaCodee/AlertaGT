import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnection = async () => {
  try {
    const mongoURI = process.env.URI_MONGODB || 'mongodb://localhost:27017/AlertsPosts';
    
    await mongoose.connect(mongoURI);

    console.log('✓ Conexión a MongoDB exitosa');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    throw error;
  }
};
