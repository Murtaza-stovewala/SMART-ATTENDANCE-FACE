const express = require('express');
const router = express.Router();
const Code = require('../models/generateCode');

router.post('/generate', async (req, res) => {
  const { code, latitude, longitude } = req.body;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    await Code.deleteMany(); // remove old codes 
    const newCode = await Code.create({ code, latitude, longitude, expiresAt });
    res.status(200).json(newCode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/active', async (req, res) => {
  const now = new Date();
  const code = await Code.findOne({ expiresAt: { $gt: now } });
  if (code) {
    res.json(code);
  } else {
    res.status(404).json({ message: 'No active code' });
  }
});

module.exports = router;