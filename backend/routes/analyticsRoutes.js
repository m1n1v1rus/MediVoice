const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getDailyStats,
  getLanguageStats,
  getSymptomStats,
  getDoctorStats,
  getPeakHours,
} = require('../controllers/analyticsController');

router.get('/dashboard', protect, getDashboardStats);
router.get('/daily', protect, getDailyStats);
router.get('/languages', protect, getLanguageStats);
router.get('/symptoms', protect, getSymptomStats);
router.get('/doctors', protect, getDoctorStats);
router.get('/peak-hours', protect, getPeakHours);

module.exports = router;