const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AlertaGT Posts API',
    version: '1.0.0',
    description: 'Documentación Swagger de la API de publicaciones y comentarios de AlertaGT',
    contact: {
      name: 'AlertaGT Team',
    },
  },
  servers: [
    {
      url: 'http://127.0.0.1:3020/api/v1',
      description: 'Entorno local',
    },
  ],
  tags: [
    {
      name: 'Posts',
      description: 'Rutas de publicaciones',
    },
    {
      name: 'Comments',
      description: 'Rutas de comentarios',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  swaggerDefinition,
  apis: ['./src/posts/*.routes.js', './src/comments/*.routes.js'],
};

export default swaggerOptions;
