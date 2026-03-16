const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualification: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    experience: { type: Number, default: 0, min: 0 },
    fee: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    room: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
    },
    isAvailable: { type: Boolean, default: true, index: true },
    languages: {
      type: [String],
      default: ['Hindi', 'English'],
    },
    workingDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    slotDuration: { type: Number, default: 20, min: 5 },
    availableSlots: {
      type: Map,
      of: [
        {
          time: { type: String, required: true },
          isBooked: { type: Boolean, default: false },
          appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
        },
      ],
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

doctorSchema.index({ specialization: 1, isAvailable: 1 });
doctorSchema.index({ name: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);