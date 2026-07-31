const { sendEmail } = require('./emailService');
const User = require('../models/User');
const Investment = require('../models/Investment');
const InvestorLoginLog = require('../models/InvestorLoginLog');
const VisitorLog = require('../models/VisitorLog');

const NOTIFICATION_RECIPIENTS = [
    'livingvineproperties@gmail.com',
    'bukola.ajayi@livingvinepropertiesinvestment.com'
];

const brandColor = '#de1f25';
const brandName = 'LIVING VINE PROPERTIES INVESTMENT LIMITED';

/**
 * Resolves location string from request headers and user document profile
 */
function resolveLocation(req, user) {
    const parts = [];

    if (user?.state) parts.push(`State: ${user.state}`);
    if (user?.address) parts.push(`Address: ${user.address}`);

    const clientCity = req?.headers ? (req.headers['x-client-city'] || req.headers['cf-ipcity']) : null;
    const clientCountry = req?.headers ? (req.headers['x-client-country'] || req.headers['cf-ipcountry']) : null;

    if (clientCity) parts.push(`City: ${clientCity}`);
    if (clientCountry) parts.push(`Country: ${clientCountry}`);

    let ip = 'Unknown';
    if (req?.headers && req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    } else if (req?.socket?.remoteAddress) {
        ip = req.socket.remoteAddress;
    } else if (req?.ip) {
        ip = req.ip;
    }

    if (ip === '::1' || ip === '127.0.0.1') {
        ip = 'Localhost / Dev Environment (::1)';
    }

    if (parts.length === 0) {
        return `IP: ${ip}`;
    }

    return `${parts.join(' | ')} (IP: ${ip})`;
}

/**
 * Shared Base Template for Activity Alert Emails
 */
