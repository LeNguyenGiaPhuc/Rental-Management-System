const { createOTPGenerator } = require('../utils/otpDecorator');
const { sendMail } = require('./emailService');

const otpStore = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; 
const SEND_COOLDOWN_MS = 60 * 1000; 

function buildGenerator() {
  return createOTPGenerator({ ttlMs: DEFAULT_TTL });
}

async function requestOTP({ email, subject, templateText }) {
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

function verifyOTP({ email, code }) {
  const entry = otpStore.get(email);
  if (!entry || !entry.stored) return false;

  const gen = buildGenerator();
  const ok = gen.validate(code, entry.stored);
  if (ok) otpStore.delete(email);
  return ok;
}

module.exports = { requestOTP, verifyOTP, otpStore };
