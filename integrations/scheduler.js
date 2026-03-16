const cron = require('node-cron');

// Dummy scheduler for hackathon
export const startScheduler = () => {
  // schedule daily at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running daily appointment reminder job...');
    // fetch upcoming appointments
    // send Twilio reminders
  });
};
