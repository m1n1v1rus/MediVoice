<p align="center">
  <img src="docs/medivoice-banner.png" alt="MediVoice Banner" width="100%" />
</p>

<h1 align="center">🏥 MediVoice</h1>

<p align="center">
  <strong>AI-Powered Voice Receptionist for Clinics & Hospitals</strong><br/>
  <em>Built for the Murf AI Hackathon 🏆</em>
</p>

<p align="center">
  <a href="https://github.com/m1n1v1rus/MediVoice/stargazers"><img src="https://img.shields.io/github/stars/m1n1v1rus/MediVoice?style=for-the-badge&logo=github&color=f5c542" alt="Stars" /></a>
  <a href="https://github.com/m1n1v1rus/MediVoice/blob/main/LICENSE"><img src="https://img.shields.io/github/license/m1n1v1rus/MediVoice?style=for-the-badge&color=00d4ff" alt="License" /></a>
  <a href="https://github.com/m1n1v1rus/MediVoice/issues"><img src="https://img.shields.io/github/issues/m1n1v1rus/MediVoice?style=for-the-badge&color=7c3aed" alt="Issues" /></a>
  <a href="https://github.com/m1n1v1rus/MediVoice/commits"><img src="https://img.shields.io/github/commit-activity/t/m1n1v1rus/MediVoice?style=for-the-badge&color=00c853" alt="Commits" /></a>
  <img src="https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18+-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-team">Team</a> •
  <a href="#-future-roadmap">Roadmap</a>
</p>

---

## 📌 Problem Statement

> In India, **65%+ clinics** still rely on manual phone receptionists who miss calls, double-book appointments, and struggle during peak hours. Patients spend **15-30 minutes** on hold, leading to frustration, lost revenue, and delayed care.

**MediVoice** solves this by replacing the traditional phone receptionist with an intelligent, multilingual AI voice agent that handles **real-time phone calls**, books appointments, answers queries, and sends confirmations — **24/7, in 10+ Indian languages**.

---

## ✨ Features

### 🎙️ Real-Time Voice Conversations
- **Full-duplex voice calls** with sub-2 second response latency
- **Natural, human-like** conversations — not robotic IVR menus
- Smart **Voice Activity Detection (VAD)** with echo cancellation
- Seamless **Speech-to-Text** (Whisper) → **AI Brain** (LLM) → **Text-to-Speech** (Murf/Google) pipeline

### 🌍 Multilingual Support (10+ Languages)
- Hindi, English, Tamil, Telugu, Kannada, Malayalam, Punjabi, Gujarati, Marathi, Bengali, Urdu
- **Auto-detects** patient's language and responds in the same language & script
- **Hinglish** (Hindi + English mix) support for natural conversations

### 📅 Smart Appointment Management
- **Book** appointments with symptom-based doctor recommendation
- **Reschedule** or **Cancel** existing appointments
- Automatic **conflict detection** — no double-bookings
- Collects patient name, phone, preferred date/time, and symptoms

### 🧠 Intelligent AI Brain
- **Symptom-based doctor matching** — analyzes symptoms and recommends the right specialist
- **Context-aware conversations** — remembers what patient said earlier in the call
- **State machine** driven appointment flow — never asks the same question twice
- **Intent classification** — understands greeting, booking, inquiry, cancellation, etc.

### 📊 Admin Dashboard
- **Real-time analytics** — daily bookings, call logs, patient statistics
- **Doctor management** — add/edit doctors, specialties, availability slots
- **Appointment tracking** — view, filter, and manage all appointments
- **Call history** — complete logs with transcripts, duration, and outcomes

### 📱 Automated Notifications
- **SMS confirmations** via Twilio after successful bookings
- **WhatsApp notifications** for appointment reminders
- **Automated reminders** 24 hours before appointments

