const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const reviewController = require("../controller/reviewController");

router.post(
  "/",
  authMiddleware,
  reviewController.addReview
);
router.get(
  "/course/:courseId",
  reviewController.getCourseReviews
);
module.exports = router;