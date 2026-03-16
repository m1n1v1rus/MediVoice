const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      unique: true,
      index: true,
    },
    patientPhone: { type: String, default: '', index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    languageDetected: { type: String, default: 'en' },
    intentDetected: { type: String, default: '' },
    outcome: {
      type: String,
      enum: ['booked', 'cancelled', 'rescheduled', 'inquiry', 'failed', ''],
      default: '',
    },
    wasResolved: { type: Boolean, default: false },
    turnsCount: { type: Number, default: 0 },
    fullTranscript: { type: String, default: '' },
    symptoms: { type: [String], default: [] },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    source: {
      type: String,
      enum: ['web', 'phone'],
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

callLogSchema.index({ startedAt: -1 });
callLogSchema.index({ outcome: 1 });

module.exports = mongoose.model('CallLog', callLogSchema);