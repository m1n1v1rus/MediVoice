/**
 * MediVoice Backend API Documentation
 * Version: 1.0.0
 * 
 * Base URL: http://localhost:5000/api
 */

/**
 * ============================================
 * 1. HEALTH CHECK
 * ============================================
 */

// Health status
GET /health
Response: { status: "Backend is running", timestamp: "2026-03-16T..." }


/**
 * ============================================
 * 2. AUTHENTICATION (No Rate Limit: 5 req/15min)
 * ============================================
 */

// Register clinic
POST /auth/register
Body: {
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
  timings?: string
}
Response: { token: JWT, clinic: Object }

// Login
POST /auth/login
Body: { email: string, password: string }
Response: { token: JWT, clinic: Object }

// Get current user
GET /auth/me (Requires: Bearer token)
Response: { clinic object }

// Logout
POST /auth/logout (Requires: Bearer token)
Response: { message: "Logout successful" }


/**
 * ============================================
 * 3. DOCTORS (Rate Limited: 30 req/min)
 * ============================================
 */

// GET: All doctors
GET /doctors
Query: ?specialization=Cardiology&isAvailable=true
Response: [{ doctor objects }]

// GET: Doctor by ID
GET /doctors/:id
Response: { doctor object }

// GET: Available doctors
GET /doctors/available
Query: ?specialization=ENT&date=2026-03-20
Response: [{ doctor with slots }]

// GET: Doctor's available slots
GET /doctors/:id/slots
Query: ?date=2026-03-20
Response: [{ time: "10:00", isBooked: false }, ...]

// POST: Add new doctor (Admin)
POST /doctors (Requires: Bearer token)
Body: {
  name: string,
  specialization: string,
  fee?: number,
  experience?: number,
  ratings?: number,
  languages?: [string],
  workingDays?: [string],
  slotDuration: number
}
Response: { doctor object with ID }

// PUT: Update doctor (Admin)
PUT /doctors/:id (Requires: Bearer token)
Body: { fields to update }
Response: { updated doctor object }

// DELETE: Deactivate doctor (Admin)
DELETE /doctors/:id (Requires: Bearer token)
Response: { deactivated doctor object }


/**
 * ============================================
 * 4. APPOINTMENTS (Rate Limited: 30 req/min)
 * ============================================
 */

// GET: All appointments (Admin)
GET /appointments (Requires: Bearer token)
Query: ?date=2026-03-20&status=booked&phone=9876543210
Response: [{ appointment objects }]

// GET: Appointment by ID
GET /appointments/:id
Response: { appointment object }

// GET: Patient's appointments
GET /appointments/patient/:phone
Response: [{ appointment objects }]

// POST: Create appointment (From AI Service)
POST /appointments
Body: {
  patientName: string,
  patientPhone: string,
  doctorId: ObjectId,
  doctorName: string,
  date: "YYYY-MM-DD",
  time: "HH:MM",
  symptoms?: [string],
  bookingType?: string,
  sessionId?: string
}
Response: { saved appointment with ID }

// PATCH: Cancel appointment
PATCH /appointments/cancel
Body: { phone: string, doctorId: ObjectId, date: string }
Response: { cancelled appointment }

// PATCH: Reschedule appointment
PATCH /appointments/:id/reschedule
Body: { date: "YYYY-MM-DD", time: "HH:MM" }
Response: { rescheduled appointment }

// PATCH: Complete appointment (Admin)
PATCH /appointments/:id/complete (Requires: Bearer token)
Response: { completed appointment }


/**
 * ============================================
 * 5. CALL LOGS (Rate Limited: 30 req/min)
 * ============================================
 */

// POST: Save call log (From AI Service)
POST /calls/log
Body: {
  sessionId: string,
  patientPhone: string,
  startedAt: Date,
  endedAt: Date,
  durationSeconds: number,
  languageDetected: string,
  intentDetected: string,
  outcome: string,
  wasResolved: boolean,
  transcript?: string,
  symptoms?: [string]
}
Response: { saved call log }

// GET: All call logs (Admin)
GET /calls (Requires: Bearer token)
Query: ?date=2026-03-20&outcome=booked&language=hi
Response: [{ call log objects }]

// GET: Call log by session ID
GET /calls/:sessionId
Response: { call log object }


/**
 * ============================================
 * 6. ANALYTICS (Rate Limited: 30 req/min)
 * ============================================
 */

