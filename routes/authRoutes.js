const express=require("express");

const router=express.Router();


const authController =require("../controller/authController");

router.post("/register",authController.register);
router.post("/login",authController.login);
router.post(
  "/refresh-token",
  authController.refreshToken
);

// Logout
router.post(
  "/logout",
  authController.logout
);
router.post(
  "/verify-registration",
  authController.verifyRegistration
);

router.post("/send-otp", authController.sendOTP);

router.post("/verify-otp", authController.verifyOTP);

router.post("/resend-otp", authController.resendOTP);
router.post(
"/forgot-password",
authController.forgotPassword
);

router.post(
"/verify-reset-otp",
authController.verifyResetOTP
);

router.post(
"/reset-password",
authController.resetPassword
);

module.exports=router;