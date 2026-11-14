const asyncHandler = require('../middleware/asyncHandler');
const HttpError = require('../utils/httpError');
const catalog = require('../services/catalogService');

const COMPONENT_TYPES = ['motor', 'tanque', 'instrumento', 'energia', 'comunicacion'];

exports.planets = asyncHandler(async (req, res) => res.json(await catalog.getPlanets()));

exports.missions = asyncHandler(async (req, res) =>
  res.json(await catalog.getMissions({ onlyActive: req.query.all !== 'true' })));

exports.components = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (type !== undefined && !COMPONENT_TYPES.includes(type)) {
    throw new HttpError(400, 'INVALID_TYPE', `type debe ser uno de: ${COMPONENT_TYPES.join(', ')}.`);
  }
  res.json(await catalog.getComponents(type));
});
