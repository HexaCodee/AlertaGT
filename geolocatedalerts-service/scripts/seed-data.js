const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Geo';

// Constantes de configuración
const COLLECTION_NAMES = {
    USER_LOCATIONS: 'userlocations'
};

// Ubicaciones de prueba en Guatemala (coordenadas reales)
const TEST_LOCATIONS = [
    {
        userId: 'test-user-001',
        latitude: 14.6349,  // Antigua Guatemala
        longitude: -90.5069,
        address: 'Antigua Guatemala, Sacatepéquez',
        fcmToken: 'test-fcm-token-001',
        searchRadius: 5000
    },
    {
        userId: 'test-user-002',
        latitude: 14.8406,  // Quetzaltenango (Xela)
        longitude: -91.5181,
        address: 'Quetzaltenango, Guatemala',
        fcmToken: 'test-fcm-token-002',
        searchRadius: 3000
    },
    {
        userId: 'test-user-003',
        latitude: 14.5873,  // Guatemala City - Zona 1
        longitude: -90.5534,
        address: 'Zona 1, Ciudad de Guatemala',
        fcmToken: 'test-fcm-token-003',
        searchRadius: 2000
    },
    {
        userId: 'test-user-004',
        latitude: 14.6128,  // Mixco
        longitude: -90.6060,
        address: 'Mixco, Guatemala',
        fcmToken: 'test-fcm-token-004',
        searchRadius: 2500
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

        const collection = db.collection(COLLECTION_NAMES.USER_LOCATIONS);

        // Verificar si ya existen datos de prueba
        const existingCount = await collection.countDocuments({
            userId: { $regex: /^test-user-/ }
        });
        console.log(` Ubicaciones de prueba existentes: ${existingCount}`);

        if (existingCount === 0) {
            console.log('🌱 Creando ubicaciones de prueba para desarrollo...');

            const seedData = TEST_LOCATIONS.map(location => ({
                userId: location.userId,
                location: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude] // [lng, lat]
                },
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
                isActive: true,
                lastLocationUpdate: new Date(),
                fcmToken: location.fcmToken,
                searchRadius: location.searchRadius,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            const result = await collection.insertMany(seedData);
            console.log(`✅ Ubicaciones de prueba creadas: ${result.insertedCount}`);

            TEST_LOCATIONS.forEach((location, index) => {
                console.log(`    ${location.userId}: ${location.address} (${location.latitude}, ${location.longitude})`);
            });

            console.log('');
            console.log(' NOTA: Estas ubicaciones son solo para desarrollo/testing.');
            console.log('   En producción, eliminar estos datos de prueba.');

        } else {
            console.log('⚠️  Ya existen ubicaciones de prueba, saltando creación.');
        }

        // Verificar índices geoespaciales
        console.log('🔍 Verificando índices geoespaciales...');
        const indexes = await collection.listIndexes().toArray();
        const has2dSphereIndex = indexes.some(index =>
            index.name === 'location_2dsphere' ||
            (index.key && index.key.location === '2dsphere')
        );

        if (has2dSphereIndex) {
            console.log('✅ Índice geoespacial 2dsphere encontrado');
        } else {
            console.log('⚠️  ADVERTENCIA: No se encontró índice geoespacial 2dsphere');
            console.log('   Ejecutar: node scripts/create-indexes.js');
        }

        console.log('Seed de datos geoespaciales completado!');

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