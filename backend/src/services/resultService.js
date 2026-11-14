const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { maxScore } = require('../config/env');
const { isInt, isNum } = require('../utils/validators');
const { assertUserExists } = require('./userService');

const STATUSES = ['completed', 'failed', 'aborted'];

const SELECT_RESULT = `
  SELECT r.id, r.usuario_id AS userId, u.nombre AS userName, r.mision_id AS missionId,
         m.titulo AS missionTitle, p.id AS planetId, p.nombre AS planetName,
         r.nave_id AS shipId, n.nombre AS shipName,
         r.puntuacion AS score, r.estado AS status,
         r.combustible_final AS fuelRemaining, r.energia_final AS energyRemaining,
         r.duracion_segundos AS durationSeconds, r.fecha AS date
    FROM resultados_mision r
    JOIN usuarios u ON u.id = r.usuario_id
    JOIN misiones m ON m.id = r.mision_id
    JOIN planetas p ON p.id = m.planeta_id
    JOIN naves n ON n.id = r.nave_id`;

function validateResult(b) {
  const p = [];
  if (!isInt(b.userId) || b.userId <= 0) p.push('userId debe ser un entero positivo.');
  if (!isInt(b.missionId) || b.missionId <= 0) p.push('missionId debe ser un entero positivo.');
  if (!isInt(b.shipId) || b.shipId <= 0) p.push('shipId debe ser un entero positivo.');
  if (!isInt(b.score) || b.score < 0 || b.score > maxScore) p.push(`score debe ser un entero entre 0 y ${maxScore}.`);
  if (!STATUSES.includes(b.status)) p.push(`status debe ser uno de: ${STATUSES.join(', ')}.`);
  if (!isNum(b.fuelRemaining) || b.fuelRemaining < 0 || b.fuelRemaining > 100) p.push('fuelRemaining debe ser un número entre 0 y 100.');
  if (!isNum(b.energyRemaining) || b.energyRemaining < 0 || b.energyRemaining > 100) p.push('energyRemaining debe ser un número entre 0 y 100.');
  if (!isInt(b.durationSeconds) || b.durationSeconds < 0 || b.durationSeconds > 86400) p.push('durationSeconds debe ser un entero entre 0 y 86400.');
  if (b.clientRef !== undefined && (typeof b.clientRef !== 'string' || !b.clientRef || b.clientRef.length > 64)) p.push('clientRef debe ser texto (1-64 caracteres).');
  if (p.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Datos del resultado inválidos o incompletos.', p);
}

/** Guarda un resultado. Si clientRef ya existe, devuelve el guardado (duplicate = true). */
async function createResult(b) {
  validateResult(b);

  if (b.clientRef) {
    const [dup] = await pool.query(`${SELECT_RESULT} WHERE r.client_ref = ?`, [b.clientRef]);
    if (dup.length) return { result: dup[0], duplicate: true };
  }

  await assertUserExists(b.userId);
  const [m] = await pool.query('SELECT id FROM misiones WHERE id = ?', [b.missionId]);
  if (!m.length) throw new HttpError(404, 'MISSION_NOT_FOUND', `No existe la misión ${b.missionId}.`);
  const [s] = await pool.query('SELECT id, usuario_id FROM naves WHERE id = ?', [b.shipId]);
  if (!s.length) throw new HttpError(404, 'SHIP_NOT_FOUND', `No existe la nave ${b.shipId}.`);
  if (s[0].usuario_id !== b.userId) throw new HttpError(400, 'SHIP_NOT_OWNED', 'La nave no pertenece a ese usuario.');

  try {
    const [ins] = await pool.query(
      `INSERT INTO resultados_mision
         (usuario_id, mision_id, nave_id, puntuacion, estado, combustible_final, energia_final, duracion_segundos, client_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.userId, b.missionId, b.shipId, b.score, b.status, b.fuelRemaining, b.energyRemaining, b.durationSeconds, b.clientRef || null]
    );
    const [rows] = await pool.query(`${SELECT_RESULT} WHERE r.id = ?`, [ins.insertId]);
    return { result: rows[0], duplicate: false };
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY' && b.clientRef) {
      const [rows] = await pool.query(`${SELECT_RESULT} WHERE r.client_ref = ?`, [b.clientRef]);
      return { result: rows[0], duplicate: true };
    }
    throw e;
  }
}

async function getResultsByUser(userId, limit, offset) {
  await assertUserExists(userId);
  const [rows] = await pool.query(`${SELECT_RESULT} WHERE r.usuario_id = ? ORDER BY r.fecha DESC, r.id DESC LIMIT ? OFFSET ?`, [userId, limit, offset]);
  return rows;
}

async function getAllResults(limit, offset) {
  const [rows] = await pool.query(`${SELECT_RESULT} ORDER BY r.fecha DESC, r.id DESC LIMIT ? OFFSET ?`, [limit, offset]);
  return rows;
}

/** Detalle de una misión jugada: resultado + piezas de la nave usada */
async function getResultDetail(id) {
  const [rows] = await pool.query(`${SELECT_RESULT} WHERE r.id = ?`, [id]);
  if (!rows.length) throw new HttpError(404, 'RESULT_NOT_FOUND', `No existe el resultado ${id}.`);
  const result = rows[0];
  const [ship] = await pool.query('SELECT masa_total AS totalMass, costo_total AS totalCost FROM naves WHERE id = ?', [result.shipId]);
  const [comps] = await pool.query(
    `SELECT c.id AS componentId, c.nombre AS name, c.tipo AS type, nc.cantidad AS quantity, c.masa AS mass, c.costo AS cost
       FROM nave_componentes nc JOIN componentes_nave c ON c.id = nc.componente_id
      WHERE nc.nave_id = ? ORDER BY c.id`,
    [result.shipId]
  );
  return { ...result, ship: { id: result.shipId, name: result.shipName, ...ship[0], components: comps } };
}

module.exports = { createResult, getResultsByUser, getAllResults, getResultDetail };
