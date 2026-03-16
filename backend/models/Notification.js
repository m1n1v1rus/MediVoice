
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patientPhone: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['sms', 'whatsapp'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['confirmation', 'reminder', 'cancellation', 'reschedule'],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    twilioSid: { type: String, default: '' },
    sentAt: { type: Date },
    errorMessage: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ appointmentId: 1 });
notificationSchema.index({ status: 1, purpose: 1 });

module.exports = mongoose.model('Notification', notificationSchema);