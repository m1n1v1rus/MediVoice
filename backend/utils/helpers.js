const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minutes} ${ampm}`;
};

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').replace(/^(\+91)?/, '');
};

const isValidDate = (dateStr) => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

module.exports = {
  formatDate,
  formatTime,
  generateSessionId,
  sanitizePhone,
  isValidDate,
  getTomorrowDate,
};