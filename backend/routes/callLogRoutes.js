const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateCallLog } = require('../middleware/validateMiddleware');
const {
  createCallLog,
  getCallLogs,
  getCallBySession,
  getCallStats,
} = require('../controllers/callLogController');

router.post('/log', validateCallLog, createCallLog);
router.get('/stats', protect, getCallStats);
router.get('/', protect, getCallLogs);
router.get('/:sessionId', getCallBySession);

module.exports = router;