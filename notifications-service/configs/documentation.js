const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AlertaGT Notifications API',
    version: '1.0.0',
    description: 'Documentación Swagger de la API de notificaciones de AlertaGT',
    contact: {
      name: 'AlertaGT Team',
    },
  },
  servers: [
    {
      url: 'http://127.0.0.1:3021/api/v1',
      description: 'Entorno local',
    },
  ],
  tags: [
    {
      name: 'Notifications',
      description: 'Rutas de notificaciones',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      serviceToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-service-token',
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  swaggerDefinition,
  apis: ['./src/notifications/*.routes.js'],
};

export default swaggerOptions;
