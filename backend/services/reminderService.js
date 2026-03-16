const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendSMS } = require('./smsService');
const Notification = require('../models/Notification');

const startReminderScheduler = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running daily reminder job...');

    try {
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Find appointments for tomorrow that haven't been reminded
      const appointments = await Appointment.find({
        date: tomorrowStr,
        status: { $in: ['booked', 'confirmed'] },
        reminderSent: false,
      });

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      for (const appt of appointments) {
        const message = `⏰ Reminder: Your appointment with ${appt.doctorName} is tomorrow (${appt.date}) at ${appt.time}. Please arrive 10 minutes early.\n\n- MediVoice AI`;

        const result = await sendSMS(appt.patientPhone, message);

        await Notification.create({
          appointmentId: appt._id,
          patientPhone: appt.patientPhone,
          type: 'sms',
          purpose: 'reminder',
          message,
          status: result.success ? 'sent' : 'failed',
          twilioSid: result.sid || '',
          sentAt: result.success ? new Date() : undefined,
          errorMessage: result.error || '',
        });

        if (result.success) {
          appt.reminderSent = true;
          await appt.save();
        }

        // Small delay between messages to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500));
      }

      console.log(`✅ Reminder job completed. Processed ${appointments.length} appointments.`);
    } catch (error) {
      console.error('❌ Reminder job failed:', error.message);
    }
  });

  // Scheduler running silently
};

module.exports = { startReminderScheduler };