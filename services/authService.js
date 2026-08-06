const otpService = require("./otpService");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailService=require("../services/mailService");
const generateOTP=require("../utils/generateOtp");
exports.register = async (data) => {
  const { name, email, password } = data;

  // Check existing user
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email=$1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already registered");
  }

  // Remove previous pending registration
  await pool.query(
    "DELETE FROM pending_users WHERE email=$1",
    [email]
  );

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Save pending registration
  await pool.query(
    `
    INSERT INTO pending_users
    (
        name,
        email,
        password,
        otp,
        expires_at
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        NOW()+INTERVAL '5 minutes'
    )
    `,
    [
      name,
      email,
      hashedPassword,
      otp,
    ]
  );

  // Send OTP email
  await mailService.sendMail(
    email,
    "Email Verification",
    otp
  );

  return {
    message: "OTP Sent Successfully",
  };
};
exports.verifyRegistration = async (
  email,
  otp
) => {

  const pending = await pool.query(
    `
    SELECT *

    FROM pending_users

    WHERE

    email=$1

    AND otp=$2

    AND expires_at > NOW()

    LIMIT 1
    `,
    [email, otp]
  );

  if (pending.rows.length === 0) {
    throw new Error("Invalid OTP");
  }

  const user = pending.rows[0];

  const createdUser = await pool.query(
    `
    INSERT INTO users
    (
        name,
        email,
        password,
        role
    )

    VALUES

    (
        $1,
        $2,
        $3,
        'User'
    )

    RETURNING
    id,
    name,
    email,
    role
    `,
    [
      user.name,
      user.email,
      user.password,
    ]
  );

  await pool.query(
    `
    DELETE FROM pending_users

    WHERE email=$1
    `,
    [email]
  );

  const token = jwt.sign(
    {
      id: createdUser.rows[0].id,
      email: createdUser.rows[0].email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return {

    message: "Registration Successful",

    token,

    user: createdUser.rows[0],

  };

};
exports.forgotPassword = async (email) => {

    const user = await pool.query(
        "SELECT id FROM users WHERE email=$1",
        [email]
    );

    if(user.rows.length===0){

        throw new Error("User not found");

    }

    const otp=generateOTP();

    await pool.query(

        "DELETE FROM otp_verification WHERE email=$1",

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

        [email,otp]

    );

    await mailService.sendMail(

        email,

        "Reset Password OTP",

        otp

    );

    return{

        success:true,

        message:"OTP Sent"

    };

};
exports.verifyResetOTP = async (
email,
otp
)=>{

const result=await pool.query(

`
SELECT *

FROM otp_verification

WHERE

email=$1

AND otp=$2

AND expires_at>NOW()

LIMIT 1
`,

[email,otp]

);

if(result.rows.length===0){

throw new Error("Invalid OTP");

}

return{

success:true,

message:"OTP Verified"

};

};exports.resetPassword = async (
email,
password
)=>{

const hashedPassword=await bcrypt.hash(
password,
10
);

await pool.query(

`
UPDATE users

SET password=$1

WHERE email=$2
`,

[
hashedPassword,
email
]

);

await pool.query(

"DELETE FROM otp_verification WHERE email=$1",

[email]

);

return{

success:true,

message:"Password Updated"

};

};
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

// ===============================
// Generate Refresh Token
// ===============================
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

exports.login = async (
  email,
  password
) => {
  console.log("service");
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
console.log(result)
  if (result.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }

  const user = result.rows[0];
  console.log("Password from DB:", user.password);
console.log("Type:", typeof user.password);
  const isMatch = await bcrypt.compare(
    password,
    user.password
  );
console.log("Password Match:", isMatch);
  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }

  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  await pool.query(
    `
    INSERT INTO refresh_tokens
    (
        user_id,
        token,
        expires_at
    )
    VALUES
    (
        $1,
        $2,
        NOW()+INTERVAL '7 days'
    )
    `,
    [
      user.id,
      refreshToken,
    ]
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
exports.refreshToken = async (
  refreshToken
) => {
  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_SECRET
  );

  const tokenExists = await pool.query(
    `
    SELECT *
    FROM refresh_tokens
    WHERE token=$1
    `,
    [refreshToken]
  );

  if (tokenExists.rows.length === 0) {
    throw new Error("Invalid Refresh Token");
  }

  const user = await pool.query(
    `
    SELECT id,name,email,role
    FROM users
    WHERE id=$1
    `,
    [decoded.id]
  );

  if (user.rows.length === 0) {
    throw new Error("User not found");
  }

  const accessToken =
    generateAccessToken(user.rows[0]);

  return {
    accessToken,
  };
};

// ===============================
// Logout
// ===============================
exports.logout = async (
  refreshToken
) => {
  await pool.query(
    `
    DELETE FROM refresh_tokens
    WHERE token=$1
    `,
    [refreshToken]
  );

  return {
    success: true,
    message: "Logout Successful",
  };
};
exports.sendOTP = async (email) => {
  return await otpService.sendOTP(email);
};

exports.verifyOTP = async (email, otp) => {
  return await otpService.verifyOTP(email, otp);
};

exports.resendOTP = async (email) => {
  return await otpService.sendOTP(email);
};