# MediVoice Backend - Complete Setup Guide

## Overview
MediVoice is an AI-powered voice receptionist backend for hospitals and clinics. This is the complete Node.js + Express + MongoDB implementation with real-time Socket.io integration.

## Tech Stack
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Auth**: JWT (JSON Web Tokens)
- **Notifications**: Twilio (SMS + WhatsApp)
- **Scheduling**: node-cron
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **Logging**: Morgan, Winston

## Project Structure
```
backend/
├── config/
│   ├── db.js              ← MongoDB connection
│   ├── constants.js       ← App constants
│   └── rateLimiter.js     ← Rate limiting config
├── controllers/
│   ├── doctorController.js
│   ├── appointmentController.js
│   ├── callLogController.js
│   ├── analyticsController.js
│   ├── authController.js
│   ├── patientController.js
│   └── notificationController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validateMiddleware.js
├── models/
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── CallLog.js
│   ├── Patient.js
│   ├── Notification.js
│   └── Clinic.js
├── routes/
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── callLogRoutes.js
│   ├── analyticsRoutes.js
│   ├── authRoutes.js
│   ├── patientRoutes.js
│   └── notificationRoutes.js
├── services/
│   ├── smsService.js      ← Twilio SMS
│   ├── whatsappService.js ← Twilio WhatsApp
│   └── reminderService.js ← Cron scheduler
├── socket/
│   └── socketHandler.js   ← Socket.io events
├── utils/
│   ├── helpers.js         ← Utility functions
│   └── logger.js          ← Logging utility
├── .env                   ← Environment variables
├── server.js              ← Entry point
├── package.json
└── API_DOCUMENTATION.md
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/medivoice

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Twilio - SMS + WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# AI Service URL
AI_SERVICE_URL=http://localhost:8000

# Hospital Config
HOSPITAL_NAME=MediVoice Hospital
REMINDER_TIME=09:00
```

### 3. Start MongoDB
```bash
# On Windows (if installed)
mongod

# Or use MongoDB Atlas connection string (recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medivoice
```

### 4. Run Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new clinic
- `POST /api/auth/login` - Login clinic admin
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/slots?date=2026-03-20` - Get available slots
- `POST /api/doctors` - Create doctor (Admin)
- `PUT /api/doctors/:id` - Update doctor (Admin)
- `DELETE /api/doctors/:id` - Deactivate doctor (Admin)

### Appointments
- `GET /api/appointments` - Get all appointments (Admin)
- `GET /api/appointments/:id` - Get appointment by ID
- `GET /api/appointments/patient/:phone` - Get patient's appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/reschedule` - Reschedule appointment
- `PATCH /api/appointments/:id/complete` - Mark as completed (Admin)

