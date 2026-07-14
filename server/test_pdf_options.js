require('dotenv').config();
const mongoose = require('mongoose');
const { generateReceiptHTML, generateCertificateHTML } = require('./services/emailService');
const Investment = require('./models/Investment');
const WebsiteSetting = require('./models/WebsiteSetting');
const puppeteer = require('puppeteer-core');
const fs = require('fs');

function getChromePath() {
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

async function testPdfOptions() {
    await mongoose.connect(process.env.MONGO_URI);
    const investment = await Investment.findOne().sort({ createdAt: -1 });
    const settings = await WebsiteSetting.findOne() || {};
    await mongoose.disconnect();

    const receiptHtml = generateReceiptHTML(investment, settings);
    const chromePath = getChromePath();

    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        console.log("Option 1: waitUntil: 'load'");
        const page1 = await browser.newPage();
        await page1.setContent(receiptHtml, { waitUntil: 'load', timeout: 10000 });
        const pdf1 = await page1.pdf({ format: 'letter' });
        console.log("Option 1 success! Length:", pdf1.length);
        await page1.close();
    } catch (e) {
        console.error("Option 1 failed:", e.message);
    }

    try {
        console.log("Option 2: waitUntil: 'domcontentloaded'");
        const page2 = await browser.newPage();
        await page2.setContent(receiptHtml, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const pdf2 = await page2.pdf({ format: 'letter' });
        console.log("Option 2 success! Length:", pdf2.length);
        await page2.close();
    } catch (e) {
        console.error("Option 2 failed:", e.message);
    }

    await browser.close();
}

testPdfOptions();
