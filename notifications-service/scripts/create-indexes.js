const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Notifications';

// Constantes de configuración
const COLLECTION_NAMES = {
    NOTIFICATIONS: 'notifications'
};

async function createIndexes() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        // Índices para la colección 'notifications'
        console.log('Creando índices para colección "notifications"...');
        const notificationsCollection = db.collection(COLLECTION_NAMES.NOTIFICATIONS);

        // Índice compuesto userId + createdAt (descendente) para listar notificaciones de un usuario
        await notificationsCollection.createIndex(
            { userId: 1, createdAt: -1 },
            { name: 'userId_createdAt_desc' }
        );
        console.log('✅ Índice compuesto creado: userId + createdAt (descendente)');

        // Índice compuesto read + userId para filtrar notificaciones no leídas
        await notificationsCollection.createIndex(
            { read: 1, userId: 1 },
            { name: 'read_userId' }
        );
        console.log('✅ Índice compuesto creado: read + userId');

        // Índice por postId para agrupar notificaciones de una publicación
        await notificationsCollection.createIndex(
            { postId: 1 },
            { name: 'postId_index' }
        );
        console.log('✅ Índice creado: postId');

        // Índice por tipo de notificación
        await notificationsCollection.createIndex(
            { type: 1 },
            { name: 'type_index' }
        );
        console.log('✅ Índice creado: type');

        // Índice compuesto tipo + usuario para notificaciones específicas
        await notificationsCollection.createIndex(
            { type: 1, userId: 1 },
            { name: 'type_userId' }
        );
        console.log('✅ Índice compuesto creado: type + userId');

        // Índice por estado de envío FCM
        await notificationsCollection.createIndex(
            { sentViaFCM: 1 },
            { name: 'sentViaFCM_index' }
        );
        console.log('✅ Índice creado: sentViaFCM');

        // Índice por fecha de lectura
        await notificationsCollection.createIndex(
            { readAt: -1 },
            {
                name: 'readAt_desc',
                sparse: true
            }
        );
        console.log('✅ Índice creado: readAt (descendente, sparse)');

        // Índice solo por userId
        await notificationsCollection.createIndex(
            { userId: 1 },
            { name: 'userId_index' }
        );
        console.log('✅ Índice creado: userId');

        // Índice por fecha de creación (descendente) para ordenamiento general
        await notificationsCollection.createIndex(
            { createdAt: -1 },
            { name: 'createdAt_desc' }
        );
        console.log('✅ Índice creado: createdAt (descendente)');

        console.log('Todos los índices han sido creados exitosamente!');
        console.log('');
        console.log('Resumen de índices creados:');
        console.log('   🔔 NOTIFICATIONS:');
        console.log('   • userId + createdAt: listar notificaciones por usuario (recientes primero)');
        console.log('   • read + userId: filtrar notificaciones no leídas');
        console.log('   • postId: agrupar por publicación');
        console.log('   • type, type + userId: filtrar por tipo de notificación');
        console.log('   • sentViaFCM: estado de envío push');
        console.log('   • readAt: fecha de lectura');
        console.log('   • userId, createdAt: índices individuales');

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

// Ejecutar si se llama directamente
if (require.main === module) {
    createIndexes();
}

module.exports = { createIndexes };