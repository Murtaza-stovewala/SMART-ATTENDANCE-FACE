// models/PredefinedStudent.js
const mongoose = require('mongoose');

const PredefinedStudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeId: { type: String, required: true }
});

module.exports = mongoose.model('PredefinedStudent', PredefinedStudentSchema);
