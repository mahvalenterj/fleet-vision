const express = require('express');
const { getAllVehicles } = require('../services/olhoVivoService');

const router = express.Router();

router.get('/', async (req, res) => {
  const vehicles = await getAllVehicles();
  res.json(vehicles);
});

module.exports = router;