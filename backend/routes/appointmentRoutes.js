const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateAppointment } = require('../middleware/validateMiddleware');
const {
  getAppointments,
  getAppointmentById,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} = require('../controllers/appointmentController');

router.get('/', protect, getAppointments);
router.get('/:id', getAppointmentById);
router.get('/patient/:phone', getPatientAppointments);
router.post('/', validateAppointment, createAppointment);
router.patch('/cancel', cancelAppointment);
router.patch('/:id', updateAppointment);
router.patch('/:id/reschedule', rescheduleAppointment);
router.patch('/:id/complete', protect, completeAppointment);

module.exports = router;