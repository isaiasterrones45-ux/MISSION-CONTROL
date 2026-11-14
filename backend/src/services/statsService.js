const pool = require('../config/db');

async function getStatistics() {
  const [[t]] = await pool.query(
    `SELECT COUNT(*) AS totalMissions,
            COALESCE(SUM(estado = 'completed'), 0) AS completedMissions,
            COALESCE(SUM(estado = 'failed'), 0) AS failedMissions,
            COALESCE(SUM(estado = 'aborted'), 0) AS abortedMissions,
            COALESCE(AVG(puntuacion), 0) AS averageScore,
            COALESCE(MAX(puntuacion), 0) AS bestScore
       FROM resultados_mision`
  );
  const [[u]] = await pool.query('SELECT COUNT(*) AS totalPlayers FROM usuarios');
  const [byPlanet] = await pool.query(
    `SELECT p.id AS planetId, p.nombre AS planetName, COUNT(r.id) AS missions,
            COALESCE(SUM(r.estado = 'completed'), 0) AS completed,
            COALESCE(AVG(r.puntuacion), 0) AS averageScore
       FROM planetas p LEFT JOIN misiones m ON m.planeta_id = p.id
       LEFT JOIN resultados_mision r ON r.mision_id = m.id
      GROUP BY p.id, p.nombre ORDER BY p.id`
  );
  const [recent] = await pool.query(
    `SELECT r.id, u.nombre AS userName, p.nombre AS planetName, r.puntuacion AS score, r.estado AS status, r.fecha AS date
       FROM resultados_mision r JOIN usuarios u ON u.id = r.usuario_id
       JOIN misiones m ON m.id = r.mision_id JOIN planetas p ON p.id = m.planeta_id
      ORDER BY r.fecha DESC, r.id DESC LIMIT 5`
  );

  const total = Number(t.totalMissions);
  const completed = Number(t.completedMissions);
  return {
    totalMissions: total,
    completedMissions: completed,
    failedMissions: Number(t.failedMissions),
    abortedMissions: Number(t.abortedMissions),
    successRate: total ? Math.round((completed / total) * 1000) / 10 : 0, // porcentaje con 1 decimal
    averageScore: Math.round(Number(t.averageScore)),
    bestScore: Number(t.bestScore),
    totalPlayers: Number(u.totalPlayers),
    byPlanet: byPlanet.map((r) => ({ ...r, missions: Number(r.missions), completed: Number(r.completed), averageScore: Math.round(Number(r.averageScore)) })),
    recentActivity: recent,
  };
}

async function getRanking(limit) {
  const [rows] = await pool.query(
    `SELECT u.id AS userId, u.nombre AS userName,
            SUM(r.puntuacion) AS totalScore, MAX(r.puntuacion) AS bestScore,
            COUNT(r.id) AS missionsPlayed, SUM(r.estado = 'completed') AS missionsCompleted
       FROM usuarios u JOIN resultados_mision r ON r.usuario_id = u.id
      GROUP BY u.id, u.nombre
      ORDER BY totalScore DESC, bestScore DESC, u.id ASC LIMIT ?`,
    [limit]
  );
  return rows.map((r, i) => ({
    position: i + 1, userId: r.userId, userName: r.userName,
    totalScore: Number(r.totalScore), bestScore: Number(r.bestScore),
    missionsPlayed: Number(r.missionsPlayed), missionsCompleted: Number(r.missionsCompleted),
  }));
}

module.exports = { getStatistics, getRanking };
