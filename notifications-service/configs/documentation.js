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
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'notif-123' },
          userId: { type: 'string', example: 'user-123' },
          postId: { type: 'string', example: 'post-456' },
          type: { type: 'string', example: 'NEW_ALERT' },
          title: { type: 'string', example: 'Nueva alerta cerca de ti' },
          body: { type: 'string', example: 'Un accidente ha sido reportado a 500m' },
          data: { type: 'object', example: { postId: 'post-456' } },
          read: { type: 'boolean', example: false },
          readAt: { type: 'string', format: 'date-time', nullable: true },
          sentViaFCM: { type: 'boolean', example: true },
          fcmResponse: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      NotificationPage: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 35 },
          pages: { type: 'integer', example: 2 },
        },
      },
      NotificationListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Notification' },
          },
          pagination: { $ref: '#/components/schemas/NotificationPage' },
        },
      },
      NotificationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Notification' },
        },
      },
      CreateNotificationRequest: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: 'user-123' },
          postId: { type: 'string', example: 'post-456' },
          type: { type: 'string', example: 'NEW_ALERT' },
          title: { type: 'string', example: 'Nueva alerta' },
          body: { type: 'string', example: 'Revisa la publicación en tu área' },
          data: { type: 'object', example: { url: 'https://example.com/alert/123' } },
          fcmToken: { type: 'string', example: 'fcm_token_abc123' },
        },
        required: ['userId', 'postId', 'title', 'body'],
      },
      SuccessMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operación correcta' },
        },
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
