const express = require("express");
const router = express.Router();

const enrollmentController = require("../controller/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  enrollmentController.enrollCourse
);

router.get(
  "/my-courses",
  authMiddleware,
  enrollmentController.getMyCourses
);

module.exports = router;