const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientName:   { type: String, required: true, trim: true },
  phoneNumber:   { type: String, required: true, index: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date:          { type: String, required: true },         
  time:          { type: String, required: true },          
  symptoms:      { type: String, default: "" },
  language:      { type: String, default: "en" },
  status: {
    type: String,
    enum: ["booked", "cancelled", "rescheduled", "completed"],
    default: "booked",
    index: true,
  },
  priorityLevel: {
    type: String,
    enum: ["normal", "urgent", "emergency"],
    default: "normal",
  },
  reminderSent:      { type: Boolean, default: false },
  confirmationSent:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);