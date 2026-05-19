// ============================================================
//  ExpertsWorld — Main Server
// ============================================================

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();

const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const cors         = require('cors');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { protect }  = require('./middleware/auth');

// ── Routes ────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const expertRoutes  = require('./routes/expertRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// ── Models ────────────────────────────────────────────────────
let Message;
try {
  Message = require('./models/Message');
} catch (err) {
  console.warn('⚠️  Message model not found — chat saving disabled');
}

const app        = express();
const httpServer = http.createServer(app);

// Track sockets
const userSockets   = new Map();
const expertSockets = new Map();

// ── Database ──────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api',         sessionRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:         'ok',
    env:            process.env.NODE_ENV,
    connectedUsers: userSockets.size,
    timestamp:      new Date().toISOString(),
  });
});

// ── Agora Token Generator ─────────────────────────────────────
app.get('/api/agora/token', protect, (req, res) => {
  try {
    const { channel } = req.query;
    const appId   = process.env.AGORA_APP_ID;
    const appCert = process.env.AGORA_APP_CERTIFICATE;

    // No certificate means testing mode — return null token
    if (!appCert || appCert === 'none' || appCert === '') {
      return res.json({ success: true, token: null, appId });
    }

    // Certificate exists — generate real token
    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-token');
      const uid    = 0;
      const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const token  = RtcTokenBuilder.buildTokenWithUid(
        appId, appCert, channel, uid, RtcRole.PUBLISHER, expire, expire
      );
      console.log(`🎥 Agora token generated for channel: ${channel}`);
      return res.json({ success: true, token, appId, channel });
    } catch (tokenErr) {
      console.warn('agora-token not installed — returning null token');
      return res.json({ success: true, token: null, appId });
    }
  } catch (err) {
    res.json({ success: true, token: null });
  }
});

// ══════════════════════════════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════════════════════════════
const io = new Server(httpServer, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout:  60000,
  pingInterval: 25000,
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── User joins room ────────────────────────────────────────
  socket.on('join_user', (userId) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    userSockets.set(String(userId), socket.id);
    console.log(`👤 User ${userId} joined`);
  });

  // ── Expert joins room ──────────────────────────────────────
  socket.on('join_expert', (expertId) => {
    if (!expertId) return;
    socket.join(`expert_${expertId}`);
    expertSockets.set(String(expertId), socket.id);
    io.emit('expert_online', { expertId, online: true });
    console.log(`🧑‍💼 Expert ${expertId} joined`);
  });

  // ── Expert sets availability ───────────────────────────────
  socket.on('set_availability', ({ expertId, online }) => {
    io.emit('expert_online', { expertId, online });
  });

  // ── Expert responds to request ─────────────────────────────
  socket.on('respond_request', ({ sessionId, userId, action, expertName }) => {
    io.to(`user_${userId}`).emit('request_response', {
      sessionId,
      action,
      expertName,
      message: action === 'accepted'
        ? `${expertName} accepted your request!`
        : `${expertName} is unavailable right now.`,
    });
  });

  // ── Join session chat room ─────────────────────────────────
  socket.on('join_session', (sessionId) => {
    if (!sessionId) return;
    socket.join(`session_${sessionId}`);
    console.log(`💬 Socket joined session: ${sessionId}`);
  });

  // ── Send chat message ──────────────────────────────────────
  socket.on('send_message', async (data) => {
    const { sessionId, senderId, senderName, text, type, fileName, timestamp } = data;
    if (!sessionId || !text) return;

    // Save to MongoDB
    if (Message && senderId) {
      try {
        await Message.create({
          session:    sessionId,
          sender:     senderId,
          senderName: senderName || 'User',
          text:       text.trim(),
          type:       type || 'text',
          fileName:   fileName || '',
        });
      } catch (err) {
        console.error('❌ Message save failed:', err.message);
      }
    }

    // Broadcast to all OTHER users in session
    socket.to(`session_${sessionId}`).emit('receive_message', {
      senderId,
      senderName,
      text,
      type:      type || 'text',
      fileName:  fileName || '',
      timestamp: timestamp || new Date().toISOString(),
    });
  });

  // ── Typing indicator ───────────────────────────────────────
  socket.on('user_typing', ({ sessionId, senderId, isTyping }) => {
    socket.to(`session_${sessionId}`).emit('user_typing', { senderId, isTyping });
  });

  // ── Disconnect ─────────────────────────────────────────────
  socket.on('disconnect', () => {
    for (const [uid, sid] of userSockets.entries()) {
      if (sid === socket.id) { userSockets.delete(uid); break; }
    }
    for (const [eid, sid] of expertSockets.entries()) {
      if (sid === socket.id) {
        expertSockets.delete(eid);
        io.emit('expert_online', { expertId: eid, online: false });
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Error handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 ExpertsWorld Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL:  ${process.env.CLIENT_URL}\n`);
});