### 🔒 Security & Reliability
- **JWT authentication** for admin dashboard
- **Rate limiting** to prevent API abuse
- **Helmet.js** for HTTP security headers
- **Graceful error handling** — AI never crashes mid-call

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Call UI  │  │ Chat UI  │  │Dashboard │  │ Doctor Mgmt   │  │
│  │(useAICall│  │(ChatBot) │  │(Analytics│  │ (CRUD Panel)  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │ WebSocket    │ HTTP        │ HTTP            │ HTTP     │
└───────┼──────────────┼─────────────┼────────────────┼──────────┘
        │              │             │                │
┌───────▼──────────────▼─────────────▼────────────────▼──────────┐
│                     BACKEND (Node.js + Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ gRPC     │  │  REST    │  │ Socket.IO│  │ Reminder     │   │
│  │ Proxy    │  │  API     │  │ Handler  │  │ Scheduler    │   │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────────┘   │
│       │ gRPC         │                                          │
│       │              │   ┌─────────────┐                       │
│       │              └──►│  MongoDB    │                       │
│       │                  └─────────────┘                       │
└───────┼────────────────────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────────────┐
│                    AI SERVICE (Python FastAPI)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ gRPC     │  │ STT      │  │ AI Agent │  │ TTS          │   │
│  │ Server   │  │ (Whisper)│  │ (LLM)    │  │ (Murf/gTTS)  │   │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────────┘   │
│                                    │                            │
│  ┌──────────┐  ┌──────────┐  ┌────▼─────┐  ┌──────────────┐   │
│  │ Intent   │  │ Symptom  │  │ Gemini / │  │ Conversation │   │
│  │Classifier│  │ Detector │  │ Groq LLM │  │   Memory     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────────────┐
│                     INTEGRATIONS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Twilio   │  │ Murf AI  │  │ n8n      │  │ Scheduler    │   │
│  │ SMS/Call │  │ TTS API  │  │ Workflows│  │ (node-cron)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">

### Frontend
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio)

</td>
<td align="center" width="25%">

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?style=flat-square&logo=mongodb)

</td>
<td align="center" width="25%">

### AI Service
![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![gRPC](https://img.shields.io/badge/gRPC-Proto3-244c5a?style=flat-square&logo=google)

</td>
<td align="center" width="25%">

### Integrations
![Twilio](https://img.shields.io/badge/Twilio-SMS-f22f46?style=flat-square&logo=twilio)
![Murf](https://img.shields.io/badge/Murf-TTS-7c3aed?style=flat-square)
![n8n](https://img.shields.io/badge/n8n-Workflows-ea4b71?style=flat-square&logo=n8n)

</td>
</tr>
</table>

| Category | Technologies |
|----------|-------------|
| **LLM Providers** | Gemini 2.0 Flash, Groq (Llama 3.3 70B) |
| **Speech-to-Text** | Groq Whisper (distil-whisper-large-v3-en) |
| **Text-to-Speech** | Murf AI, Google gTTS (fallback) |
| **Database** | MongoDB with Mongoose ODM |
| **Real-time** | gRPC bidirectional streaming, WebSocket, Socket.IO |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Notifications** | Twilio SMS, WhatsApp Business API |
| **Scheduling** | node-cron for automated reminders |
| **DevOps** | Nodemon, Vite HMR, Python venv |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ with pip
- **MongoDB** (local or Atlas)
- API Keys: Gemini, Groq, Twilio (optional), Murf AI (optional)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/m1n1v1rus/MediVoice.git
cd MediVoice
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI, JWT secret, etc.
node seed-doctors.js    # Seed sample doctors
npm run dev             # Starts on port 5000
```

### 3️⃣ Setup AI Service

```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
cp .env.example .env             # Add Gemini, Groq API keys
python grpc_server.py            # Starts gRPC on port 50051
# In another terminal:
python main.py                   # Starts FastAPI on port 8000
```

### 4️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev              # Starts on port 5173
```

### 5️⃣ Open in Browser

```
http://localhost:5173
```

---

## 📡 API Reference

### Voice Call (WebSocket)
```
WS /ws/ai → Bidirectional audio streaming
```

### Chat (REST)
```
POST /process-text → Text-based AI conversation
```

### Appointments
```
GET    /api/appointments          → List all appointments
POST   /api/appointments          → Create new appointment
PUT    /api/appointments/:id      → Reschedule appointment
DELETE /api/appointments/:id      → Cancel appointment
```

### Doctors
```
GET    /api/doctors               → List all doctors
GET    /api/doctors/:id/slots     → Get available slots
POST   /api/doctors               → Add new doctor
```

### Analytics
```
GET    /api/analytics/dashboard   → Dashboard statistics
GET    /api/calls                 → Call history & logs
```

> 📄 Full API documentation available at [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md)

---

## 📂 Project Structure

```
MediVoice/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages (Dashboard, Chat, Call)
│   │   ├── hooks/               # Custom hooks (useAICall, useChat)
│   │   ├── services/            # API client services
│   │   └── context/             # React context providers
│   └── package.json
│
├── backend/                     # Node.js + Express API
│   ├── controllers/             # Request handlers
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routes
│   ├── middleware/               # Auth, error handling
│   ├── services/                # Business logic
│   ├── config/                  # DB, rate limiter config
│   ├── protos/                  # gRPC proto definitions
│   └── server.js                # Entry point
│
├── ai-service/                  # Python AI Engine
│   ├── services/
│   │   ├── ai_agent.py          # Core AI brain + LLM routing
│   │   ├── stt_service.py       # Speech-to-Text (Whisper)
│   │   ├── tts_service.py       # Text-to-Speech (Murf/gTTS)
│   │   ├── intent_classifier.py # Intent detection
│   │   ├── symptom_detector.py  # Medical symptom analysis
│   │   └── conversation_memory.py # Session state management
│   ├── models/                  # Medical rules engine
│   ├── data/                    # Training data & examples
│   ├── main.py                  # FastAPI server
│   └── grpc_server.py           # gRPC streaming server
│
├── integrations/                # Third-party integrations
│   ├── murf/                    # Murf AI TTS integration
│   ├── notifications/           # SMS/WhatsApp services
│   ├── n8n/                     # n8n workflow automations
│   ├── stt/                     # STT provider configs
│   └── scheduler.js             # Cron job scheduler
│
├── docs/                        # Documentation & assets
├── LICENSE                      # MIT License
└── README.md                 
```

---

## 🔄 Voice Call Pipeline

```
Patient speaks into mic
        │
        ▼
┌──────────────┐
│  Browser VAD │ ← Detects speech start/end
│  (80ms loop) │   Threshold: 0.08 RMS
└──────┬───────┘
       │ WebSocket (base64 audio)
       ▼
┌──────────────┐
│  Node.js     │ ← Proxies to Python via gRPC
│  gRPC Proxy  │
└──────┬───────┘
       │ gRPC bidirectional stream
       ▼
┌──────────────┐
│  Whisper STT │ ← Groq-hosted, ~0.5s latency
│  + Filters   │   Hallucination filter (23 tokens)
└──────┬───────┘
       │ Transcribed text
       ▼
┌──────────────┐
│  AI Agent    │ ← Intent classification
│  (LLM Brain) │   Symptom detection
│              │   State machine (7 states)
│              │   Groq Llama 3.3 70B (~1.2s)
└──────┬───────┘
       │ Response text
       ▼
┌──────────────┐
│  Murf TTS    │ ← Natural Indian voice
│  (or gTTS)   │   Hindi/English/Regional
└──────┬───────┘
       │ Audio (base64)
       ▼
Patient hears AI response
```

---

## 👥 Team

<table>
<tr>
<td align="center" width="25%">
<a href="https://github.com/m1n1v1rus">
<img src="https://github.com/m1n1v1rus.png" width="100px;" alt="Ayush Mani" style="border-radius:50%"/>
<br /><sub><b>Ayush Mani</b></sub>
</a>
<br />
<sub>🎯 Team Lead • Full Stack</sub>
<br />
<a href="https://github.com/m1n1v1rus">@m1n1v1rus</a>
</td>
<td align="center" width="25%">
<a href="https://github.com/GoutamKumar-07">
<img src="https://github.com/GoutamKumar-07.png" width="100px;" alt="Goutam Kumar" style="border-radius:50%"/>
<br /><sub><b>Goutam Kumar</b></sub>
</a>
<br />
<sub>🤖 AI Service</sub>
<br />
<a href="https://github.com/GoutamKumar-07">@GoutamKumar-07</a>
</td>
<td align="center" width="25%">
<a href="https://github.com/Tany-Bansilal">
<img src="https://github.com/Tany-Bansilal.png" width="100px;" alt="Tany Bansilal" style="border-radius:50%"/>
<br /><sub><b>Tany Bansilal</b></sub>
</a>
<br />
<sub>🔗 Integrations</sub>
<br />
<a href="https://github.com/Tany-Bansilal">@Tany-Bansilal</a>
</td>
<td align="center" width="25%">
<a href="https://github.com/hunk-raived">
<img src="https://github.com/hunk-raived.png" width="100px;" alt="Hunk Raived" style="border-radius:50%"/>
<br /><sub><b>Hunk Raived</b></sub>
</a>
<br />
<sub>🎨 Frontend</sub>
<br />
<a href="https://github.com/hunk-raived">@hunk-raived</a>
</td>
</tr>
</table>

---

## 🚀 Future Roadmap

<table>
<tr>
<td>

### v2.0 — Enhanced Intelligence
- [ ] Multi-turn memory across sessions (patient returns)
- [ ] Prescription upload & OCR reading
- [ ] Voice biometric patient identification
- [ ] Drug interaction warnings

</td>
<td>

### v3.0 — Scale & Deploy
- [ ] Cloud deployment (AWS/GCP)
- [ ] Docker + Kubernetes orchestration
- [ ] Horizontal auto-scaling
- [ ] CDN for static assets

</td>
</tr>
<tr>
<td>

### v4.0 — Ecosystem
- [ ] Twilio IVR — real phone number integration
- [ ] EMR/EHR system integration (HL7 FHIR)
- [ ] Insurance pre-authorization workflow
- [ ] Multi-clinic white-label support

</td>
<td>

### v5.0 — Intelligence++
- [ ] Predictive no-show detection
- [ ] Patient sentiment analysis
- [ ] Automated follow-up scheduling
- [ ] Health trend analytics dashboard

</td>
</tr>
</table>

---

## 🧪 Environment Variables

<details>
<summary><strong>Backend (.env)</strong></summary>

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medivoice
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

</details>

<details>
<summary><strong>AI Service (.env)</strong></summary>

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxx
HOSPITAL_NAME=MediVoice Hospital
BACKEND_URL=http://localhost:5000
MURF_API_KEY=your_murf_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

</details>

---

## 🤝 Contributing

Contributions are welcome — bug fixes, feature enhancements, or documentation improvements!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please give appropriate credit to the original authors if you use or modify this project.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-❤️-red?style=for-the-badge" alt="Built with love" />
  <img src="https://img.shields.io/badge/For-Murf%20AI%20Hackathon-7c3aed?style=for-the-badge" alt="Murf AI Hackathon" />
</p>

<p align="center">
  <strong>⭐ Star this repo if you found it useful!</strong>
</p>
