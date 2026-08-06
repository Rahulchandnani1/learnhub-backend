const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = async (
  to,
  subject,
  otp
) => {
  const mailOptions = {
    from: process.env.EMAIL,

    to,

    subject,

    html: `
        <div style="font-family:Arial">

            <h2>LearnHub</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>This OTP is valid for 5 minutes.</p>

        </div>
        `,
  };

  return await transporter.sendMail(
    mailOptions
  );
};