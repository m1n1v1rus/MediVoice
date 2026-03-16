# Quick Reference Guide - MediVoice Backend

## Starting the Server

```bash
cd backend

# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

## Essential Endpoints

### Health Check
```
GET /api/health
```

### Auth
```
POST /api/auth/register      # Create clinic account
POST /api/auth/login         # Get JWT token
GET /api/auth/me             # Get user (requires token)
POST /api/auth/logout        # Logout
```

### Doctors
```
GET /api/doctors                      # All doctors
GET /api/doctors/:id                  # Doctor by ID
GET /api/doctors/:id/slots?date=...   # Available slots
POST /api/doctors                     # Create (admin)
PUT /api/doctors/:id                  # Update (admin)
DELETE /api/doctors/:id               # Deactivate (admin)
```

### Appointments
```
GET /api/appointments              # All (admin)
GET /api/appointments/:id          # By ID
GET /api/appointments/patient/:phone
POST /api/appointments             # Create
PATCH /api/appointments/cancel     # Cancel
PATCH /api/appointments/:id/reschedule
PATCH /api/appointments/:id/complete  # Complete (admin)
```

### Other
```
POST /api/calls/log                       # Save call log
GET /api/analytics/dashboard              # Stats (admin)
POST /api/notifications/sms               # Send SMS
POST /api/notifications/whatsapp          # Send WhatsApp
GET /api/patients                         # All (admin)
```

---

## Authentication

### Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"clinic@example.com","password":"pass123"}'
```

### Use Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/dashboard
```

---

## Common cURL Examples

### Create Doctor
```bash
curl -X POST http://localhost:5000/api/doctors \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sharma",
    "specialization": "Cardiology",
    "fee": 500,
    "experience": 10
  }'
```

### Create Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Ram Kumar",
    "patientPhone": "9876543210",
    "doctorId": "DOC_ID",
    "date": "2026-03-20",
    "time": "10:00"
  }'
```

### Send SMS
```bash
curl -X POST http://localhost:5000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "patientPhone": "9876543210",
    "message": "Your appointment is confirmed"
  }'
```

---

## Environment Variables

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medivoice
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
AI_SERVICE_URL=http://localhost:8000
```

---

## Database

### Connect to MongoDB
```bash
mongo medivoice
```

### Useful Queries
```javascript
// Count documents
db.doctors.countDocuments()
db.appointments.countDocuments()

// Find all doctors
db.doctors.find()

// Find appointments by date
db.appointments.find({ date: "2026-03-20" })

// Find booked appointments
db.appointments.find({ status: "booked" })

// Clear collection (careful!)
db.doctors.deleteMany({})
```

---

## Rate Limiting

- Global: 100 req/15min
- Auth: 5 req/15min  
- API: 30 req/min
- Returns 429 if exceeded

---

## Error Responses

### 400 Bad Request
```json
{ "error": "Invalid input", "errors": [...] }
```

### 401 Unauthorized
```json
{ "error": "Invalid or expired token" }
```

### 404 Not Found
```json
{ "error": "Resource not found" }
```

### 429 Too Many Requests
```json
{ "error": "Too many requests, please try again later" }
```

### 500 Server Error
```json
{ "error": "Internal server error" }
```

---

## WebSocket Events

### Connect & Start Call
```javascript
const socket = io('http://localhost:5000');

socket.emit('call:start', {
  sessionId: 'session_123',
  patientPhone: '9876543210'
});

socket.on('call:state', (data) => {
  console.log(data.state); // 'listening' | 'thinking' | 'speaking'
});
```

### Send Audio
```javascript
socket.emit('audio:chunk', {
  sessionId: 'session_123',
  audioBase64: 'data:audio/wav;base64,...'
});

socket.on('audio:response', (data) => {
  console.log(data.text);      // AI transcript
  console.log(data.audioBase64); // AI response audio
});
```

### End Call
```javascript
socket.emit('call:end', { sessionId: 'session_123' });

socket.on('call:ended', (data) => {
  console.log(data.summary);
});
```

---

## File Structure

```
backend/
├── config/          # Configuration
├── controllers/     # Business logic
├── middleware/      # Express middleware
├── models/         # MongoDB schemas
├── routes/         # API routes
├── services/       # External services
├── socket/         # WebSocket
├── utils/          # Utilities
├── server.js       # Entry point
├── package.json    # Dependencies
└── .env            # Environment
```

---

## Development Tips

### Check Logs
```bash
tail -f logs/error.log
tail -f logs/api.log
```

### Test with Postman
1. Import collection from `API_DOCUMENTATION.md`
2. Set `base_url = http://localhost:5000/api`
3. Set `token` from login response
4. Test endpoints

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Restart Server
```bash
npm run dev
# Press Ctrl+C to stop
# npm run dev to restart
```

---

## Common Issues

### Port 5000 Already in Use
```bash
# Change in .env
PORT=5001
```

### MongoDB Connection Error
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medivoice
```

### JWT Token Expired
```bash
# Login again to get new token
curl -X POST http://localhost:5000/api/auth/login ...
```

### Rate Limited (429)
```bash
# Wait 15 minutes or clear rate limiter
# In development, reduce limits in config/rateLimiter.js
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure `MONGODB_URI` for production
- [ ] Verify Twilio credentials
- [ ] Set proper CORS origin
- [ ] Enable HTTPS
- [ ] Monitor logs
- [ ] Set up backups
- [ ] Configure CI/CD
- [ ] Test all endpoints

---

## Useful Commands

```bash
# Install packages
npm install

# Update packages
npm update

# Check security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Start dev server
npm run dev

# Start prod server
npm start

# Check running processes
lsof -i :5000

# Kill process on port
kill -9 <PID>
```

---

## Key Files to Edit

### Add New Route
1. Create controller in `controllers/`
2. Create route in `routes/`
3. Add to `server.js`

### Add New Model
1. Create schema in `models/`
2. Create controller
3. Create routes

### Add New Service
1. Create file in `services/`
2. Import in controller
3. Use in business logic

---

## Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Run full test
bash test-all.sh  # if available

# Postman tests
# Import collection and test endpoints
```

---

## Links & Resources

- API Docs: `API_DOCUMENTATION.md`
- Testing Guide: `TESTING.md`
- Complete Setup: `README.md`
- Phase 3 Summary: `PHASE3_SUMMARY.md`

---

## Support

For issues:
1. Check error logs
2. Verify `.env` variables
3. Ensure MongoDB is running
4. Check port availability
5. Review API documentation

---

**Happy Coding! 🚀**