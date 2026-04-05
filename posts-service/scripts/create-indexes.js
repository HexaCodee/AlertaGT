const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Posts';

// Constantes de configuración
const COLLECTION_NAMES = {
    POSTS: 'posts',
    COMMENTS: 'comments'
};

async function createIndexes() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        // Índices para la colección 'posts'
        console.log('Creando índices para colección "posts"...');
        const postsCollection = db.collection(COLLECTION_NAMES.POSTS);

        // Índice geoespacial 2dsphere para búsquedas por proximidad
        await postsCollection.createIndex(
            { 'location.coordinates': '2dsphere' },
            {
                name: 'location_coordinates_2dsphere',
                background: true
            }
        );
        console.log('✅ Índice geoespacial creado: location.coordinates (2dsphere)');

        // Índices de estado y actividad
        await postsCollection.createIndex(
            { isActive: 1 },
            { name: 'isActive_index' }
        );
        console.log('✅ Índice creado: isActive');

        await postsCollection.createIndex(
            { isPublished: 1 },
            { name: 'isPublished_index' }
        );
        console.log('✅ Índice creado: isPublished');

        // Índice por categoría con collation española
        await postsCollection.createIndex(
            { category: 1 },
            { 
                name: 'category_index',
                collation: { locale: 'es', strength: 1 }
            }
        );
        console.log('✅ Índice creado: category (con collation española)');

        // Índice por autor
        await postsCollection.createIndex(
            { authorId: 1 },
            { name: 'authorId_index' }
        );
        console.log('✅ Índice creado: authorId');

        // Índice compuesto autor + activo
        await postsCollection.createIndex(
            { authorId: 1, isActive: 1 },
            { name: 'authorId_isActive' }
        );
        console.log('✅ Índice compuesto creado: authorId + isActive');

        // Índice de moderación
        await postsCollection.createIndex(
            { 'moderation.status': 1 },
            { name: 'moderation_status_index' }
        );
        console.log('✅ Índice creado: moderation.status');

        // Índice compuesto moderación + publicado
        await postsCollection.createIndex(
            { 'moderation.status': 1, isPublished: 1 },
            { name: 'moderation_status_isPublished' }
        );
        console.log('✅ Índice compuesto creado: moderation.status + isPublished');

        // Índice por fecha de creación (descendente)
        await postsCollection.createIndex(
            { createdAt: -1 },
            { name: 'createdAt_desc' }
        );
        console.log('✅ Índice creado: createdAt (descendente)');

        // Índice por riesgo con collation
        await postsCollection.createIndex(
            { riskType: 1 },
            { 
                name: 'riskType_index',
                collation: { locale: 'es', strength: 1 }
            }
        );
        console.log('✅ Índice creado: riskType (con collation española)');

        // Índice de texto para búsquedas en título y texto
        await postsCollection.createIndex(
            { title: 'text', text: 'text' },
            { 
                name: 'title_text_text_index',
                default_language: 'spanish',
                language_override: 'spanish'
            }
        );
        console.log('✅ Índice de texto creado: title + text (español)');

        // Índices para la colección 'comments'
        console.log('Creando índices para colección "comments"...');
        const commentsCollection = db.collection(COLLECTION_NAMES.COMMENTS);

        // Índice por postId + activo
        await commentsCollection.createIndex(
            { postId: 1, isActive: 1 },
            { name: 'postId_isActive' }
        );
        console.log('✅ Índice compuesto creado: postId + isActive');

        // Índice por autor + activo
        await commentsCollection.createIndex(
            { authorId: 1, isActive: 1 },
            { name: 'authorId_isActive' }
        );
        console.log('✅ Índice compuesto creado: authorId + isActive');

        // Índice por postId solo
        await commentsCollection.createIndex(
            { postId: 1 },
            { name: 'postId_index' }
        );
        console.log('✅ Índice creado: postId');

        // Índice por fecha de creación (descendente)
        await commentsCollection.createIndex(
            { createdAt: -1 },
            { name: 'createdAt_desc' }
        );
        console.log('✅ Índice creado: createdAt (descendente)');

        console.log('Todos los índices han sido creados exitosamente!');
        console.log('');
        console.log('Resumen de índices creados:');
        console.log('    POSTS:');
        console.log('   • location.coordinates: 2dsphere (búsquedas geoespaciales)');
        console.log('   • isActive, isPublished, authorId, riskType (con collation española)');
        console.log('   • category (con collation española)');
        console.log('   • authorId + isActive, moderation.status + isPublished');
        console.log('   • createdAt (descendente)');
        console.log('   • title + text: índice de texto (español)');
        console.log('    COMMENTS:');
        console.log('   • postId + isActive, authorId + isActive');
        console.log('   • postId, createdAt (descendente)');

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