require('dotenv').config();
const { htmlToPdfBuffer } = require('./services/emailService');

async function testPdf() {
    console.log("Starting PDF generation test...");
    try {
        const buffer = await htmlToPdfBuffer("<h1>Test PDF Generation</h1><p>Testing living vine properties pdf generation.</p>", { landscape: false });
        console.log("PDF generated successfully! Buffer length:", buffer.length);
    } catch (err) {
        console.error("PDF generation failed with error:", err);
    }
}

testPdf();
