const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AlertaGT Geolocation API',
    version: '1.0.0',
    description: 'Documentación Swagger de la API de geolocalización de AlertaGT',
    contact: {
      name: 'AlertaGT Team',
    },
  },
  servers: [
    {
      url: 'http://127.0.0.1:3022/api/v1',
      description: 'Entorno local',
    },
  ],
  tags: [
    {
      name: 'Locations',
      description: 'Rutas de ubicación y proximidad',
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
      LocationPoint: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'Point' },
          coordinates: {
            type: 'array',
            items: { type: 'number' },
            example: [-90.512, 14.6349],
          },
        },
      },
      UserLocation: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'b7f0d1d8-87e5-4a3d-baf7-6fc94bd1505f' },
          userId: { type: 'string', example: 'user-123' },
          location: { $ref: '#/components/schemas/LocationPoint' },
          latitude: { type: 'number', example: 14.6349 },
          longitude: { type: 'number', example: -90.512 },
          address: { type: 'string', example: 'Zona 10, Guatemala' },
          isActive: { type: 'boolean', example: true },
          lastLocationUpdate: { type: 'string', format: 'date-time' },
          expoPushToken: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
          searchRadius: { type: 'number', example: 2000 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LocationUpdateRequest: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'ID de usuario; si se envía Authorization Bearer, puede omitirse.',
            example: 'user-123',
          },
          latitude: { type: 'number', example: 14.6349 },
          longitude: { type: 'number', example: -90.512 },
          address: { type: 'string', example: 'Av. Reforma 10-32' },
          expoPushToken: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
        },
        required: ['latitude', 'longitude'],
      },
      UpdateFcmTokenRequest: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: 'user-123' },
          expoPushToken: { type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' },
        },
        required: ['expoPushToken'],
      },
      NearbyUsersResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserLocation' },
          },
          count: { type: 'number', example: 5 },
          searchLocation: {
            type: 'object',
            properties: {
              latitude: { type: 'number', example: 14.6349 },
              longitude: { type: 'number', example: -90.512 },
            },
          },
          searchRadius: { type: 'number', example: 2000 },
        },
      },
      NearbyTokensResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              users: { type: 'number', example: 3 },
              tokens: { type: 'array', items: { type: 'string' }, example: ['token1', 'token2'] },
            },
          },
          searchLocation: {
            type: 'object',
            properties: {
              latitude: { type: 'number', example: 14.6349 },
              longitude: { type: 'number', example: -90.512 },
            },
          },
          searchRadius: { type: 'number', example: 2000 },
        },
      },
      BooleanStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Usuario marcado como activo' },
          data: { $ref: '#/components/schemas/UserLocation' },
        },
      },
      StatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  swaggerDefinition,
  apis: ['./src/locations/*.routes.js'],
};

export default swaggerOptions;
