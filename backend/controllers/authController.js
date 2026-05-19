const crypto = require('crypto');
const User   = require('../models/User');
const Expert = require('../models/Expert');
const { generateToken } = require('../middleware/auth');
const { sendOTPEmail, sendVerificationEmail } = require('../utils/email');

// ── Helper: send token response ─────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:             user._id,
      name:            user.name,
      email:           user.email,
      role:            user.role,
      avatar:          user.avatar || user.name.split(' ').map(n => n[0]).join(''),
      wallet:          user.wallet,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// ── @POST /api/auth/register ─────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const verifyToken  = crypto.randomBytes(32).toString('hex');
    const verifyExpire = Date.now() + 24 * 60 * 60 * 1000;

    // Create user object first
    const user = new User({ name, email, password, emailVerifyToken: verifyToken, emailVerifyExpire: verifyExpire });

    // Save — this triggers pre-save hook correctly
    await user.save();

    // Send verification email non-blocking
    sendVerificationEmail(email, verifyToken).catch(console.error);

    sendToken(user, 201, res);
  } catch (err) { next(err); }
};


// ── @POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Google-only accounts have no password
    if (!user.password)
      return res.status(401).json({ success: false, message: 'This account uses Google login. Please sign in with Google.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// ── @POST /api/auth/google ───────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!name || !email || !googleId) {
      return res.status(400).json({ success: false, message: 'Google login data incomplete' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create Google user — NO password field to avoid pre-save hash
      user = new User({
        name,
        email,
        googleId,
        avatar:          avatar || '',
        isEmailVerified: true,
        role:            'user',
        wallet:          0,
        isActive:        true,
      });
      await user.save();
    } else {
      let changed = false;
      if (!user.googleId)              { user.googleId = googleId; changed = true; }
      if (avatar && !user.avatar)      { user.avatar = avatar;     changed = true; }
      if (!user.isEmailVerified)       { user.isEmailVerified = true; changed = true; }
      if (changed) await user.save();
    }

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// ── @GET /api/auth/me ────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ── @POST /api/auth/forgot-password ─────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    // Generate 6-digit OTP
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOTP    = otp;
    user.resetPasswordExpire = expire;
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) { next(err); }
};

// ── @POST /api/auth/verify-otp ───────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const user = await User.findOne({
      email,
      resetPasswordOTP:    otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    res.json({ success: true, message: 'OTP verified. Set your new password.' });
  } catch (err) { next(err); }
};

// ── @POST /api/auth/reset-password ──────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const user = await User.findOne({
      email,
      resetPasswordOTP:    otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    user.password            = password;
    user.resetPasswordOTP    = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// ── @GET /api/auth/verify-email?token=xxx ───────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const user = await User.findOne({
      emailVerifyToken:  token,
      emailVerifyExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });

    user.isEmailVerified   = true;
    user.emailVerifyToken  = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (err) { next(err); }
};

// ── @PUT /api/auth/update-profile ───────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, location, phone },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ── @PUT /api/auth/change-password ──────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords are required' });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.password)
      return res.status(400).json({ success: false, message: 'This account uses Google login and has no password' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

// ── @POST /api/auth/save-fcm-token ───────────────────────────
exports.saveFcmToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    // Save FCM token to user document
    await User.findByIdAndUpdate(req.user._id, { fcmToken: token });

    res.json({ success: true, message: 'FCM token saved' });
  } catch (err) { next(err); }
};