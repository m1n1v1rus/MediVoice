const CallLog = require('../models/CallLog');
const Patient = require('../models/Patient');

// POST /api/calls/log — AI service sends call data here
const createCallLog = async (req, res, next) => {
  try {
    const {
      sessionId,
      patientPhone,
      startedAt,
      endedAt,
      durationSeconds,
      languageDetected,
      intentDetected,
      outcome,
      wasResolved,
      turnsCount,
      fullTranscript,
      symptoms,
      appointmentId,
      source,
    } = req.body;

    const callLog = await CallLog.create({
      sessionId,
      patientPhone: patientPhone || '',
      startedAt,
      endedAt,
      durationSeconds: durationSeconds || 0,
      languageDetected: languageDetected || 'en',
      intentDetected: intentDetected || '',
      outcome: outcome || '',
      wasResolved: wasResolved || false,
      turnsCount: turnsCount || 0,
      fullTranscript: fullTranscript || '',
      symptoms: symptoms || [],
      appointmentId,
      source: source || 'web',
    });

    // Update patient's call stats
    if (patientPhone) {
      await Patient.findOneAndUpdate(
        { phone: patientPhone },
        {
          $inc: { totalCalls: 1 },
          $set: { lastCallAt: new Date() },
          $setOnInsert: { phone: patientPhone },
        },
        { upsert: true }
      );
    }

    res.status(201).json({ success: true, data: callLog });
  } catch (error) {
    // Handle duplicate sessionId gracefully
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Call log with this session ID already exists',
      });
    }
    next(error);
  }
};

// GET /api/calls — all call logs with filters
const getCallLogs = async (req, res, next) => {
  try {
    const { date, outcome, language, source, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.startedAt = { $gte: dayStart, $lt: dayEnd };
    }
    if (outcome) filter.outcome = outcome;
    if (language) filter.languageDetected = language;
    if (source) filter.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [calls, total] = await Promise.all([
      CallLog.find(filter)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CallLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: calls.length,
      total,
      page: parseInt(page),
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/calls/:sessionId
const getCallBySession = async (req, res, next) => {
  try {
    const call = await CallLog.findOne({ sessionId: req.params.sessionId }).lean();
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call log not found' });
    }
    res.json({ success: true, data: call });
  } catch (error) {
    next(error);
  }
};

// GET /api/calls/stats — summary stats for analytics
const getCallStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalCalls, todayCalls, resolvedCalls, avgDuration, outcomeBreakdown] = await Promise.all([
      CallLog.countDocuments(),
      CallLog.countDocuments({ startedAt: { $gte: today, $lt: tomorrow } }),
      CallLog.countDocuments({ wasResolved: true }),
      CallLog.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' } } },
      ]),
      CallLog.aggregate([
        { $group: { _id: '$outcome', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalCalls,
        todayCalls,
        resolvedCalls,
        resolutionRate: totalCalls > 0 ? ((resolvedCalls / totalCalls) * 100).toFixed(1) : 0,
        avgDurationSeconds: avgDuration[0]?.avgDuration?.toFixed(0) || 0,
        outcomeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCallLog,
  getCallLogs,
  getCallBySession,
  getCallStats,
};