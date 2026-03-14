const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  specialization:  { type: String, required: true, trim: true, index: true },
  qualification:   { type: String, default: "" },
  room:            { type: String, default: "" },
  clinicId:        { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  isAvailable:     { type: Boolean, default: true },
  availableSlots: {
    type: Map,
    of: [slotSchema],
    default: {},
  },
  languages:       [{ type: String }],
}, { timestamps: true });

doctorSchema.index({ specialization: 1, isAvailable: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);