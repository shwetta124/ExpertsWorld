// 📁 FILE: backend/controllers/sessionController.js

const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Session  = require('../models/Session');
const Expert   = require('../models/Expert');

// Safe import Message model
let Message;
try {
  Message = require('../models/Message');
} catch (err) {
  console.warn('Message model not found');
}

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── @POST /api/payments/create-order ──────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { expertId } = req.body;
    if (!expertId) {
      return res.status(400).json({ success: false, message: 'Expert ID required' });
    }

    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    const options = {
      amount:   expert.price * 100,
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
      },
      expert: {
        _id:   expert._id,
        name:  expert.name,
        price: expert.price,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('createOrder error:', err.message);
    next(err);
  }
};

// ── @POST /api/payments/verify ────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      expertId,
      topic,
    } = req.body;

    // Verify signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    const session = await Session.create({
      user:      req.user._id,
      expert:    expert._id,
      topic:     topic || 'General consultation',
      amount:    expert.price,
      orderId:   razorpay_order_id,
      paymentId: razorpay_payment_id,
      isPaid:    true,
      status:    'pending',
    });

    // Notify expert via socket
    req.app.get('io')?.to(`expert_${expert._id}`).emit('new_request', {
      requestId: session._id,
      userId:    req.user._id,
      userName:  req.user.name,
      topic:     session.topic,
      amount:    session.amount,
      time:      'Just now',
    });

    res.json({
      success:   true,
      message:   'Payment verified. Request sent to expert.',
      sessionId: session._id,
    });
  } catch (err) {
    console.error('verifyPayment error:', err.message);
    next(err);
  }
};

// ── @GET /api/sessions/my ─────────────────────────────────────
exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .populate('expert', 'name role avatar category color price isOnline')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, sessions: sessions || [] });
  } catch (err) {
    console.error('getMySessions error:', err.message);
    // Return empty array so UI doesn't break
    res.json({ success: true, sessions: [] });
  }
};

// ── @GET /api/sessions/expert-requests ───────────────────────
exports.getExpertRequests = async (req, res, next) => {
  try {
    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert) {
      return res.status(404).json({
        success: false,
        message: 'Expert profile not found',
      });
    }

    const sessions = await Session.find({
      expert: expert._id,
      status: { $in: ['pending', 'accepted'] },
    })
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, sessions: sessions || [] });
  } catch (err) {
    console.error('getExpertRequests error:', err.message);
    next(err);
  }
};

// ── @PATCH /api/sessions/:id/respond ─────────────────────────
exports.respondToSession = async (req, res, next) => {
  try {
    const { action } = req.body;

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accepted or rejected' });
    }

    const session = await Session.findById(req.params.id).populate('user', 'name _id');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = action;
    if (action === 'accepted') session.acceptedAt = new Date();
    await session.save();

    req.app.get('io')?.to(`user_${session.user._id}`).emit('request_response', {
      sessionId: session._id,
      action,
      expertId:  session.expert,
      topic:     session.topic,
      message:   action === 'accepted'
        ? 'Your expert accepted your request! You can now start the session.'
        : 'The expert is unavailable right now. Try another expert.',
    });

    res.json({ success: true, session });
  } catch (err) {
    console.error('respondToSession error:', err.message);
    next(err);
  }
};

// ── @PATCH /api/sessions/:id/complete ────────────────────────
exports.completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Already completed — just return success
    if (session.status === 'completed') {
      return res.json({ success: true, message: 'Session already completed', session });
    }

    session.status      = 'completed';
    session.completedAt = new Date();
    if (req.body.duration) session.duration = req.body.duration;
    await session.save();

    // Credit expert 90%
    const expertEarning = Math.floor(session.amount * 0.9);
    await Expert.findByIdAndUpdate(session.expert, {
      $inc: { sessions: 1, totalEarned: expertEarning },
    });

    // Notify user
    req.app.get('io')?.to(`user_${session.user}`).emit('session_completed', {
      sessionId: session._id,
      message:   'Session completed! Please rate your experience.',
    });

    res.json({ success: true, session });
  } catch (err) {
    console.error('completeSession error:', err.message);
    next(err);
  }
};

// ── @POST /api/sessions/:id/rate ──────────────────────────────
exports.rateSession = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.userRating) {
      return res.status(400).json({ success: false, message: 'Already rated this session' });
    }

    session.userRating = rating;
    session.userReview = review || '';
    await session.save();

    const expert = await Expert.findById(session.expert);
    if (expert) {
      expert.reviews.push({
        user:     req.user._id,
        userName: req.user.name,
        rating,
        text:     review || '',
      });
      if (typeof expert.calcRating === 'function') {
        expert.calcRating();
      } else {
        const total  = expert.reviews.reduce((sum, r) => sum + r.rating, 0);
        expert.rating = Math.round((total / expert.reviews.length) * 10) / 10;
      }
      await expert.save();
    }

    res.json({ success: true, message: 'Thank you for your rating!' });
  } catch (err) {
    console.error('rateSession error:', err.message);
    next(err);
  }
};

// ── @GET /api/sessions/:id/messages ──────────────────────────
exports.getSessionMessages = async (req, res, next) => {
  try {
    if (!Message) {
      return res.json({ success: true, messages: [] });
    }

    const messages = await Message.find({ session: req.params.id })
      .sort({ createdAt: 1 })
      .select('sender senderName text type fileName createdAt')
      .lean();

    res.json({ success: true, messages: messages || [] });
  } catch (err) {
    console.error('getSessionMessages error:', err.message);
    res.json({ success: true, messages: [] });
  }
};