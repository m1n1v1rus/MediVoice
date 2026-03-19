import { useState, useRef, useCallback, useEffect } from 'react'

const AI_WS_URL = (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000')
  .replace('http://', 'ws://').replace('https://', 'wss://')

// VAD — tuned for clean detection without background noise triggers
const SPEECH_THRESHOLD = 0.08
const SILENCE_DURATION_MS = 1500
const MIN_SPEECH_MS = 400
const VAD_INTERVAL_MS = 80     // 12.5fps — enough for speech detection, won't block UI
const AUDIO_UI_INTERVAL = 150  // ~7fps for audio level ring animation

export default function useAICall() {
  const [callState, setCallState] = useState('idle')
  const [transcript, setTranscript] = useState([])
  const [timer, setTimer] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [error, setError] = useState(null)
  const [muted, setMuted] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)

  const wsRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const playbackCtxRef = useRef(null)
  const vadCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const isSpeakingRef = useRef(false)
  const silenceTimerRef = useRef(null)
  const speechStartRef = useRef(null)
  const vadLoopRef = useRef(null)       // now an interval ID, not rAF
  const audioLevelRef = useRef(null)    // separate interval for UI audio level
  const canRecordRef = useRef(false)
  const ringingCtxRef = useRef(null)
  const activeRef = useRef(false)
  const mutedRef = useRef(false)
  const playingRef = useRef(false)
  const queueRef = useRef([])
  const endingRef = useRef(false)
  const callStateRef = useRef('idle')   // ref mirror of callState — never stale
  const speakerOnRef = useRef(true)

  // Keep refs in sync with state
  useEffect(() => { callStateRef.current = callState }, [callState])
  useEffect(() => { speakerOnRef.current = speakerOn }, [speakerOn])

  // ─── RINGING ───
  const playRinging = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const g = ctx.createGain(); g.gain.value = 0.1; g.connect(ctx.destination)
      let n = 0
      const ring = () => {
        if (n >= 4 || !activeRef.current || ctx.state === 'closed') { ctx.close().catch(() => {}); return }
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator()
        o1.frequency.value = 440; o2.frequency.value = 480
        o1.connect(g); o2.connect(g)
        o1.start(); o2.start()
        o1.stop(ctx.currentTime + 0.7); o2.stop(ctx.currentTime + 0.7)
        n++; setTimeout(ring, 2000)
      }
      ring(); ringingCtxRef.current = ctx
    } catch (_) {}
  }, [])

  const stopRinging = useCallback(() => {
    ringingCtxRef.current?.close().catch(() => {}); ringingCtxRef.current = null
  }, [])

  // ─── DISCONNECT BEEPS ───
  const playDisconnect = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const g = ctx.createGain(); g.gain.value = 0.12; g.connect(ctx.destination)
      ;[800,600,400].forEach((f,i) => {
        const o = ctx.createOscillator(); o.frequency.value = f; o.connect(g)
        o.start(ctx.currentTime + i*0.2); o.stop(ctx.currentTime + i*0.2 + 0.12)
      })
      setTimeout(() => ctx.close().catch(() => {}), 1000)
    } catch (_) {}
  }, [])

  // ─── RECORDING ───
  const _startRec = useCallback(() => {
    if (!streamRef.current || recorderRef.current?.state === 'recording') return
    try {
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const r = new MediaRecorder(streamRef.current, { mimeType: mime, audioBitsPerSecond: 64000 })
      chunksRef.current = []
      r.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorderRef.current = r; r.start(200)
    } catch (_) {}
  }, [])

  const _cancelRec = useCallback(() => {
    const r = recorderRef.current
    if (r?.state === 'recording') { r.onstop = () => {}; r.stop() }
    chunksRef.current = []
  }, [])

  const _stopAndSend = useCallback(() => {
    const r = recorderRef.current
    if (!r || r.state !== 'recording') return
    r.onstop = async () => {
      const ch = chunksRef.current; chunksRef.current = []
      if (!ch.length) {
        // Nothing recorded — go back to listening
        if (activeRef.current && !endingRef.current) canRecordRef.current = true
        return
      }
      const blob = new Blob(ch, { type: r.mimeType || 'audio/webm' })
      if (blob.size < 500) {
        if (activeRef.current && !endingRef.current) canRecordRef.current = true
        return
      }
      const rdr = new FileReader()
      rdr.onloadend = () => {
        const b64 = rdr.result?.split(',')[1]
        if (b64 && wsRef.current?.readyState === WebSocket.OPEN) {
          canRecordRef.current = false // STOP recording while AI processes
          wsRef.current.send(JSON.stringify({ type: 'audio', data: b64, speechEnded: true }))
        } else {
          // WS not open — don't freeze, re-enable recording
          if (activeRef.current && !endingRef.current) canRecordRef.current = true
        }
      }
      rdr.onerror = () => {
        // FileReader failed — don't freeze
        if (activeRef.current && !endingRef.current) canRecordRef.current = true
      }
      rdr.readAsDataURL(blob)
    }
    r.stop()
  }, [])

  // ─── CLEANUP (full reset) ───
  const _cleanup = useCallback(() => {
    // Stop VAD interval
    if (vadLoopRef.current) { clearInterval(vadLoopRef.current); vadLoopRef.current = null }
    if (audioLevelRef.current) { clearInterval(audioLevelRef.current); audioLevelRef.current = null }
    _cancelRec()
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    isSpeakingRef.current = false
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); wsRef.current = null }
    if (playbackCtxRef.current && playbackCtxRef.current.state !== 'closed') {
      playbackCtxRef.current.close().catch(() => {})
    }
    playbackCtxRef.current = null
    if (vadCtxRef.current && vadCtxRef.current.state !== 'closed') {
      vadCtxRef.current.close().catch(() => {})
    }
    vadCtxRef.current = null
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    queueRef.current = []; playingRef.current = false
    canRecordRef.current = false; isSpeakingRef.current = false
    endingRef.current = false
    setAudioLevel(0)
  }, [_cancelRec])

  // ─── AUDIO PLAYBACK — uses REFS only, no stale closures ───
  const _playNext = useCallback(async () => {
    if (playingRef.current || !queueRef.current.length) return
    playingRef.current = true
    const b64 = queueRef.current.shift()
    if (!b64) { playingRef.current = false; return }

    try {
      if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed')
        playbackCtxRef.current = new AudioContext()
      const ctx = playbackCtxRef.current
      if (ctx.state === 'suspended') await ctx.resume()

      const bin = atob(b64), bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const buf = await ctx.decodeAudioData(bytes.buffer.slice(0))
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination)

      src.onended = () => {
        playingRef.current = false
        if (queueRef.current.length) {
          _playNext()
        } else if (callStateRef.current === 'ended' || !activeRef.current) {
          // Call ended, last audio finished — cleanup
          _cleanup()
        } else if (activeRef.current && !endingRef.current) {
           // AI finished speaking, wait 1500ms for room echo/reverb to die before listening
          setCallState('listening')
          setTimeout(() => {
             if (activeRef.current && !endingRef.current) {
                canRecordRef.current = true
             }
          }, 1500)
        }
      }
      src.start(0)
    } catch (e) {
      console.warn('[PLAY] decode error:', e)
      playingRef.current = false
      // CRITICAL: Don't freeze on audio error — re-enable listening
      if (!activeRef.current || callStateRef.current === 'ended') {
        _cleanup()
      } else if (activeRef.current && !endingRef.current) {
        canRecordRef.current = true
        setCallState('listening')
      }
    }
  }, [_cleanup]) // NO callState dependency — uses callStateRef

  const _enqueue = useCallback((b64) => {
    if (!speakerOnRef.current) {
      // Speaker off — skip audio but still go back to listening
      setTimeout(() => {
        if (activeRef.current && !endingRef.current) {
          canRecordRef.current = true
          setCallState('listening')
        }
      }, 300)
      return
    }
    queueRef.current.push(b64)
    _playNext()
  }, [_playNext]) // NO speakerOn dependency — uses speakerOnRef

  // ─── VAD — runs on setInterval (NOT requestAnimationFrame) ───
  const startVAD = useCallback(() => {
    if (!analyserRef.current) return
    const an = analyserRef.current
    const buf = new Float32Array(an.fftSize)

    // Speech detection at 12.5fps (every 80ms) — plenty for VAD, won't block UI
    vadLoopRef.current = setInterval(() => {
      if (!activeRef.current) return
      an.getFloatTimeDomainData(buf)
      let s = 0
      for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
      const rms = Math.sqrt(s / buf.length)

      // Speech detection — only when allowed
      if (rms > SPEECH_THRESHOLD && canRecordRef.current && !mutedRef.current && activeRef.current) {
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true
          speechStartRef.current = Date.now()
          _startRec()
        }
        if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
      } else if (isSpeakingRef.current && canRecordRef.current) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            const dur = Date.now() - (speechStartRef.current || 0)
            if (dur >= MIN_SPEECH_MS) _stopAndSend()
            else _cancelRec()
            isSpeakingRef.current = false
            silenceTimerRef.current = null
          }, SILENCE_DURATION_MS)
        }
      }
    }, VAD_INTERVAL_MS)

    // Separate low-frequency interval for UI audio level animation
    audioLevelRef.current = setInterval(() => {
      if (!activeRef.current || !analyserRef.current) { setAudioLevel(0); return }
      an.getFloatTimeDomainData(buf)
      let s = 0
      for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
      setAudioLevel(Math.sqrt(s / buf.length))
    }, AUDIO_UI_INTERVAL)
  }, [_startRec, _stopAndSend, _cancelRec])

  const stopVAD = useCallback(() => {
    if (vadLoopRef.current) { clearInterval(vadLoopRef.current); vadLoopRef.current = null }
    if (audioLevelRef.current) { clearInterval(audioLevelRef.current); audioLevelRef.current = null }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    isSpeakingRef.current = false
  }, [])

  // ─── START CALL ───
  const startCall = useCallback(async (language = 'hi') => {
    // Full reset first
    _cleanup()
    setCallState('connecting')
    setError(null)
    setTranscript([])
    setTimer(0)
    setMuted(false)
    mutedRef.current = false
    activeRef.current = true
    canRecordRef.current = false
    endingRef.current = false
    callStateRef.current = 'connecting'

    const sid = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    setSessionId(sid)

    playRinging()

    try {
      // Get mic FIRST
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access requires a secure connection (HTTPS) or localhost.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 }
      })
      streamRef.current = stream

      // Playback context
      playbackCtxRef.current = new AudioContext()

      // VAD analyser
      vadCtxRef.current = new AudioContext()
      const src = vadCtxRef.current.createMediaStreamSource(stream)
      const an = vadCtxRef.current.createAnalyser()
      an.fftSize = 2048; an.smoothingTimeConstant = 0.3
      src.connect(an); analyserRef.current = an

      // WebSocket to Node.js gRPC Proxy
      const ws = new WebSocket(`${AI_WS_URL}/ws/ai`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[CALL] WS connected')
        ws.send(JSON.stringify({ type: 'config', language }))
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'state') {
            if (msg.state === 'listening') {
              stopRinging()
              setCallState('listening')
              callStateRef.current = 'listening'
              _cancelRec()
              if (!endingRef.current) canRecordRef.current = true
              if (!timerRef.current) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
            } else if (msg.state === 'thinking') {
              canRecordRef.current = false
              _cancelRec()
              setCallState('thinking')
              callStateRef.current = 'thinking'
            } else if (msg.state === 'speaking') {
              stopRinging()
              canRecordRef.current = false
              _cancelRec()
              setCallState('speaking')
              callStateRef.current = 'speaking'
            } else if (msg.state === 'ended') {
              callStateRef.current = 'ended'
              playDisconnect()
              setCallState('ended')
              activeRef.current = false
              if (!playingRef.current && queueRef.current.length === 0) _cleanup()
            }
          } else if (msg.type === 'transcript' && msg.text) {
            stopRinging()
            setTranscript(p => [...p, { role: msg.role, text: msg.text, isWelcome: msg.isWelcome, isGoodbye: msg.isGoodbye }])
          } else if (msg.type === 'audio' && msg.data) {
            stopRinging()
            _enqueue(msg.data)
          } else if (msg.type === 'error') {
            setError(msg.message)
            setTimeout(() => setError(null), 3000)
            // CRITICAL: Don't freeze on error — go back to listening
            if (activeRef.current && !endingRef.current) {
              canRecordRef.current = true
              setCallState('listening')
              callStateRef.current = 'listening'
            }
          }
        } catch (_) {}
      }

      ws.onerror = () => {
        setError('Server connection failed'); stopRinging()
        callStateRef.current = 'ended'
        setCallState('ended'); activeRef.current = false; _cleanup()
      }

      ws.onclose = () => {
        if (activeRef.current) {
          playDisconnect()
          callStateRef.current = 'ended'
          setCallState('ended'); activeRef.current = false; _cleanup()
        }
      }

      startVAD()
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Mic permission denied' : err.message)
      callStateRef.current = 'ended'
      setCallState('ended'); activeRef.current = false; stopRinging(); _cleanup()
    }
  }, [_cleanup, playRinging, stopRinging, playDisconnect, startVAD, _cancelRec, _enqueue])

  // ─── END CALL ───
  const endCall = useCallback(() => {
    if (endingRef.current) return
    endingRef.current = true
    activeRef.current = false
    canRecordRef.current = false
    stopRinging(); stopVAD(); _cancelRec()

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end' }))
    }

    setTimeout(() => {
      playDisconnect()
      callStateRef.current = 'ended'
      setCallState('ended')
      _cleanup()
    }, 3000)
  }, [stopRinging, stopVAD, _cancelRec, playDisconnect, _cleanup])

  // ─── MUTE ───
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const newVal = !prev
      mutedRef.current = newVal
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => { track.enabled = !newVal })
      }
      if (newVal) {
        canRecordRef.current = false
        _cancelRec()
        isSpeakingRef.current = false
      }
      return newVal
    })
  }, [_cancelRec])

  const toggleSpeaker = useCallback(() => setSpeakerOn(s => !s), [])

  // Cleanup on unmount
  useEffect(() => () => { activeRef.current = false; _cleanup(); stopRinging() }, [])

  return {
    callState, transcript, timer, sessionId, error,
    muted, speakerOn, audioLevel,
    startCall, endCall, toggleMute, toggleSpeaker,
  }
}
