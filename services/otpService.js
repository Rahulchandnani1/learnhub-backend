const pool = require("../config/db");

const generateOTP = require("../utils/generateOtp");

const mailService = require("./mailService");

exports.sendOTP = async (email,otp) => {
//   const otp = generateOTP();

  await pool.query(
    `
        DELETE FROM otp_verification
        WHERE email=$1
        `,
    [email]
  );

  await pool.query(
    `
        INSERT INTO otp_verification
        (
            email,
            otp,
            expires_at
        )

        VALUES
        (
            $1,
            $2,
            NOW()+INTERVAL '5 minutes'
        )
        `,
    [email, otp]
  );

  await mailService.sendMail(
    email,
    "Email Verification",
    otp
  );

  return {
    message: "OTP Sent Successfully",
  };
};
exports.verifyOTP = async (
  email,
  otp
) => {
  const result = await pool.query(
    `
        SELECT *
        FROM otp_verification

        WHERE

        email=$1

        AND otp=$2

        AND expires_at > NOW()

        ORDER BY id DESC

        LIMIT 1
        `,
    [email, otp]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid or Expired OTP");
  }

  await pool.query(
    `
        DELETE FROM otp_verification
        WHERE email=$1
        `,
    [email]
  );

  return {
    message: "OTP Verified Successfully",
  };
};