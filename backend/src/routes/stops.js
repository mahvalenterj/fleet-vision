const express = require('express');
const { searchStops, getStopsByLine } = require('../services/olhoVivoService');

const router = express.Router();

/**
 * GET /api/stops/search?q=termo
 * Busca paradas por nome ou endereço
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({
      error: 'Termo de busca deve ter pelo menos 3 caracteres'
    });
  }

  try {
    const stops = await searchStops(q);
    res.json(stops);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar paradas',
      message: error.message
    });
  }
});

/**
 * GET /api/stops/line/:lineCode
 * Retorna todas as paradas de uma linha específica
 */
router.get('/line/:lineCode', async (req, res) => {
  const { lineCode } = req.params;

  if (!lineCode) {
    return res.status(400).json({
      error: 'Código da linha é obrigatório'
    });
  }

  try {
    const stops = await getStopsByLine(parseInt(lineCode));
    res.json(stops);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar paradas da linha',
      message: error.message
    });
  }
});

module.exports = router;
