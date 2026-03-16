import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#060918] text-white px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#060918] via-[#0a1628] to-[#091220] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black">Privacy <span className="gradient-text">Policy</span></h1>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-gray-400 text-sm leading-relaxed">
          <p className="text-gray-500 text-xs">Last updated: March 2026 | Effective for MediVoice AI Platform</p>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Introduction</h2>
            <p>MediVoice AI ("we," "our," or "us") is committed to protecting the privacy and security of your personal and medical information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you interact with our AI-powered voice receptionist platform. By using MediVoice, you agree to the practices described in this policy.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2>
            <p className="mb-2"><strong className="text-gray-300">Voice & Conversation Data:</strong> When you interact with our AI receptionist, we process your speech in real-time to understand appointment requests, symptoms, and preferences. Voice data is processed transiently and is <strong className="text-emerald-400">not permanently stored</strong> after the session ends.</p>
            <p className="mb-2"><strong className="text-gray-300">Appointment Information:</strong> Patient name, phone number, preferred doctor, appointment time, and medical concerns shared during the booking process.</p>
            <p className="mb-2"><strong className="text-gray-300">Clinic Data:</strong> Clinic registration details including name, email, phone, address, doctor profiles, and scheduling information.</p>
            <p><strong className="text-gray-300">Technical Data:</strong> Browser type, device information, and interaction logs for service improvement and security.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and manage appointment bookings via AI voice interaction</li>
              <li>To match patients with the most suitable doctors based on symptoms and specialization</li>
              <li>To send appointment confirmations, reminders, and follow-up notifications</li>
              <li>To improve our AI models for better intent detection and medical terminology understanding</li>
              <li>To provide clinic analytics and operational insights on the dashboard</li>
              <li>To detect and prioritize emergency medical situations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. Data Security</h2>
            <p>We employ industry-standard security measures including AES-256 encryption for data at rest, TLS 1.3 for data in transit, and JWT-based authentication for clinic access. Our MongoDB database is hosted on secured cloud infrastructure with automatic backups and access controls. All voice processing occurs through secured APIs with no raw audio stored permanently.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">5. Data Sharing</h2>
            <p>We do <strong className="text-emerald-400">not</strong> sell, rent, or share your personal or medical data with third parties for marketing purposes. Data may only be shared with the specific clinic you are booking with, and with our AI processing partners (under strict data processing agreements) to facilitate appointment booking.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. Clinics can manage patient data through the dashboard. For data deletion requests or privacy concerns, contact us at <span className="text-emerald-400">privacy@medivoice.in</span>.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">7. Compliance</h2>
            <p>MediVoice complies with applicable data protection regulations including India's Digital Personal Data Protection Act (DPDPA) 2023. We follow healthcare data handling best practices aligned with global standards for patient data confidentiality.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
