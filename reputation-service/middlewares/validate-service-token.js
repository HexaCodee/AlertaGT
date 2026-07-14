export const validateServiceToken = (req, res, next) => {
  try {
    const token = req.headers['x-service-token'];
    if (!token || token !== process.env.SERVICE_TOKEN) {
      return res.status(401).json({ success: false, message: 'Service token inválido' });
    }
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Error validating service token', error: err.message });
  }
};
