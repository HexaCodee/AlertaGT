const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Geo';

// Constantes de configuración
const COLLECTION_NAMES = {
    USER_LOCATIONS: 'userlocations'
};

async function createIndexes() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        // Índices para la colección 'userlocations'
        console.log('Creando índices para colección "userlocations"...');
        const userLocationsCollection = db.collection(COLLECTION_NAMES.USER_LOCATIONS);

        // Índice geoespacial 2dsphere para búsquedas por proximidad
        await userLocationsCollection.createIndex(
            { location: '2dsphere' },
            {
                name: 'location_2dsphere',
                background: true
            }
        );
        console.log('✅ Índice geoespacial creado: location (2dsphere)');

        // Índice único en userId
        await userLocationsCollection.createIndex(
            { userId: 1 },
            {
                unique: true,
                sparse: true,
                name: 'userId_unique'
            }
        );
        console.log('✅ Índice único creado: userId');

        // Índice en isActive para filtrar usuarios activos
        await userLocationsCollection.createIndex(
            { isActive: 1 },
            {
                name: 'isActive_index'
            }
        );
        console.log('✅ Índice creado: isActive');

        // Índice compuesto para búsquedas activas recientes
        await userLocationsCollection.createIndex(
            { isActive: 1, lastLocationUpdate: -1 },
            {
                name: 'isActive_lastLocationUpdate'
            }
        );
        console.log('✅ Índice compuesto creado: isActive + lastLocationUpdate (desc)');

        // Índice en lastLocationUpdate para ordenamiento
        await userLocationsCollection.createIndex(
            { lastLocationUpdate: -1 },
            {
                name: 'lastLocationUpdate_desc'
            }
        );
        console.log('✅ Índice creado: lastLocationUpdate (descendente)');

        // Índice en searchRadius para optimizar consultas de radio
        await userLocationsCollection.createIndex(
            { searchRadius: 1 },
            {
                name: 'searchRadius_index'
            }
        );
        console.log('✅ Índice creado: searchRadius');

        console.log('Todos los índices geoespaciales han sido creados exitosamente!');
        console.log('');
        console.log('Resumen de índices creados:');
        console.log('   • location: 2dsphere (búsquedas geoespaciales)');
        console.log('   • userId: unique (usuario único por ubicación)');
        console.log('   • isActive: filtrado de usuarios activos');
        console.log('   • isActive + lastLocationUpdate: usuarios activos recientes');
        console.log('   • lastLocationUpdate: ordenamiento por actualización');
        console.log('   • searchRadius: optimización de consultas por radio');

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