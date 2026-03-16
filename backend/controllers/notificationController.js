const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const { sendSMS } = require('../services/smsService');
const { sendWhatsApp } = require('../services/whatsappService');

// POST /api/notifications/sms
const sendSMSNotification = async (req, res, next) => {
  try {
    const { appointmentId, phone, message, purpose } = req.body;

    const result = await sendSMS(phone, message);

    const notification = await Notification.create({
      appointmentId,
      patientPhone: phone,
      type: 'sms',
      purpose: purpose || 'confirmation',
      message,
      status: result.success ? 'sent' : 'failed',
      twilioSid: result.sid || '',
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error || '',
    });

    // Update appointment's smsSent flag
    if (appointmentId && result.success) {
      await Appointment.findByIdAndUpdate(appointmentId, { smsSent: true });
    }

    res.json({ success: result.success, data: notification });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/whatsapp
const sendWhatsAppNotification = async (req, res, next) => {
  try {
    const { appointmentId, phone, message, purpose } = req.body;

    const result = await sendWhatsApp(phone, message);

    const notification = await Notification.create({
      appointmentId,
      patientPhone: phone,
      type: 'whatsapp',
      purpose: purpose || 'confirmation',
      message,
      status: result.success ? 'sent' : 'failed',
      twilioSid: result.sid || '',
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error || '',
    });

    if (appointmentId && result.success) {
      await Appointment.findByIdAndUpdate(appointmentId, { whatsappSent: true });
    }

    res.json({ success: result.success, data: notification });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/appointment-confirm
const sendAppointmentConfirmation = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId).populate('doctorId', 'name room');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const message = `✅ Appointment Confirmed!\n\nDoctor: ${appointment.doctorName}\nDate: ${appointment.date}\nTime: ${appointment.time}\nRoom: ${appointment.doctorId?.room || 'TBD'}\n\n- MediVoice AI`;

    // Try SMS
    const smsResult = await sendSMS(appointment.patientPhone, message);
    await Notification.create({
      appointmentId,
      patientPhone: appointment.patientPhone,
      type: 'sms',
      purpose: 'confirmation',
      message,
      status: smsResult.success ? 'sent' : 'failed',
      twilioSid: smsResult.sid || '',
      sentAt: smsResult.success ? new Date() : undefined,
      errorMessage: smsResult.error || '',
    });

    if (smsResult.success) {
      appointment.smsSent = true;
      await appointment.save();
    }

    res.json({
      success: true,
      message: 'Confirmation sent',
      sms: smsResult.success,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/reminder
const sendReminder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const message = `⏰ Reminder: Your appointment with ${appointment.doctorName} is on ${appointment.date} at ${appointment.time}. Please arrive 10 minutes early.\n\n- MediVoice AI`;

    const smsResult = await sendSMS(appointment.patientPhone, message);
    await Notification.create({
      appointmentId,
      patientPhone: appointment.patientPhone,
      type: 'sms',
      purpose: 'reminder',
      message,
      status: smsResult.success ? 'sent' : 'failed',
      twilioSid: smsResult.sid || '',
      sentAt: smsResult.success ? new Date() : undefined,
      errorMessage: smsResult.error || '',
    });

    if (smsResult.success) {
      appointment.reminderSent = true;
      await appointment.save();
    }

    res.json({ success: true, message: 'Reminder sent', sms: smsResult.success });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/logs
const getNotificationLogs = async (req, res, next) => {
  try {
    const { type, purpose, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, count: notifications.length, total, data: notifications });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendSMSNotification,
  sendWhatsAppNotification,
  sendAppointmentConfirmation,
  sendReminder,
  getNotificationLogs,
};