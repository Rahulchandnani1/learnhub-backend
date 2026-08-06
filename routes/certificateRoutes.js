const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const certificateController = require("../controller/certificateController");

router.get(
  "/:courseId",
  authMiddleware,
  certificateController.downloadCertificate
);

module.exports = router;