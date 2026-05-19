// 📁 CREATE: backend/routes/agoraRoutes.js
// This generates Agora tokens so video call works in both testing AND token mode

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/agora/token?channel=xxx
router.get('/token', protect, async (req, res) => {
  try {
    const { channel } = req.query;

    if (!channel) {
      return res.status(400).json({ success: false, message: 'Channel name required' });
    }

    const appId     = process.env.AGORA_APP_ID;
    const appCert   = process.env.AGORA_APP_CERTIFICATE;

    // If no certificate — testing mode, return null token
    if (!appCert || appCert === 'none' || appCert === '') {
      return res.json({
        success: true,
        token:   null, // null = testing mode
        appId,
        channel,
        uid:     0,
      });
    }

    // If certificate exists — generate real token
    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
      const uid          = 0;
      const role         = RtcRole.PUBLISHER;
      const expireTime   = 3600; // 1 hour
      const currentTime  = Math.floor(Date.now() / 1000);
      const privilegeExpireTime = currentTime + expireTime;

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCert, channel, uid, role, privilegeExpireTime
      );

      return res.json({ success: true, token, appId, channel, uid });
    } catch (err) {
      // agora-access-token not installed — return null token
      return res.json({ success: true, token: null, appId, channel, uid: 0 });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;