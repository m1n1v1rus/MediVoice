const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

const sendWhatsApp = async (to, message) => {
  try {
    const twilioClient = getClient();

    if (!twilioClient) {
      console.warn('Twilio not configured. WhatsApp skipped:', { to, message });
      return { success: false, error: 'Twilio not configured' };
    }

    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:+91${to.replace('+91', '')}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: formattedTo,
    });

    console.log('WhatsApp sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('WhatsApp failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsApp };