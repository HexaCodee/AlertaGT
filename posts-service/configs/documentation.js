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
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
      ImageObject: {
        type: 'object',
        properties: {
          public_id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          mimeType: { type: 'string' },
          originalName: { type: 'string' },
        },
      },
      AttachmentObject: {
        type: 'object',
        properties: {
          public_id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          mimeType: { type: 'string' },
          originalName: { type: 'string' },
        },
      },
      PostLocation: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'Point' },
          coordinates: {
            type: 'array',
            items: { type: 'number' },
            example: [-90.512, 14.6349],
          },
          latitude: { type: 'number', example: 14.6349 },
          longitude: { type: 'number', example: -90.512 },
          address: { type: 'string', example: 'Av. Reforma 10-32' },
          manual: { type: 'boolean', example: true },
        },
      },
      ModerationInfo: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'PENDING' },
          moderatorId: { type: 'string', example: 'moderator-1' },
          comments: { type: 'string', example: 'Revisar contenido' },
          moderatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'post-123' },
          title: { type: 'string', example: 'Choque en carretera' },
          category: { type: 'string', example: 'ACCIDENTE' },
          riskType: { type: 'string', example: 'MODERADO' },
          text: { type: 'string', example: 'Colisión en 7a avenida' },
          image: { $ref: '#/components/schemas/ImageObject' },
          authorId: { type: 'string', example: 'user-123' },
          location: { $ref: '#/components/schemas/PostLocation' },
          attachments: {
            type: 'array',
            items: { $ref: '#/components/schemas/AttachmentObject' },
          },
          isActive: { type: 'boolean', example: true },
          isPublished: { type: 'boolean', example: false },
          moderation: { $ref: '#/components/schemas/ModerationInfo' },
          flaggedCount: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PostListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Post' },
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 100 },
              pages: { type: 'integer', example: 10 },
            },
          },
        },
      },
      PostResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Publicación creada exitosamente' },
          data: { $ref: '#/components/schemas/Post' },
        },
      },
      CreatePostRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Choque en carretera' },
          category: { type: 'string', example: 'ACCIDENTE' },
          riskType: { type: 'string', example: 'LEVE' },
          text: { type: 'string', example: 'Una camioneta colisionó...' },
          location: { $ref: '#/components/schemas/PostLocation' },
          isPublished: { type: 'boolean', example: true },
          moderation: { $ref: '#/components/schemas/ModerationInfo' },
        },
        required: ['title', 'category', 'text'],
      },
      UpdatePostRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Choque corregido' },
          category: { type: 'string', example: 'TRAFICO' },
          riskType: { type: 'string', example: 'MODERADO' },
          text: { type: 'string', example: 'El tránsito se ha normalizado...' },
          location: { $ref: '#/components/schemas/PostLocation' },
          isPublished: { type: 'boolean', example: false },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'comment-123' },
          postId: { type: 'string', example: 'post-123' },
          authorId: { type: 'string', example: 'user-123' },
          text: { type: 'string', example: 'Gracias por la información' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CommentListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Comment' },
          },
        },
      },
      CommentResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Comentario creado exitosamente' },
          data: { $ref: '#/components/schemas/Comment' },
        },
      },
      CreateCommentRequest: {
        type: 'object',
        properties: {
          postId: { type: 'string', example: 'post-123' },
          text: { type: 'string', example: 'Buen reporte' },
        },
        required: ['postId', 'text'],
      },
      UpdateCommentRequest: {
        type: 'object',
        properties: {
          text: { type: 'string', example: 'Comentario actualizado' },
        },
        required: ['text'],
      },
      SuccessMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operación exitosa' },
        },
      },
    }
  }
};

const swaggerOptions = {
  definition: swaggerDefinition,
  swaggerDefinition,
  apis: ['./src/posts/*.routes.js', './src/comments/*.routes.js'],
};

export default swaggerOptions;
