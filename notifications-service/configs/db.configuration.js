import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.8.8']); // Forzar DNS de Google (fix para ECONNREFUSED en querySrv)

export const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.URI_MONGODB || 'mongodb://localhost:27017/AlertaGT_Noti'
    );
    console.log(`✓ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('✗ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};