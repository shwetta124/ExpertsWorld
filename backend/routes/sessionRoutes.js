// 📁 FILE: backend/routes/sessionRoutes.js

const express = require('express');
const router  = express.Router();
const {
  createOrder,
  verifyPayment,
  getMySessions,
  getExpertRequests,
  respondToSession,
  completeSession,
  rateSession,
  getSessionMessages,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

// ── Payment routes ─────────────────────────────────────────────
// These become: POST /api/payments/create-order
//               POST /api/payments/verify
router.post('/payments/create-order', protect, createOrder);
router.post('/payments/verify',       protect, verifyPayment);

// ── Session routes ─────────────────────────────────────────────
// IMPORTANT: specific named routes MUST come BEFORE /:id param routes
// These become: GET /api/sessions/my
//               GET /api/sessions/expert-requests
router.get('/sessions/my',              protect, getMySessions);
router.get('/sessions/expert-requests', protect, getExpertRequests);

// These become: PATCH /api/sessions/:id/respond  etc.
router.patch('/sessions/:id/respond',   protect, respondToSession);
router.patch('/sessions/:id/complete',  protect, completeSession);
router.post('/sessions/:id/rate',       protect, rateSession);
router.get('/sessions/:id/messages',    protect, getSessionMessages);

module.exports = router;