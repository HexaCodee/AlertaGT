import axios from 'axios';

export const validateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
    }

    const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api/v1';
    try {
      const resp = await axios.post(`${authUrl}/auth/verify`, { token });
      req.user = resp.data.user;
      return next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado', error: err.message });
    }
  } catch (err) {
    res.status(401).json({ success: false, message: 'Error validando token', error: err.message });
  }
};