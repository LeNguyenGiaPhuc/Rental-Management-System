const express = require("express");
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { requestOTP, verifyOTP } = require('../services/otpService');

router.post("/login", async (req, res) => {
  const { phone, password } = req.body || {};

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    const user = await db("users").where({ phone }).first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Wrong credentials' });
    }

    const stored = user.password_hash || "";

    let passwordMatches = false;

    if (stored.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else {
      passwordMatches = stored === password;
    }

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Wrong credentials' });
    }

    req.session.user = {
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
    };
    console.log("LOGIN SUCCESS:", req.session.user);
    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Session error' });

      // Respond with JSON so client can redirect from browser-side
      let redirect = '/';
      if (user.role === 'Tenant') redirect = '/tenant';
      if (user.role === 'Admin') redirect = '/admin';
      return res.json({ success: true, redirect });
    });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      return res.redirect("/");
    });
  } else {
    return res.redirect("/");
  }
});

// Request OTP (forgot password)
router.post('/forgot', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

  try {
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    // request OTP and send email
    try {
      await requestOTP({
        email,
        subject: 'Mã OTP đặt lại mật khẩu',
        user_id: user.id
      });
      return res.status(200).json({ success: true, message: 'OTP has been sent to your email' });
    } catch (e) {
      console.error('Forgot password error (requestOTP):', e);
      if (e && e.code === 'TOO_EARLY') {
        return res.status(429).json({ success: false, message: e.message || 'Too many requests' });
      }
      return res.status(500).json({ success: false, message: 'Mail or server error' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify OTP and reset password
router.post('/forgot/verify', async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).json({ success: false, message: 'Missing data' });

  try {
    const ok = await verifyOTP({ email, code });
    if (!ok) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const hash = bcrypt.hashSync(newPassword, 8);
    await db('users').where({ email }).update({ password_hash: hash });

    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
