const { body, param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateAppointment = [
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('patientPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Invalid phone number (must be 10-15 digits, optional + prefix)'),
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('doctorName').trim().notEmpty().withMessage('Doctor name is required'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be YYYY-MM-DD format'),
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time must be HH:MM format'),
  handleValidation,
];

const validateCallLog = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('startedAt').notEmpty().withMessage('Start time is required').isISO8601().withMessage('Invalid date format'),
  handleValidation,
];

const validateDoctor = [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validatePhone = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Invalid phone number (must be 10-15 digits, optional + prefix)'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateAppointment,
  validateCallLog,
  validateDoctor,
  validateLogin,
  validatePhone,
};