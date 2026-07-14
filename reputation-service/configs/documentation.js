const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AlertaGT Reputation API',
    version: '1.0.0',
    description: 'Documentación Swagger de la API de reputación, reportes de alertas falsas y calificaciones de usuarios de AlertaGT',
    contact: {
      name: 'AlertaGT Team',
    },
  },
  servers: [
    {
      url: 'http://127.0.0.1:3023/api/v1',
      description: 'Entorno local',
    },
  ],
  tags: [
    { name: 'Reports', description: 'Reportes de alertas (información falsa, spam, etc.)' },
    { name: 'Ratings', description: 'Calificaciones de usuarios (estrellas tipo Uber)' },
    { name: 'Reputation', description: 'Reputación agregada, confianza y penalizaciones' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          errorCode: { type: 'string' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'report-123' },
          postId: { type: 'string', example: 'post-123' },
          authorId: { type: 'string', example: 'user-999' },
          reporterId: { type: 'string', example: 'user-123' },
          reason: { type: 'string', example: 'FALSE_INFO' },
          comment: { type: 'string', example: 'No hay ningún accidente en esa zona' },
          status: { type: 'string', example: 'PENDING' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Rating: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'rating-123' },
          targetUserId: { type: 'string', example: 'user-999' },
          raterId: { type: 'string', example: 'user-123' },
          postId: { type: 'string', example: 'post-123' },
          score: { type: 'integer', example: 5 },
          comment: { type: 'string', example: 'Alerta muy útil y precisa' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Reputation: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: 'user-999' },
          averageRating: { type: 'number', example: 4.6 },
          ratingsCount: { type: 'integer', example: 27 },
          trustScore: { type: 'integer', example: 82 },
          falseAlertsCount: { type: 'integer', example: 1 },
          reportsReceived: { type: 'integer', example: 4 },
          status: { type: 'string', example: 'ACTIVE' },
          suspendedUntil: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CanPublish: {
        type: 'object',
        properties: {
          allowed: { type: 'boolean', example: true },
          status: { type: 'string', example: 'ACTIVE' },
          trustScore: { type: 'integer', example: 82 },
          suspendedUntil: { type: 'string', format: 'date-time', nullable: true },
          reason: { type: 'string', nullable: true },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  swaggerDefinition,
  apis: [
    './src/reports/*.routes.js',
    './src/ratings/*.routes.js',
    './src/reputation/*.routes.js',
  ],
};

export default swaggerOptions;
