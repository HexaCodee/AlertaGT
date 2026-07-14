const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Reputation';

const COLLECTION_NAMES = {
  REPORTS: 'reports',
  RATINGS: 'ratings',
  REPUTATIONS: 'reputations',
  ALERT_VERDICTS: 'alertverdicts',
};

async function createIndexes() {
  let client;

  try {
    console.log('🔗 Conectando a MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    console.log(`Base de datos: ${DATABASE_NAME}`);

    // ── reports ──
    console.log('Creando índices para colección "reports"...');
    const reports = db.collection(COLLECTION_NAMES.REPORTS);
    await reports.createIndex({ postId: 1, reporterId: 1 }, { unique: true, name: 'postId_reporterId_unique' });
    console.log('✅ Índice único creado: postId + reporterId (un reporte por usuario y alerta)');
    await reports.createIndex({ postId: 1 }, { name: 'postId_index' });
    await reports.createIndex({ authorId: 1 }, { name: 'authorId_index' });
    await reports.createIndex({ status: 1, createdAt: -1 }, { name: 'status_createdAt_desc' });
    console.log('✅ Índices creados: postId, authorId, status + createdAt');

    // ── ratings ──
    console.log('Creando índices para colección "ratings"...');
    const ratings = db.collection(COLLECTION_NAMES.RATINGS);
    await ratings.createIndex({ raterId: 1, targetUserId: 1, postId: 1 }, { unique: true, name: 'rater_target_post_unique' });
    console.log('✅ Índice único creado: raterId + targetUserId + postId (una calificación por alerta)');
    await ratings.createIndex({ targetUserId: 1, createdAt: -1 }, { name: 'targetUserId_createdAt_desc' });
    console.log('✅ Índice creado: targetUserId + createdAt');

    // ── reputations ──
    console.log('Creando índices para colección "reputations"...');
    const reputations = db.collection(COLLECTION_NAMES.REPUTATIONS);
    await reputations.createIndex({ trustScore: -1 }, { name: 'trustScore_desc' });
    await reputations.createIndex({ status: 1 }, { name: 'status_index' });
    console.log('✅ Índices creados: trustScore, status');

    // ── alertverdicts ──
    console.log('Creando índices para colección "alertverdicts"...');
    const verdicts = db.collection(COLLECTION_NAMES.ALERT_VERDICTS);
    await verdicts.createIndex({ authorId: 1 }, { name: 'authorId_index' });
    await verdicts.createIndex({ verdict: 1 }, { name: 'verdict_index' });
    console.log('✅ Índices creados: authorId, verdict');

    console.log('\nTodos los índices han sido creados exitosamente!');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('Conexión cerrada.');
    }
  }
}

if (require.main === module) {
  createIndexes();
}

module.exports = { createIndexes };
