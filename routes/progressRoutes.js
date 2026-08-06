const express = require("express");

const router = express.Router();

const progressController = require("../controller/progressController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/:lessonId",
  authMiddleware,
  progressController.markCompleted
);

router.get(
  "/check/:lessonId",
  authMiddleware,
  progressController.checkCompleted
);

router.get(
  "/course/:courseId",
  authMiddleware,
  progressController.getCourseProgress
);

module.exports = router;