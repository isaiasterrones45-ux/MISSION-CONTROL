const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'ROUTE_NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Formato único de error: { error: { code, message, details? } }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // JSON mal formado enviado por el cliente
  if (err.type === 'entity.parse.failed') {
    err = new HttpError(400, 'INVALID_JSON', 'El cuerpo de la petición no es un JSON válido.');
  }
  if (err.type === 'entity.too.large') {
    err = new HttpError(413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la petición es demasiado grande.');
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  // Errores de MySQL conocidos
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { code: 'DUPLICATE', message: 'Ya existe un registro con esos datos.' } });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'Se hace referencia a un registro que no existe.' } });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('[DB] Sin conexión a MySQL:', err.message);
    return res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'No hay conexión con la base de datos.' } });
  }

  console.error('[ERROR]', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error inesperado del servidor.' } });
}

module.exports = { notFound, errorHandler };
