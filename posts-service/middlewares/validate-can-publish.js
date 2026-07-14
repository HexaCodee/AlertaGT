import axios from 'axios';

const REPUTATION_SERVICE_URL = process.env.REPUTATION_SERVICE_URL || 'http://localhost:3023/api/v1';

/**
 * Gate de reputación: impide publicar a los usuarios suspendidos por acumular
 * alertas falsas. Debe ejecutarse DESPUÉS de validateJWT (necesita req.user.id)
 * y ANTES de la subida de archivos, para no gastar Cloudinary con usuarios
 * bloqueados.
 *
 * Diseño "fail-open": si el reputation-service no responde, NO se bloquea la
 * publicación. Preferimos permitir publicar antes que caer toda la app por una
 * dependencia no crítica.
 */
export const validateCanPublish = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) return next();

  try {
    const resp = await axios.get(
      `${REPUTATION_SERVICE_URL}/reputation/${userId}/can-publish`,
      { timeout: 4000 }
    );

    const data = resp.data?.data;
    if (data && data.allowed === false) {
      return res.status(403).json({
        success: false,
        message: data.reason || 'Tu cuenta está suspendida temporalmente por publicar alertas falsas.',
        errorCode: 'ACCOUNT_SUSPENDED',
        data: {
          status: data.status,
          suspendedUntil: data.suspendedUntil,
          trustScore: data.trustScore,
        },
      });
    }

    return next();
  } catch (err) {
    // Fail-open: registrar y continuar si el servicio de reputación falla.
    console.error('validateCanPublish (fail-open):', err.message);
    return next();
  }
};
