
require("dotenv").config();

const { sendEmail } = require("./services/email.service");
const { emailTemplate } = require("./templates/emai_temp1")

const emailService = async (to, subject, title, message) => {
    try {
        const data = await sendEmail({
            to,
            subject,
            html: emailTemplate({
                title,
                message,
            }),
        });

        console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
};



module.exports = { emailService }
