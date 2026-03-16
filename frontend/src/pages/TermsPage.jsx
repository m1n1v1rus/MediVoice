import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#060918] text-white px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#060918] via-[#0a1628] to-[#091220] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black">Terms of <span className="gradient-text">Use</span></h1>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-gray-400 text-sm leading-relaxed">
          <p className="text-gray-500 text-xs">Last updated: March 2026 | MediVoice AI Platform</p>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using MediVoice AI — including our voice receptionist, appointment booking system, and clinic dashboard — you agree to be bound by these Terms of Use. MediVoice is an AI-powered healthcare communication platform designed to streamline appointment booking through natural voice conversations.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Service Description</h2>
            <p className="mb-2">MediVoice provides the following services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-300">AI Voice Receptionist:</strong> An intelligent voice-based interface that understands patient symptoms, recommends appropriate doctors, and books appointments in real-time</li>
              <li><strong className="text-gray-300">Multilingual Support:</strong> Natural conversation capabilities in Hindi and English, with intent detection and medical terminology understanding</li>
              <li><strong className="text-gray-300">Clinic Dashboard:</strong> A comprehensive management portal for clinics to manage doctors, appointments, schedules, and analytics</li>
              <li><strong className="text-gray-300">Smart Appointment Routing:</strong> AI-driven matching of patients to specialists based on symptom analysis and doctor availability</li>
              <li><strong className="text-gray-300">Emergency Detection:</strong> Automatic identification and prioritization of urgent medical cases</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Medical Disclaimer</h2>
            <p>MediVoice AI is a <strong className="text-emerald-400">scheduling and communication tool</strong>, not a medical diagnostic service. Our AI receptionist may ask about symptoms solely to route you to an appropriate specialist. The information provided during voice interactions does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical decisions.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate information during appointment booking for proper doctor matching</li>
              <li>Attend scheduled appointments or cancel in advance through the platform</li>
              <li>Clinics are responsible for maintaining accurate doctor profiles, availability, and schedule information</li>
              <li>Do not use the platform for non-medical or fraudulent appointment requests</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">5. AI Accuracy & Limitations</h2>
            <p>While our AI strives for high accuracy in understanding speech, detecting intent, and recommending doctors, it may occasionally misinterpret queries — especially with heavy accents, background noise, or rare medical terminology. In such cases, users can switch to text-based input or directly contact the clinic.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">6. Intellectual Property</h2>
            <p>All content, features, design, and functionality of MediVoice — including the AI voice models, dashboard UI, and appointment routing algorithms — are the exclusive property of MediVoice and are protected by intellectual property laws. Unauthorized reproduction, distribution, or reverse engineering of any component is strictly prohibited.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">7. Service Availability</h2>
            <p>MediVoice aims for 24/7 availability but does not guarantee uninterrupted service. Scheduled maintenance, AI model updates, and unforeseen technical issues may temporarily affect availability. Clinics are notified in advance of planned downtime through the dashboard.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">8. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-emerald-400">legal@medivoice.in</span> or through the "Chat with AI" feature on our platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
