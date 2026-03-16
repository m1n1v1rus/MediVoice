const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    preferredLanguage: { type: String, default: 'en' },
    age: { type: Number, min: 0 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    totalCalls: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    lastCallAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);