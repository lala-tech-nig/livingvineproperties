const nodemailer = require('nodemailer');

const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 465;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
});

const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM || 'LIVING VINE PROPERTIES INVESTMENT LIMITED'}" <${process.env.EMAIL_USER}>`,
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
const brandName = 'LIVING VINE PROPERTIES INVESTMENT LIMITED';

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
      <img src="${process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com'}/living-logo.png" alt="${brandName}" style="height: 50px; width: auto; display: block; margin: 0 auto;" />
      <p style="color:rgba(255,255,255,0.8); margin:10px 0 0; font-size:12px; letter-spacing:1px; text-transform:uppercase; font-weight:600;">Trusted Real Estate Investment Partner</p>
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
        <h2>Happy Birthday, ${name}!</h2>
        <p>On behalf of <strong>${brandName}</strong>, we wish you a fantastic day filled with joy and celebration.</p>
        <p>Thank you for being part of our journey. May this year bring you great prosperity and investment returns!</p>
        <br/>
        <p>Best Regards,<br/>The Living Vine Team</p>
    `),

    anniversary: (name, years) => baseTemplate(`
        <h2>Happy ${years} Year Anniversary!</h2>
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
        <h2>New Login Detected</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We noticed a new login to your ${brandName} investor account. Here are the details:</p>
        <table class="info-table">
          <tr><td>Time</td><td>${time}</td></tr>
          <tr><td>IP Address</td><td>${ip}</td></tr>
          <tr><td>Location</td><td>${location || 'Unknown'}</td></tr>
          <tr><td>Device / Browser</td><td>${device}</td></tr>
        </table>
        <div class="alert-box">
          <strong>Not you?</strong> If you did not log in, please reset your password immediately and contact our support team.
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
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </div>
        <p>Best Regards,<br/>${brandName} Security Team</p>
    `),

    investmentApproved: (investor) => baseTemplate(`
        <h2>Investment Application Approved!</h2>
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
        <h2>Your Investment is Now Active!</h2>
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

