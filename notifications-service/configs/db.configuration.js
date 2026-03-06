import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications-service');
    console.log(`✓ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('✗ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }
};
