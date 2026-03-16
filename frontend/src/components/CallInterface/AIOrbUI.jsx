import { useState, useEffect } from 'react'
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Building2, ArrowDown } from 'lucide-react'

// Props: onEndCall to close the Modal
export default function AIOrbUI({ onEndCall, initialTranscript }) {
  // States: 'connecting' | 'idle' | 'listening' | 'thinking' | 'speaking'
  const [callState, setCallState] = useState('connecting')
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [duration, setDuration] = useState(0)
  
  const [transcript, setTranscript] = useState(initialTranscript || [
    { role: 'ai', text: 'Namaste! City Care Hospital mein aapka swagat hai. Main aapki kaise madad kar sakta hoon?' }
  ])

  // Timer
  useEffect(() => {
    if (callState === 'connecting') {
      const t = setTimeout(() => setCallState('idle'), 2000)
      return () => clearTimeout(t)
    }
    const timer = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(timer)
  }, [callState])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // UI mapping for states
  const stateConfig = {
    connecting: { text: 'Connecting...', color: 'text-gray-400', orbClass: 'orb-idle opacity-50' },
    idle:       { text: 'Wait for your turn...', color: 'text-purple-400', orbClass: 'orb-idle' },
    listening:  { text: 'Listening...', color: 'text-cyan-400', orbClass: 'orb-listen' },
    thinking:   { text: 'Thinking...', color: 'text-amber-400', orbClass: 'orb-think' },
    speaking:   { text: 'Speaking...', color: 'text-emerald-400', orbClass: 'orb-speak' },
  }

  const currentConfig = stateConfig[callState] || stateConfig.idle

  // Demo state cycler (For Hackathon UI Demo without actual backend yet)
  const cycleState = () => {
    const states = ['idle', 'listening', 'thinking', 'speaking']
    const next = states[(states.indexOf(callState) + 1) % states.length]
    setCallState(next)
    
    if (next === 'thinking') {
      setTranscript(p => [...p, { role: 'user', text: 'Mujhe Dr. Sharma se milna hai kal subah.' }])
    } else if (next === 'speaking') {
      setTranscript(p => [...p, { role: 'ai', text: 'Dr. Sharma kal subah 10 baje available hain. Kya main aapki appointment book kar doon?' }])
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#060612] text-white flex flex-col items-center justify-between py-12 px-6 overflow-hidden font-sans">
      
      {/* Background glow based on state */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 pointer-events-none
        ${callState === 'listening' ? 'bg-cyan-500' : 
          callState === 'thinking' ? 'bg-amber-500' : 
          callState === 'speaking' ? 'bg-emerald-500' : 'bg-purple-500'}`} 
      />

      {/* Top Header */}
      <div className="z-10 text-center space-y-2 animate-fade-in mt-4">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs tracking-[0.2em] font-medium uppercase mb-4">
          <Building2 className="w-4 h-4" /> City Care Hospital
        </div>
        <h1 className="text-3xl font-black text-white">AI Receptionist</h1>
        <p className={`font-medium transition-colors duration-300 ${currentConfig.color}`}>
          {currentConfig.text}
        </p>
      </div>

      {/* Center Orb (Clickable for demo purposes) */}
      <div className="z-10 flex-1 flex flex-col items-center justify-center w-full" onClick={cycleState}>
        <div className="relative flex items-center justify-center">
          {/* Main Orb */}
          <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${currentConfig.orbClass} backdrop-blur-xl`}>
            {/* Inner Icon */}
            <div className={`w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20
              ${callState === 'speaking' ? 'animate-pulse' : ''}
            `}>
              <Building2 className={`w-8 h-8 ${currentConfig.color}`} />
            </div>
          </div>
        </div>

        {/* Visualizer bars below orb */}
        <div className="flex items-center justify-center gap-1 mt-12 h-8">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 rounded-full transition-all duration-300 ${(callState === 'speaking' || callState === 'listening') ? 'animate-wave wave-bar bg-white/80' : 'h-1.5 bg-white/20'}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        
        {/* Timer */}
        <div className="mt-8 text-xl font-medium text-gray-300 font-mono">
          {formatTime(duration)}
        </div>
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-sm mb-3 animate-slide-up">
        
        {/* Call Action Buttons */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <button 
            onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border outline-none
              ${muted ? 'bg-white/10 border-white/20 text-white' : 'glass border-white/10 text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={onEndCall}
            className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/40 transition-all group">
            <PhoneOff className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setSpeakerOn(!speakerOn); }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border outline-none
              ${speakerOn ? 'glass border-white/10 text-white' : 'bg-white/10 border-white/20 text-gray-400'}`}>
            {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>

        {/* State Badges (Hackathon Demo controls) */}
        <div className="flex justify-center gap-2 mb-6" onClick={(e) => e.stopPropagation()}>
          {['connecting', 'listening', 'thinking', 'speaking'].map((s) => (
            <div key={s} 
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all
                ${callState === s ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-600'}
              `}>
              {s}
            </div>
          ))}
        </div>

        {/* Live Transcript Box */}
        <div className="glass border-white/10 rounded-2xl p-5 relative overflow-hidden h-32 flex flex-col justify-end" onClick={(e) => e.stopPropagation()}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          
          <p className="absolute top-4 left-5 text-[10px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-2">
            Live Transcript
            {(callState === 'listening' || callState === 'speaking') && (
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </span>
            )}
          </p>

          <div className="flex flex-col justify-end overflow-hidden pt-6">
            {transcript.slice(-1).map((msg, i) => (
              <p key={i} className={`text-sm font-medium leading-relaxed animate-slide-up
                ${msg.role === 'user' ? 'text-white' : 'text-emerald-400'}`}>
                {msg.text}
              </p>
            ))}
          </div>

          <button className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  )
}
