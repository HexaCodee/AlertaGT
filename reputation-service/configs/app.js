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

// Rutas de Reputación, Reportes y Calificaciones
import reportRoutes from '../src/reports/report.routes.js';
import ratingRoutes from '../src/ratings/rating.routes.js';
import reputationRoutes from '../src/reputation/reputation.routes.js';
import swaggerDocumentation from './documentation.js';

const BASE_PATH = '/api/v1';
const swaggerSpec = swaggerJsdoc(swaggerDocumentation);

const routes = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(`${BASE_PATH}/reports`, reportRoutes);
  app.use(`${BASE_PATH}/ratings`, ratingRoutes);
  app.use(`${BASE_PATH}/reputation`, reputationRoutes);

  // Healthcheck
  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timeStamp: new Date().toISOString(),
      service: 'AlertaGT - Reputation, Reports & Ratings API',
    });
  });

  // 404 para endpoints no encontrados
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
    });
  });

  // Manejo centralizado de errores
  app.use(errorHandler);
}

const middlewares = (app) => {
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '2mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetOptions));
  app.use(morgan('dev'));
}

export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3023;

  try {
    await dbConnection();
    middlewares(app);
    routes(app);

    app.listen(PORT, () => {
      console.log(`\n✓ AlertaGT Reputation API running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}${BASE_PATH}/health\n`);
    });
  } catch (err) {
    console.error('✗ Error iniciando servidor:', err.message);
    process.exit(1);
  }
}
