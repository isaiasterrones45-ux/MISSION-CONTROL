const pool = require('../config/db');
const HttpError = require('../utils/httpError');

async function findOrCreateUser(name) {
  const [found] = await pool.query('SELECT id, nombre AS name, fecha_creacion AS createdAt FROM usuarios WHERE nombre = ?', [name]);
  if (found.length) return { user: found[0], created: false };
  try {
    const [r] = await pool.query('INSERT INTO usuarios (nombre) VALUES (?)', [name]);
    const [rows] = await pool.query('SELECT id, nombre AS name, fecha_creacion AS createdAt FROM usuarios WHERE id = ?', [r.insertId]);
    return { user: rows[0], created: true };
  } catch (e) {
    // Dos peticiones al mismo tiempo: la segunda recibe el existente
    if (e.code === 'ER_DUP_ENTRY') {
      const [rows] = await pool.query('SELECT id, nombre AS name, fecha_creacion AS createdAt FROM usuarios WHERE nombre = ?', [name]);
      return { user: rows[0], created: false };
    }
    throw e;
  }
}

async function getUsers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre AS name, u.fecha_creacion AS createdAt,
            COUNT(r.id) AS missionsPlayed,
            COALESCE(SUM(r.estado = 'completed'), 0) AS missionsCompleted,
            COALESCE(MAX(r.puntuacion), 0) AS bestScore
       FROM usuarios u LEFT JOIN resultados_mision r ON r.usuario_id = u.id
      GROUP BY u.id, u.nombre, u.fecha_creacion ORDER BY u.id`
  );
  return rows.map((r) => ({ ...r, missionsPlayed: Number(r.missionsPlayed), missionsCompleted: Number(r.missionsCompleted), bestScore: Number(r.bestScore) }));
}

async function assertUserExists(userId) {
  const [rows] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [userId]);
  if (!rows.length) throw new HttpError(404, 'USER_NOT_FOUND', `No existe el usuario ${userId}.`);
}

module.exports = { findOrCreateUser, getUsers, assertUserExists };
