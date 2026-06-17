import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DATABASE_NAME || 'AlertaGT_Posts';
    
    await mongoose.connect(mongoURI, { dbName });

    console.log(`✓ MongoDB conectado: ${mongoURI}/${dbName}`);
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    throw error;
  }
};