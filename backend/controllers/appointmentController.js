const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const CallLog = require("../models/CallLog");

exports.book = async (req, res) => {
  try {
    const { patientName, phoneNumber, doctorId, date, time, symptoms, language, priorityLevel } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const daySlots = doctor.availableSlots.get(date);
    if (!daySlots) return res.status(400).json({ error: "No slots on this date" });

    const slot = daySlots.find((s) => s.time === time && !s.isBooked);
    if (!slot) return res.status(409).json({ error: "Slot not available" });

    slot.isBooked = true;
    doctor.availableSlots.set(date, daySlots);
    await doctor.save();

    const appointment = await Appointment.create({
      patientName, phoneNumber, doctorId, date, time,
      symptoms, language, priorityLevel: priorityLevel || "normal",
      confirmationSent: true,
    });

    const populated = await appointment.populate("doctorId", "name specialization room");

    await CallLog.create({
      phoneNumber, language, intent: "book",
      symptomsDetected: symptoms ? symptoms.split(",") : [],
      doctorRecommended: doctor.name, outcome: "booked",
    });

    res.status(201).json({ appointment: populated, message: "Appointment booked successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const { status, date, doctorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (doctorId) filter.doctorId = doctorId;

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization room")
      .sort({ createdAt: -1 })
      .lean();
    res.json(appointments);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const doctor = await Doctor.findById(appt.doctorId);
    if (doctor) {
      const daySlots = doctor.availableSlots.get(appt.date);
      if (daySlots) {
        const slot = daySlots.find((s) => s.time === appt.time);
        if (slot) slot.isBooked = false;
        doctor.availableSlots.set(appt.date, daySlots);
        await doctor.save();
      }
    }

    appt.status = "cancelled";
    await appt.save();

    await CallLog.create({ phoneNumber: appt.phoneNumber, intent: "cancel", outcome: "cancelled" });

    res.json({ message: "Appointment cancelled", appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.reschedule = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });

    const doctor = await Doctor.findById(appt.doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const oldSlots = doctor.availableSlots.get(appt.date);
    if (oldSlots) {
      const old = oldSlots.find((s) => s.time === appt.time);
      if (old) old.isBooked = false;
      doctor.availableSlots.set(appt.date, oldSlots);
    }

    const newSlots = doctor.availableSlots.get(newDate);
    if (!newSlots) return res.status(400).json({ error: "No slots on new date" });
    const target = newSlots.find((s) => s.time === newTime && !s.isBooked);
    if (!target) return res.status(409).json({ error: "New slot not available" });

    target.isBooked = true;
    doctor.availableSlots.set(newDate, newSlots);
    await doctor.save();

    appt.date = newDate;
    appt.time = newTime;
    appt.status = "rescheduled";
    await appt.save();

    await CallLog.create({ phoneNumber: appt.phoneNumber, intent: "reschedule", outcome: "rescheduled" });

    res.json({ message: "Appointment rescheduled", appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.findByPhone = async (req, res) => {
  try {
    const appts = await Appointment.find({
      phoneNumber: req.params.phone,
      status: { $in: ["booked", "rescheduled"] },
    }).populate("doctorId", "name specialization room").lean();
    res.json(appts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};