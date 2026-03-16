const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'MediVoice Hospital',
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    workingHours: {
      type: Map,
      of: String,
      default: {
        Mon: '09:00-18:00',
        Tue: '09:00-18:00',
        Wed: '09:00-18:00',
        Thu: '09:00-18:00',
        Fri: '09:00-18:00',
        Sat: '09:00-14:00',
      },
    },
    defaultLanguage: { type: String, default: 'en' },
    reminderTime: { type: String, default: '09:00' },
    maxSlotsPerDay: { type: Number, default: 30 },
    adminEmail: { type: String, default: '' },
    adminPasswordHash: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Clinic', clinicSchema);