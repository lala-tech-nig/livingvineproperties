require('dotenv').config();
const mongoose = require('mongoose');
const WebsiteSetting = require('./models/WebsiteSetting');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const settings = await WebsiteSetting.findOne() || {};
    console.log("receiptSigneeSignature:", settings.receiptSigneeSignature);
    console.log("certSigneeLeftSignature:", settings.certSigneeLeftSignature);
    console.log("certSigneeRightSignature:", settings.certSigneeRightSignature);
    await mongoose.disconnect();
}
test();