// GET: Dashboard analytics (Admin)
GET /analytics/dashboard (Requires: Bearer token)
Response: {
  totalCalls: number,
  totalBookings: number,
  resolutionRate: string,
  resolvedCalls: number,
  recentAppointments: [objects]
}

// GET: Daily analytics (Admin)
GET /analytics/daily (Requires: Bearer token)
Query: ?from=2026-03-01&to=2026-03-31
Response: [{ date, totalCalls, resolvedCalls }, ...]

// GET: Language breakdown (Admin)
GET /analytics/languages (Requires: Bearer token)
Response: [{ language, count }, ...]

// GET: Top symptoms (Admin)
GET /analytics/symptoms (Requires: Bearer token)
Response: [{ symptom, count }, ...]

// GET: Most booked doctors (Admin)
GET /analytics/doctors (Requires: Bearer token)
Response: [{ doctorId, doctorName, totalBookings }, ...]

// GET: Peak hours (Admin)
GET /analytics/peak-hours (Requires: Bearer token)
Response: [{ hour, totalCalls }, ...]


/**
 * ============================================
 * 7. PATIENTS (Rate Limited: 30 req/min)
 * ============================================
 */

// GET: All patients (Admin)
GET /patients (Requires: Bearer token)
Response: [{ patient objects }]

// GET: Patient by phone
GET /patients/:phone
Response: { patient object }

// POST: Create patient
POST /patients
Body: {
  phone: string (10 digits),
  name?: string,
  preferredLanguage?: string,
  age?: number,
  gender?: string
}
Response: { saved patient }

// PUT: Update patient
PUT /patients/:phone
Body: { fields to update }
Response: { updated patient }


/**
 * ============================================
 * 8. NOTIFICATIONS (Rate Limited: 30 req/min)
 * ============================================
 */

// GET: Notification logs (Admin)
GET /notifications/logs (Requires: Bearer token)
Response: [{ notification objects }]

// POST: Send SMS
POST /notifications/sms
Body: {
  patientPhone: string,
  message: string,
  appointmentId?: ObjectId
}
Response: { notification status }

// POST: Send WhatsApp
POST /notifications/whatsapp
Body: {
  patientPhone: string,
  message: string,
  appointmentId?: ObjectId
}
Response: { notification status }

// POST: Send appointment confirmation
POST /notifications/appointment-confirm
Body: { same as SMS }
Response: { notification status }

// POST: Send reminder manually (Admin)
POST /notifications/reminder (Requires: Bearer token)
Body: { appointmentId: ObjectId }
Response: { message: "Reminder sent successfully" }


/**
 * ============================================
 * WEBSOCKET EVENTS (Socket.io)
 * ============================================
 */

// Client -> Server Events
call:start -> { sessionId: string, patientPhone: string }
audio:chunk -> { sessionId: string, audioBase64: string }
transcript:update -> { sessionId: string, role: string, text: string }
call:end -> { sessionId: string }

// Server -> Client Events
call:state -> { state: string, sessionId: string, message?: string }
audio:response -> { sessionId: string, audioBase64: string, text: string, state: string }
transcript:update -> { sessionId: string, role: string, text: string }
call:ended -> { summary: object }
error -> { message: string }


/**
 * ============================================
 * ERROR RESPONSES
 * ============================================
 */

// 400 Bad Request
{ error: "Invalid input parameters", errors: [...validation errors] }

// 401 Unauthorized
{ error: "No token provided" }
{ error: "Invalid or expired token" }

// 404 Not Found
{ error: "Resource not found" }

// 409 Conflict
{ error: "Resource already exists" }

// 429 Too Many Requests
{ error: "Too many requests from this IP, please try again later." }

// 500 Internal Server Error
{ error: "Internal server error", ...(dev only: stack trace) }


/**
 * ============================================
 * EXAMPLE REQUESTS
 * ============================================
 */

// 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@example.com","password":"password123"}'

// 2. Create Appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName":"Ram Kumar",
    "patientPhone":"9876543210",
    "doctorId":"64abc123...",
    "doctorName":"Dr. Sharma",
    "date":"2026-03-20",
    "time":"10:00",
    "symptoms":["fever","headache"]
  }'

// 3. Send SMS
curl -X POST http://localhost:5000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhone":"9876543210",
    "message":"Your appointment confirmed with Dr. Sharma on 2026-03-20 at 10:00"
  }'