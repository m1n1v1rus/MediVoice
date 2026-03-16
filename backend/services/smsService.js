const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

const sendSMS = async (to, message) => {
  try {
    const twilioClient = getClient();

    if (!twilioClient) {
      console.warn('Twilio not configured. SMS skipped:', { to, message });
      return { success: false, error: 'Twilio not configured' };
    }

    // Ensure +91 prefix for Indian numbers
    const formattedTo = to.startsWith('+') ? to : `+91${to}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });

    console.log('SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };