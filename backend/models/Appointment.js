const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, BOOKING_TYPE } = require('../config/constants');

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      trim: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    symptoms: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.BOOKED,
      index: true,
    },
    bookingType: {
      type: String,
      enum: Object.values(BOOKING_TYPE),
      default: BOOKING_TYPE.BY_SYMPTOM,
    },
    sessionId: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    whatsappSent: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientPhone: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);