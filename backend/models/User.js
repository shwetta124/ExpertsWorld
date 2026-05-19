const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true,
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String, minlength: 6, select: false,
  },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'expert', 'admin'], default: 'user' },
  googleId: { type: String, default: null },
  wallet:   { type: Number, default: 0 },

  isEmailVerified:   { type: Boolean, default: false },
  emailVerifyToken:  { type: String,  default: null },
  emailVerifyExpire: { type: Date,    default: null },

  resetPasswordToken:  { type: String, default: null },
  resetPasswordExpire: { type: Date,   default: null },
  resetPasswordOTP:    { type: String, default: null },

  bio:      { type: String, default: '' },
  location: { type: String, default: '' },
  phone:    { type: String, default: '' },
  fcmToken: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, 
{ timestamps: true });

// ── Hash password before save ────────────────────────────────
// NOTE: Do NOT use next with async in newer Mongoose versions
userSchema.pre('save', async function () {
  // Skip if password not modified or not present
  if (!this.isModified('password') || !this.password) return;

  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare password ─────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Get initials ─────────────────────────────────────────────
userSchema.methods.getInitials = function () {
  if (!this.name) return 'U';
  return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
};

module.exports = mongoose.model('User', userSchema);