module.exports = {
  APPOINTMENT_STATUS: {
    BOOKED: 'booked',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    RESCHEDULED: 'rescheduled',
  },

  BOOKING_TYPE: {
    BY_NAME: 'by_name',
    BY_SYMPTOM: 'by_symptom',
  },

  CALL_OUTCOMES: {
    BOOKED: 'booked',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled',
    INQUIRY: 'inquiry',
    FAILED: 'failed',
  },

  NOTIFICATION_TYPE: {
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
  },

  NOTIFICATION_PURPOSE: {
    CONFIRMATION: 'confirmation',
    REMINDER: 'reminder',
    CANCELLATION: 'cancellation',
    RESCHEDULE: 'reschedule',
  },

  NOTIFICATION_STATUS: {
    SENT: 'sent',
    FAILED: 'failed',
    PENDING: 'pending',
  },

  LANGUAGES: ['hi', 'en', 'ta', 'te', 'kn', 'ml'],

  SLOT_DURATION_DEFAULT: 20,
  MAX_SLOTS_PER_DAY: 30,

  SPECIALIZATION_MAP: {
    fever: 'General Physician',
    cold: 'General Physician',
    cough: 'General Physician',
    headache: 'General Physician',
    stomach_pain: 'Gastroenterologist',
    acidity: 'Gastroenterologist',
    skin_rash: 'Dermatologist',
    acne: 'Dermatologist',
    chest_pain: 'Cardiologist',
    heart: 'Cardiologist',
    eye_problem: 'Ophthalmologist',
    ear_pain: 'ENT',
    tooth_pain: 'Dentist',
    bone_pain: 'Orthopedic',
    anxiety: 'Psychiatrist',
    depression: 'Psychiatrist',
    child_fever: 'Pediatrician',
    pregnancy: 'Gynecologist',
  },

  EMERGENCY_SYMPTOMS: [
    'chest_pain',
    'breathing_difficulty',
    'severe_bleeding',
    'unconscious',
    'stroke',
    'heart_attack',
  ],
};