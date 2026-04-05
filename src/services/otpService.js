const { createOTPGenerator } = require('../utils/otpDecorator');
const { sendMail } = require('./emailService');
const db = require('../config/db');

const otpStore = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; 
const SEND_COOLDOWN_MS = 60 * 1000; 

function buildGenerator() {
  return createOTPGenerator({ ttlMs: DEFAULT_TTL });
}

async function requestOTP({ email, subject, templateText, user_id } = {}) {
  const now = Date.now();

  const existing = otpStore.get(email);
  if (existing && existing.lastSent && now - existing.lastSent < SEND_COOLDOWN_MS) {
    const wait = Math.ceil((SEND_COOLDOWN_MS - (now - existing.lastSent)) / 1000);
    const err = new Error(`Vui lòng chờ ${wait}s trước khi yêu cầu mã mới`);
    err.code = 'TOO_EARLY';
    throw err;
  }

  const gen = buildGenerator();
  const { code, stored } = gen.generate();

  otpStore.set(email, { stored, lastSent: now });

  // Persist OTP to database (otp_code stores the hash)
  try {
    await db('otp_tokens').insert({
      email,
      otp_code: stored.hash || null,
      expires_at: new Date(stored.expiresAt || (Date.now() + DEFAULT_TTL)),
      is_used: false,
      created_at: new Date(),
      user_id: user_id || null
    });
  } catch (dbErr) {
    console.error('Lỗi khi lưu OTP vào DB:', dbErr);
    throw dbErr;
  }

  try {
    await sendMail({
      to: email,
      subject: subject || 'Your OTP code',
      text: templateText || `Mã OTP của bạn là: ${code}`
    });
    console.log(' Mail đã gửi thành công tới:', email);
  } catch (err) {
    console.error(' Lỗi gửi mail:', err);
    throw err;
  }

  return { code, stored }; 
}

async function verifyOTP({ email, code } = {}) {
  const entry = otpStore.get(email);
  if (entry && entry.stored) {
    const gen = buildGenerator();
    const ok = gen.validate(code, entry.stored);
    if (ok) otpStore.delete(email);
    if (ok) {
      try {
        await db('otp_tokens')
          .where({ email })
          .andWhere('is_used', false)
          .andWhere('expires_at', '>', new Date())
          .update({ is_used: true });
      } catch (e) {
        console.error('Lỗi khi cập nhật is_used trong DB:', e);
      }
    }
    return ok;
  }

  try {
    const row = await db('otp_tokens')
      .where({ email })
      .andWhere('is_used', false)
      .andWhere('expires_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!row) return false;

    const gen = buildGenerator();
    const stored = { hash: row.otp_code, expiresAt: row.expires_at };
    const ok = gen.validate(code, stored);
    if (!ok) return false;

    try {
      await db('otp_tokens').where({ id: row.id }).update({ is_used: true });
    } catch (e) {
      console.error('Lỗi khi cập nhật is_used trong DB:', e);
    }

    return true;
  } catch (err) {
    console.error('Lỗi khi xác thực OTP từ DB:', err);
    return false;
  }
}

module.exports = { requestOTP, verifyOTP, otpStore };
