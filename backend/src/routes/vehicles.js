const express = require('express');
const { getVehicles } = require('../simulator');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getVehicles());
});

module.exports = router;
