const Doctor = require("../models/Doctor");

exports.getAll = async (_req, res) => {
  try {
    const doctors = await Doctor.find().lean();
    res.json(doctors);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAvailable = async (req, res) => {
  try {
    const { specialization, date } = req.query;
    const filter = { isAvailable: true };
    if (specialization) filter.specialization = new RegExp(specialization, "i");

    const doctors = await Doctor.find(filter).lean();

    // Attach free slots for the requested date
    const result = doctors.map((doc) => {
      const daySlots = doc.availableSlots?.[date] || [];
      const freeSlots = daySlots.filter((s) => !s.isBooked);
      return { ...doc, freeSlots };
    }).filter((d) => d.freeSlots.length > 0);

    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.generateSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, slots } = req.body;      
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const slotObjects = slots.map((t) => ({ time: t, isBooked: false }));
    doctor.availableSlots.set(date, slotObjects);
    await doctor.save();
    res.json({ message: "Slots generated", date, slots: slotObjects });
  } catch (err) { res.status(500).json({ error: err.message }); }
};