// Helper formatters
function serverFormatCurrency(amount) {
    return `₦${Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function serverFormatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function serverGetMaturityDate(investment) {
    if (!investment.startDate || !investment.durationInMonths) return null;
    const d = new Date(investment.startDate);
    d.setMonth(d.getMonth() + investment.durationInMonths);
    return d;
}

function serverToNairaWords(amount) {
    const num = Math.floor(amount);
    if (num === 0) return "ZERO NAIRA ONLY";
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const scales = ["", "Thousand", "Million", "Billion", "Trillion"];
    
    function convertSection(n) {
        let str = "";
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            str += ones[n] + " ";
        }
        return str;
    }
    
    let parts = [];
    let scaleIndex = 0;
    let temp = num;
    
    while (temp > 0) {
        let section = temp % 1000;
        if (section > 0) {
            let sectionStr = convertSection(section).trim();
            if (scaleIndex > 0) {
                sectionStr += " " + scales[scaleIndex];
            }
            parts.unshift(sectionStr);
        }
        temp = Math.floor(temp / 1000);
        scaleIndex++;
    }
    
    return (parts.join(" ").replace(/\s+/g, " ").trim() + " NAIRA ONLY").toUpperCase();
}

function generateReceiptHTML(investment, settings = {}) {
    const receiptNo = `LVP-${investment._id?.toString().slice(-6).toUpperCase() || 'XXXXXX'}`;
    const today = serverFormatDate(new Date());
    const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
    const logoUrl = `${clientUrl}/living-logo.png`;
    const amountInWords = serverToNairaWords(investment.amountToInvest || 0);

    const signeeName = settings.receiptSigneeName || 'AUTHORIZED SIGNATORY';
    const signeePosition = settings.receiptSigneePosition || 'Authorized Signature';
    const signatureImage = settings.receiptSigneeSignature 
        ? `<img src="${settings.receiptSigneeSignature}" alt="Signature" class="signature-img" />`
        : '<div class="signature-line"></div>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt — ${receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #fafafa; color: #333; }
    .page { width: 1000px; min-height: 700px; background: white; margin: 20px auto; position: relative; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border-radius: 12px; }
    .header-banner { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #b0181d; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-section { display: flex; align-items: center; gap: 15px; }
    .brand-logo { height: 65px; width: auto; }
    .brand-info { display: flex; flex-direction: column; }
    .brand-name { font-size: 22px; font-weight: 900; color: #b0181d; letter-spacing: -0.5px; line-height: 1.1; }
    .brand-legal { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-top: 2px; }
    .brand-tagline { font-size: 11px; font-style: italic; color: #666; font-weight: 500; margin-top: 4px; }
    .receipt-title-box { text-align: right; }
    .receipt-header-title { font-size: 26px; font-weight: 900; color: white; background: #b0181d; padding: 12px 35px; border-radius: 6px; letter-spacing: 1px; display: inline-block; }
    .receipt-header-line { height: 3px; background: #d4af37; width: 60px; margin-left: auto; margin-top: 8px; }
    .content-box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: #fff; margin-bottom: 24px; }
    .meta-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 30px; }
    .meta-col { display: flex; flex-direction: column; gap: 14px; }
    .section-lbl { font-size: 11px; font-weight: 800; color: #b0181d; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1.5px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 8px; }
    .info-row { display: flex; font-size: 12px; margin-bottom: 6px; }
    .info-lbl { font-weight: 700; color: #666; width: 80px; }
    .info-val { color: #111; font-weight: 600; flex: 1; }
    .badge-box { background: #fafafa; border: 1.5px dashed #d4af37; border-radius: 10px; padding: 15px; text-align: center; }
    .badge-lbl { font-size: 10px; color: #888; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .badge-val { font-size: 14px; font-weight: 800; color: #b0181d; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1.5px solid #b0181d; }
    .data-table th { background: #b0181d; color: white; padding: 12px 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .data-table td { padding: 22px 20px; font-size: 13px; font-weight: 600; color: #222; }
    .data-table td:last-child { text-align: right; font-size: 18px; font-weight: 900; color: #b0181d; border-left: 1.5px solid #e5e7eb; width: 250px; }
    .words-box { display: flex; align-items: center; gap: 12px; background: #fff8f8; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 18px; margin-bottom: 24px; }
    .words-icon { width: 22px; height: 22px; border-radius: 50%; background: #b0181d; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 900; }
    .words-label { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; }
    .words-value { font-size: 12px; font-weight: 800; color: #b0181d; }
    .bottom-row { display: flex; justify-content: space-between; align-items: flex-end; }
    .thanks-title { font-family: Georgia, serif; font-size: 24px; font-style: italic; font-weight: bold; color: #b0181d; }
    .thanks-sub { font-size: 12px; color: #666; font-weight: 600; }
    .sig-section { text-align: center; width: 220px; }
    .signature-container { height: 60px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px; }
    .signature-img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .signature-line { width: 100%; height: 1.5px; background: #bbb; }
    .sig-label { font-size: 11px; font-weight: 700; color: #111; }
    .sig-title { font-size: 10px; font-weight: 600; color: #777; }
    .footer-bar { background: #b0181d; color: white; padding: 15px 25px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 600; margin-top: 30px; border-bottom: 3.5px solid #d4af37; }
    .footer-col { display: flex; align-items: center; gap: 8px; }
    .tagline-row { text-align: center; font-size: 9px; font-weight: 800; text-transform: uppercase; color: #d4af37; letter-spacing: 4px; margin-top: 15px; }
  </style>
</head>
<body>
<div class="page">
  <div class="header-banner">
    <div class="brand-section">
      <img src="${logoUrl}" alt="LVP Logo" class="brand-logo" onerror="this.style.display='none'" />
      <div class="brand-info">
        <div class="brand-name">LIVING VINE PROPERTIES INVESTMENT LIMITED</div>
        <div class="brand-legal">INVESTMENT LIMITED</div>
        <div class="brand-tagline">Building Wealth. Securing Futures.</div>
      </div>
    </div>
    <div class="receipt-title-box">
      <div class="receipt-header-title">PAYMENT RECEIPT</div>
      <div class="receipt-header-line"></div>
    </div>
  </div>

  <div class="content-box meta-grid">
    <div class="meta-col">
      <div class="section-lbl">Received From:</div>
      <div class="info-row"><span class="info-lbl">Name:</span><span class="info-val">${investment.name || '—'}</span></div>
      <div class="info-row"><span class="info-lbl">Phone:</span><span class="info-val">${investment.phoneNumber || '—'}</span></div>
      <div class="info-row"><span class="info-lbl">Address:</span><span class="info-val">${investment.contactAddress || '—'}</span></div>
    </div>
    
    <div class="meta-col">
      <div class="section-lbl">Payment Summary:</div>
      <div class="info-row"><span class="info-lbl">Total Paid:</span><span class="info-val">${serverFormatCurrency(investment.amountToInvest)}</span></div>
      <div class="info-row"><span class="info-lbl">Method:</span><span class="info-val">Bank Transfer</span></div>
      <div class="info-row"><span class="info-lbl">Tx ID:</span><span class="info-val">${investment._id?.toString().slice(-8).toUpperCase() || '—'}</span></div>
    </div>

    <div class="meta-col" style="gap: 10px;">
      <div class="badge-box">
        <div class="badge-lbl">Receipt No:</div>
        <div class="badge-val">PR: ${investment.startDate ? new Date(investment.startDate).getMonth() + 1 : '01'}/${investment._id?.toString().slice(-3).toUpperCase() || '001'}</div>
      </div>
      <div class="badge-box" style="border-color: #e5e7eb;">
        <div class="badge-lbl">Date Issued:</div>
        <div class="badge-val" style="color: #111; font-size: 12px;">${investment.startDate ? serverFormatDate(investment.startDate) : today}</div>
      </div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="text-align: left;">Description</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Being Payment for ${investment.durationInMonths || '12'} Month Investment Subscription 
          at the rate of ${investment.roiPercent || '26'}% Return on Investment
        </td>
        <td>${serverFormatCurrency(investment.amountToInvest)}</td>
      </tr>
    </tbody>
  </table>

  <div class="words-box">
    <div class="words-icon">₦</div>
    <div class="words-label">Amount in Words:</div>
    <div class="words-value">${amountInWords}</div>
  </div>

  <div class="bottom-row">
    <div class="thanks-section">
      <div class="thanks-title">Thank You!</div>
      <div class="thanks-sub">Thank you for investing with us.</div>
    </div>
    
    <div class="sig-section">
      <div class="signature-container">${signatureImage}</div>
      <div class="sig-label">${signeeName}</div>
      <div class="sig-title">${signeePosition}</div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="footer-col">📞 +234 707 474 4676, 0707 474 4677</div>
    <div class="footer-col">🌐 www.livingvineproperties.com.ng</div>
    <div class="footer-col">✉️ info@livingvineproperties.com.ng</div>
  </div>
  <div class="tagline-row">BUILD WEALTH &bull; SECURE FUTURES &bull; LIVE BETTER</div>
</div>
</body>
</html>`;
}

