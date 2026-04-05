const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Posts';

// Constantes de configuración
const COLLECTION_NAMES = {
    POSTS: 'posts',
    COMMENTS: 'comments'
};

// Datos de prueba para desarrollo
const TEST_POSTS = [
    {
        title: 'Accidente en Boulevard Liberación',
        category: 'ACCIDENTE',
        riskType: 'GRAVE',
        text: 'Accidente grave en Boulevard Liberación a la altura del Parque La Concordia. Múltiples vehículos involucrados. Tráfico completamente detenido.',
        authorId: 'test-user-001',
        location: {
            type: 'Point',
            coordinates: [-90.5069, 14.6349], // Antigua Guatemala [lng, lat]
            latitude: 14.6349,
            longitude: -90.5069,
            address: 'Boulevard Liberación, Antigua Guatemala',
            manual: false
        },
        isActive: true,
        isPublished: true,
        moderation: {
            status: 'APPROVED',
            moderatorId: 'admin-user',
            comments: 'Información verificada',
            moderatedAt: new Date()
        }
    },
    {
        title: 'Tráfico intenso en Calzada Roosevelt',
        category: 'TRAFICO',
        riskType: 'MODERADO',
        text: 'Tráfico muy lento en Calzada Roosevelt dirección al sur. Parece haber un accidente menor.',
        authorId: 'test-user-002',
        location: {
            type: 'Point',
            coordinates: [-90.5534, 14.5873], // Zona 1, Guatemala City
            latitude: 14.5873,
            longitude: -90.5534,
            address: 'Calzada Roosevelt, Zona 1',
            manual: false
        },
        isActive: true,
        isPublished: true,
        moderation: {
            status: 'APPROVED',
            moderatorId: 'admin-user',
            comments: 'Tráfico reportado confirmado',
            moderatedAt: new Date()
        }
    },
    {
        title: 'Zona peligrosa en la noche',
        category: 'PELIGRO',
        riskType: 'LEVE',
        text: 'Área con poca iluminación en la zona 18. Recomiendo evitar transitar solo por la noche.',
        authorId: 'test-user-003',
        location: {
            type: 'Point',
            coordinates: [-90.4800, 14.6000], // Zona aproximada
            latitude: 14.6000,
            longitude: -90.4800,
            address: 'Zona 18, Ciudad de Guatemala',
            manual: true
        },
        isActive: true,
        isPublished: true,
        moderation: {
            status: 'APPROVED',
            moderatorId: 'admin-user',
            comments: 'Información útil para seguridad',
            moderatedAt: new Date()
        }
    }
];

const TEST_COMMENTS = [
    {
        postId: null, // Se asignará después de crear posts
        authorId: 'test-user-002',
        text: 'Gracias por la información. Voy a tomar otra ruta.',
        isActive: true
    },
    {
        postId: null, // Se asignará después de crear posts
        authorId: 'test-user-003',
        text: '¿Ya llegó la policía? ¿Hay heridos?',
        isActive: true
    },
    {
        postId: null, // Se asignará después de crear posts
        authorId: 'test-user-001',
        text: 'Efectivamente, hay mucho tráfico. Tardé 45 minutos en pasar.',
        isActive: true
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

        const postsCollection = db.collection(COLLECTION_NAMES.POSTS);
        const commentsCollection = db.collection(COLLECTION_NAMES.COMMENTS);

        // Verificar si ya existen posts de prueba
        const existingPostsCount = await postsCollection.countDocuments({
            authorId: { $regex: /^test-user-/ }
        });
        console.log(`Posts de prueba existentes: ${existingPostsCount}`);

        let createdPostIds = [];

        if (existingPostsCount === 0) {
            console.log('Creando posts de prueba para desarrollo...');

            const postsToInsert = TEST_POSTS.map(post => ({
                ...post,
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            const result = await postsCollection.insertMany(postsToInsert);
            console.log(`✅ Posts de prueba creados: ${result.insertedCount}`);

            // Obtener los IDs de los posts creados
            createdPostIds = Object.values(result.insertedIds);

            TEST_POSTS.forEach((post, index) => {
                const postId = createdPostIds[index];
                console.log(`   Post ${index + 1}: "${post.title}" (ID: ${postId})`);
            });

        } else {
            console.log('⚠️  Ya existen posts de prueba, saltando creación.');
            // Obtener IDs de posts existentes para comentarios
            const existingPosts = await postsCollection.find({
                authorId: { $regex: /^test-user-/ }
            }).project({ _id: 1 }).toArray();
            createdPostIds = existingPosts.map(p => p._id);
        }

        // Crear comentarios si hay posts disponibles
        if (createdPostIds.length > 0) {
            const existingCommentsCount = await commentsCollection.countDocuments({
                authorId: { $regex: /^test-user-/ }
            });
            console.log(` Comentarios de prueba existentes: ${existingCommentsCount}`);

            if (existingCommentsCount === 0) {
                console.log(' Creando comentarios de prueba...');

                const commentsToInsert = TEST_COMMENTS.map((comment, index) => ({
                    ...comment,
                    postId: createdPostIds[index % createdPostIds.length], // Distribuir comentarios entre posts
                    createdAt: new Date(Date.now() - (index * 60000)), // Comentarios en diferentes tiempos
                    updatedAt: new Date(Date.now() - (index * 60000))
                }));

                const result = await commentsCollection.insertMany(commentsToInsert);
                console.log(`✅ Comentarios de prueba creados: ${result.insertedCount}`);

                commentsToInsert.forEach((comment, index) => {
                    console.log(`    Comentario ${index + 1}: "${comment.text.substring(0, 30)}..."`);
                });
            } else {
                console.log('⚠️  Ya existen comentarios de prueba, saltando creación.');
            }
        }

        // Verificar índices
        console.log(' Verificando índices...');
        const postsIndexes = await postsCollection.listIndexes().toArray();
        const has2dSphereIndex = postsIndexes.some(index =>
            index.name === 'location_coordinates_2dsphere' ||
            (index.key && index.key['location.coordinates'] === '2dsphere')
        );

        if (has2dSphereIndex) {
            console.log('✅ Índice geoespacial 2dsphere encontrado en posts');
        } else {
            console.log('⚠️  ADVERTENCIA: No se encontró índice geoespacial 2dsphere en posts');
            console.log('   Ejecutar: node scripts/create-indexes.js');
        }

        console.log('Seed de datos de posts completado!');
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