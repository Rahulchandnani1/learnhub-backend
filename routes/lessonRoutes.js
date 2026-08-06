const express = require("express");

const router = express.Router();

const lessonController = require("../controller/lessonController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  lessonController.createLesson
);

router.get(
  "/course/:courseId",
  authMiddleware,
  lessonController.getLessonsByCourse
);

router.get(
  "/:id",
  authMiddleware,
  lessonController.getLessonById
);

router.put(
  "/:id",
  authMiddleware,
  lessonController.updateLesson
);

router.delete(
  "/:id",
  authMiddleware,
  lessonController.deleteLesson
);

module.exports = router;