function activityBaseTemplate(title, badgeText, contentHtml) {
    const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
    const logoUrl = `${clientUrl}/living-logo.png`;
    const timeStr = new Date().toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos',
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f4f5f7; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#333; }
    .wrapper { max-width:620px; margin:25px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.06); border:1px solid #e5e7eb; }
    .header { background:${brandColor}; padding:24px 30px; text-align:center; color:#ffffff; }
    .header h1 { margin:8px 0 0; font-size:20px; font-weight:800; letter-spacing:0.5px; }
    .header p { margin:4px 0 0; font-size:12px; opacity:0.9; text-transform:uppercase; letter-spacing:1px; }
    .body { padding:28px 30px; }
    .badge { display:inline-block; background:#fef2f2; color:${brandColor}; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px; border:1px solid #fecaca; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; }
    .info-table { width:100%; border-collapse:collapse; margin:16px 0; font-size:14px; }
    .info-table td { padding:10px 14px; border-bottom:1px solid #f3f4f6; }
    .info-table td:first-child { font-weight:700; color:#555; width:35%; background:#fafafa; border-radius:4px 0 0 4px; }
    .info-table td:last-child { color:#111; font-weight:600; word-break:break-word; }
    .footer { background:#f9fafb; padding:18px 30px; text-align:center; font-size:12px; color:#888; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${logoUrl}" alt="${brandName}" style="height:45px; width:auto; display:block; margin:0 auto;" onerror="this.style.display='none'" />
      <h1>Platform Activity Alert</h1>
      <p>${brandName}</p>
    </div>
    <div class="body">
      <div class="badge">${badgeText}</div>
      <h2 style="font-size:18px; margin-top:0; color:#111;">${title}</h2>
      ${contentHtml}
      <p style="font-size:12px; color:#777; margin-top:20px; text-align:right;">Triggered at: <strong>${timeStr}</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${brandName}. Automated Activity Logger.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Dispatch activity email safely in background
 */
async function dispatchActivityEmail(subject, badgeText, contentHtml) {
    try {
        const fullHtml = activityBaseTemplate(subject, badgeText, contentHtml);
        await sendEmail(NOTIFICATION_RECIPIENTS, subject, fullHtml);
        console.log(`[Activity Logger] Sent alert: "${subject}" to ${NOTIFICATION_RECIPIENTS.join(', ')}`);
    } catch (err) {
        console.error(`[Activity Logger Error] Failed to send email alert: ${err.message}`);
    }
}

// ── 1. Investor Login Alert ──────────────────────────────────────────────────
async function notifyInvestorLogin(req, user) {
    const userAgent = req?.headers ? (req.headers['user-agent'] || 'Unknown Browser') : 'Unknown';
    const location = resolveLocation(req, user);

    const subject = `[Activity Alert] Investor Login: ${user.firstName} ${user.surname}`;
    const badge = `1. Investor Login`;
    const content = `
        <p>An investor has logged in to the platform portal.</p>
        <table class="info-table">
          <tr><td>Investor Name</td><td><strong>${user.firstName} ${user.surname}</strong></td></tr>
          <tr><td>Investor Email</td><td>${user.email}</td></tr>
          <tr><td>Phone Number</td><td>${user.phoneNumber || 'N/A'}</td></tr>
          <tr><td>Location Details</td><td><strong>${location}</strong></td></tr>
          <tr><td>Browser / Device</td><td>${userAgent}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 2. Staff Login Alert ─────────────────────────────────────────────────────
async function notifyStaffLogin(req, user) {
    const userAgent = req?.headers ? (req.headers['user-agent'] || 'Unknown Browser') : 'Unknown';
    const location = resolveLocation(req, user);

    const subject = `[Activity Alert] Staff Login: ${user.firstName} ${user.surname}`;
    const badge = `2. Staff Login`;
    const content = `
        <p>A staff member has logged in to the staff CRM portal.</p>
        <table class="info-table">
          <tr><td>Staff Name</td><td><strong>${user.firstName} ${user.surname}</strong></td></tr>
          <tr><td>Staff Email</td><td>${user.email}</td></tr>
          <tr><td>Role</td><td><span style="text-transform:uppercase;">${user.role}</span></td></tr>
          <tr><td>Phone Number</td><td>${user.phoneNumber || 'N/A'}</td></tr>
          <tr><td>Location Details</td><td><strong>${location}</strong></td></tr>
          <tr><td>Browser / Device</td><td>${userAgent}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 3. Manager Login Alert ───────────────────────────────────────────────────
async function notifyManagerLogin(req, user) {
    const userAgent = req?.headers ? (req.headers['user-agent'] || 'Unknown Browser') : 'Unknown';
    const location = resolveLocation(req, user);

    const subject = `[Activity Alert] Manager Login: ${user.firstName} ${user.surname}`;
    const badge = `3. Manager Login`;
    const content = `
        <p>A manager/executive has logged in to the administrative portal.</p>
        <table class="info-table">
          <tr><td>Manager Name</td><td><strong>${user.firstName} ${user.surname}</strong></td></tr>
          <tr><td>Manager Email</td><td>${user.email}</td></tr>
          <tr><td>Role</td><td><span style="text-transform:uppercase;">${user.role}</span></td></tr>
          <tr><td>Phone Number</td><td>${user.phoneNumber || 'N/A'}</td></tr>
          <tr><td>Location Details</td><td><strong>${location}</strong></td></tr>
          <tr><td>Browser / Device</td><td>${userAgent}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 4. New Investment Initiation Alert ──────────────────────────────────────
async function notifyNewInvestmentInitiation(investment, user) {
    const subject = `[Activity Alert] New Investment Initiated: ₦${Number(investment.amountToInvest || 0).toLocaleString()} by ${investment.name}`;
    const badge = `4. New Investment Initiated`;
    const content = `
        <p>A new investment subscription application has been initiated on the platform.</p>
        <table class="info-table">
          <tr><td>Investor Name</td><td><strong>${investment.name}</strong></td></tr>
          <tr><td>Email Address</td><td>${investment.email}</td></tr>
          <tr><td>Phone Number</td><td>${investment.phoneNumber || 'N/A'}</td></tr>
          <tr><td>Amount to Invest</td><td><strong style="color:${brandColor}; font-size:16px;">₦${Number(investment.amountToInvest || 0).toLocaleString()}</strong></td></tr>
          <tr><td>Duration</td><td>${investment.durationInMonths} Months</td></tr>
          <tr><td>Expected ROI</td><td>₦${Number(investment.expectedROI || 0).toLocaleString()}</td></tr>
          <tr><td>Investment ID</td><td><code>${investment._id}</code></td></tr>
          <tr><td>Next of Kin</td><td>${investment.nextOfKin?.name ? `${investment.nextOfKin.name} (${investment.nextOfKin.relationship || 'N/A'})` : 'N/A'}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 5. Investment Approval Alert ────────────────────────────────────────────
async function notifyInvestmentApproval(investment, approvedBy, status) {
    const isApproved = status === 'approved';
    const actionLabel = isApproved ? 'Approved' : 'Activated';
    const subject = `[Activity Alert] Investment ${actionLabel}: ${investment.name}`;
    const badge = `5. Investment Approval`;
    const content = `
        <p>An investment application status has been updated to <strong>${status.toUpperCase()}</strong>.</p>
        <table class="info-table">
          <tr><td>Investor Name</td><td><strong>${investment.name}</strong></td></tr>
          <tr><td>Investment Amount</td><td><strong>₦${Number(investment.amountToInvest || 0).toLocaleString()}</strong></td></tr>
          <tr><td>Duration</td><td>${investment.durationInMonths} Months</td></tr>
          <tr><td>New Status</td><td><span style="color:#16a34a; font-weight:800; text-transform:uppercase;">${status}</span></td></tr>
          <tr><td>Action Taken By</td><td><strong>${approvedBy ? `${approvedBy.firstName} ${approvedBy.surname} (${approvedBy.role})` : 'System Administrator'}</strong></td></tr>
          <tr><td>Investment ID</td><td><code>${investment._id}</code></td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 6. Password Change / Recovery Alert ─────────────────────────────────────
async function notifyPasswordActivity(req, user, actionType) {
    const location = resolveLocation(req, user);

    const subject = `[Activity Alert] ${actionType}: ${user.firstName} ${user.surname}`;
    const badge = `6. Password Security`;
    const content = `
        <p>A password security event was recorded for an account.</p>
        <table class="info-table">
          <tr><td>User Name</td><td><strong>${user.firstName} ${user.surname}</strong></td></tr>
          <tr><td>Email Address</td><td>${user.email}</td></tr>
          <tr><td>User Role</td><td><span style="text-transform:uppercase;">${user.role}</span></td></tr>
          <tr><td>Security Event</td><td><strong style="color:${brandColor};">${actionType}</strong></td></tr>
          <tr><td>Location Details</td><td>${location}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 7. Payment Receipt Upload Alert ─────────────────────────────────────────
async function notifyReceiptUpload(investment, user) {
    const subject = `[Activity Alert] Payment Receipt Uploaded: ${investment.name}`;
    const badge = `7. Receipt Uploaded`;
    const content = `
        <p>An investor has uploaded a proof of payment receipt for their investment.</p>
        <table class="info-table">
          <tr><td>Investor Name</td><td><strong>${investment.name}</strong></td></tr>
          <tr><td>Email Address</td><td>${investment.email}</td></tr>
          <tr><td>Amount to Invest</td><td><strong>₦${Number(investment.amountToInvest || 0).toLocaleString()}</strong></td></tr>
          <tr><td>Investment ID</td><td><code>${investment._id}</code></td></tr>
          <tr><td>Receipt Document</td><td><a href="${investment.paymentReceipt}" target="_blank" style="color:${brandColor}; font-weight:700;">View Uploaded Receipt →</a></td></tr>
          <tr><td>Uploaded At</td><td>${new Date().toLocaleString('en-NG')}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 8. Liquidation Request Alert ────────────────────────────────────────────
async function notifyLiquidationRequest(investment, actionBy) {
    const subject = `[Activity Alert] Investment Liquidation: ${investment.name}`;
    const badge = `8. Liquidation Request`;
    const content = `
        <p>An investment has been requested or marked for <strong>LIQUIDATION</strong>.</p>
        <table class="info-table">
          <tr><td>Investor Name</td><td><strong>${investment.name}</strong></td></tr>
          <tr><td>Email Address</td><td>${investment.email}</td></tr>
          <tr><td>Investment Amount</td><td><strong>₦${Number(investment.amountToInvest || 0).toLocaleString()}</strong></td></tr>
          <tr><td>Expected ROI</td><td>₦${Number(investment.expectedROI || 0).toLocaleString()}</td></tr>
          <tr><td>Duration</td><td>${investment.durationInMonths} Months</td></tr>
          <tr><td>Processed / Initiated By</td><td><strong>${actionBy ? `${actionBy.firstName} ${actionBy.surname} (${actionBy.role})` : investment.name}</strong></td></tr>
          <tr><td>Investment ID</td><td><code>${investment._id}</code></td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 9. Website Editor Changes Alert ─────────────────────────────────────────
async function notifyWebsiteEditorChanges(req, user, section, action, details) {
    const subject = `[Activity Alert] Website Editor Change: ${section} (${action})`;
    const badge = `9. Website Content Modified`;
    const detailsFormatted = typeof details === 'object' ? `<pre style="background:#f4f4f4; padding:10px; border-radius:6px; font-size:12px;">${JSON.stringify(details, null, 2)}</pre>` : details;

    const content = `
        <p>A website administrator has made changes to the public website content.</p>
        <table class="info-table">
          <tr><td>Editor Name</td><td><strong>${user.firstName} ${user.surname}</strong></td></tr>
          <tr><td>Editor Email</td><td>${user.email}</td></tr>
          <tr><td>Editor Role</td><td><span style="text-transform:uppercase;">${user.role}</span></td></tr>
          <tr><td>Section Modified</td><td><strong>${section}</strong></td></tr>
          <tr><td>Action Type</td><td><span style="color:${brandColor}; font-weight:700;">${action}</span></td></tr>
          <tr><td>Details / Content</td><td>${detailsFormatted}</td></tr>
        </table>
    `;
    return dispatchActivityEmail(subject, badge, content);
}

// ── 10. Daily Activities Report Email ───────────────────────────────────────
async function sendDailyActivitiesReport() {
    console.log('[Daily Activity Report] Generating daily platform activities report...');
    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Daily email counts of new registered investors
        const newInvestorsCount = await User.countDocuments({
            $or: [{ role: 'investor' }, { roles: 'investor' }],
            createdAt: { $gte: last24h }
        });

        // 2. Daily email counts of daily logins of investors
        const investorLoginsCount = await InvestorLoginLog.countDocuments({
            createdAt: { $gte: last24h }
        });

        // 3. Daily email counts of total investment initiated
        const investmentsInitiated = await Investment.find({
            createdAt: { $gte: last24h }
        });
        const totalInitiatedCount = investmentsInitiated.length;
        const totalInitiatedAmount = investmentsInitiated.reduce((sum, inv) => sum + Number(inv.amountToInvest || 0), 0);

        // 4. Daily email counts of approved investment
        const approvedCount = await Investment.countDocuments({
            $or: [
                { approvedAt: { $gte: last24h } },
                { status: { $in: ['approved', 'active'] }, updatedAt: { $gte: last24h } }
            ]
        });

        // 5. Daily email counts of liquidated investment
        const liquidatedCount = await Investment.countDocuments({
            $or: [
                { liquidatedAt: { $gte: last24h } },
                { status: 'liquidated', updatedAt: { $gte: last24h } }
            ]
        });

        // 6. Daily email counts of website visitors and location
        const visitorCount = await VisitorLog.countDocuments({
            createdAt: { $gte: last24h }
        });

        const locationAggregation = await VisitorLog.aggregate([
            { $match: { createdAt: { $gte: last24h } } },
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        let locationRowsHtml = '';
        if (locationAggregation.length > 0) {
            locationAggregation.forEach(loc => {
                locationRowsHtml += `
                    <tr>
                      <td style="padding:8px 12px; border-bottom:1px solid #eee;">${loc._id || 'Unknown Location'}</td>
                      <td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right; font-weight:bold; color:${brandColor};">${loc.count}</td>
                    </tr>
                `;
            });
        } else {
            locationRowsHtml = `<tr><td colspan="2" style="padding:12px; text-align:center; color:#888;">No website visits recorded in the last 24 hours.</td></tr>`;
        }

        const subject = `[Daily Activity Report] Summary of Platform Activities (${new Date().toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })})`;
        const badge = `10. Daily Activities Report`;

        const content = `
            <p style="font-size:14px; color:#444; margin-bottom:20px;">
                Here is the automated 24-hour daily summary of platform activities across investor registrations, logins, investments, liquidations, and website visitors:
            </p>

            <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
              <tr style="background:#fef2f2;">
                <td style="padding:12px; font-weight:bold; color:#555; border-bottom:1px solid #fee2e2;">Metrics Category</td>
                <td style="padding:12px; font-weight:bold; color:#111; border-bottom:1px solid #fee2e2; text-align:right;">Past 24H Count</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">👤 New Registered Investors</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:15px; color:#111;">${newInvestorsCount}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">🔑 Daily Investor Logins</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:15px; color:#111;">${investorLoginsCount}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">📝 Total Investments Initiated</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:15px; color:#111;">${totalInitiatedCount} <span style="font-size:12px; color:#666; font-weight:normal;">(₦${totalInitiatedAmount.toLocaleString()})</span></td>
              </tr>
              <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">✅ Approved Investments</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:15px; color:#16a34a;">${approvedCount}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">💸 Liquidated Investments</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:15px; color:#9333ea;">${liquidatedCount}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6;">🌐 Total Website Visitors</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; font-size:16px; color:${brandColor};">${visitorCount}</td>
              </tr>
            </table>

            <h3 style="font-size:15px; margin:24px 0 10px; color:#111; border-bottom:2px solid ${brandColor}; padding-bottom:6px; display:inline-block;">
              🌐 Website Visitors Breakdown by Location
            </h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:8px;">
              <thead>
                <tr style="background:#f9fafb; color:#666;">
                  <th style="padding:8px 12px; text-align:left; border-bottom:1px solid #ddd;">Location / City / Country / IP</th>
                  <th style="padding:8px 12px; text-align:right; border-bottom:1px solid #ddd;">Visits</th>
                </tr>
              </thead>
              <tbody>
                ${locationRowsHtml}
              </tbody>
            </table>
        `;

        await dispatchActivityEmail(subject, badge, content);
        console.log('[Daily Activity Report] Daily activities report sent successfully to NOTIFICATION_RECIPIENTS.');
        return {
            success: true,
            newInvestorsCount,
            investorLoginsCount,
            totalInitiatedCount,
            approvedCount,
            liquidatedCount,
            visitorCount
        };

    } catch (error) {
        console.error('[Daily Activity Report Error]', error);
        throw error;
    }
}

module.exports = {
    NOTIFICATION_RECIPIENTS,
    resolveLocation,
    notifyInvestorLogin,
    notifyStaffLogin,
    notifyManagerLogin,
    notifyNewInvestmentInitiation,
    notifyInvestmentApproval,
    notifyPasswordActivity,
    notifyReceiptUpload,
    notifyLiquidationRequest,
    notifyWebsiteEditorChanges,
    sendDailyActivitiesReport
};
