require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mission_control',
  },
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:4200')
    .split(',').map((s) => s.trim()).filter(Boolean),
  maxMass: Number(process.env.MAX_MASS) || 600,
  maxScore: Number(process.env.MAX_SCORE) || 10000,
};
