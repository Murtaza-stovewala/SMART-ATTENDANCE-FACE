const express = require('express');
const router = express.Router();
const PredefinedStudent = require('../models/PredefinedStudent');
const PredefinedTeacher = require('../models/PredefinedTeacher'); // ✅ Create this model
const bcrypt = require('bcryptjs');

// 🎯 Add Predefined Student
router.post('/add-student', async (req, res) => {
  const { name, collegeId } = req.body;
  try {
    const student = new PredefinedStudent({ name, collegeId });
    await student.save();
    res.status(201).json({ message: 'Student added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// ✅ Add Predefined Teacher
router.post('/add-teacher', async (req, res) => {
  const { name, teacherId, password } = req.body;

  if (!name || !teacherId || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existing = await PredefinedTeacher.findOne({ teacherId });
    if (existing) {
      return res.status(409).json({ message: 'Teacher ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new PredefinedTeacher({ name, teacherId, password: hashedPassword });
    await teacher.save();
    res.status(201).json({ message: 'Teacher added successfully' });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

module.exports = router;

