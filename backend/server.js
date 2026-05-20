// 📁 FILE: backend/server.js
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
  console.warn('⚠️  Message model not found');
}

const app        = express();
const httpServer = http.createServer(app);

// Track sockets
const userSockets   = new Map();
const expertSockets = new Map();

// ── Database ──────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all in development
    }
  },
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
    status:    'ok',
    env:       process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Agora Token Generator ─────────────────────────────────────
app.get('/api/agora/token', protect, (req, res) => {
  try {
    const { channel } = req.query;
    const appId   = process.env.AGORA_APP_ID;
    const appCert = process.env.AGORA_APP_CERTIFICATE;

    if (!appCert || appCert === 'none' || appCert === '') {
      return res.json({ success: true, token: null, appId });
    }

    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-token');
      const expire = Math.floor(Date.now() / 1000) + 3600;
      const token  = RtcTokenBuilder.buildTokenWithUid(
        appId, appCert, channel, 0, RtcRole.PUBLISHER, expire, expire
      );
      return res.json({ success: true, token, appId, channel });
    } catch {
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
    origin:      allowedOrigins,
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout:  60000,
  pingInterval: 25000,
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_user', (userId) => {
    if (!userId) return;
    socket.join(`user_${userId}`);
    userSockets.set(String(userId), socket.id);
    console.log(`👤 User ${userId} joined`);
  });

  socket.on('join_expert', (expertId) => {
    if (!expertId) return;
    socket.join(`expert_${expertId}`);
    expertSockets.set(String(expertId), socket.id);
    io.emit('expert_online', { expertId, online: true });
  });

  socket.on('set_availability', ({ expertId, online }) => {
    io.emit('expert_online', { expertId, online });
  });

  socket.on('respond_request', ({ sessionId, userId, action, expertName }) => {
    io.to(`user_${userId}`).emit('request_response', {
      sessionId, action, expertName,
      message: action === 'accepted'
        ? `${expertName} accepted your request!`
        : `${expertName} is unavailable right now.`,
    });
  });

  socket.on('join_session', (sessionId) => {
    if (!sessionId) return;
    socket.join(`session_${sessionId}`);
  });

  socket.on('send_message', async (data) => {
    const { sessionId, senderId, senderName, text, type, fileName, timestamp } = data;
    if (!sessionId || !text) return;

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
        console.error('Message save failed:', err.message);
      }
    }

    socket.to(`session_${sessionId}`).emit('receive_message', {
      senderId, senderName, text,
      type:      type || 'text',
      fileName:  fileName || '',
      timestamp: timestamp || new Date().toISOString(),
    });
  });

  socket.on('user_typing', ({ sessionId, senderId, isTyping }) => {
    socket.to(`session_${sessionId}`).emit('user_typing', { senderId, isTyping });
  });

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
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 ExpertsWorld Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL:  ${process.env.CLIENT_URL}\n`);
});