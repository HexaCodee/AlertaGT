const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'AlertaGT_Auth';

// Constantes de roles
const ROLES = {
    ADMIN_ROLE: 'ADMIN_ROLE',
    USER_ROLE: 'USER_ROLE'
};

// Función para generar IDs únicos (simulando UuidGenerator.GenerateRoleId/GenerateUserId)
function generateId() {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
}

// Función simple para hash de contraseña (en producción usar Argon2)
function hashPassword(password) {
    // NOTA: En producción, usar la implementación real de Argon2 del servicio
    // Esta es solo una implementación de ejemplo para el seed
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `$pbkdf2-sha512$1000$${salt}$${hash}`;
}

async function seedData() {
    let client;

    try {
        console.log('🔗 Conectando a MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DATABASE_NAME);
        console.log(`Base de datos: ${DATABASE_NAME}`);

        // Verificar si ya existen roles
        const rolesCount = await db.collection('roles').countDocuments();
        console.log(`Roles existentes: ${rolesCount}`);

        if (rolesCount === 0) {
            console.log('Creando roles iniciales...');

            const roles = [
                {
                    _id: generateId(),
                    name: ROLES.ADMIN_ROLE,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: generateId(),
                    name: ROLES.USER_ROLE,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            const result = await db.collection('roles').insertMany(roles);
            console.log(`✅ Roles creados: ${result.insertedCount}`);
            console.log(`   - ADMIN_ROLE: ${roles[0]._id}`);
            console.log(`   - USER_ROLE: ${roles[1]._id}`);
        } else {
            console.log('⚠️  Los roles ya existen, saltando creación.');
        }

        // Verificar si ya existen usuarios
        const usersCount = await db.collection('users').countDocuments();
        console.log(`👥 Usuarios existentes: ${usersCount}`);

        if (usersCount === 0) {
            console.log('Creando usuario administrador...');

            // Obtener el rol de administrador
            const adminRole = await db.collection('roles').findOne({ name: ROLES.ADMIN_ROLE });
            if (!adminRole) {
                throw new Error('No se encontró el rol de administrador');
            }

            const userId = generateId();
            const profileId = generateId();
            const emailId = generateId();
            const userRoleId = generateId();
            const preferencesId = generateId();

            // Crear usuario administrador
            const adminUser = {
                _id: userId,
                name: 'Admin',
                surname: 'Sistema',
                username: 'admin',
                email: 'admin@alertagt.com',
                password: hashPassword('Informatica2026?'), // Cambiar en producción
                status: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Crear perfil de usuario
            const userProfile = {
                _id: profileId,
                userId: userId,
                profilePicture: '',
                phone: '00000000',
                city: 'Guatemala',
                address: 'Centro Histórico',
                country: 'Guatemala',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Crear email de usuario
            const userEmail = {
                _id: emailId,
                userId: userId,
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenExpiry: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Crear preferencias de usuario
            const userPreferences = {
                _id: preferencesId,
                userId: userId,
                notifyNewAlerts: true,
                notifyComments: true,
                notifyModeration: true,
                notifyNearbyAlerts: true,
                preferredSearchRadius: 2000,
                shareLocation: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Crear rol de usuario
            const userRole = {
                _id: userRoleId,
                userId: userId,
                roleId: adminRole._id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Insertar todos los documentos
            await db.collection('users').insertOne(adminUser);
            await db.collection('user_profiles').insertOne(userProfile);
            await db.collection('user_emails').insertOne(userEmail);
            await db.collection('user_preferences').insertOne(userPreferences);
            await db.collection('user_roles').insertOne(userRole);

            console.log('✅ Usuario administrador creado exitosamente!');
            console.log(`   👤 Usuario: admin`);
            console.log(`   📧 Email: admin@alertagt.com`);
            console.log(`   🔑 Contraseña: Informatica2026? (CAMBIAR EN PRODUCCIÓN)`);
            console.log(`   🆔 ID: ${userId}`);

        } else {
            console.log('⚠️  Ya existen usuarios, saltando creación de admin.');
        }

        console.log('Seed de datos completado exitosamente!');

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