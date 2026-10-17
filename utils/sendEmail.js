const { Resend } = require("resend");

async function sendEmail(to, subject, text ) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: "theintelimerch@gmail.com <noreply@gmail.com>",
        to: to,
        subject: "Password Reset OTP",
        html: text
    });
}

module.exports = { sendEmail }