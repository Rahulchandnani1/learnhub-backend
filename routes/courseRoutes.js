const express = require("express");

const router = express.Router();

const courseController = require("../controller/courseController");

const authMiddleware = require("../middleware/authMiddleware");

// Create Course
router.post(
  "/",
  authMiddleware,
  courseController.createCourse
);

// Get All Courses
router.get(
  "/",
  courseController.getCourses
);

// Get Course By Id
router.get(
  "/:id",
  authMiddleware,
  courseController.getCourseById
);

// Update Course
router.put(
  "/:id",
  authMiddleware,
  courseController.updateCourse
);

// Delete Course
router.delete(
  "/:id",
  authMiddleware,
  courseController.deleteCourse
);

// Publish Course
// router.patch("/:id/publish", authMiddleware, courseController.publishCourse);

module.exports = router;
