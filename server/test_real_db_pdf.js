require('dotenv').config();
const mongoose = require('mongoose');
const { generateReceiptHTML, generateCertificateHTML, htmlToPdfBuffer } = require('./services/emailService');
const Investment = require('./models/Investment');
const WebsiteSetting = require('./models/WebsiteSetting');

async function testRealDbPdf() {
    console.log("Connecting to MongoDB...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully!");

        console.log("Fetching latest investment...");
        const investment = await Investment.findOne().sort({ createdAt: -1 });
        if (!investment) {
            console.log("No investments found in database.");
            await mongoose.disconnect();
            return;
        }
        console.log("Found investment:", investment._id);

        console.log("Fetching website settings...");
        const settings = await WebsiteSetting.findOne() || {};
        console.log("Found settings:", settings._id || "none");

        console.log("Generating Receipt HTML...");
        const receiptHtml = generateReceiptHTML(investment, settings);
        console.log("Generating Receipt PDF...");
        const receiptPdf = await htmlToPdfBuffer(receiptHtml, { landscape: false });
        console.log("Receipt PDF generated! Length:", receiptPdf.length);

        console.log("Generating Certificate HTML...");
        const certHtml = generateCertificateHTML(investment, settings);
        console.log("Generating Certificate PDF...");
        const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });
        console.log("Certificate PDF generated! Length:", certPdf.length);

    } catch (err) {
        console.error("Real DB PDF test failed with error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testRealDbPdf();
