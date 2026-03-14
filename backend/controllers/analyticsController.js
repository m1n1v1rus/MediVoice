const Appointment = require("../models/Appointment");
const CallLog = require("../models/CallLog");

exports.getDashboard = async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [totalAppts, todayAppts, cancelledToday, callsToday, allCalls] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: today, status: { $ne: "cancelled" } }),
      Appointment.countDocuments({ date: today, status: "cancelled" }),
      CallLog.countDocuments({ createdAt: { $gte: new Date(today) } }),
      CallLog.find({ createdAt: { $gte: new Date(today) } }).lean(),
    ]);

    const avgDuration = allCalls.length
      ? Math.round(allCalls.reduce((s, c) => s + (c.duration || 0), 0) / allCalls.length)
      : 0;

    const recentAppointments = await Appointment.find()
      .populate("doctorId", "name specialization")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      totalAppointments: totalAppts,
      todayAppointments: todayAppts,
      cancelledToday,
      callsToday,
      avgCallDuration: avgDuration,
      recentAppointments,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};