const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Generic send ────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to, subject, html,
  });
};

// ── OTP email ────────────────────────────────────────────────
const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: 'ExpertsWorld — Password Reset OTP',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#F8FAFF;border-radius:12px;">
        <h2 style="color:#1A56DB;font-size:22px;margin-bottom:1rem;">Reset Your Password</h2>
        <p style="color:#475569;font-size:15px;">Use the OTP below to reset your ExpertsWorld password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1A56DB;color:white;font-size:32px;font-weight:800;letter-spacing:12px;text-align:center;padding:1.2rem;border-radius:10px;margin:1.5rem 0;">
          ${otp}
        </div>
        <p style="color:#94A3B8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

// ── Verification email ────────────────────────────────────────
const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'ExpertsWorld — Verify Your Email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#F8FAFF;border-radius:12px;">
        <h2 style="color:#1A56DB;">Welcome to ExpertsWorld!</h2>
        <p style="color:#475569;">Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#1A56DB;color:white;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;margin:1rem 0;">
          Verify Email
        </a>
        <p style="color:#94A3B8;font-size:12px;">Link expires in 24 hours.</p>
      </div>
    `,
  });
};

// ── Expert approved email ──────────────────────────────────────
const sendExpertApprovedEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'ExpertsWorld — Your Expert Application is Approved! 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#F8FAFF;border-radius:12px;">
        <h2 style="color:#10B981;">Congratulations, ${name}! 🎉</h2>
        <p style="color:#475569;">Your expert application has been approved. You can now receive session requests and start earning on ExpertsWorld.</p>
        <a href="${process.env.CLIENT_URL}/expert-dashboard" style="display:inline-block;background:#1A56DB;color:white;padding:12px 28px;border-radius:99px;text-decoration:none;font-weight:700;margin:1rem 0;">
          Go to Expert Dashboard
        </a>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOTPEmail, sendVerificationEmail, sendExpertApprovedEmail };