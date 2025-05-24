const mongoose = require("mongoose");

const predefinedTeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("PredefinedTeacher", predefinedTeacherSchema);
