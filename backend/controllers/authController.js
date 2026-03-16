const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Clinic = require('../models/Clinic');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, hospitalName, phone, address } = req.body;

    // Check if admin already exists
    const existing = await Clinic.findOne({ adminEmail: email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const clinic = await Clinic.create({
      name: hospitalName || 'MediVoice Hospital',
      phone: phone || '',
      address: address || '',
      adminEmail: email,
      adminPasswordHash: hashedPassword,
    });

    const token = jwt.sign(
      { clinicId: clinic._id, email: clinic.adminEmail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      data: {
        clinicId: clinic._id,
        hospitalName: clinic.name,
        email: clinic.adminEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const clinic = await Clinic.findOne({ adminEmail: email });
    if (!clinic) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, clinic.adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { clinicId: clinic._id, email: clinic.adminEmail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        clinicId: clinic._id,
        hospitalName: clinic.name,
        email: clinic.adminEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.user.clinicId).select('-adminPasswordHash');
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    res.json({ success: true, data: clinic });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, getMe, logout };