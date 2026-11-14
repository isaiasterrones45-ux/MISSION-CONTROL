const asyncHandler = require('../middleware/asyncHandler');
const { requireBody } = require('../utils/validators');
const ships = require('../services/shipService');

exports.create = asyncHandler(async (req, res) => {
  const ship = await ships.createShip(requireBody(req.body));
  res.status(201).json(ship);
});
