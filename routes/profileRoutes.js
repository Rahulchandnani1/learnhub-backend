const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const profileController =
require("../controller/profileController");

router.get(
  "/",
  authMiddleware,
  profileController.getProfile
);

router.put(
  "/",
  authMiddleware,
  profileController.updateProfile
);

// router.put(
//   "/password",
//   authMiddleware,
//   profileController.changePassword
// );

module.exports = router;