const emailTemplate = ({ title, message }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 30px auto; padding: 32px 24px; background-color: #ffffff; border-radius: 8px;">

        <div style="text-align: center; margin-bottom: 28px;">
          <img
            src="https://intelimerch-app.netlify.app/logo.png"
            alt="Intelimerch Logo"
            width="140"
            style="display: block; width: 140px; max-width: 100%; height: auto; margin: 0 auto;"
          />
        </div>

        <h2 style="color: #1f2937; font-size: 22px; text-align:center; margin-bottom: 16px;">
          ${title}
        </h2>

        <div style="color: #4b5563; font-size: 15px; line-height: 1.7;">
          ${message}
        </div>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0 20px;" />

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} Intelimerch. All rights reserved.
        </p>

      </div>
    </body>
  </html>
`;

module.exports = { emailTemplate };