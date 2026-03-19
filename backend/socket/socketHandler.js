const axios = require('axios');

module.exports = (io) => {
  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Call start — frontend triggers this when user taps "Call AI"
    socket.on('call:start', async (data) => {
      const { sessionId, patientPhone, language } = data || {};
      const sid = sessionId || `session_${Date.now()}_${socket.id}`;

      activeSessions.set(socket.id, {
        sessionId: sid,
        patientPhone: patientPhone || '',
        language: language || 'hi',
        startedAt: new Date(),
        audioChunks: [],
      });

      // Send welcome message from AI service
      try {
        const welcomeRes = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/welcome`,
          {
            session_id: sid,
            language: language || 'hi',
            patient_phone: patientPhone || '',
          },
          { timeout: 15000 }
        );

        const { welcome_text, audio_base64, language: lang } = welcomeRes.data;

        // Send transcript for welcome
        if (welcome_text) {
          socket.emit('transcript:update', {
            role: 'agent',
            text: welcome_text,
            sessionId: sid,
            language: lang,
            isWelcome: true,
          });
        }

        // Send audio for welcome
        if (audio_base64) {
          socket.emit('call:state', { state: 'speaking', sessionId: sid });
          socket.emit('audio:response', {
            audioBase64: audio_base64,
            text: welcome_text || '',
            state: 'speaking',
            sessionId: sid,
            isWelcome: true,
          });
        }

        // Ready to listen
        setTimeout(() => {
          socket.emit('call:state', { state: 'listening', sessionId: sid });
        }, 500);
      } catch (err) {
        console.error('Welcome message error:', err.message);
        socket.emit('call:state', { state: 'listening', sessionId: sid });
      }

      console.log(`📞 Call started: ${sid}`);
    });

    // Audio chunk from frontend — send to AI service for processing
    socket.on('audio:chunk', async (data) => {
      const session = activeSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session. Start a call first.' });
        return;
      }

      try {
        // State → thinking
        socket.emit('call:state', { state: 'thinking', sessionId: session.sessionId });

        // Send audio to Python AI service with CORRECT field names
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/process`,
          {
            audio_base64: data.audioBase64 || data.audio || '',
            session_id: session.sessionId,
            patient_phone: session.patientPhone || null,
          },
          {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
            maxContentLength: 50 * 1024 * 1024,
          }
        );

        const {
          response_text,
          audio_base64,
          user_text,
          action_result,
          intent,
          state,
          language,
          appointment_details,
        } = aiResponse.data;

        // Send user transcript (what STT heard)
        if (user_text) {
          socket.emit('transcript:update', {
            role: 'user',
            text: user_text,
            sessionId: session.sessionId,
            language: language || 'hi',
          });
        }

        // Send AI response text
        if (response_text) {
          socket.emit('transcript:update', {
            role: 'agent',
            text: response_text,
            sessionId: session.sessionId,
            language: language || 'hi',
          });
        }

        // State → speaking
        socket.emit('call:state', { state: 'speaking', sessionId: session.sessionId });

        // Send audio response
        socket.emit('audio:response', {
          audioBase64: audio_base64 || '',
          text: response_text || '',
          state: 'speaking',
          sessionId: session.sessionId,
          action: action_result || null,
          intent: intent || null,
          appointmentDetails: appointment_details || null,
          aiState: state || null,
        });

        // After speaking done, go back to listening
        setTimeout(() => {
          if (activeSessions.has(socket.id)) {
            socket.emit('call:state', { state: 'listening', sessionId: session.sessionId });
          }
        }, 1500);
      } catch (error) {
        console.error('AI service error:', error.message);

        socket.emit('call:state', { state: 'listening', sessionId: session.sessionId });
        socket.emit('error', {
          message: 'AI service temporarily unavailable. Please try again.',
          sessionId: session.sessionId,
        });
      }
    });

    // Call end — send goodbye message before closing
    socket.on('call:end', async (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        try {
          const endRes = await axios.post(
            `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/end-call`,
            { session_id: session.sessionId },
            { timeout: 15000 }
          );

          const summary = endRes.data || {};

          // Send goodbye transcript
          if (summary.goodbye_text) {
            socket.emit('transcript:update', {
              role: 'agent',
              text: summary.goodbye_text,
              sessionId: session.sessionId,
              isGoodbye: true,
            });
          }

          // Send goodbye audio
          if (summary.goodbye_audio) {
            socket.emit('call:state', { state: 'speaking', sessionId: session.sessionId });
            socket.emit('audio:response', {
              audioBase64: summary.goodbye_audio,
              text: summary.goodbye_text || '',
              state: 'speaking',
              sessionId: session.sessionId,
              isGoodbye: true,
            });
          }

          // Brief delay to let goodbye play, then end
          setTimeout(() => {
            socket.emit('call:ended', {
              sessionId: session.sessionId,
              duration: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
              summary: summary,
            });
          }, 2000);
        } catch (err) {
          socket.emit('call:ended', {
            sessionId: session.sessionId,
            duration: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
          });
        }
        activeSessions.delete(socket.id);
        console.log(`📞 Call ended: ${session.sessionId}`);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const session = activeSessions.get(socket.id);
      if (session) {
        activeSessions.delete(socket.id);
        console.log(`📞 Call disconnected: ${session.sessionId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Cleanup stale sessions every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [socketId, session] of activeSessions) {
      if (now - session.startedAt.getTime() > 10 * 60 * 1000) {
        activeSessions.delete(socketId);
        console.log(`🧹 Cleaned stale session: ${session.sessionId}`);
      }
    }
  }, 5 * 60 * 1000);
};