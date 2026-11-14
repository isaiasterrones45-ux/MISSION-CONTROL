// Crea la base de datos y (opcional) los datos iniciales, sin necesitar la consola de mysql.
//   npm run db:init      -> schema.sql + seed.sql
//   npm run db:schema    -> solo schema.sql
// ⚠️ Borra y recrea las tablas.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { db } = require('../src/config/env');

(async () => {
  const withSeed = !process.argv.includes('--no-seed');
  const dir = path.join(__dirname, '..', '..', 'database');
  const conn = await mysql.createConnection({
    host: db.host, port: db.port, user: db.user, password: db.password,
    multipleStatements: true,
  });
  try {
    console.log('➡️  Ejecutando schema.sql ...');
    await conn.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
    if (withSeed) {
      console.log('➡️  Ejecutando seed.sql ...');
      await conn.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
    }
    console.log('✅ Base de datos lista.');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
