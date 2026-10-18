
require("dotenv").config();

const { sendEmail } = require("./services/email.service");
const { emailTemplate } = require("./templates/emai_temp1")

const testEmail = async () => {
  try {
    const data = await sendEmail({
      to:[
        "odedejikehinde08@gmail.com",
        "dolapo.akanji.tech@gmail.com",
        "kehindeodedeji04@gmail.com"
    ],
      subject: "Welcome to Intelimerch",
      html: emailTemplate({
        title: "Welcome to Intelimerch",
        message: "Your email service is working successfully.",
      }),
    });

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
};

testEmail();
