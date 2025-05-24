const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  code: String,
  latitude: Number,
  longitude: Number,
  expiresAt: Date
});

module.exports = mongoose.model('Code', codeSchema);