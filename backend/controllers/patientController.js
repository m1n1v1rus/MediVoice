const Patient = require('../models/Patient');

// GET /api/patients
const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [patients, total] = await Promise.all([
      Patient.find().sort({ lastCallAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Patient.countDocuments(),
    ]);

    res.json({ success: true, count: patients.length, total, data: patients });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/:phone
const getPatientByPhone = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ phone: req.params.phone }).lean();
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// POST /api/patients
const createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { phone: req.body.phone },
      { $set: req.body, $setOnInsert: { phone: req.body.phone } },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:phone
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { phone: req.params.phone },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatientByPhone, createPatient, updatePatient };