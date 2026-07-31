const User = require('../models/User');
const Investment = require('../models/Investment');
const { sendEmail } = require('./emailService');

const brandColor = '#de1f25';
const brandName = 'LIVING VINE PROPERTIES INVESTMENT LIMITED';
const supportEmail = 'info@livingvinepropertiesinvestment.com';

/**
 * Base template for investor daily update emails
 */
function investorEmailBaseTemplate(title, contentHtml) {
    const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
    const logoUrl = `${clientUrl}/living-logo.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f4f5f7; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#333; }
    .wrapper { max-width:620px; margin:25px auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.06); border:1px solid #e5e7eb; }
    .header { background:${brandColor}; padding:28px 30px; text-align:center; color:#ffffff; }
    .header h1 { margin:10px 0 0; font-size:22px; font-weight:800; letter-spacing:0.5px; }
    .header p { margin:4px 0 0; font-size:12px; opacity:0.9; text-transform:uppercase; letter-spacing:1px; }
    .body { padding:32px 30px; }
    .inv-card { background:#fafafa; border:1px solid #eaeaea; border-radius:12px; padding:20px; margin-bottom:20px; }
    .inv-card h3 { margin:0 0 14px; font-size:16px; color:#111; border-bottom:2px solid ${brandColor}; padding-bottom:8px; display:inline-block; }
    .info-table { width:100%; border-collapse:collapse; font-size:14px; }
    .info-table td { padding:8px 12px; border-bottom:1px solid #f0f0f0; }
    .info-table td:first-child { font-weight:600; color:#555; width:45%; }
    .info-table td:last-child { color:#111; font-weight:700; text-align:right; }
    .support-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px; margin-top:24px; text-align:center; }
    .btn { display:inline-block; background:${brandColor}; color:#ffffff !important; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:8px; margin-top:16px; font-size:14px; }
    .footer { background:#f9fafb; padding:20px 30px; text-align:center; font-size:12px; color:#888; border-top:1px solid #eee; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="${logoUrl}" alt="${brandName}" style="height:48px; width:auto; display:block; margin:0 auto;" onerror="this.style.display='none'" />
      <h1>${brandName}</h1>
      <p>Daily Investment Portfolio Update</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${brandName}. All Rights Reserved.</p>
      <p style="margin-top:4px; font-size:11px;">If you have any questions, reach out to us at <a href="mailto:${supportEmail}" style="color:${brandColor}; font-weight:bold;">${supportEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Calculates days remaining, total duration days, and accrued ROI earned as of today
 */
function calculateInvestmentProgress(inv) {
    const amount = Number(inv.amountToInvest || 0);
    const expected = Number(inv.expectedROI || (amount * 1.24));
    const totalRoiProfit = Math.max(0, expected - amount);

    const startDate = inv.startDate ? new Date(inv.startDate) : new Date(inv.createdAt);
    const durationMonths = Number(inv.durationInMonths || 12);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const today = new Date();

    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const daysElapsed = Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

    let roiEarnedToday = 0;
    if (inv.status === 'active') {
        roiEarnedToday = Math.min(totalRoiProfit, Math.round((daysElapsed / totalDays) * totalRoiProfit));
    }

    return {
        amount,
        expected,
        totalRoiProfit,
        durationMonths,
        startDate,
        endDate,
        totalDays,
        daysElapsed,
        daysRemaining: inv.status === 'active' ? daysRemaining : totalDays,
        roiEarnedToday
    };
}

/**
 * Main worker function: Send daily automated emails to all investors
 */
async function sendDailyInvestorUpdates() {
    console.log('[Daily Investor Update] Starting daily morning email updates to investors...');

    try {
        // Fetch all registered investor users
        const investors = await User.find({
            $or: [
                { role: 'investor' },
                { roles: 'investor' }
            ],
            isActive: true
        });

        console.log(`[Daily Investor Update] Found ${investors.length} active investor account(s).`);

        let sentActiveCount = 0;
        let sentInactiveCount = 0;

        for (const investor of investors) {
            const investorName = `${investor.firstName || ''} ${investor.surname || ''}`.trim() || 'Valued Investor';

            // Find active/approved investments for this user
            const activeInvestments = await Investment.find({
                user: investor._id,
                status: { $in: ['active', 'approved'] }
            });

            if (activeInvestments.length > 0) {
                // ── INVESTOR HAS ACTIVE INVESTMENT(S) ──
                let investmentsHtml = '';

                activeInvestments.forEach((inv, index) => {
                    const prog = calculateInvestmentProgress(inv);
                    investmentsHtml += `
                        <div class="inv-card">
                          <h3>Investment #${index + 1}: ${inv.durationInMonths}-Month Yield Plan</h3>
                          <table class="info-table">
                            <tr>
                              <td>Investment Amount</td>
                              <td><strong style="color:${brandColor}; font-size:16px;">₦${prog.amount.toLocaleString()}.00</strong></td>
                            </tr>
                            <tr>
                              <td>Duration</td>
                              <td>${prog.durationMonths} Months (${prog.totalDays} Days)</td>
                            </tr>
                            <tr>
                              <td>Days Remaining</td>
                              <td><strong style="color:#2563eb;">${prog.daysRemaining} Days</strong></td>
                            </tr>
                            <tr>
                              <td>Accrued ROI Earned Today</td>
                              <td><strong style="color:#16a34a; font-size:15px;">₦${prog.roiEarnedToday.toLocaleString()}.00</strong></td>
                            </tr>
                            <tr>
                              <td>Expected Total Return</td>
                              <td>₦${prog.expected.toLocaleString()}.00</td>
                            </tr>
                            <tr>
                              <td>Status</td>
                              <td style="text-transform:uppercase; font-size:12px;"><span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:12px;">${inv.status}</span></td>
                            </tr>
                          </table>
                        </div>
                    `;
                });

                const contentHtml = `
                    <h2 style="margin-top:0; color:#111; font-size:18px;">Good morning, ${investorName}! 👋</h2>
                    <p style="font-size:14px; line-height:1.6; color:#555;">
                      Here is your daily portfolio update for today. Your investments are actively building wealth with Living Vine Properties Investment Limited.
                    </p>

                    ${investmentsHtml}

                    <div class="support-box">
                      <p style="margin:0 0 6px; font-weight:bold; color:#166534; font-size:14px;">Need Help or Clarification?</p>
                      <p style="margin:0; font-size:13px; color:#15803d;">
                        Our dedicated investor relationship team is always here for you. Contact us anytime at 
                        <a href="mailto:${supportEmail}" style="color:${brandColor}; font-weight:bold;">${supportEmail}</a>
                      </p>
                    </div>

                    <p style="font-size:14px; font-weight:bold; color:#111; margin-top:24px; text-align:center;">
                      Thank you for investing with us! We appreciate your trust and partnership. 🌟
                    </p>
                `;

                const fullHtml = investorEmailBaseTemplate(`Daily Portfolio Update - ${investorName}`, contentHtml);
                await sendEmail(investor.email, `Daily Investment Portfolio Update — ${brandName}`, fullHtml);
                sentActiveCount++;

            } else {
                // ── INVESTOR HAS NO ACTIVE INVESTMENT ──
                const clientUrl = process.env.CLIENT_URL || 'https://livingvinepropertiesinvestment.com';
                const investLink = `${clientUrl}/investor/new-investment`;

                const contentHtml = `
                    <h2 style="margin-top:0; color:#111; font-size:18px;">Good morning, ${investorName}! ❤️</h2>
                    <p style="font-size:14px; line-height:1.6; color:#444;">
                      We love having you as a member of the <strong>Living Vine Properties Investment Limited</strong> family!
                    </p>
                    <p style="font-size:14px; line-height:1.6; color:#444;">
                      We notice you do not currently have an active investment running. We are eagerly waiting to help you start your real estate wealth creation journey!
                    </p>
                    
                    <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:12px; padding:20px; margin:20px 0; text-align:center;">
                      <h3 style="margin:0 0 8px; color:${brandColor}; font-size:16px;">Start Small, Grow Big</h3>
                      <p style="margin:0 0 12px; font-size:13px; color:#9a3412; line-height:1.5;">
                        Did you know you can start your real estate investment with as little as possible? You don't have to wait to own prime property returns.
                      </p>
                      <p style="margin:0; font-size:15px; font-weight:bold; color:#111;">
                        ⏰ <em>Investment waits for nobody — start your investment today!</em>
                      </p>
                      <a href="${investLink}" class="btn" target="_blank">Start Your Investment Today →</a>
                    </div>

                    <div class="support-box">
                      <p style="margin:0 0 6px; font-weight:bold; color:#166534; font-size:14px;">Have Questions or Need Help Getting Started?</p>
                      <p style="margin:0; font-size:13px; color:#15803d;">
                        We're here to guide you through every step. Feel free to contact our team at 
                        <a href="mailto:${supportEmail}" style="color:${brandColor}; font-weight:bold;">${supportEmail}</a>
                      </p>
                    </div>
                `;

                const fullHtml = investorEmailBaseTemplate(`Start Your Investment Today - ${investorName}`, contentHtml);
                await sendEmail(investor.email, `We Love You & Eagerly Await Your Investment Journey! — ${brandName}`, fullHtml);
                sentInactiveCount++;
            }
        }

        console.log(`[Daily Investor Update] Finished sending daily updates: ${sentActiveCount} active investor(s), ${sentInactiveCount} inactive investor(s).`);
        return { success: true, sentActiveCount, sentInactiveCount };

    } catch (error) {
        console.error('[Daily Investor Update Error]', error);
        throw error;
    }
}

module.exports = {
    sendDailyInvestorUpdates,
    calculateInvestmentProgress
};
