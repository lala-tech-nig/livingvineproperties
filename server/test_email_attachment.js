require('dotenv').config();
const { htmlToPdfBuffer, sendEmail } = require('./services/emailService');

async function testSendAttachment() {
    console.log("Starting email attachment test...");
    try {
        const receiptHtml = "<h1>Receipt</h1><p>This is a test receipt.</p>";
        const certHtml = "<h1>Certificate</h1><p>This is a test certificate.</p>";

        console.log("Generating PDFs...");
        const receiptPdf = await htmlToPdfBuffer(receiptHtml, { landscape: false });
        const certPdf = await htmlToPdfBuffer(certHtml, { landscape: true });

        console.log("Sending email to invest@livingvinepropertiesinvestment.com...");
        const info = await sendEmail(
            "invest@livingvinepropertiesinvestment.com",
            "SMTP Attachment Test",
            "<p>Please see attachments.</p>",
            [
                { filename: 'LVP-Receipt.pdf', content: receiptPdf },
                { filename: 'LVP-Certificate.pdf', content: certPdf }
            ]
        );

        console.log("Email sent successfully!", info);
    } catch (err) {
        console.error("Email attachment test failed with error:", err);
    }
}

testSendAttachment();
