require('dotenv').config();
const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPassRaw = process.env.SMTP_PASS || '';
const smtpPass = smtpPassRaw.replace(/\s+/g, '');
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpSecure = smtpPort === 465;

const transport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

async function sendMail({ to, subject, text, html }) {
  if (!smtpUser || !smtpPass) {
    console.warn('SMTP_USER or SMTP_PASS not set; skipping sendMail');
    return Promise.resolve();
  }

  const msg = {
    from: process.env.SMTP_FROM || smtpUser,
    to,
    subject,
    text,
    html
  };

  return transport.sendMail(msg);
}

module.exports = { sendMail };
