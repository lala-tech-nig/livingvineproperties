require('dotenv').config();
const mongoose = require('mongoose');
const { generateReceiptHTML, generateCertificateHTML, htmlToPdfBuffer } = require('./services/emailService');

async function testRealPdf() {
    console.log("Starting real PDF generation test...");
    const fakeInvestment = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        phoneNumber: "+2348000000000",
        contactAddress: "Lagos, Nigeria",
        amountToInvest: 5000000,
        durationInMonths: 12,
        roiPercent: 24,
        startDate: new Date(),
        expectedROI: 1300000
    };

    const fakeSettings = {
        receiptSigneeName: "Test Signee",
        receiptSigneePosition: "CEO",
        receiptSigneeSignature: "",
        certSigneeLeftName: "Left Name",
        certSigneeLeftPosition: "Left Pos",
        certSigneeLeftSignature: "",
        certSigneeRightName: "Right Name",
        certSigneeRightPosition: "Right Pos",
        certSigneeRightSignature: ""
    };

    try {
        console.log("Generating Receipt HTML...");
        const receiptHtml = generateReceiptHTML(fakeInvestment, fakeSettings);
        console.log("Generating Receipt PDF...");
        const receiptPdf = await htmlToPdfBuffer(receiptHtml, { landscape: false });
        console.log("Receipt PDF generated! Length:", receiptPdf.length);

        console.log("Generating Certificate HTML...");
        const certHtml = generateCertificateHTML(fakeInvestment, fakeSettings);
        console.log("Generating Certificate PDF...");
        const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });
        console.log("Certificate PDF generated! Length:", certPdf.length);
    } catch (err) {
        console.error("Real PDF test failed:", err);
    }
}

testRealPdf();
