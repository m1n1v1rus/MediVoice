const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPatients,
  getPatientByPhone,
  createPatient,
  updatePatient,
} = require('../controllers/patientController');

router.get('/', protect, getPatients);
router.get('/:phone', getPatientByPhone);
router.post('/', createPatient);
router.put('/:phone', updatePatient);

module.exports = router;