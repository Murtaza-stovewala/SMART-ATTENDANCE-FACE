const express = require('express');
const router = express.Router();
const Code = require('../models/Lecturecode'); // or your code model

router.get('/active', async (req, res) => {
try {
const now = new Date();
const code = await Code.findOne({ expiresAt: { $gt: now } });
if (code) {
res.json(code);
} else {
res.status(404).json({ message: 'No active code' });
}
} catch (err) {
res.status(500).json({ message: err.message });
}
});

module.exports = router;