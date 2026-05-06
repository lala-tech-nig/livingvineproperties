const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const templates = {
    birthday: (name) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #d4af37;">Happy Birthday, ${name}!</h1>
            <p>On behalf of <strong>Living Vine Properties</strong>, we wish you a fantastic day filled with joy and celebration.</p>
            <p>Thank you for being part of our journey.</p>
            <br/>
            <p>Best Regards,<br/>Living Vine Team</p>
        </div>
    `,
    anniversary: (name, years) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #2c3e50;">Happy ${years} Year Anniversary!</h1>
            <p>Dear ${name},</p>
            <p>Congratulations on reaching this milestone! You have been with us for ${years} years, and we truly appreciate your trust and loyalty.</p>
            <p>Here's to many more years of success together.</p>
            <br/>
            <p>Best Regards,<br/>Living Vine Properties</p>
        </div>
    `,
    survey: (name) => `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>We Value Your Feedback</h2>
            <p>Hi ${name},</p>
            <p>Could you please take a moment to tell us how we're doing? Your feedback helps us improve our services.</p>
            <a href="#" style="background: #2c3e50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Take Survey</a>
            <br/><br/>
            <p>Thank you!</p>
        </div>
    `
};

module.exports = { sendEmail, templates };
