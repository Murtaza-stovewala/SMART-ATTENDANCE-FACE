const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  collegeId: {
    type: String, 
    required: true,
    unique: true
  },
  collegeName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.College || mongoose.model("College", collegeSchema); 

