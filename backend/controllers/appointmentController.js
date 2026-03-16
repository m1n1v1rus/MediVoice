const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { APPOINTMENT_STATUS } = require('../config/constants');

// GET /api/appointments — admin, filter by date/status/phone/doctor
const getAppointments = async (req, res, next) => {
  try {
    const { date, status, phone, doctorId, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (status) filter.status = status;
    if (phone) filter.patientPhone = phone;
    if (doctorId) filter.doctorId = doctorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ date: -1, time: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('doctorId', 'name specialization room')
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctorId', 'name specialization room fee')
      .lean();

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/patient/:phone
const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      patientPhone: req.params.phone,
    })
      .sort({ date: -1, time: -1 })
      .populate('doctorId', 'name specialization room')
      .lean();

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments — MAIN BOOKING ENDPOINT (AI service calls this)
const createAppointment = async (req, res, next) => {
  try {
    const { patientName, patientPhone, doctorId, doctorName, date, time, symptoms, bookingType, sessionId } = req.body;

    // 1. Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    if (!doctor.isAvailable) {
      return res.status(400).json({ success: false, message: 'Doctor is not available' });
    }

    // 2. Check for duplicate booking (same doctor, date, time)
    const existingSlot = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (existingSlot) {
      return res.status(409).json({
        success: false,
        message: `This slot (${time}) is already booked. Please choose another time.`,
      });
    }

    // 3. Check for duplicate patient booking (same patient, same doctor, same date)
    const duplicatePatient = await Appointment.findOne({
      patientPhone,
      doctorId,
      date,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (duplicatePatient) {
      return res.status(409).json({
        success: false,
        message: 'Patient already has an appointment with this doctor on this date.',
        existingAppointment: duplicatePatient,
      });
    }

    // 4. Create appointment
    const appointment = await Appointment.create({
      patientName,
      patientPhone,
      doctorId,
      doctorName: doctorName || doctor.name,
      date,
      time,
      symptoms: symptoms || [],
      bookingType: bookingType || 'by_symptom',
      sessionId: sessionId || '',
      status: APPOINTMENT_STATUS.BOOKED,
    });

    // 5. Update doctor's slot as booked (if using availableSlots map)
    if (doctor.availableSlots && doctor.availableSlots.has(date)) {
      const slots = doctor.availableSlots.get(date);
      const slotIndex = slots.findIndex((s) => s.time === time);
      if (slotIndex !== -1) {
        slots[slotIndex].isBooked = true;
        slots[slotIndex].appointmentId = appointment._id;
        doctor.availableSlots.set(date, slots);
        await doctor.save();
      }
    }

    // 6. Update or create patient record
    await Patient.findOneAndUpdate(
      { phone: patientPhone },
      {
        $set: { name: patientName, lastCallAt: new Date() },
        $inc: { totalAppointments: 1 },
        $setOnInsert: { phone: patientPhone },
      },
      { upsert: true, new: true }
    );

    // Populate doctor info for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization room fee')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id — update individual fields
const updateAppointment = async (req, res, next) => {
  try {
    const allowedUpdates = ['reminderSent', 'smsSent', 'whatsappSent', 'status', 'notes'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/cancel — cancel by phone + doctorId + date (AI service calls this)
const cancelAppointment = async (req, res, next) => {
  try {
    const { phone, doctorId, date } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const filter = {
      patientPhone: phone,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
    };

    if (doctorId) filter.doctorId = doctorId;
    if (date) filter.date = date;

    // Find the most recent matching appointment
    const appointment = await Appointment.findOne(filter).sort({ date: 1, time: 1 });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'No active appointment found for this patient',
      });
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    // Free up the doctor's slot
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor && doctor.availableSlots && doctor.availableSlots.has(appointment.date)) {
      const slots = doctor.availableSlots.get(appointment.date);
      const slotIndex = slots.findIndex((s) => s.time === appointment.time);
      if (slotIndex !== -1) {
        slots[slotIndex].isBooked = false;
        slots[slotIndex].appointmentId = undefined;
        doctor.availableSlots.set(appointment.date, slots);
        await doctor.save();
      }
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, message: 'New date and time are required' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if new slot is available
    const slotTaken = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date,
      time,
      status: { $in: [APPOINTMENT_STATUS.BOOKED, APPOINTMENT_STATUS.CONFIRMED] },
      _id: { $ne: appointment._id },
    });

    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: `Slot ${time} on ${date} is already booked`,
      });
    }

    // Free old slot
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor && doctor.availableSlots) {
      // Free old
      if (doctor.availableSlots.has(appointment.date)) {
        const oldSlots = doctor.availableSlots.get(appointment.date);
        const oldIdx = oldSlots.findIndex((s) => s.time === appointment.time);
        if (oldIdx !== -1) {
          oldSlots[oldIdx].isBooked = false;
          oldSlots[oldIdx].appointmentId = undefined;
          doctor.availableSlots.set(appointment.date, oldSlots);
        }
      }
      // Book new
      if (doctor.availableSlots.has(date)) {
        const newSlots = doctor.availableSlots.get(date);
        const newIdx = newSlots.findIndex((s) => s.time === time);
        if (newIdx !== -1) {
          newSlots[newIdx].isBooked = true;
          newSlots[newIdx].appointmentId = appointment._id;
          doctor.availableSlots.set(date, newSlots);
        }
      }
      await doctor.save();
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
    appointment.reminderSent = false;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/appointments/:id/complete
const completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: APPOINTMENT_STATUS.COMPLETED },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment completed', data: appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
};