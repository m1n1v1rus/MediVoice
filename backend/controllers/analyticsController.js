const CallLog = require('../models/CallLog');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// GET /api/analytics/dashboard — main dashboard stats
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];

    const [
      totalCalls,
      todayCalls,
      resolvedCalls,
      totalAppointments,
      todayAppointments,
      cancelledAppointments,
      totalPatients,
      avgDuration,
    ] = await Promise.all([
      CallLog.countDocuments(),
      CallLog.countDocuments({ startedAt: { $gte: today, $lt: tomorrow } }),
      CallLog.countDocuments({ wasResolved: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: todayStr }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Patient.countDocuments(),
      CallLog.aggregate([
        { $group: { _id: null, avg: { $avg: '$durationSeconds' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalCalls,
        todayCalls,
        resolvedCalls,
        resolutionRate: totalCalls > 0 ? ((resolvedCalls / totalCalls) * 100).toFixed(1) : '0',
        totalAppointments,
        todayAppointments,
        cancelledAppointments,
        totalPatients,
        avgCallDuration: avgDuration[0]?.avg?.toFixed(0) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/daily?from=YYYY-MM-DD&to=YYYY-MM-DD
const getDailyStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    toDate.setDate(toDate.getDate() + 1);

    const dailyStats = await CallLog.aggregate([
      {
        $match: {
          startedAt: { $gte: fromDate, $lt: toDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          totalCalls: { $sum: 1 },
          resolvedCalls: { $sum: { $cond: ['$wasResolved', 1, 0] } },
          avgDuration: { $avg: '$durationSeconds' },
          bookings: { $sum: { $cond: [{ $eq: ['$outcome', 'booked'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: dailyStats });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/languages
const getLanguageStats = async (req, res, next) => {
  try {
    const stats = await CallLog.aggregate([
      { $match: { languageDetected: { $ne: '' } } },
      { $group: { _id: '$languageDetected', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/symptoms
const getSymptomStats = async (req, res, next) => {
  try {
    const stats = await CallLog.aggregate([
      { $unwind: '$symptoms' },
      { $group: { _id: '$symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/doctors — most booked doctors
const getDoctorStats = async (req, res, next) => {
  try {
    const stats = await Appointment.aggregate([
      { $match: { status: { $in: ['booked', 'confirmed', 'completed'] } } },
      {
        $group: {
          _id: '$doctorId',
          doctorName: { $first: '$doctorName' },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/peak-hours
const getPeakHours = async (req, res, next) => {
  try {
    const stats = await CallLog.aggregate([
      {
        $group: {
          _id: { $hour: '$startedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = stats.map((s) => ({
      hour: `${String(s._id).padStart(2, '0')}:00`,
      calls: s.count,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDailyStats,
  getLanguageStats,
  getSymptomStats,
  getDoctorStats,
  getPeakHours,
};