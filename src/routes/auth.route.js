const express = require("express");
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { requestOTP, verifyOTP } = require('../services/otpService');

router.post("/login", async (req, res) => {
  const { phone, password } = req.body || {};

  if (!phone || !password) {
    return res.status(400).send("Thiếu dữ liệu");
  }

  try {
    const user = await db("users").where({ phone }).first();

    if (!user) {
      return res.status(401).send("Sai tài khoản");
    }

    const stored = user.password_hash || "";

    let passwordMatches = false;

    if (stored.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else {
      passwordMatches = stored === password;
    }

    if (!passwordMatches) {
      return res.status(401).send("Sai tài khoản");
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
      if (err) return res.status(500).send("Lỗi session");

      // Chuyển hướng đúng vai trò nhưng đã có session chắc chắn
      if (user.role === "Tenant") return res.redirect("/tenant");
      if (user.role === "Admin") return res.redirect("/admin");
      return res.redirect("/");
    });
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(500).send("Lỗi server");
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

module.exports = router;
// Request OTP (forgot password)
router.post('/forgot', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).send('Thiếu email');

  try {
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(404).send('Không tìm thấy tài khoản');

    // request OTP and send email
    try {
      await requestOTP({
        email,
        subject: 'Mã OTP đặt lại mật khẩu',
        user_id: user.id
      });
      return res.status(200).send('OTP đã được gửi tới email nếu tồn tại');
    } catch (e) {
      console.error('Forgot password error (requestOTP):', e);
      if (e && e.code === 'TOO_EARLY') {
        return res.status(429).send(e.message);
      }
      return res.status(500).send('Lỗi gửi mail hoặc server');
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).send('Lỗi server');
  }
});

// Verify OTP and reset password
router.post('/forgot/verify', async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).send('Thiếu dữ liệu');

  try {
    const ok = await verifyOTP({ email, code });
    if (!ok) return res.status(400).send('OTP không hợp lệ hoặc đã hết hạn');

    const hash = bcrypt.hashSync(newPassword, 8);
    await db('users').where({ email }).update({ password_hash: hash });

    return res.status(200).send('Mật khẩu đã được cập nhật');
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).send('Lỗi server');
  }
});

module.exports = router;
