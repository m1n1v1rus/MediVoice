import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Keyboard, Volume2, VolumeX, Globe, Send, Phone, PhoneOff, X, ChevronDown, Bot } from 'lucide-react'
import useAICall from '../hooks/useAICall'
import { sendTextToAI } from '../services/api'

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
]

/* ═══════════════════════════════════════
   LIVE CALLING UI — Real-time AI Call
   ═══════════════════════════════════════ */
function CallingUI({ aiCall, onEnd }) {
  const { callState, transcript, timer, muted, speakerOn, toggleMute, toggleSpeaker, error, audioLevel } = aiCall
  const transcriptEndRef = useRef(null)

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const getStateLabel = () => {
    switch (callState) {
      case 'connecting': return '📞 Ringing...'
      case 'listening': return '🎤 Listening...'
      case 'thinking': return '🧠 AI is thinking...'
      case 'speaking': return '🔊 AI is speaking...'
      case 'ended': return 'Call Ended'
      default: return 'Ready'
    }
  }

  const getStateColor = () => {
    switch (callState) {
      case 'connecting': return 'text-amber-400 animate-pulse'
      case 'listening': return 'text-emerald-400 animate-pulse'
      case 'thinking': return 'text-cyan-400 animate-pulse'
      case 'speaking': return 'text-purple-400'
      case 'ended': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getOrbGlow = () => {
    switch (callState) {
      case 'listening': return 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 shadow-emerald-500/20'
      case 'thinking': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 shadow-cyan-500/20'
      case 'speaking': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-purple-500/20'
      case 'ended': return 'from-red-500/20 to-orange-500/20 border-red-500/30 shadow-red-500/20'
      default: return 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 shadow-emerald-500/20'
    }
  }

  const getInnerOrb = () => {
    switch (callState) {
      case 'listening': return 'from-emerald-500 to-cyan-600 shadow-emerald-500/30'
      case 'thinking': return 'from-cyan-500 to-blue-600 shadow-cyan-500/30'
      case 'speaking': return 'from-purple-500 to-pink-600 shadow-purple-500/30'
      case 'ended': return 'from-red-600 to-orange-600 shadow-red-500/30'
      default: return 'from-emerald-500 to-cyan-600 shadow-emerald-500/30'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#060918]">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <div className="text-center flex-1">
          <p className="text-emerald-400/60 text-[10px] uppercase tracking-[0.3em] font-medium">MediVoice Hospital</p>
          <h2 className="text-xl font-bold text-white mt-1">AI Receptionist</h2>
          <p className={`text-sm mt-1 font-medium ${getStateColor()}`}>
            {error ? `⚠️ ${error}` : getStateLabel()}
          </p>
        </div>
      </div>

      {/* Center Orb */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          {/* Ripple rings for active states */}
          {(callState === 'listening' || callState === 'speaking' || callState === 'connecting') && (
            <>
              <div className="absolute inset-0 -m-6 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 -m-12 rounded-full border border-emerald-500/5 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 -m-20 rounded-full border border-cyan-500/5 animate-ping" style={{ animationDuration: '4s' }} />
            </>
          )}

          {/* Main orb */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 bg-gradient-to-br border-2 ${getOrbGlow()}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 bg-gradient-to-br shadow-lg ${getInnerOrb()}`}>
              <svg viewBox="0 0 50 50" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(1,1)">
                  <path d="M13 3 h14 a3 3 0 0 1 3 3 v8 h8 a3 3 0 0 1 3 3 v10 a3 3 0 0 1-3 3 h-8 v8 a3 3 0 0 1-3 3 h-14 a3 3 0 0 1-3-3 v-8 h-7 a3 3 0 0 1-3-3 v-10 a3 3 0 0 1 3-3 h7 v-8 a3 3 0 0 1 3-3z" fill="white" opacity="0.9"/>
                  <line x1="12" y1="18" x2="12" y2="26" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="16" y1="15" x2="16" y2="29" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="20" y1="12" x2="20" y2="32" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="24" y1="15" x2="24" y2="29" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="28" y1="18" x2="28" y2="26" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M32 8 C40 4, 47 12, 44 22 C42 28, 36 32, 30 34" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Waveform visualizer — reacts to real mic level */}
        <div className="flex items-center gap-[3px] mt-8 h-10">
          {Array.from({ length: 20 }).map((_, i) => {
            const level = callState === 'listening'
              ? Math.min(audioLevel * 800, 1) // scale mic level to 0-1
              : callState === 'speaking' ? 0.6 : 0
            const barH = callState === 'thinking'
              ? 6
              : Math.max(4, level * 32 * (0.5 + Math.sin(i * 0.6 + Date.now() / 200) * 0.5))
            return (
              <div key={i}
                className={`w-[3px] rounded-full transition-all duration-150
                  ${callState === 'listening' ? 'bg-emerald-400' :
                    callState === 'speaking' ? 'bg-purple-400 wave-bar' :
                    callState === 'thinking' ? 'bg-cyan-400/40 animate-pulse' :
                    callState === 'connecting' ? 'bg-amber-400/30 animate-pulse' :
                    'bg-gray-700/30'}`}
                style={{
                  height: `${barH}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            )
          })}
        </div>

        {/* Timer */}
        <p className="text-gray-500 text-lg font-mono mt-4 tracking-widest">
          {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
        </p>
      </div>

      {/* Call Controls */}
      <div className="relative z-10 pb-8 flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-8">
          {/* Mute */}
          <button onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border
              ${muted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>
            {muted ? <VolumeX className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button onClick={onEnd}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 transition-all duration-300">
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          {/* Speaker */}
          <button onClick={toggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border
              ${speakerOn ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>
            {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="px-5 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium mb-2">Live Transcript</p>
          <div className="max-h-36 overflow-y-auto space-y-2 scrollbar-thin">
            {transcript.length === 0 ? (
              <p className="text-gray-600 text-sm italic">AI receptionist will greet you...</p>
            ) : (
              transcript.map((t, i) => (
                <div key={i} className="flex items-start gap-2 animate-fade-in">
                  <span className={`text-[10px] font-bold uppercase mt-0.5 min-w-[40px]
                    ${t.role === 'agent' ? 'text-emerald-400' : t.role === 'user' ? 'text-purple-400' : 'text-amber-400'}`}>
                    {t.role === 'agent' ? 'AI' : t.role === 'user' ? 'You' : 'SYS'}
                  </span>
                  <p className={`text-sm leading-relaxed
                    ${t.role === 'agent' ? 'text-emerald-200' : t.role === 'user' ? 'text-purple-200' : 'text-amber-200'}`}>
                    {t.text}
                  </p>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   MAIN BOOK APPOINTMENT PAGE
   ═══════════════════════════════════════ */
export default function BookAppointment() {
  const navigate = useNavigate()
  const aiCall = useAICall()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]) // Default Hindi
  const [showCallingUI, setShowCallingUI] = useState(false)
  const [textSessionId] = useState(`text_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (showKeyboard && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showKeyboard])

  // Watch for call ending
  useEffect(() => {
    if (aiCall.callState === 'ended' && showCallingUI) {
      // Transfer transcript to chat messages
      if (aiCall.transcript.length > 0) {
        const chatMsgs = aiCall.transcript.map(t => ({
          role: t.role === 'agent' ? 'ai' : t.role === 'user' ? 'user' : 'system',
          text: t.text,
        }))
        setMessages(prev => [...prev, ...chatMsgs])
      }
      setTimeout(() => setShowCallingUI(false), 2000)
    }
  }, [aiCall.callState])

  // Start voice call
  const handleMicTap = () => {
    setShowCallingUI(true)
    aiCall.startCall(selectedLang.code)
  }

  // End voice call
  const handleEndCall = () => {
    aiCall.endCall()
    // Wait for goodbye to play (3.5s) before hiding overlay
    setTimeout(() => setShowCallingUI(false), 3500)
  }

  // Send text message to AI (text mode — direct HTTP, not Socket)
  const sendMessage = async (overrideText) => {
    const text = (overrideText || inputText).trim()
    if (!text || isLoading) return

    setInputText('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setIsLoading(true)

    try {
      const res = await sendTextToAI({
        text,
        language: selectedLang.code,
        session_id: textSessionId,
      })
      const data = res.data
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.response_text || data.text || data.response || 'AI responded.',
      }])
    } catch (err) {
      console.error('Text AI error:', err)
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ AI service se connect nahi ho paya. Please ensure AI service is running on port 8000.',
      }])
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#060918] text-white">

      {/* Calling UI overlay */}
      {showCallingUI && (
        <CallingUI aiCall={aiCall} onEnd={handleEndCall} />
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between p-4 border-b border-white/5 glass z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 relative">
              <img src="/logo.svg" alt="MediVoice" className="h-8" />
              <h1 className="font-extrabold text-emerald-400 text-lg mt-0.5">AI ✨</h1>
              <div className="absolute top-0 -right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#060918]" />
            </div>
            <p className="text-xs text-emerald-400/90 flex items-center gap-1.5 ml-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'} ${!isLoading && 'animate-pulse'}`} />
              {isLoading ? (
                <span className="animate-pulse font-medium text-amber-400/90">typing...</span>
              ) : 'Online • Ready to help'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors border border-white/5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {selectedLang.native}
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 glass-strong neon-border rounded-2xl overflow-hidden z-50 animate-scale-in max-h-80 overflow-y-auto">
                  <div className="p-2">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} onClick={() => { setSelectedLang(lang); setShowLangMenu(false) }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                          ${selectedLang.code === lang.code
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <span className="font-medium">{lang.native}</span>
                        <span className="text-xs text-gray-600">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Keyboard toggle */}
          <button data-keyboard onClick={() => setShowKeyboard(!showKeyboard)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border
              ${showKeyboard ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}>
            <Keyboard className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="text-center py-16 animate-fade-in flex flex-col items-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center border border-emerald-500/10 overflow-hidden shadow-[0_0_40px_rgba(6,214,160,0.1)]">
                <img src="/ai-doctor.png" alt="AI Doctor" className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-emerald-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg></div>' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-[#060918] shadow-lg shadow-emerald-500/30">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="absolute inset-0 -m-2 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">MediVoice AI Receptionist</h3>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              {showKeyboard
                ? 'Type your message below to chat with our AI receptionist.'
                : 'Tap the call button below to start a live voice call with our AI receptionist.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['Book appointment', 'Cancel booking', 'Doctor availability', 'Clinic hours'].map(q => (
                <button key={q} onClick={() => { setShowKeyboard(true); sendMessage(q) }}
                  className="px-4 py-2 rounded-full glass text-xs text-gray-400 border border-white/5 transition-all duration-300 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 active:shadow-none cursor-pointer">
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${msg.role === 'user'
                    ? 'bg-purple-500/20 border border-purple-500/20'
                    : msg.role === 'system'
                      ? 'bg-amber-500/20 border border-amber-500/20'
                      : 'bg-emerald-500/20 border border-emerald-500/20'}`}>
                  {msg.role === 'user'
                    ? <span className="text-xs text-purple-400 font-bold">U</span>
                    : msg.role === 'system'
                      ? <span className="text-xs text-amber-400 font-bold">!</span>
                      : <Bot className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-purple-500/10 text-purple-100 rounded-tr-sm border border-purple-500/10'
                    : msg.role === 'system'
                      ? 'bg-amber-500/10 text-amber-100 rounded-tl-sm border border-amber-500/10'
                      : 'bg-emerald-500/10 text-emerald-100 rounded-tl-sm border border-emerald-500/10'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 glass shrink-0">
        {showKeyboard ? (
          /* Text input mode */
          <div className="p-4 flex items-end gap-3 max-w-2xl mx-auto w-full">
            <button onClick={() => setShowKeyboard(false)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-colors shrink-0 mb-0.5">
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-600 focus:border-emerald-500/30 focus:outline-none resize-none transition-all" />
              <button onClick={() => sendMessage()} disabled={!inputText.trim() || isLoading}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center disabled:opacity-30 hover:scale-105 transition-all">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ) : (
          /* Mic mode */
          <div className="p-4 pb-6 flex flex-col items-center justify-center">
            <button onClick={handleMicTap}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,214,160,0.3)] hover:scale-105 transition-all duration-300 neon-border relative">
              <div className="w-full h-full rounded-full absolute inset-0 bg-emerald-500/20 animate-ping opacity-75" />
              <Phone className="w-8 h-8 text-white relative z-10" />
            </button>
            <p className="text-gray-400 text-sm mt-3 font-medium">📞 Call AI Receptionist</p>
          </div>
        )}
      </footer>

    </div>
  )
}
