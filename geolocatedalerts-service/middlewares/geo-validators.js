// Constantes de validación geoespacial de Guatemala
export const GEO_CONSTRAINTS = {
  // Límites aproximados de Guatemala en coordenadas
  MIN_LATITUDE: 13.73,  // Sur (límite con El Salvador/Honduras)
  MAX_LATITUDE: 17.81,  // Norte (Petén)
  MIN_LONGITUDE: -92.24, // Oeste (frontera con México)
  MAX_LONGITUDE: -88.22, // Este (frontera con Belice/Honduras)
  
  // Radios de búsqueda permitidos
  MIN_SEARCH_RADIUS: 500,    // 500 metros
  MAX_SEARCH_RADIUS: 50000,  // 50 km
  DEFAULT_SEARCH_RADIUS: 2000, // 2 km
  
  // Errores de precisión GPS (metros)
  ACCURACY_THRESHOLD: 100,
};

/**
 * Valida que las coordenadas están dentro de los límites de Guatemala
 * @param {number} latitude
 * @param {number} longitude
 * @returns {object} { isValid: boolean, error?: string }
 */
export const validateGpsCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { isValid: false, error: 'Coordenadas inválidas: latitude y longitude deben ser números' };
  }

  if (latitude < GEO_CONSTRAINTS.MIN_LATITUDE || latitude > GEO_CONSTRAINTS.MAX_LATITUDE) {
    return { isValid: false, error: `Latitud fuera de rango. Rango permitido: ${GEO_CONSTRAINTS.MIN_LATITUDE} a ${GEO_CONSTRAINTS.MAX_LATITUDE}` };
  }

  if (longitude < GEO_CONSTRAINTS.MIN_LONGITUDE || longitude > GEO_CONSTRAINTS.MAX_LONGITUDE) {
    return { isValid: false, error: `Longitud fuera de rango. Rango permitido: ${GEO_CONSTRAINTS.MIN_LONGITUDE} a ${GEO_CONSTRAINTS.MAX_LONGITUDE}` };
  }

  return { isValid: true };
};

/**
 * Valida el radio de búsqueda
 * @param {number} radius Radio en metros
 * @returns {object} { isValid: boolean, error?: string, normalizedRadius: number }
 */
export const validateSearchRadius = (radius) => {
  const parsedRadius = parseInt(radius) || GEO_CONSTRAINTS.DEFAULT_SEARCH_RADIUS;

  if (parsedRadius < GEO_CONSTRAINTS.MIN_SEARCH_RADIUS) {
    return {
      isValid: false,
      error: `Radio mínimo: ${GEO_CONSTRAINTS.MIN_SEARCH_RADIUS}m`,
      normalizedRadius: GEO_CONSTRAINTS.MIN_SEARCH_RADIUS
    };
  }

  if (parsedRadius > GEO_CONSTRAINTS.MAX_SEARCH_RADIUS) {
    return {
      isValid: false,
      error: `Radio máximo: ${GEO_CONSTRAINTS.MAX_SEARCH_RADIUS}m`,
      normalizedRadius: GEO_CONSTRAINTS.MAX_SEARCH_RADIUS
    };
  }

  return { isValid: true, normalizedRadius: parsedRadius };
};

/**
 * Valida un token FCM
 * @param {string} token Token FCM
 * @returns {boolean}
 */
export const validateFCMToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // FCM tokens típicamente tienen 152+ caracteres
  return token.length > 100 && /^[a-zA-Z0-9_\-:]+$/.test(token);
};
