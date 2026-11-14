const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { maxMass } = require('../config/env');
const { isInt } = require('../utils/validators');
const { assertUserExists } = require('./userService');

/**
 * Crea una nave. El servidor CALCULA masa y costo desde el catálogo (no confía en el cliente).
 * body: { userId, name, missionId?, components: [{ componentId, quantity }] }
 */
async function createShip({ userId, name, missionId, components }) {
  const problems = [];
  if (!isInt(userId) || userId <= 0) problems.push('userId debe ser un entero positivo.');
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) problems.push('name es obligatorio (máx. 80 caracteres).');
  if (missionId !== undefined && (!isInt(missionId) || missionId <= 0)) problems.push('missionId debe ser un entero positivo.');
  if (!Array.isArray(components) || components.length === 0) {
    problems.push('components debe ser un arreglo con al menos una pieza.');
  } else {
    components.forEach((c, i) => {
      if (!c || !isInt(c.componentId) || c.componentId <= 0) problems.push(`components[${i}].componentId inválido.`);
      if (!c || !isInt(c.quantity) || c.quantity < 1 || c.quantity > 10) problems.push(`components[${i}].quantity debe ser un entero entre 1 y 10.`);
    });
  }
  if (problems.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Datos de nave inválidos.', problems);

  await assertUserExists(userId);

  // Unificar piezas repetidas
  const qty = new Map();
  for (const c of components) qty.set(c.componentId, (qty.get(c.componentId) || 0) + c.quantity);

  const ids = [...qty.keys()];
  const [catalog] = await pool.query(
    'SELECT id, masa, costo, consumo_energia, capacidad_combustible, generacion_energia FROM componentes_nave WHERE id IN (?)',
    [ids]
  );
  const missing = ids.filter((id) => !catalog.some((c) => c.id === id));
  if (missing.length) throw new HttpError(400, 'COMPONENT_NOT_FOUND', 'Hay componentes que no existen.', { missing });

  const totals = { totalMass: 0, totalCost: 0, fuelCapacity: 0, energyUse: 0, energyOutput: 0 };
  for (const c of catalog) {
    const n = qty.get(c.id);
    totals.totalMass += c.masa * n;
    totals.totalCost += c.costo * n;
    totals.fuelCapacity += c.capacidad_combustible * n;
    totals.energyUse += c.consumo_energia * n;
    totals.energyOutput += c.generacion_energia * n;
  }

  if (totals.totalMass > maxMass) {
    throw new HttpError(400, 'MASS_LIMIT_EXCEEDED', `La masa (${totals.totalMass}) supera el máximo permitido (${maxMass}).`, { totalMass: totals.totalMass, maxMass });
  }

  if (missionId !== undefined) {
    const [m] = await pool.query('SELECT presupuesto_base FROM misiones WHERE id = ?', [missionId]);
    if (!m.length) throw new HttpError(404, 'MISSION_NOT_FOUND', `No existe la misión ${missionId}.`);
    if (totals.totalCost > m[0].presupuesto_base) {
      throw new HttpError(400, 'BUDGET_EXCEEDED', `El costo (${totals.totalCost}) supera el presupuesto (${m[0].presupuesto_base}).`, { totalCost: totals.totalCost, budget: m[0].presupuesto_base });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ins] = await conn.query(
      'INSERT INTO naves (usuario_id, nombre, masa_total, costo_total) VALUES (?, ?, ?, ?)',
      [userId, name.trim(), totals.totalMass, totals.totalCost]
    );
    const rows = [...qty.entries()].map(([cid, n]) => [ins.insertId, cid, n]);
    await conn.query('INSERT INTO nave_componentes (nave_id, componente_id, cantidad) VALUES ?', [rows]);
    await conn.commit();
    return {
      id: ins.insertId, userId, name: name.trim(), ...totals, maxMass,
      components: [...qty.entries()].map(([componentId, quantity]) => ({ componentId, quantity })),
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { createShip };
