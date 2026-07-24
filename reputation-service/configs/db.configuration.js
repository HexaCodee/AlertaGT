import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

dns.setServers(['8.8.8.8', '8.8.8.8']); // Forzar DNS de Google (fix para ECONNREFUSED en querySrv)

export const dbConnection = async () => {
  try {
    const mongoURI = process.env.URI_MONGODB || 'mongodb://localhost:27017';
    const dbName = process.env.DATABASE_NAME || 'AlertaGtRepu';
    
    await mongoose.connect(mongoURI, { dbName });

    console.log(`✓ MongoDB conectado: ${mongoURI}/${dbName}`);
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error.message);
    throw error;
  }
};