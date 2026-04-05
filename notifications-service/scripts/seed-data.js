const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Notifications';

// Constantes de configuración
const COLLECTION_NAMES = {
    NOTIFICATIONS: 'notifications'
};

// Datos de prueba para desarrollo
const TEST_NOTIFICATIONS = [
    {
        userId: 'test-user-001',
        postId: 'test-post-001',
        type: 'NEW_ALERT',
        title: 'Nueva alerta cercana',
        body: 'Se reportó un accidente a 320m de tu ubicación',
        data: {
            distance: 320,
            category: 'ACCIDENTE',
            riskType: 'GRAVE',
            latitude: 14.6349,
            longitude: -90.5069
        },
        read: false
    },
    {
        userId: 'test-user-002',
        postId: 'test-post-002',
        type: 'NEW_COMMENT',
        title: 'Nuevo comentario en tu alerta',
        body: 'Alguien comentó en tu publicación sobre el tráfico',
        data: {
            commentId: 'test-comment-001',
            commentText: 'Gracias por la información...'
        },
        read: false
    },
    {
        userId: 'test-user-003',
        postId: 'test-post-003',
        type: 'MODERATION',
        title: 'Publicación moderada',
        body: 'Tu alerta ha sido aprobada y publicada',
        data: {
            moderationStatus: 'APPROVED',
            moderatorComments: 'Información verificada y útil'
        },
        read: true,
        readAt: new Date(Date.now() - 3600000) // Leída hace 1 hora
    },
    {
        userId: 'test-user-001',
        postId: 'test-post-004',
        type: 'NEARBY_ALERT_CRITICAL',
        title: '¡Alerta crítica cercana!',
        body: 'Accidente grave reportado a 1.2km - Boulevard Liberación bloqueado',
        data: {
            distance: 1200,
            category: 'ACCIDENTE',
            riskType: 'GRAVE',
            latitude: 14.6349,
            longitude: -90.5069,
            address: 'Boulevard Liberación, Antigua Guatemala'
        },
        read: false
    },
    {
        userId: 'test-user-002',
        postId: 'test-post-005',
        type: 'SYSTEM',
        title: 'Bienvenido a AlertaGT',
        body: 'Tu cuenta ha sido activada. ¡Comienza a reportar alertas!',
        data: {
            welcome: true,
            tips: 'Mantén tu ubicación actualizada para recibir alertas relevantes'
        },
        read: true,
        readAt: new Date(Date.now() - 7200000) // Leída hace 2 horas
    }
];

async function seedData() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        const collection = db.collection(COLLECTION_NAMES.NOTIFICATIONS);

        // Verificar si ya existen notificaciones de prueba
        const existingCount = await collection.countDocuments({
            userId: { $regex: /^test-user-/ }
        });
        console.log(`Notificaciones de prueba existentes: ${existingCount}`);

        if (existingCount === 0) {
            console.log(' Creando notificaciones de prueba para desarrollo...');

            const notificationsToInsert = TEST_NOTIFICATIONS.map((notification, index) => ({
                ...notification,
                sentViaFCM: Math.random() > 0.3, // 70% enviadas por FCM
                fcmResponse: Math.random() > 0.3 ? { success: true, messageId: `fcm-${index}` } : null,
                createdAt: new Date(Date.now() - (index * 1800000)), // Notificaciones en diferentes tiempos (30 min intervalo)
                updatedAt: new Date(Date.now() - (index * 1800000))
            }));

            const result = await collection.insertMany(notificationsToInsert);
            console.log(`✅ Notificaciones de prueba creadas: ${result.insertedCount}`);

            TEST_NOTIFICATIONS.forEach((notification, index) => {
                const status = notification.read ? '✅ Leída' : ' No leída';
                console.log(`   ${status} ${notification.type}: "${notification.title}"`);
            });

            console.log('');
            console.log('Resumen de tipos de notificación creados:');
            const typeCount = TEST_NOTIFICATIONS.reduce((acc, notif) => {
                acc[notif.type] = (acc[notif.type] || 0) + 1;
                return acc;
            }, {});
            Object.entries(typeCount).forEach(([type, count]) => {
                console.log(`   • ${type}: ${count} notificaciones`);
            });

        } else {
            console.log('⚠️  Ya existen notificaciones de prueba, saltando creación.');
        }

        // Mostrar estadísticas
        const totalNotifications = await collection.countDocuments();
        const unreadCount = await collection.countDocuments({ read: false });
        const readCount = await collection.countDocuments({ read: true });

        console.log('');
        console.log('📈 Estadísticas de notificaciones:');
        console.log(`   • Total: ${totalNotifications}`);
        console.log(`   • No leídas: ${unreadCount}`);
        console.log(`   • Leídas: ${readCount}`);

        console.log('Seed de datos de notificaciones completado!');
        console.log('');
        console.log('NOTA: Estos datos son solo para desarrollo/testing.');
        console.log('   En producción, eliminar estos datos de prueba.');

    } catch (error) {
        console.error('❌ Error en seed de datos:', error);
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
    seedData();
}

module.exports = { seedData };