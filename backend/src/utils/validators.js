const HttpError = require('./httpError');

const isInt = (v) => Number.isInteger(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// Id positivo (puede venir como string desde la URL)
function parseId(value, field = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, 'INVALID_ID', `"${field}" debe ser un entero positivo.`);
  }
  return n;
}

function parseLimit(value, def = 20, max = 100) {
  if (value === undefined) return def;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, 'INVALID_LIMIT', '"limit" debe ser un entero positivo.');
  }
  return Math.min(n, max);
}

function parseOffset(value) {
  if (value === undefined) return 0;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new HttpError(400, 'INVALID_OFFSET', '"offset" debe ser un entero >= 0.');
  }
  return n;
}

// Verifica que el body sea un objeto JSON
function requireBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'INVALID_BODY', 'Se esperaba un objeto JSON en el cuerpo de la petición.');
  }
  return body;
}

module.exports = { isInt, isNum, parseId, parseLimit, parseOffset, requireBody };
