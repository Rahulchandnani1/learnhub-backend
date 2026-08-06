
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");


exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyRegistration(
      email,
      otp
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
console.log("point hit");
    const result = await authService.login(
      email,
      password
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(
      refreshToken
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Logout
// ==========================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.logout(
      refreshToken
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const response = await authService.sendOTP(email);
console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const response = await authService.verifyOTP(email, otp);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const response = await authService.resendOTP(email);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.forgotPassword=async(req,res)=>{

try{

const result=await authService.forgotPassword(

req.body.email

);

res.json(result);

}

catch(error){

res.status(400).json({

message:error.message

});

}

};
exports.verifyResetOTP=async(req,res)=>{

try{

const result=await authService.verifyResetOTP(

req.body.email,req.body.otp

);

res.json(result);

}

catch(error){

res.status(400).json({

message:error.message

});

}

};
exports.resetPassword=async(req,res)=>{

try{

const result=await authService.resetPassword(

req.body.email,req.body.password

);

res.json(result);

}

catch(error){

res.status(400).json({

message:error.message

});

}

};