const asyncHandler = require('../middleware/asyncHandler');
const { parseLimit } = require('../utils/validators');
const stats = require('../services/statsService');

exports.statistics = asyncHandler(async (req, res) => res.json(await stats.getStatistics()));
exports.ranking = asyncHandler(async (req, res) => res.json(await stats.getRanking(parseLimit(req.query.limit, 10, 50))));
