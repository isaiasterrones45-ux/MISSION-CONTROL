const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Godot no envía Origin (no necesita CORS); Angular sí → se permite su origen.
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => res.json({ name: 'MISSION CONTROL API', docs: '/api/health' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
