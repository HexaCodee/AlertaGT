export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_ERROR';
  const message = err.message || 'Ocurrió un error interno';
  const details = err.details || null;

  console.error('Unhandled error:', err);

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
    timestamp: new Date().toISOString(),
  });
}
