const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../config/rateLimiter');
const { validateLogin } = require('../middleware/validateMiddleware');
const { register, login, getMe, logout } = require('../controllers/authController');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;