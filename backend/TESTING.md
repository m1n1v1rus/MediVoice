# Backend Testing & Validation Guide

## Quick Start Tests

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
Expected Response:
```json
{
  "status": "Backend is running",
  "timestamp": "2026-03-16T10:30:00.000Z"
}
```

### 2. Authentication Flow

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clinic",
    "email": "clinic@test.com",
    "password": "testpass123",
    "phone": "9876543210",
    "address": "123 Main Street"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "clinic@test.com",
    "password": "testpass123"
  }'
```

Save the returned token as `TOKEN`:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 3. Doctor Management

**Create Doctor:**
```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Sharma",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD",
    "experience": 10,
    "fee": 500,
    "rating": 4.5,
    "room": "A-101",
    "phone": "9876543210",
    "email": "sharma@hospital.com",
    "languages": ["Hindi", "English"],
    "workingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "slotDuration": 20,
    "isAvailable": true
  }'
```

**Get All Doctors:**
```bash
curl http://localhost:5000/api/doctors
```

**Get Doctors by Specialization:**
```bash
curl "http://localhost:5000/api/doctors?specialization=Cardiology&isAvailable=true"
```

**Get Available Doctors (by date):**
```bash
curl "http://localhost:5000/api/doctors/available?specialization=Cardiology&date=2026-03-20"
```

### 4. Appointment Flow

**Create Appointment:**
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Ram Kumar",
    "patientPhone": "9876543210",
    "doctorId": "DOCTOR_ID_HERE",
    "doctorName": "Dr. Sharma",
    "date": "2026-03-20",
    "time": "10:00",
    "symptoms": ["fever", "headache"],
    "bookingType": "by_symptom",
    "sessionId": "session_123456"
  }'
```

**Get Patient Appointments:**
```bash
curl "http://localhost:5000/api/appointments/patient/9876543210"
```

**Cancel Appointment:**
```bash
curl -X PATCH http://localhost:5000/api/appointments/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "doctorId": "DOCTOR_ID_HERE",
    "date": "2026-03-20"
  }'
```

### 5. Call Log Testing

**Save Call Log:**
```bash
curl -X POST http://localhost:5000/api/calls/log \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123456",
    "patientPhone": "9876543210",
    "startedAt": "2026-03-20T09:00:00Z",
    "endedAt": "2026-03-20T09:05:30Z",
    "durationSeconds": 330,
    "languageDetected": "hi",
    "intentDetected": "book_appointment",
    "outcome": "booked",
    "wasResolved": true,
    "turnsCount": 8,
    "symptoms": ["fever"],
    "source": "web"
  }'
```

**Get Call Logs:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/calls"
```

### 6. Patient Management

**Create Patient:**
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "name": "Ram Kumar",
    "preferredLanguage": "hi",
    "age": 35,
    "gender": "male"
  }'
```

**Get Patient Details:**
```bash
curl "http://localhost:5000/api/patients/9876543210"
```

### 7. Notifications

**Send SMS:**
```bash
curl -X POST http://localhost:5000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhone": "9876543210",
    "message": "Your appointment is confirmed with Dr. Sharma on 2026-03-20 at 10:00",
    "appointmentId": "APPOINTMENT_ID_HERE"
  }'
```

**Send WhatsApp:**
```bash
curl -X POST http://localhost:5000/api/notifications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhone": "9876543210",
    "message": "Hi Ram, your appointment reminder: Dr. Sharma tomorrow at 10:00",
    "appointmentId": "APPOINTMENT_ID_HERE"
  }'
```

### 8. Analytics (Admin Only)

**Dashboard:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/analytics/dashboard
```

**Daily Stats:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/analytics/daily?from=2026-03-01&to=2026-03-31"
```

**Language Analytics:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/analytics/languages
```

**Top Symptoms:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/analytics/symptoms
```

**Most Booked Doctors:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/analytics/doctors
```

**Peak Hours:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/analytics/peak-hours
```

