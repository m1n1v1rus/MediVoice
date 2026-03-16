const axios = require('axios');

module.exports = (io) => {
  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Call start
    socket.on('call:start', (data) => {
      const { sessionId, patientPhone } = data || {};
      const sid = sessionId || `session_${Date.now()}_${socket.id}`;

      activeSessions.set(socket.id, {
        sessionId: sid,
        patientPhone: patientPhone || '',
        startedAt: new Date(),
        audioChunks: [],
      });

      socket.emit('call:state', { state: 'listening', sessionId: sid });
      console.log(`📞 Call started: ${sid}`);
    });

    // Audio chunk from frontend
    socket.on('audio:chunk', async (data) => {
      const session = activeSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session. Start a call first.' });
        return;
      }

      try {
        // Change state to thinking
        socket.emit('call:state', { state: 'thinking', sessionId: session.sessionId });

        // Send audio to Python AI service
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/process`,
          {
            sessionId: session.sessionId,
            audio: data.audioBase64 || data.audio,
            patientPhone: session.patientPhone,
          },
          {
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
            maxContentLength: 50 * 1024 * 1024,
          }
        );

        const { text, audioBase64, transcript, action, intent } = aiResponse.data;

        // Send transcript update
        if (transcript) {
          socket.emit('transcript:update', {
            role: 'user',
            text: transcript,
            sessionId: session.sessionId,
          });
        }

        // Send AI text response
        if (text) {
          socket.emit('transcript:update', {
            role: 'agent',
            text,
            sessionId: session.sessionId,
          });
        }

        // Change state to speaking
        socket.emit('call:state', { state: 'speaking', sessionId: session.sessionId });

        // Send audio response
        socket.emit('audio:response', {
          audioBase64: audioBase64 || '',
          text: text || '',
          state: 'speaking',
          sessionId: session.sessionId,
          action: action || null,
          intent: intent || null,
        });

        // After speaking, go back to listening
        setTimeout(() => {
          if (activeSessions.has(socket.id)) {
            socket.emit('call:state', { state: 'listening', sessionId: session.sessionId });
          }
        }, 1000);
      } catch (error) {
        console.error('AI service error:', error.message);

        socket.emit('call:state', { state: 'listening', sessionId: session.sessionId });
        socket.emit('error', {
          message: 'AI service temporarily unavailable. Please try again.',
          sessionId: session.sessionId,
        });
      }
    });

    // Call end
    socket.on('call:end', (data) => {
      const session = activeSessions.get(socket.id);
      if (session) {
        socket.emit('call:ended', {
          sessionId: session.sessionId,
          duration: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
        });
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