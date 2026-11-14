const pool = require('../config/db');

async function getPlanets() {
  const [rows] = await pool.query(
    'SELECT id, nombre AS name, descripcion AS description, dificultad AS difficulty FROM planetas ORDER BY id'
  );
  return rows;
}

async function getMissions({ onlyActive = true } = {}) {
  const [rows] = await pool.query(
    `SELECT m.id, m.planeta_id AS planetId, p.nombre AS planetName, m.titulo AS title,
            m.objetivo AS objective, m.presupuesto_base AS baseBudget, p.dificultad AS difficulty,
            m.activa = 1 AS active
       FROM misiones m JOIN planetas p ON p.id = m.planeta_id
      ${onlyActive ? 'WHERE m.activa = 1' : ''}
      ORDER BY m.id`
  );
  return rows.map((r) => ({ ...r, active: !!r.active }));
}

async function getComponents(type) {
  const [rows] = await pool.query(
    `SELECT id, nombre AS name, tipo AS type, descripcion AS description, masa AS mass, costo AS cost,
            consumo_energia AS energyUse, capacidad_combustible AS fuelCapacity,
            empuje AS thrust, generacion_energia AS energyOutput
       FROM componentes_nave ${type ? 'WHERE tipo = ?' : ''} ORDER BY id`,
    type ? [type] : []
  );
  return rows;
}

module.exports = { getPlanets, getMissions, getComponents };
