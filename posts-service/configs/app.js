'use strict'
 
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js'; 
import { dbConnection } from './db.configuration.js';
 
// Rutas para Posts y Comments
import postRoutes from '../src/posts/post.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';
 
const BASE_PATH = '/api/v1';
 
const routes = (app) => {
    // Rutas principales
    app.use(`${BASE_PATH}/posts`, postRoutes);
    app.use(`${BASE_PATH}/comments`, commentRoutes);
 
    // Healthcheck
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'AlertsPosts - Publications & Comments API',
        });
    });
 
    // 404 para endpoints no encontrados
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado',
        });
    });
}
 
const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
}
 
export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3020;
 
    try {
        await dbConnection();
        middlewares(app);
        routes(app);
 
        app.listen(PORT, () => {
            console.log(`\n✓ AlertsPosts Publications API running on port ${PORT}`);
            console.log(`✓ Health check: http://localhost:${PORT}${BASE_PATH}/health\n`);
        });
    } catch (err) {
        console.error('✗ Error iniciando servidor:', err.message);
        process.exit(1);
    }
}
