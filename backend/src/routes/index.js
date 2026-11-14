const router = require('express').Router();
const catalog = require('../controllers/catalogController');
const users = require('../controllers/userController');
const ships = require('../controllers/shipController');
const results = require('../controllers/resultController');
const stats = require('../controllers/statsController');
const pool = require('../config/db');

// Salud del servidor (útil para que Godot/Angular comprueben conexión)
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

router.get('/planets', catalog.planets);
router.get('/missions', catalog.missions);
router.get('/components', catalog.components);

router.get('/users', users.list);
router.post('/users', users.createOrGet);

router.post('/ships', ships.create);

router.post('/results', results.create);
router.get('/results', results.listAll);
router.get('/results/detail/:id', results.detail);
router.get('/results/:userId', results.byUser);

router.get('/statistics', stats.statistics);
router.get('/ranking', stats.ranking);

module.exports = router;
