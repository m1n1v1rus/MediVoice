const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  phoneNumber:       { type: String, default: "web" },
  language:          { type: String, default: "en" },
  intent:            { type: String, default: "" },
  symptomsDetected:  [String],
  doctorRecommended: { type: String, default: "" },
  outcome:           { type: String, default: "" },
  duration:          { type: Number, default: 0 },
  transcript:        { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("CallLog", callLogSchema);