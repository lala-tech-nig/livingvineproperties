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
          ${investment.productName ? `<strong>${investment.productName}</strong> — ` : ''}Being Payment for ${investment.durationInMonths || '12'} Month Investment Subscription 
          at the rate of ${investment.roiPercent || '24'}% Return on Investment
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
    const certNo = `LVP/${investment.startDate ? new Date(investment.startDate).getFullYear() : new Date().getFullYear()}/${investment._id?.toString().slice(-6).toUpperCase() || '000001'}`;
    const issuedDate = serverFormatDate(investment.startDate ? new Date(investment.startDate) : new Date());
    const maturityDate = maturity ? serverFormatDate(maturity) : '—';
    const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
    const logoUrl = `${clientUrl}/living-logo.png`;
    const amountInWords = serverToNairaWords(investment.amountToInvest || 0);
    const planName = investment.productName || `${investment.durationInMonths || 12}-Month Investment Plan`;
    const roiPct = investment.roiPercent || 24;
    const duration = investment.durationInMonths || 12;

    const sigLeftName    = settings.certSigneeLeftName     || 'AUTHORIZED SIGNATORY';
    const sigLeftPos     = settings.certSigneeLeftPosition || 'Admin Manager';
    const sigRightName   = settings.certSigneeRightName    || 'AUTHORIZED SIGNATORY';
    const sigRightPos    = settings.certSigneeRightPosition|| 'Business Development Manager';

    const sigLeftImageHtml = settings.certSigneeLeftSignature
        ? `<img src="${settings.certSigneeLeftSignature}" alt="${sigLeftName} signature" style="max-height:52px;max-width:160px;object-fit:contain;" />`
        : `<div style="width:160px;height:1.5px;background:#b8a060;margin:0 auto;"></div>`;

    const sigRightImageHtml = settings.certSigneeRightSignature
        ? `<img src="${settings.certSigneeRightSignature}" alt="${sigRightName} signature" style="max-height:52px;max-width:160px;object-fit:contain;" />`
        : `<div style="width:160px;height:1.5px;background:#b8a060;margin:0 auto;"></div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Investment Certificate — ${certNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700;800;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; }
    body {
      font-family: 'Montserrat', sans-serif;
      background: #e8e0cc;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 1050px;
      min-height: 780px;
      margin: 0 auto;
      background: #fdfaf2;
      background-image:
        radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 70%, rgba(176,24,29,0.05) 0%, transparent 55%);
      position: relative;
      overflow: hidden;
    }

    .border-layer-1 {
      position: absolute; inset: 0;
      border: 18px solid #7d1419;
      pointer-events: none; z-index: 5;
    }
    .border-layer-2 {
      position: absolute; inset: 18px;
      border: 2.5px solid #c9a84c;
      pointer-events: none; z-index: 5;
    }
    .border-layer-3 {
      position: absolute; inset: 24px;
      border: 0.8px solid #c9a84c;
      pointer-events: none; z-index: 5;
      opacity: 0.5;
    }
    .border-layer-1::before {
      content: '';
      position: absolute; inset: 3px;
      border: 1px solid rgba(201,168,76,0.35);
      pointer-events: none;
    }

    .corner { position: absolute; width: 60px; height: 60px; z-index: 10; pointer-events: none; }
    .corner-tl { top: 6px; left: 6px; }
    .corner-tr { top: 6px; right: 6px; transform: scaleX(-1); }
    .corner-bl { bottom: 6px; left: 6px; transform: scaleY(-1); }
    .corner-br { bottom: 6px; right: 6px; transform: scale(-1,-1); }

    .watermark-seal {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 340px; height: 340px;
      opacity: 0.045; pointer-events: none; z-index: 1;
    }

    .cert-header {
      position: relative; z-index: 15;
      background: linear-gradient(135deg, #5c0e12 0%, #8b1a1f 40%, #7d1419 60%, #5c0e12 100%);
      padding: 22px 45px 18px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 3px solid #c9a84c;
    }
    .cert-header::after {
      content: ''; position: absolute; bottom: -6px; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c 20%, #c9a84c 80%, transparent);
    }

    .header-brand { display: flex; align-items: center; gap: 16px; }
    .header-logo { height: 56px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }
    .header-text { display: flex; flex-direction: column; }
    .header-org-name {
      font-family: 'Cinzel', serif; font-size: 13.5px; font-weight: 900;
      color: #fff; letter-spacing: 1px; line-height: 1.2;
    }
    .header-rc { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 1.5px; margin-top: 2px; text-transform: uppercase; }
    .header-tagline { font-size: 8.5px; font-style: italic; color: #c9a84c; margin-top: 3px; font-family: 'EB Garamond', serif; letter-spacing: 0.5px; }

    .cert-badge { text-align: right; }
    .cert-badge-label { font-size: 7.5px; font-weight: 800; color: rgba(255,255,255,0.55); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 3px; }
    .cert-badge-no { font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700; color: #c9a84c; letter-spacing: 1.5px; background: rgba(0,0,0,0.25); padding: 5px 14px; border: 1px solid rgba(201,168,76,0.4); border-radius: 4px; display: inline-block; }

    .gold-ribbon { position: relative; z-index: 15; height: 6px; background: linear-gradient(90deg, #5c0e12 0%, #c9a84c 20%, #f0d080 50%, #c9a84c 80%, #5c0e12 100%); }

    .cert-body { position: relative; z-index: 15; padding: 30px 60px 22px; text-align: center; }

    .cert-main-title { font-family: 'Cinzel Decorative', serif; font-size: 38px; font-weight: 900; color: #7d1419; letter-spacing: 4px; line-height: 1.1; margin-bottom: 2px; }
    .cert-sub-heading { font-family: 'Cinzel', serif; font-size: 11px; font-weight: 700; color: #c9a84c; letter-spacing: 8px; text-transform: uppercase; margin-bottom: 14px; }

    .ornate-divider { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 10px 0 14px; }
    .od-line { flex: 1; max-width: 100px; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c); }
    .od-line.right { background: linear-gradient(90deg, #c9a84c, transparent); }
    .od-diamond { width: 7px; height: 7px; background: #c9a84c; transform: rotate(45deg); }
    .od-diamond-sm { width: 4px; height: 4px; background: #c9a84c; transform: rotate(45deg); opacity: 0.6; }
    .od-center-ornament { font-size: 18px; color: #c9a84c; line-height: 1; }

    .presented-label { font-family: 'EB Garamond', serif; font-size: 12px; font-style: italic; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }

    .investor-name-row { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 14px; }
    .name-bar { height: 2px; width: 80px; background: linear-gradient(90deg, transparent, #c9a84c); }
    .name-bar.right { background: linear-gradient(90deg, #c9a84c, transparent); }
    .name-gem { width: 8px; height: 8px; background: #c9a84c; transform: rotate(45deg); }
    .investor-name { font-family: 'Cinzel', serif; font-size: 28px; font-weight: 900; color: #1a0a0a; letter-spacing: 2px; text-transform: uppercase; }

    .declaration { font-family: 'EB Garamond', serif; font-size: 14px; color: #3a2a2a; line-height: 1.9; max-width: 760px; margin: 0 auto 18px; letter-spacing: 0.3px; }
    .decl-highlight { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 700; color: #7d1419; }

    .details-table { max-width: 760px; margin: 0 auto 20px; border: 1.5px solid #c9a84c; border-radius: 6px; overflow: hidden; }
    .details-table table { width: 100%; border-collapse: collapse; }
    .details-table th { background: linear-gradient(135deg, #5c0e12, #7d1419); color: #c9a84c; font-family: 'Cinzel', serif; font-size: 7.5px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 8px 16px; text-align: left; }
    .details-table td { padding: 9px 16px; font-size: 11px; font-weight: 600; color: #2a1a1a; border-bottom: 1px solid rgba(201,168,76,0.2); background: rgba(255,255,255,0.7); }
    .details-table td:first-child { font-weight: 700; color: #7d1419; width: 200px; font-size: 9.5px; letter-spacing: 0.8px; text-transform: uppercase; font-family: 'Montserrat', sans-serif; border-right: 1px solid rgba(201,168,76,0.2); }
    .details-table tr:last-child td { border-bottom: none; }
    .details-table tr:nth-child(even) td { background: rgba(253,250,242,0.9); }
    .amount-val { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 900; color: #7d1419; }

    .signatures-section { position: relative; z-index: 15; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 70px 24px; margin-top: 4px; }
    .sig-block { text-align: center; min-width: 200px; }
    .sig-image-zone { height: 58px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 6px; }
    .sig-underline { width: 180px; height: 1.5px; background: linear-gradient(90deg, transparent 5%, #b8a060 30%, #b8a060 70%, transparent 95%); margin: 0 auto 5px; }
    .sig-name { font-family: 'Cinzel', serif; font-size: 9.5px; font-weight: 800; color: #1a0a0a; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
    .sig-role { font-size: 8px; font-weight: 700; color: #7d1419; letter-spacing: 1px; text-transform: uppercase; }
    .sig-center-seal { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding-bottom: 8px; }
    .seal-logo { width: 52px; height: 52px; object-fit: contain; opacity: 0.9; }
    .seal-rc { font-size: 7px; font-weight: 900; background: #1a0a0a; color: #c9a84c; padding: 2px 8px; border-radius: 3px; letter-spacing: 1px; }
    .seal-motto { font-family: 'EB Garamond', serif; font-size: 8px; font-style: italic; color: #888; }

    .cert-footer { position: relative; z-index: 15; background: linear-gradient(135deg, #5c0e12, #7d1419); border-top: 3px solid #c9a84c; padding: 10px 45px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 8px; color: rgba(255,255,255,0.65); font-weight: 600; letter-spacing: 0.5px; }
    .footer-center { font-family: 'Cinzel', serif; font-size: 8px; font-weight: 800; color: #c9a84c; letter-spacing: 3px; text-transform: uppercase; }
    .footer-right { font-size: 8px; color: rgba(255,255,255,0.65); font-weight: 600; letter-spacing: 0.5px; text-align: right; }
  </style>
</head>
<body>
<div class="page">
  <svg class="watermark-seal" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="100,5 120,60 180,60 132,95 152,150 100,118 48,150 68,95 20,60 80,60" fill="#7d1419"/>
    <circle cx="100" cy="100" r="55" fill="none" stroke="#7d1419" stroke-width="3"/>
    <circle cx="100" cy="100" r="48" fill="none" stroke="#7d1419" stroke-width="1"/>
    <text x="100" y="93" text-anchor="middle" font-family="serif" font-size="10" font-weight="bold" fill="#7d1419" letter-spacing="2">LIVING VINE</text>
    <text x="100" y="107" text-anchor="middle" font-family="serif" font-size="8" fill="#7d1419" letter-spacing="1">PROPERTIES</text>
    <text x="100" y="118" text-anchor="middle" font-family="serif" font-size="7" fill="#7d1419">INVESTMENT LTD</text>
  </svg>

  <div class="border-layer-1"></div>
  <div class="border-layer-2"></div>
  <div class="border-layer-3"></div>

  <svg class="corner corner-tl" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>
  <svg class="corner corner-tr" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>
  <svg class="corner corner-bl" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>
  <svg class="corner corner-br" viewBox="0 0 60 60" fill="none">
    <path d="M2 2 L20 2 L2 20 Z" fill="#7d1419" opacity="0.4"/>
    <path d="M2 2 L50 2" stroke="#c9a84c" stroke-width="2"/>
    <path d="M2 2 L2 50" stroke="#c9a84c" stroke-width="2"/>
    <circle cx="8" cy="8" r="3" fill="#c9a84c"/>
  </svg>

  <div class="cert-header">
    <div class="header-brand">
      <img src="${logoUrl}" alt="LVP Logo" class="header-logo" onerror="this.style.display='none'" />
      <div class="header-text">
        <div class="header-org-name">LIVING VINE PROPERTIES INVESTMENT LIMITED</div>
        <div class="header-rc">RC NO: 773931 &nbsp;|&nbsp; CAC REGISTERED</div>
        <div class="header-tagline">Building Wealth. Securing Futures. Transforming Lives.</div>
      </div>
    </div>
    <div class="cert-badge">
      <div class="cert-badge-label">Certificate No.</div>
      <div class="cert-badge-no">${certNo}</div>
    </div>
  </div>

  <div class="gold-ribbon"></div>

  <div class="cert-body">
    <div class="cert-main-title">Certificate</div>
    <div class="cert-sub-heading">of Investment</div>

    <div class="ornate-divider">
      <div class="od-line"></div>
      <div class="od-diamond-sm"></div>
      <div class="od-diamond"></div>
      <div class="od-center-ornament">✦</div>
      <div class="od-diamond"></div>
      <div class="od-diamond-sm"></div>
      <div class="od-line right"></div>
    </div>

    <div class="presented-label">This Certificate is Proudly Presented To</div>

    <div class="investor-name-row">
      <div class="name-bar"></div>
      <div class="name-gem"></div>
      <div class="investor-name">${investment.name || '—'}</div>
      <div class="name-gem"></div>
      <div class="name-bar right"></div>
    </div>

    <div class="declaration">
      In recognition of your trust, commitment, and investment of
      <span class="decl-highlight">${serverFormatCurrency(investment.amountToInvest)}</span>
      (${amountInWords})
      under the <span class="decl-highlight">${planName.toUpperCase()}</span>,
      for a tenure of <span class="decl-highlight">${duration} Months</span>
      at a guaranteed return of <span class="decl-highlight">${roiPct}% per annum</span>.
      This certificate serves as official acknowledgment of your participation in LIVING VINE PROPERTIES INVESTMENT LIMITED.
    </div>

    <div class="details-table">
      <table>
        <thead>
          <tr>
            <th colspan="2">Investment Summary &amp; Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Investor Name</td>
            <td>${investment.name || '—'}</td>
          </tr>
          <tr>
            <td>Investment Plan</td>
            <td>${planName}</td>
          </tr>
          <tr>
            <td>Principal Amount</td>
            <td><span class="amount-val">${serverFormatCurrency(investment.amountToInvest)}</span></td>
          </tr>
          <tr>
            <td>Return on Investment</td>
            <td>${roiPct}% &nbsp;—&nbsp; Expected Return: ${serverFormatCurrency((investment.amountToInvest || 0) * roiPct / 100)}</td>
          </tr>
          <tr>
            <td>Tenure / Duration</td>
            <td>${duration} Months</td>
          </tr>
          <tr>
            <td>Investment Start Date</td>
            <td>${issuedDate}</td>
          </tr>
          <tr>
            <td>Maturity Date</td>
            <td>${maturityDate}</td>
          </tr>
          <tr>
            <td>Certificate Issued On</td>
            <td>${serverFormatDate(new Date())}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <div class="signatures-section">
    <div class="sig-block">
      <div class="sig-image-zone">${sigLeftImageHtml}</div>
      <div class="sig-underline"></div>
      <div class="sig-name">${sigLeftName}</div>
      <div class="sig-role">${sigLeftPos}</div>
    </div>

    <div class="sig-center-seal">
      <img src="${logoUrl}" alt="Company Seal" class="seal-logo" onerror="this.style.display='none'" />
      <div class="seal-rc">RC: 773931</div>
      <div class="seal-motto">....quest for uniqueness in service.......</div>
    </div>

    <div class="sig-block">
      <div class="sig-image-zone">${sigRightImageHtml}</div>
      <div class="sig-underline"></div>
      <div class="sig-name">${sigRightName}</div>
      <div class="sig-role">${sigRightPos}</div>
    </div>
  </div>

  <div class="cert-footer">
    <div class="footer-left">📞 +234 707 474 4676 | 0707 474 4677</div>
    <div class="footer-center">Build Wealth &bull; Secure Futures &bull; Live Better</div>
    <div class="footer-right">✉ info@livingvineproperties.com.ng &nbsp;|&nbsp; 14, Fadare Street, Ogba, Ikeja, Lagos</div>
  </div>
</div>
</body>
</html>`;
}

function getChromePath() {
    const fs = require('fs');
    const paths = [
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
        await page.setContent(html, { waitUntil: 'load', timeout: 15000 });
        
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
