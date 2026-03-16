import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#060918] text-white px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#060918] via-[#0a1628] to-[#091220] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Cookie className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black">Cookie <span className="gradient-text">Policy</span></h1>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-gray-400 text-sm leading-relaxed">
          <p className="text-gray-500 text-xs">Last updated: March 2026 | MediVoice AI Platform</p>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. What Are Cookies?</h2>
            <p>Cookies are small text files placed on your device when you visit MediVoice. They help us provide a seamless experience by remembering your preferences, maintaining your login session, and ensuring the AI receptionist works efficiently across your interactions.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">2. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 text-gray-300">Cookie</th>
                    <th className="py-2 pr-4 text-gray-300">Purpose</th>
                    <th className="py-2 text-gray-300">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-500">
                  <tr className="border-b border-white/5">
                    <td className="py-2 pr-4 text-emerald-400 font-mono">mv_auth_token</td>
                    <td className="py-2 pr-4">JWT authentication token for clinic dashboard login sessions</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 pr-4 text-emerald-400 font-mono">mv_clinic_data</td>
                    <td className="py-2 pr-4">Cached clinic information for faster dashboard loading</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 pr-4 text-emerald-400 font-mono">mv_lang_pref</td>
                    <td className="py-2 pr-4">Stores language preference (English/Hindi) for AI receptionist</td>
                    <td className="py-2">30 days</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2 pr-4 text-emerald-400 font-mono">mv_voice_consent</td>
                    <td className="py-2 pr-4">Records user consent for microphone access and voice processing</td>
                    <td className="py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">3. Essential vs Optional Cookies</h2>
            <p className="mb-2"><strong className="text-gray-300">Essential Cookies:</strong> Required for platform functionality — authentication tokens and session management. These cannot be disabled without affecting login and dashboard access.</p>
            <p><strong className="text-gray-300">Preference Cookies:</strong> Language and voice consent preferences. These enhance your experience but the platform will function (with reduced personalization) without them.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">4. Third-Party Cookies</h2>
            <p>MediVoice does <strong className="text-emerald-400">not</strong> use third-party tracking cookies, advertising cookies, or analytics pixels. We do not share cookie data with any advertising networks. Our platform is designed with a privacy-first approach — minimal data collection for maximum functionality.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">5. Managing Cookies</h2>
            <p>You can manage cookies through your browser settings. Note that disabling essential cookies will prevent you from logging into the clinic dashboard. For the AI voice receptionist (patient-facing), only the language preference cookie is used — the core voice booking experience works without any cookies.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-2">6. Contact</h2>
            <p>For questions about our cookie usage, contact us at <span className="text-emerald-400">privacy@medivoice.in</span>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
