const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendSMSNotification,
  sendWhatsAppNotification,
  sendAppointmentConfirmation,
  sendReminder,
  getNotificationLogs,
} = require('../controllers/notificationController');

router.post('/sms', sendSMSNotification);
router.post('/whatsapp', sendWhatsAppNotification);
router.post('/appointment-confirm', sendAppointmentConfirmation);
router.post('/reminder', sendReminder);
router.get('/logs', protect, getNotificationLogs);

module.exports = router;