function generateCertificateHTML(investment, settings = {}) {
    const maturity = serverGetMaturityDate(investment);
    const certNo = `LVP-${investment.startDate ? new Date(investment.startDate).getFullYear() : new Date().getFullYear()}/${investment.durationInMonths || '12'}/${investment._id?.toString().slice(-3).toUpperCase() || '001'}`;
    const today = serverFormatDate(new Date());
    const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
    const logoUrl = `${clientUrl}/living-logo.png`;
    const amountInWords = serverToNairaWords(investment.amountToInvest || 0);

    const sigLeftName = settings.certSigneeLeftName || 'ADMIN MANAGER';
    const sigLeftPos = settings.certSigneeLeftPosition || 'Admin Manager';
    const sigLeftImage = settings.certSigneeLeftSignature 
        ? `<img src="${settings.certSigneeLeftSignature}" alt="Admin Signature" class="sig-img" />`
        : '<div class="sig-placeholder-line"></div>';

    const sigRightName = settings.certSigneeRightName || 'BDM';
    const sigRightPos = settings.certSigneeRightPosition || 'BDM';
    const sigRightImage = settings.certSigneeRightSignature 
        ? `<img src="${settings.certSigneeRightSignature}" alt="BDM Signature" class="sig-img" />`
        : '<div class="sig-placeholder-line"></div>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Certificate — ${certNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Montserrat', sans-serif; background: #fafafa; color: #111; }
    .page { width: 1000px; height: 750px; background: #fdfcf7; margin: 20px auto; position: relative; padding: 45px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; border-radius: 12px; }
    .gold-border-outer { position: absolute; inset: 20px; border: 2.5px solid #d4af37; pointer-events: none; border-radius: 6px; z-index: 10; }
    .gold-border-inner { position: absolute; inset: 26px; border: 1px solid #d4af37; pointer-events: none; border-radius: 4px; opacity: 0.6; z-index: 10; }
    .corner-curve { position: absolute; width: 120px; height: 120px; pointer-events: none; z-index: 5; }
    .curve-tl { top: 0; left: 0; border-top: 25px solid #b0181d; border-left: 25px solid #b0181d; border-top-left-radius: 12px; border-bottom-right-radius: 100%; border-right: 3px solid #d4af37; border-bottom: 3px solid #d4af37; background: #b0181d; }
    .curve-br { bottom: 0; right: 0; border-bottom: 25px solid #b0181d; border-right: 25px solid #b0181d; border-bottom-right-radius: 12px; border-top-left-radius: 100%; border-left: 3px solid #d4af37; border-top: 3px solid #d4af37; background: #b0181d; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; margin-bottom: 12px; padding: 0 30px; position: relative; z-index: 15; }
    .logo-block { display: flex; align-items: center; gap: 14px; }
    .logo-img { height: 50px; width: auto; }
    .brand-title { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 900; color: #b0181d; letter-spacing: 0.5px; line-height: 1.1; }
    .brand-legal { font-size: 14px; font-weight: 800; color: #111; letter-spacing: 0.5px; }
    .brand-tagline { font-size: 9px; font-style: italic; color: #777; margin-top: 2px; font-weight: 500; }
    .certificate-ribbon-seal { text-align: center; position: relative; width: 90px; height: 90px; margin-right: 15px; }
    .ribbon-img { width: 100%; height: 100%; }
    .ribbon-text-container { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 8px; color: white; text-align: center; }
    .ribbon-label { font-size: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #ffd700; }
    .ribbon-val { font-size: 8px; font-weight: 900; margin-top: 1px; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .content-center { text-align: center; position: relative; z-index: 15; padding: 0 40px; }
    .cert-title { font-family: 'Cinzel', serif; font-size: 40px; font-weight: 900; color: #b0181d; letter-spacing: 3px; line-height: 1; }
    .cert-subtitle { font-size: 10px; font-weight: 800; color: #b0181d; letter-spacing: 5px; text-transform: uppercase; margin-top: 8px; }
    .divider-dots { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 10px 0; }
    .divider-dot { width: 4px; height: 4px; background: #d4af37; transform: rotate(45deg); }
    .divider-gold-line { width: 80px; height: 1px; background: #d4af37; }
    .presented-lbl { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 5px; }
    .name-row { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 12px; }
    .name-side-bar { height: 2px; width: 60px; background: #d4af37; }
    .name-circle { width: 5px; height: 5px; background: #d4af37; border-radius: 50%; }
    .investor-name { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 800; color: #111; letter-spacing: 1px; text-transform: uppercase; }
    .investment-declaration { font-size: 11px; color: #444; font-weight: 600; line-height: 1.8; max-width: 750px; margin: 0 auto 18px; }
    .text-red { color: #b0181d; font-weight: 800; }
    .summary-bar { display: flex; align-items: center; justify-content: center; gap: 20px; border: 1.5px solid #d4af37; border-radius: 10px; padding: 12px 30px; max-width: 750px; margin: 0 auto 20px; background: #fdfdfb; }
    .summary-item { display: flex; align-items: center; gap: 10px; font-size: 11px; }
    .summary-text-col { display: flex; flex-direction: column; text-align: left; }
    .summary-label { font-size: 9px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .summary-val { font-weight: 800; color: #111; }
    .summary-divider { width: 1.5px; height: 35px; background: #e5e7eb; }
    .signatures-row { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 20px; align-items: flex-end; padding: 0 40px; margin-top: 15px; position: relative; z-index: 15; }
    .sig-block { text-align: center; }
    .sig-container { height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 6px; }
    .sig-img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .sig-placeholder-line { width: 150px; height: 1.5px; background: #ccc; margin: 0 auto; }
    .sig-name { font-size: 10px; font-weight: 800; color: #111; margin-bottom: 2px; }
    .sig-role { font-size: 9px; font-weight: 700; color: #b0181d; text-transform: uppercase; letter-spacing: 0.5px; }
    .center-logo-stamp { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; margin-bottom: -5px; }
    .stamp-logo { height: 40px; width: auto; }
    .rc-box { background: black; color: white; font-size: 7.5px; font-weight: 900; padding: 2px 8px; border-radius: 4px; }
    .cert-motto { font-size: 9px; font-style: italic; color: #b0181d; font-weight: 700; margin-top: 4px; }
  </style>
</head>
<body>
<div class="page">
  <div class="gold-border-outer"></div>
  <div class="gold-border-inner"></div>
  <div class="corner-curve curve-tl"></div>
  <div class="corner-curve curve-br"></div>
  <div class="header">
    <div class="logo-block">
      <img src="${logoUrl}" alt="LVP Logo" class="logo-img" onerror="this.style.display='none'" />
      <div>
        <div class="brand-title">LIVING VINE PROPERTIES INVESTMENT LIMITED</div>
        <div class="brand-legal">INVESTMENT LIMITED</div>
        <div class="brand-tagline">Building Wealth. Securing Futures.</div>
      </div>
    </div>
    <div class="certificate-ribbon-seal">
      <svg class="ribbon-img" viewBox="0 0 100 100" fill="none">
        <path d="M50 5L75 22V55L50 82L25 55V22L50 5Z" fill="#b0181d" />
        <path d="M50 5L75 22V55L50 82V5Z" fill="#991519" />
        <path d="M50 15L67 27V50L50 70L33 50V27L50 15Z" fill="#d4af37" />
        <path d="M35 70L20 95L50 82L80 95L65 70" fill="#b0181d" opacity="0.8" />
        <path d="M50 70L50 82L80 95L65 70" fill="#991519" opacity="0.8" />
        <circle cx="50" cy="38" r="18" fill="#b0181d" />
      </svg>
      <div class="ribbon-text-container">
        <div class="ribbon-label">CERT NO.</div>
        <div class="ribbon-val">${certNo}</div>
      </div>
    </div>
  </div>
  <div class="content-center">
    <div class="cert-heading-box">
      <div class="cert-title">CERTIFICATE</div>
      <div class="cert-subtitle">of investment</div>
    </div>
    <div class="divider-dots">
      <div class="divider-gold-line"></div>
      <div class="divider-dot"></div>
      <div class="divider-dot" style="width: 6px; height: 6px;"></div>
      <div class="divider-dot"></div>
      <div class="divider-gold-line"></div>
    </div>
    <div class="presented-lbl">This Certificate is Proudly Presented To</div>
    <div class="name-row">
      <div class="name-side-bar"></div>
      <div class="name-circle"></div>
      <div class="investor-name">${investment.name || '—'}</div>
      <div class="name-circle"></div>
      <div class="name-side-bar"></div>
    </div>
    <div class="investment-declaration">
      FOR INVESTING THE SUM OF <span class="text-red">${amountInWords}</span> 
      FOR A PERIOD OF <span class="text-red">${investment.durationInMonths || '12'} MONTHS</span> 
      AT AN INTEREST RATE OF <span class="text-red">${investment.roiPercent || '26'}%</span>
    </div>
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-icon">📅</span>
        <div class="summary-text-col">
          <span class="summary-label">Period</span>
          <span class="summary-val">${serverFormatDate(investment.startDate)} - ${maturity ? serverFormatDate(maturity) : '—'}</span>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-icon">💼</span>
        <div class="summary-text-col">
          <span class="summary-label">From</span>
          <span class="summary-val">LIVING VINE PROPERTIES INVESTMENT LIMITED</span>
        </div>
      </div>
    </div>
  </div>
  <div class="signatures-row">
    <div class="sig-block">
      <div class="sig-container">${sigLeftImage}</div>
      <div class="sig-name">${sigLeftName}</div>
      <div class="sig-role">${sigLeftPos}</div>
    </div>
    <div class="center-logo-stamp">
      <img src="${logoUrl}" alt="Stamp Logo" class="stamp-logo" onerror="this.style.display='none'" />
      <div class="rc-box">RC: 773931</div>
      <div class="cert-motto">....quest for uniqueness in service.......</div>
    </div>
    <div class="sig-block">
      <div class="sig-container">${sigRightImage}</div>
      <div class="sig-name">${sigRightName}</div>
      <div class="sig-role">${sigRightPos}</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function getChromePath() {
    const fs = require('fs');
    const paths = [
        // Linux / cPanel / Ubuntu paths
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/snap/bin/chromium',
        '/usr/bin/google-chrome-unstable',
        // Windows paths
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

async function htmlToPdfBuffer(html, options = {}) {
    const puppeteer = require('puppeteer-core');
    const chromePath = getChromePath();
    if (!chromePath) {
        throw new Error('Chrome or Edge browser executable not found on Windows system. Please install Chrome or Edge.');
    }
    
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'letter',
            printBackground: true,
            landscape: options.landscape || false,
            margin: { top: '0.2in', bottom: '0.2in', left: '0.2in', right: '0.2in' }
        });
        
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

module.exports = { 
    sendEmail, 
    templates, 
    baseTemplate,
    generateReceiptHTML,
    generateCertificateHTML,
    htmlToPdfBuffer
};
