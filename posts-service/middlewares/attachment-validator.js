'use strict';

export const ATTACHMENT_CONSTRAINTS = {
  MAX_FILES: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB por archivo
  MAX_TOTAL_SIZE: 20 * 1024 * 1024, // 20MB total
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'pdf'],
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf'
  ]
};

/**
 * Valida archivos adjuntos
 * @param {Array} files Array de archivos desde multer
 * @returns {object} { isValid: boolean, error?: string, message?: string }
 */
export const validateAttachments = (files) => {
  if (!files || !Array.isArray(files)) {
    return { isValid: true }; // Es opcional
  }

  if (files.length > ATTACHMENT_CONSTRAINTS.MAX_FILES) {
    return {
      isValid: false,
      error: `MAX_ATTACHMENTS_EXCEEDED`,
      message: `Máximo ${ATTACHMENT_CONSTRAINTS.MAX_FILES} archivos permitidos. Se enviaron ${files.length}`
    };
  }

  let totalSize = 0;

  for (const file of files) {
    // Validar tamaño individual
    if (file.size > ATTACHMENT_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `FILE_TOO_LARGE`,
        message: `Archivo "${file.originalname}" excede ${ATTACHMENT_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Validar MIME type
    if (!ATTACHMENT_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `INVALID_FILE_TYPE`,
        message: `Tipo de archivo "${file.mimetype}" no permitido. Permitidos: ${ATTACHMENT_CONSTRAINTS.ALLOWED_FORMATS.join(', ')}`
      };
    }

    totalSize += file.size;
  }

  // Validar tamaño total
  if (totalSize > ATTACHMENT_CONSTRAINTS.MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `TOTAL_SIZE_EXCEEDED`,
      message: `Tamaño total de archivos (${(totalSize / 1024 / 1024).toFixed(2)}MB) excede ${ATTACHMENT_CONSTRAINTS.MAX_TOTAL_SIZE / 1024 / 1024}MB`
    };
  }

  return { isValid: true, message: `${files.length} archivo(s) validado(s)` };
};

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} text Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Middleware para validar adjuntos en requests
 */
export const validateAttachmentsMiddleware = (req, res, next) => {
  const attachmentFiles = Array.isArray(req.files)
    ? req.files
    : Array.isArray(req.files?.attachments)
      ? req.files.attachments
      : [];

  const validation = validateAttachments(attachmentFiles);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
      errorCode: validation.error
    });
  }

  next();
};
