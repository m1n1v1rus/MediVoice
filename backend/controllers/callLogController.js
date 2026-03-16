const CallLog = require("../models/CallLog");

exports.getAll = async (_req, res) => {
  try {
    const logs = await CallLog.find()
      .sort({ createdAt: -1 })
      .lean();

    // Compute stats
    const total = logs.length;
    const confirmed = logs.filter(l => l.status === "confirmed" || l.outcome === "booked").length;
    const cancelled = logs.filter(l => l.status === "cancelled" || l.outcome === "cancelled").length;
    const missed = logs.filter(l => l.status === "missed").length;
    const rescheduled = logs.filter(l => l.status === "rescheduled" || l.outcome === "rescheduled").length;
    const resolved = logs.filter(l => l.wasResolved).length;

    const durations = logs.filter(l => l.duration > 0).map(l => l.duration);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : 0;

    const bookingRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Language breakdown
    const langCounts = {};
    logs.forEach(l => {
      const lang = l.languageDetected || l.language || "en";
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });
    const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "en";

    // Top symptoms
    const symptomCounts = {};
    logs.forEach(l => {
      (l.symptomsDetected || []).forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Peak hours
    const hourCounts = {};
    logs.forEach(l => {
      const h = new Date(l.createdAt).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "10";

    // Format logs for frontend
    const formattedLogs = logs.map(log => {
      const dur = log.duration || 0;
      const mins = Math.floor(dur / 60);
      const secs = dur % 60;
      const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

      // Map outcome/status to display result
      let result = "No Booking";
      if (log.status === "confirmed" || log.outcome === "booked") result = "Confirmed";
      else if (log.status === "cancelled" || log.outcome === "cancelled") result = "Cancelled";
      else if (log.status === "missed") result = "Missed Call";
      else if (log.status === "rescheduled" || log.outcome === "rescheduled") result = "Rescheduled";

      // Format time
      const time = new Date(log.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", hour12: true
      });

      const caller = log.callerName !== "Unknown" ? log.callerName : (log.phoneNumber || "web");

      return {
        _id: log._id,
        caller,
        phoneNumber: log.phoneNumber || "web",
        callerName: log.callerName,
        duration: durationStr,
        durationSeconds: dur,
        intent: log.intent ? log.intent.charAt(0).toUpperCase() + log.intent.slice(1).replace(/_/g, " ") : "Info Inquiry",
        result,
        time,
        language: log.languageDetected || log.language,
        symptomsDetected: log.symptomsDetected,
        doctorRecommended: log.doctorRecommended,
        hasTranscript: Array.isArray(log.transcript) && log.transcript.length > 0,
        turnsCount: log.turnsCount || 0,
        wasResolved: log.wasResolved,
        source: log.source || "web",
        createdAt: log.createdAt,
      };
    });

    res.json({
      logs: formattedLogs,
      stats: {
        total, confirmed, cancelled, missed, rescheduled,
        avgDuration, bookingRate, resolutionRate,
        topLanguage, topSymptoms, peakHour,
        languageBreakdown: langCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await CallLog.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: "Call log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
