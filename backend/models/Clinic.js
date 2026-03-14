const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  address:  { type: String, required: true },
  phone:    { type: String, default: "" },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  timings:  { type: String, default: "9:00 AM - 6:00 PM" },
}, { timestamps: true });

module.exports = mongoose.model("Clinic", clinicSchema);