### Call Logs
- `POST /api/calls/log` - Save call log
- `GET /api/calls` - Get all call logs (Admin)
- `GET /api/calls/:sessionId` - Get call log by session

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/daily` - Daily statistics
- `GET /api/analytics/languages` - Language breakdown
- `GET /api/analytics/symptoms` - Top symptoms
- `GET /api/analytics/doctors` - Most booked doctors
- `GET /api/analytics/peak-hours` - Busy hours

### Patients
- `GET /api/patients` - All patients (Admin)
- `GET /api/patients/:phone` - Patient by phone
- `POST /api/patients` - Create patient
- `PUT /api/patients/:phone` - Update patient

### Notifications
- `GET /api/notifications/logs` - Notification logs (Admin)
- `POST /api/notifications/sms` - Send SMS
- `POST /api/notifications/whatsapp` - Send WhatsApp
- `POST /api/notifications/reminder` - Send reminder (Admin)

## WebSocket Events (Socket.io)

### Client → Server
```javascript
socket.emit('call:start', { sessionId, patientPhone })
socket.emit('audio:chunk', { sessionId, audioBase64 })
socket.emit('transcript:update', { sessionId, role, text })
socket.emit('call:end', { sessionId })
```

### Server → Client
```javascript
socket.on('call:state', { state, sessionId })
socket.on('audio:response', { audioBase64, text, state })
socket.on('transcript:update', { role, text })
socket.on('call:ended', { summary })
socket.on('error', { message })
```

## Features Implemented

### Phase 1 - Core Features ✅
- Doctor management (CRUD, filtering, slots)
- Appointment booking and management
- Call log tracking
- AI service integration ready

### Phase 2 - Dashboard & Notifications ✅
- Patient management
- Notification logging (SMS/WhatsApp)
- Twilio integration
- Analytics endpoints
- Automated reminder scheduling
- Authentication & authorization

### Phase 3 - Advanced Features ✅
- Rate limiting (global, auth, API-specific)
- Enhanced security (helmet, CORS, validation)
- Socket.io real-time voice streaming
- WhatsApp service
- Comprehensive error handling
- Request/response logging
- Production-ready configuration

## Rate Limiting

The backend includes multiple rate limiters:
- **Global**: 100 requests per 15 minutes
- **Auth**: 5 requests per 15 minutes (for login attempts)
- **API**: 30 requests per minute
- **Socket.io**: 50 connections per minute

## Security Features

1. **Helmet** - Security headers
2. **JWT Authentication** - Secure token-based auth
3. **Rate Limiting** - Prevent abuse
4. **CORS** - Cross-origin control
5. **Input Validation** - express-validator
6. **Error Handling** - Safe error messages
7. **Password Hashing** - bcryptjs with salt

## Database Models

### Doctor
- name, specialization, qualification, experience
- fee, rating, room, phone, email
- clinicId, isAvailable, availableSlots
- languages, workingDays, slotDuration

### Appointment
- patientName, patientPhone, doctorId, doctorName
- clinicId, date, time, symptoms, status
- bookingType, sessionId, reminderSent, smsSent, whatsappSent

### CallLog
- sessionId (unique), patientPhone, startedAt, endedAt
- durationSeconds, languageDetected, intentDetected
- outcome, wasResolved, turnsCount, fullTranscript
- symptoms, appointmentId, source

### Patient
- name, phone (unique), preferredLanguage, age, gender
- totalCalls, totalAppointments, lastCallAt, createdAt

### Notification
- appointmentId, patientPhone, type, purpose, message
- status, twilioSid, sentAt, errorMessage

### Clinic
- name, address, phone, email, password, timings

## Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"My Clinic","email":"clinic@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@example.com","password":"pass123"}'
```

### Using Postman
1. Import the API_DOCUMENTATION.md examples
2. Set `{{BASE_URL}}` to `http://localhost:5000/api`
3. Set `{{TOKEN}}` from login response for protected endpoints
4. Use Bearer token: `Authorization: Bearer {{TOKEN}}`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/medivoice |
| JWT_SECRET | JWT signing key | your_secret_key |
| JWT_EXPIRE | Token expiration | 7d |
| TWILIO_ACCOUNT_SID | Twilio account ID | AC... |
| TWILIO_AUTH_TOKEN | Twilio auth token | ... |
| TWILIO_PHONE_NUMBER | Twilio SMS number | +1XXXXXXXXXX |
| TWILIO_WHATSAPP_NUMBER | Twilio WhatsApp | whatsapp:+1... |
| AI_SERVICE_URL | Python AI service | http://localhost:8000 |
| HOSPITAL_NAME | Hospital name | MediVoice Hospital |
| REMINDER_TIME | Reminder cron time | 09:00 |

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- For remote: Use MongoDB Atlas connection string

### Port Already in Use
```bash
# Change PORT in .env or
lsof -i :5000  # Find process
kill -9 <PID>   # Kill process
```

### Twilio Integration Issues
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Ensure phone numbers are in international format (+91... for India)
- Check Twilio account balance

### JWT Token Errors
- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Ensure token hasn't expired (7 days default)

## Production Deployment

1. **Set NODE_ENV to production**
   ```env
   NODE_ENV=production
   ```

2. **Use MongoDB Atlas** (not local)
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medivoice
   ```

3. **Enable SSL/TLS** for HTTPS

4. **Set strong JWT_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Use environment variables** from hosting platform

6. **Enable CORS** only for frontend domain
   ```javascript
   cors({ origin: 'https://yourdomain.com' })
   ```

7. **Monitor logs** in production
   ```bash
   tail -f logs/error.log
   tail -f logs/api.log
   ```

## Next Steps

1. Connect frontend (React) to this backend
2. Integrate Python AI service
3. Configure Twilio for SMS/WhatsApp
4. Deploy to production (Heroku, AWS, DigitalOcean, etc.)
5. Monitor performance and logs
6. Set up CI/CD pipeline

## Support & Documentation

- API Documentation: See `API_DOCUMENTATION.md`
- Mongoose Schema: Check `models/` folder
- Controllers: See `controllers/` folder
- Routes: See `routes/` folder

---

**MediVoice Backend v1.0 | Murf AI Hackathon 2024**