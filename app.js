const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes =require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const progressRoutes = require("./routes/progressRoutes");
const quizRoutes = require("./routes/quizRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const profileRoutes =require("./routes/profileRoutes");
const adminDashboardRoutes =
require("./routes/adminDashboardRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/enrollments",enrollmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(
  "/api/profile",
  profileRoutes
);
app.use(
"/api/admin/dashboard",
adminDashboardRoutes
);
app.use("/api/certificates", certificateRoutes);
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
module.exports = app;