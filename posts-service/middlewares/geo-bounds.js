// Límites geográficos aproximados de Guatemala.
// Mismos valores que geolocatedalerts-service/middlewares/geo-validators.js,
// para mantener consistencia entre servicios.
export const GUATEMALA_BOUNDS = {
  MIN_LATITUDE: 13.73,   // Sur (límite con El Salvador/Honduras)
  MAX_LATITUDE: 17.81,   // Norte (Petén)
  MIN_LONGITUDE: -92.24, // Oeste (frontera con México)
  MAX_LONGITUDE: -88.22, // Este (frontera con Belice/Honduras)
};

// Valida que una coordenada esté dentro del rectángulo que cubre Guatemala.
export const isWithinGuatemala = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

  return (
    lat >= GUATEMALA_BOUNDS.MIN_LATITUDE &&
    lat <= GUATEMALA_BOUNDS.MAX_LATITUDE &&
    lng >= GUATEMALA_BOUNDS.MIN_LONGITUDE &&
    lng <= GUATEMALA_BOUNDS.MAX_LONGITUDE
  );
};