## WebSocket Testing (Node.js)

Create `test-socket.js`:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  // Start call
  socket.emit('call:start', {
    sessionId: 'test_session_123',
    patientPhone: '9876543210'
  });
});

socket.on('call:state', (data) => {
  console.log('Call state:', data);
});

socket.on('audio:response', (data) => {
  console.log('AI Response:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

Run:
```bash
node test-socket.js
```

## Postman Collection

Import this collection to Postman:

1. Create collection: "MediVoice API"
2. Add folders:
   - Auth
   - Doctors
   - Appointments
   - Calls
   - Patients
   - Notifications
   - Analytics

3. Set environment variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (from login response)

4. Test each endpoint with sample data

## Automated Testing Script

Create `test-all.sh`:
```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"
TOKEN=""

echo "🧪 MediVoice Backend Testing..."

# 1. Health check
echo "✓ Health Check..."
curl -s $BASE_URL/health | jq .

# 2. Register and login
echo "✓ Register..."
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clinic",
    "email": "test'$RANDOM'@clinic.com",
    "password": "testpass123"
  }')
TOKEN=$(echo $REGISTER | jq -r '.token')
echo "Token: $TOKEN"

# 3. Create doctor
echo "✓ Creating Doctor..."
DOCTOR=$(curl -s -X POST $BASE_URL/doctors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "specialization": "General",
    "fee": 500
  }')
DOCTOR_ID=$(echo $DOCTOR | jq -r '._id')
echo "Doctor ID: $DOCTOR_ID"

# 4. Create appointment
echo "✓ Creating Appointment..."
curl -s -X POST $BASE_URL/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test Patient",
    "patientPhone": "9876543210",
    "doctorId": "'$DOCTOR_ID'",
    "doctorName": "Dr. Test",
    "date": "2026-03-20",
    "time": "10:00"
  }' | jq .

echo "✅ All tests completed!"
```

Run:
```bash
chmod +x test-all.sh
./test-all.sh
```

## Error Testing

### 1. Rate Limiting (Should fail after limit)
```bash
for i in {1..101}; do
  curl http://localhost:5000/api/health
done
# After 100 requests, should get 429 Too Many Requests
```

### 2. Invalid Token
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/api/analytics/dashboard
# Should return 401 Unauthorized
```

### 3. Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"patientName": "Test"}'
# Should return 400 Bad Request with validation errors
```

### 4. Not Found
```bash
curl http://localhost:5000/api/appointments/invalid_id
# Should return 404 Not Found
```

## Performance Testing

Using Apache Bench:
```bash
ab -n 1000 -c 10 http://localhost:5000/api/health
```

Using wrk:
```bash
wrk -t12 -c400 -d30s http://localhost:5000/api/doctors
```

## Database Verification

```bash
# Connect to MongoDB
mongo medivoice

# Check collections
db.getCollectionNames()

# Count documents
db.doctors.countDocuments()
db.appointments.countDocuments()
db.callogs.countDocuments()

# Sample queries
db.doctors.findOne()
db.appointments.find({ status: 'booked' })
db.patients.find().limit(5)
```

## Monitoring

### Check Server Logs
```bash
tail -f logs/api.log
tail -f logs/error.log
```

### Monitor Process
```bash
pm2 start server.js --name "medivoice-backend"
pm2 logs medivoice-backend
pm2 status
```

## Debugging Tips

1. **Enable debug logging:**
   ```env
   DEBUG=*
   ```

2. **Check MongoDB connection:**
   ```javascript
   const mongoose = require('mongoose');
   console.log(mongoose.connection.readyState);
   // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
   ```

3. **Verify JWT token:**
   ```javascript
   const jwt = require('jsonwebtoken');
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   console.log(decoded);
   ```

4. **Monitor rate limiter:**
   ```javascript
   console.log(req.rateLimit);
   // Shows: limit, current, remaining
   ```

---

**Happy Testing! 🚀**