'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';

import errorHandler from '../src/middlewares/error-handler.js';

// Rutas
import notificationRoutes from '../src/notifications/notification.routes.js';
import swaggerDocumentation from './documentation.js';

const BASE_PATH = '/api/v1';
const swaggerSpec = swaggerJsdoc(swaggerDocumentation);

const routes = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(`${BASE_PATH}/notifications`, notificationRoutes);

  // Healthcheck
  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timeStamp: new Date().toISOString(),
      service: 'AlertaGT - Notifications API',
    });
  });

  // 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
    });
  });

  // Manejo centralizado de errores
  app.use(errorHandler);
};

const middlewares = (app) => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetOptions));
  app.use(morgan('dev'));
};

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3021;

  try {
    await dbConnection();
    middlewares(app);
    routes(app);

    app.listen(PORT, () => {
      console.log(`\n✓ AlertaGT Notifications API running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}${BASE_PATH}/health\n`);
    });
  } catch (err) {
    console.error('✗ Error iniciando servidor:', err.message);
    process.exit(1);
  }
};
