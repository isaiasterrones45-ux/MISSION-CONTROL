const asyncHandler = require('../middleware/asyncHandler');
const HttpError = require('../utils/httpError');
const { requireBody } = require('../utils/validators');
const users = require('../services/userService');

exports.list = asyncHandler(async (req, res) => res.json(await users.getUsers()));

// Login simple (sin contraseña) para el MVP: devuelve el usuario existente o crea uno nuevo.
exports.createOrGet = asyncHandler(async (req, res) => {
  const { name } = requireBody(req.body);
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'name es obligatorio (2 a 50 caracteres).');
  }
  const { user, created } = await users.findOrCreateUser(name.trim());
  res.status(created ? 201 : 200).json(user);
});
