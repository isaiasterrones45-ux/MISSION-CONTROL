const asyncHandler = require('../middleware/asyncHandler');
const { requireBody, parseId, parseLimit, parseOffset } = require('../utils/validators');
const results = require('../services/resultService');

exports.create = asyncHandler(async (req, res) => {
  const { result, duplicate } = await results.createResult(requireBody(req.body));
  // 201 si se creó; 200 si ya existía (misma clientRef) → no se guarda dos veces
  res.status(duplicate ? 200 : 201).json({ ...result, duplicate });
});

exports.listAll = asyncHandler(async (req, res) =>
  res.json(await results.getAllResults(parseLimit(req.query.limit), parseOffset(req.query.offset))));

exports.byUser = asyncHandler(async (req, res) =>
  res.json(await results.getResultsByUser(parseId(req.params.userId, 'userId'), parseLimit(req.query.limit), parseOffset(req.query.offset))));

exports.detail = asyncHandler(async (req, res) =>
  res.json(await results.getResultDetail(parseId(req.params.id))));
