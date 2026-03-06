import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
    path.join(__dirname, '../firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else {
    console.warn('⚠ firebase-service-account.json no encontrado. Usa variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON.');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  }
} catch (err) {
  console.error('✗ Error cargando Firebase config:', err.message);
}

if (Object.keys(serviceAccount).length > 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✓ Firebase Admin SDK inicializado');
} else {
  console.warn('⚠ Firebase no inicializado (sin credenciales válidas)');
}

export default admin;
