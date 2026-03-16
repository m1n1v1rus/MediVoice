const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateDoctor } = require('../middleware/validateMiddleware');
const {
  getDoctors,
  searchDoctors,
  getDoctorById,
  getDoctorSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateSlots,
} = require('../controllers/doctorController');

router.get('/search', searchDoctors);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);
router.post('/', protect, validateDoctor, createDoctor);
router.put('/:id', protect, updateDoctor);
router.delete('/:id', protect, deleteDoctor);
router.post('/:id/slots', protect, updateSlots);

module.exports = router;