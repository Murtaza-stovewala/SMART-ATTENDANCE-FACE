const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const generateCodeRoutes = require('./routes/generatecodeRoutes');
app.use('/api/generateCode', generateCodeRoutes);

const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);

const codeRoutes = require('./routes/codeRoutes');
app.use('/api/code', codeRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

const adminRoutes = require('./routes/adminroutes');
app.use('/api/admin', adminRoutes);

// ✅ NEW: Teacher routes
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teacher', teacherRoutes);

// DB + Server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(5000, () => console.log('✅ Server running at http://localhost:5000'));
}).catch(err => console.error('❌ MongoDB connection error:', err));
