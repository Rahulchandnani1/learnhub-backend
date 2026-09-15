
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMail = async (to, subject, otp) => {
  const { data, error } = await resend.emails.send({
    from: "LearnHub <onboarding@learnhublearning.in>",
    to: [to],
    subject,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>LearnHub</h2>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send OTP email");
  }

  return data;
};

