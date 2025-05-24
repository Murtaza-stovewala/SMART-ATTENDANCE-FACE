// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PredefinedTeacher = require('../models/PredefinedTeacher');

// ✅ Teacher Login
router.post('/login', async (req, res) => {
  const { teacherId, password } = req.body;

  if (!teacherId || !password) {
    return res.status(400).json({ message: 'Teacher ID and password are required.' });
  }

  try {
    const teacher = await PredefinedTeacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: teacher._id, teacherId: teacher.teacherId },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        teacherId: teacher.teacherId
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ✅ Fetch Teacher Profile (optional)
router.get('/profile/:id', async (req, res) => {
  const teacherId = req.params.id;

  try {
    const teacher = await PredefinedTeacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    res.status(200).json({
      success: true,
      teacher: {
        name: teacher.name,
        teacherId: teacher.teacherId
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching teacher.' });
  }
});

module.exports = router;
