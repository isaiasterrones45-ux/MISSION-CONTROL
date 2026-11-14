const app = require('./app');
const pool = require('./config/db');
const { port } = require('./config/env');

const server = app.listen(port, async () => {
  console.log(`🚀 MISSION CONTROL API escuchando en http://localhost:${port}`);
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conectado a MySQL');
  } catch (e) {
    console.error('❌ No se pudo conectar a MySQL:', e.message);
    console.error('   Revisa tu archivo .env y que MySQL esté encendido.');
  }
});

const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
