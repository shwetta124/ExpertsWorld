const express = require('express');
const router  = express.Router();
const {
  register, login, googleAuth, getMe,
  forgotPassword, verifyOTP, resetPassword,
  verifyEmail, updateProfile, changePassword,
  saveFcmToken,   // ← add this
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',         register);
router.post('/login',            login);
router.post('/google',           googleAuth);
router.get('/me',                protect, getMe);
router.post('/forgot-password',  forgotPassword);
router.post('/verify-otp',       verifyOTP);
router.post('/reset-password',   resetPassword);
router.get('/verify-email',      verifyEmail);
router.put('/update-profile',    protect, updateProfile);
router.put('/change-password',   protect, changePassword);
router.post('/save-fcm-token',   protect, saveFcmToken);  // ← add this

module.exports = router;