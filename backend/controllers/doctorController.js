const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// GET /api/doctors — filter by specialization, isAvailable, search by name
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, isAvailable, name, department, language } = req.query;
    const filter = {};

    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (name) filter.name = new RegExp(name, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (language) filter.languages = { $in: [new RegExp(language, 'i')] };

    const doctors = await Doctor.find(filter)
      .select('-availableSlots -__v')
      .sort({ rating: -1, experience: -1 })
      .lean();

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/search?name=Sharma
const searchDoctors = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name query required' });
    }

    const doctors = await Doctor.find({
      name: new RegExp(name, 'i'),
      isAvailable: true,
    })
      .select('name specialization fee rating room languages')
      .lean();

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id/slots?date=2024-01-15
const getDoctorSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if doctor has slots for this date
    let slots = doctor.availableSlots?.get(date);

    // If no slots stored, generate default slots based on working days
    if (!slots || slots.length === 0) {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

      if (!doctor.workingDays.includes(dayOfWeek)) {
        return res.json({
          success: true,
          data: {
            doctorId: doctor._id,
            doctorName: doctor.name,
            date,
            message: `Doctor is not available on ${dayOfWeek}`,
            slots: [],
          },
        });
      }

      // Generate default slots: 9 AM to 5 PM
      const generatedSlots = [];
      const duration = doctor.slotDuration || 20;
      let hour = 9;
      let minute = 0;

      while (hour < 17) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        // Check if this slot is already booked in appointments collection
        const existingAppt = await Appointment.findOne({
          doctorId: doctor._id,
          date,
          time: timeStr,
          status: { $in: ['booked', 'confirmed'] },
        });

        generatedSlots.push({
          time: timeStr,
          isBooked: !!existingAppt,
        });

        minute += duration;
        if (minute >= 60) {
          hour += Math.floor(minute / 60);
          minute = minute % 60;
        }
      }

      slots = generatedSlots;
    }

    res.json({
      success: true,
      data: {
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        fee: doctor.fee,
        date,
        slots,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors — create new doctor
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id — update doctor
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id — soft delete (set isAvailable = false)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deactivated', data: doctor });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors/:id/slots — add/update slots for a date
const updateSlots = async (req, res, next) => {
  try {
    const { date, slots } = req.body;
    if (!date || !slots) {
      return res.status(400).json({ success: false, message: 'Date and slots are required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.availableSlots.set(date, slots);
    await doctor.save();

    res.json({ success: true, message: 'Slots updated', data: { date, slots } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  searchDoctors,
  getDoctorById,
  getDoctorSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateSlots,
};