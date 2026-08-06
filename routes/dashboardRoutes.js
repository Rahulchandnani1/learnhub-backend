const express = require("express");

const router = express.Router();

const dashboardController = require("../controller/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/stats",
  authMiddleware,
  dashboardController.getDashboardStats
);
router.get(
  "/continue",
  authMiddleware,
  dashboardController.getContinueLearning
);
router.get(
  "/popular",
  authMiddleware,
  dashboardController.getPopularCourses
);
router.get(
  "/search",
  authMiddleware,
  dashboardController.searchCourses
);
router.get(
  "/categories",
  authMiddleware,
  dashboardController.getCategories
);

router.get(
  "/category/:category",
  authMiddleware,
  dashboardController.getCoursesByCategory
);
router.get(
  "/recommended",
  authMiddleware,
  dashboardController.getRecommendedCourses
);
module.exports = router;