// module.paths.push('c:/Users/olani/Desktop/livingvineproperties/server/node_modules');
// const nodemailer = require('nodemailer');

// const hosts = ['mail.livingvinepropertiesinvestment.com'];
// const users = ['invest@livingvinepropertiesinvestment.com'];
// const passwords = [
//     'Livingvine2026.'
// ];
// const ports = [
//     { port: 465, secure: true }
// ];

// async function run() {
//     console.log("Starting SMTP search on .com.");
//     for (const host of hosts) {
//         for (const user of users) {
//             for (const pass of passwords) {
//                 for (const p of ports) {
//                     const transporter = nodemailer.createTransport({
//                         host: host,
//                         port: p.port,
//                         secure: p.secure,
//                         auth: { user, pass },
//                         tls: { rejectUnauthorized: false },
//                         connectionTimeout: 2000,
//                         greetingTimeout: 2000
//                     });
                    
//                     try {
//                         await transporter.verify();
//                         console.log(`\n🎉 SUCCESSFUL SMTP AUTHENTICATION!`);
//                         console.log(`Host: ${host}`);
//                         console.log(`Port: ${p.port}`);
//                         console.log(`User: ${user}`);
//                         console.log(`Pass: ${pass}`);
//                         return;
//                     } catch (err) {
//                         // ignore expected auth/timeout failures
//                     }
//                 }
//             }
//         }
//     }
//     console.log("\nAll combinations tried. No successful authentication found.");
// }

// run();




const nodemailer = require("nodemailer");

async function test() {
    const transporter = nodemailer.createTransport({
        host: "mail.livingvinepropertiesinvestment.com",
        port: 465,
        secure: true,
        auth: {
            user: "invest@livingvinepropertiesinvestment.com",
            pass: "Livingvine2026."
        },
        logger: true,
        debug: true
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP Connected");

        const info = await transporter.sendMail({
            from: "invest@livingvinepropertiesinvestment.com",
            to: "invest@livingvinepropertiesinvestment.com",
            subject: "SMTP Test",
            text: "SMTP is working!"
        });

        console.log(info);
    } catch (err) {
        console.error(err);
    }
}

test();