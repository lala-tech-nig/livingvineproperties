const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            attachments,
        });
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const brandColor = '#de1f25';
const brandName = 'Living Vine Properties';

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { max-width:600px; margin:30px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:${brandColor}; padding:28px 32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:22px; letter-spacing:1px; }
    .header p { color:rgba(255,255,255,0.8); margin:6px 0 0; font-size:13px; }
    .body { padding:32px; color:#333; line-height:1.7; }
    .body h2 { color:#1a1a1a; font-size:20px; margin-top:0; }
    .body p { margin:12px 0; font-size:15px; }
    .otp-box { background:#fff4f4; border:2px dashed ${brandColor}; border-radius:10px; text-align:center; padding:24px; margin:24px 0; }
    .otp-code { font-size:40px; font-weight:900; color:${brandColor}; letter-spacing:12px; font-family:monospace; }
    .otp-note { font-size:13px; color:#888; margin-top:8px; }
    .info-table { width:100%; border-collapse:collapse; margin:16px 0; font-size:14px; }
    .info-table td { padding:8px 12px; border-bottom:1px solid #f0f0f0; }
    .info-table td:first-child { font-weight:600; color:#555; width:40%; }
    .btn { display:inline-block; background:${brandColor}; color:#fff!important; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:600; margin:16px 0; }
    .alert-box { background:#fff8e1; border-left:4px solid #f59e0b; padding:14px 16px; border-radius:6px; margin:16px 0; font-size:14px; }
    .footer { background:#f9f9f9; padding:20px 32px; text-align:center; color:#aaa; font-size:12px; border-top:1px solid #eee; }
    .badge { display:inline-block; background:#fef2f2; color:${brandColor}; border-radius:20px; padding:3px 10px; font-size:12px; font-weight:700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏡 ${brandName}</h1>
      <p>Trusted Real Estate Investment Partner</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
      <p>If you did not request this, please ignore this email or contact support immediately.</p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
    birthday: (name) => baseTemplate(`
        <h2>🎂 Happy Birthday, ${name}!</h2>
        <p>On behalf of <strong>${brandName}</strong>, we wish you a fantastic day filled with joy and celebration.</p>
        <p>Thank you for being part of our journey. May this year bring you great prosperity and investment returns!</p>
        <br/>
        <p>Best Regards,<br/>The Living Vine Team</p>
    `),

    anniversary: (name, years) => baseTemplate(`
        <h2>🎉 Happy ${years} Year Anniversary!</h2>
        <p>Dear ${name},</p>
        <p>Congratulations on reaching this milestone! You have been with us for <strong>${years} year${years > 1 ? 's' : ''}</strong>, and we truly appreciate your trust and loyalty.</p>
        <p>Here's to many more years of success together.</p>
        <br/>
        <p>Best Regards,<br/>${brandName}</p>
    `),

    survey: (name) => baseTemplate(`
        <h2>We Value Your Feedback</h2>
        <p>Hi ${name},</p>
        <p>Could you please take a moment to tell us how we're doing? Your feedback helps us improve our services.</p>
        <a href="#" class="btn">Take Survey</a>
        <p>Thank you!</p>
    `),

    emailVerificationOtp: (name, otp) => baseTemplate(`
        <h2>Verify Your Email Address</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering with ${brandName}. Use the OTP below to verify your email address:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-note">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</div>
        </div>
        <p>If you did not create an account, please disregard this email.</p>
        <p>Best Regards,<br/>${brandName} Security Team</p>
    `),

    loginNotification: (name, device, ip, time, location) => baseTemplate(`
        <h2>🔐 New Login Detected</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We noticed a new login to your ${brandName} investor account. Here are the details:</p>
        <table class="info-table">
          <tr><td>Time</td><td>${time}</td></tr>
          <tr><td>IP Address</td><td>${ip}</td></tr>
          <tr><td>Location</td><td>${location || 'Unknown'}</td></tr>
          <tr><td>Device / Browser</td><td>${device}</td></tr>
        </table>
        <div class="alert-box">
          ⚠️ <strong>Not you?</strong> If you did not log in, please reset your password immediately and contact our support team.
        </div>
        <p>Best Regards,<br/>${brandName} Security Team</p>
    `),

    passwordResetEmail: (name, resetLink) => baseTemplate(`
        <h2>Reset Your Password</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset the password for your ${brandName} investor account.</p>
        <p>Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
        <p style="text-align:center;">
          <a href="${resetLink}" class="btn">Reset Password</a>
        </p>
        <p style="color:#888;font-size:13px;">Or copy and paste this URL into your browser:<br/><code>${resetLink}</code></p>
        <div class="alert-box">
          ⚠️ If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </div>
        <p>Best Regards,<br/>${brandName} Security Team</p>
    `),

    investmentApproved: (investor) => baseTemplate(`
        <h2>✅ Investment Application Approved!</h2>
        <p>Dear <strong>${investor.name}</strong>,</p>
        <p>Congratulations! Your investment application with <strong>${brandName}</strong> has been approved. Please find your investment details below:</p>
        <table class="info-table">
          <tr><td>Investment Amount</td><td><strong>₦${Number(investor.amountToInvest).toLocaleString()}</strong></td></tr>
          <tr><td>Duration</td><td>${investor.durationInMonths} months</td></tr>
          <tr><td>Expected ROI</td><td>₦${Number(investor.expectedROI).toLocaleString()}</td></tr>
          <tr><td>Start Date</td><td>${investor.startDate ? new Date(investor.startDate).toLocaleDateString('en-NG', { year:'numeric', month:'long', day:'numeric' }) : 'Pending'}</td></tr>
          <tr><td>Status</td><td><span class="badge">APPROVED</span></td></tr>
        </table>
        <p>Your official <strong>receipt</strong> and <strong>certificate</strong> are attached to this email as PDF documents.</p>
        <p>Please log in to your investor portal to complete payment by uploading your payment receipt.</p>
        <p style="text-align:center;">
          <a href="${process.env.CLIENT_URL || '#'}/investor" class="btn">Go to My Dashboard</a>
        </p>
        <p>If you have any questions, please contact your account officer or our support team.</p>
        <p>Best Regards,<br/>${brandName} Investment Team</p>
    `),

    investmentActive: (investor) => baseTemplate(`
        <h2>🚀 Your Investment is Now Active!</h2>
        <p>Dear <strong>${investor.name}</strong>,</p>
        <p>Great news! Your investment with <strong>${brandName}</strong> is now <strong>ACTIVE</strong> and generating returns.</p>
        <table class="info-table">
          <tr><td>Investment Amount</td><td><strong>₦${Number(investor.amountToInvest).toLocaleString()}</strong></td></tr>
          <tr><td>Duration</td><td>${investor.durationInMonths} months</td></tr>
          <tr><td>Expected ROI</td><td>₦${Number(investor.expectedROI).toLocaleString()}</td></tr>
          <tr><td>Maturity Date</td><td>${investor.maturityDate || 'See portal'}</td></tr>
        </table>
        <p>Your official <strong>investment certificate</strong> is attached to this email.</p>
        <p style="text-align:center;">
          <a href="${process.env.CLIENT_URL || '#'}/investor" class="btn">View Dashboard</a>
        </p>
        <p>Best Regards,<br/>${brandName} Investment Team</p>
    `),
};

module.exports = { sendEmail, templates, baseTemplate };
