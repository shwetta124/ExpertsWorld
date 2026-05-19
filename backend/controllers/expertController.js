const Expert = require('../models/Expert');
const User   = require('../models/User');
const { sendExpertApprovedEmail } = require('../utils/email');

// ── @GET /api/experts ────────────────────────────────────────
// Query: ?category=dev&search=react&sort=rating&online=true&page=1&limit=12
exports.getExperts = async (req, res, next) => {
  try {
    const { category, search, sort, online, page = 1, limit = 12 } = req.query;

    const query = { isApproved: true, isActive: true };

    if (category && category !== 'all') query.category = category;
    if (online === 'true') query.isOnline = true;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { role:  { $regex: search, $options: 'i' } },
        { tags:  { $in: [new RegExp(search, 'i')] } },
        { about: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      rating:     { rating: -1 },
      sessions:   { sessions: -1 },
      'price-asc':  { price:  1 },
      'price-desc': { price: -1 },
    };
    const sortBy = sortMap[sort] || { rating: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-documents -paymentDetails -reviews');

    res.json({
      success: true,
      count:   experts.length,
      total,
      pages:   Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      experts,
    });
  } catch (err) { next(err); }
};

// ── @GET /api/experts/:id ────────────────────────────────────
exports.getExpertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expert ID format'
      });
    }

    const expert = await Expert.findById(id)
      .populate('user', 'name email')
      .select('-documents -paymentDetails');

    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    res.json({ success: true, expert });
  } catch (err) { next(err); }
};

// ── @POST /api/experts/apply ─────────────────────────────────
exports.applyAsExpert = async (req, res, next) => {
  try {
    const existing = await Expert.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied' });

    const {
      role, about, category, tags, experience, price,
      location, languages, paymentDetails,
    } = req.body;

    const expert = await Expert.create({
      user:     req.user._id,
      name:     req.user.name,
      role, about, category,
      tags:     tags || [],
      experience, price,
      location: location || '',
      languages: languages || ['English'],
      paymentDetails: paymentDetails || {},
      isApproved: false,
    });

    res.status(201).json({ success: true, message: 'Application submitted. Awaiting admin approval.', expert });
  } catch (err) { next(err); }
};

// ── @POST /api/experts/:id/reviews ──────────────────────────
exports.addReview = async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    // One review per user
    const already = expert.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'You already reviewed this expert' });

    expert.reviews.push({ user: req.user._id, userName: req.user.name, rating, text });
    expert.calcRating();
    await expert.save();

    res.status(201).json({ success: true, rating: expert.rating, reviews: expert.reviews });
  } catch (err) { next(err); }
};

// ── @PUT /api/experts/availability ──────────────────────────
exports.setAvailability = async (req, res, next) => {
  try {
    const { online } = req.body;
    const expert = await Expert.findOneAndUpdate(
      { user: req.user._id },
      { isOnline: online },
      { new: true }
    );
    if (!expert) return res.status(404).json({ success: false, message: 'Expert profile not found' });
    res.json({ success: true, isOnline: expert.isOnline });
  } catch (err) { next(err); }
};

// ── @GET /api/experts/dashboard ─────────────────────────────
exports.getExpertDashboard = async (req, res, next) => {
  try {
    const expert = await Expert.findOne({ user: req.user._id });
    if (!expert) return res.status(404).json({ success: false, message: 'Expert profile not found' });

    const Session = require('../models/Session');
    const sessions = await Session.find({ expert: expert._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const monthSessions = await Session.find({
      expert: expert._id,
      status: 'completed',
      completedAt: { $gte: thisMonth },
    });
    const monthEarnings = monthSessions.reduce((s, r) => s + r.amount, 0);

    res.json({
      success: true,
      expert,
      stats: {
        totalSessions: expert.sessions,
        totalEarned:   expert.totalEarned,
        monthEarnings,
        rating:        expert.rating,
        reviewCount:   expert.reviews.length,
      },
      recentSessions: sessions,
    });
  } catch (err) { next(err); }
};

// ── ADMIN: @GET /api/admin/experts/pending ───────────────────
exports.getPendingExperts = async (req, res, next) => {
  try {
    const experts = await Expert.find({ isApproved: false, isActive: true })
      .populate('user', 'name email createdAt');
    res.json({ success: true, count: experts.length, experts });
  } catch (err) { next(err); }
};

// ── ADMIN: @PATCH /api/admin/experts/:id/approve ─────────────
exports.approveExpert = async (req, res, next) => {
  try {
    const expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name email');

    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    // Update user role to expert
    await User.findByIdAndUpdate(expert.user._id, { role: 'expert' });

    // Send approval email
    sendExpertApprovedEmail(expert.user.email, expert.user.name).catch(console.error);

    res.json({ success: true, message: 'Expert approved!', expert });
  } catch (err) { next(err); }
};

// ── ADMIN: @PATCH /api/admin/experts/:id/reject ──────────────
exports.rejectExpert = async (req, res, next) => {
  try {
    await Expert.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Expert application rejected' });
  } catch (err) { next(err); }
};

// ── ADMIN: @GET /api/admin/stats ─────────────────────────────
exports.getAdminStats = async (req, res, next) => {
  try {
    const Session = require('../models/Session');
    const [totalUsers, totalExperts, totalSessions, pendingExperts] = await Promise.all([
      User.countDocuments(),
      Expert.countDocuments({ isApproved: true }),
      Session.countDocuments(),
      Expert.countDocuments({ isApproved: false, isActive: true }),
    ]);

    const revenue = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalExperts,
        totalSessions,
        pendingExperts,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};