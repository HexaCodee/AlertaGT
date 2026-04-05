const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Auth';

// Constantes de roles
const ROLES = {
    ADMIN_ROLE: 'ADMIN_ROLE',
    USER_ROLE: 'USER_ROLE'
};

async function createIndexes() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        // Índices para la colección 'users'
        console.log('Creando índices para colección "users"...');
        const usersCollection = db.collection('users');

        await usersCollection.createIndex(
            { username: 1 },
            {
                unique: true,
                sparse: true,
                name: 'username_unique'
            }
        );
        console.log('✅ Índice único creado: username');

        await usersCollection.createIndex(
            { email: 1 },
            {
                unique: true,
                sparse: true,
                name: 'email_unique'
            }
        );
        console.log('✅ Índice único creado: email');

        // Índices para la colección 'roles'
        console.log('Creando índices para colección "roles"...');
        const rolesCollection = db.collection('roles');

        await rolesCollection.createIndex(
            { name: 1 },
            {
                unique: true,
                sparse: true,
                name: 'role_name_unique'
            }
        );
        console.log('✅ Índice único creado: role_name');

        // Índices para la colección 'user_emails'
        console.log('Creando índices para colección "user_emails"...');
        const userEmailsCollection = db.collection('user_emails');

        await userEmailsCollection.createIndex(
            { userId: 1 },
            {
                unique: true,
                sparse: true,
                name: 'user_email_userId_unique'
            }
        );
        console.log('✅ Índice único creado: user_emails.userId');

        // Índices para la colección 'user_password_resets'
        console.log('Creando índices para colección "user_password_resets"...');
        const userPasswordResetsCollection = db.collection('user_password_resets');

        await userPasswordResetsCollection.createIndex(
            { userId: 1 },
            {
                unique: true,
                sparse: true,
                name: 'user_password_reset_userId_unique'
            }
        );
        console.log('✅ Índice único creado: user_password_resets.userId');

        // Índices adicionales de rendimiento
        console.log('Creando índices de rendimiento adicionales...');

        await usersCollection.createIndex(
            { status: 1, createdAt: -1 },
            { name: 'status_createdAt' }
        );
        console.log('✅ Índice compuesto creado: users.status + createdAt');

        await usersCollection.createIndex(
            { createdAt: -1 },
            { name: 'createdAt_desc' }
        );
        console.log('✅ Índice creado: users.createdAt (descendente)');

        console.log('Todos los índices han sido creados exitosamente!');

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