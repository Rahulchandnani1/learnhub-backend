const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const adminDashboardController =
  require("../controller/adminDashboardController");

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getStats
);
router.get(
  "/popular-courses",
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getPopularCourses
);
router.get(
  "/monthly-users",
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getMonthlyUsers
);
router.get(
  "/monthly-enrollments",
  authMiddleware,
  adminMiddleware,
  adminDashboardController.getMonthlyEnrollments
);
module.exports = router;