const express = require("express");

const router = express.Router();

const quizController = require("../controller/quizController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  quizController.createQuiz
);
router.post(
  "/question",
  authMiddleware,
  quizController.addQuestion
);
router.get(
  "/lesson/:lessonId",
  authMiddleware,
  quizController.getQuizByLesson
);
router.post(
  "/submit",
  authMiddleware,
  quizController.submitQuiz
);
router.get(
  "/:quizId/questions",
  authMiddleware,
  quizController.getQuestions
);
router.put(
  "/question/:id",
  authMiddleware,
  quizController.updateQuestion
);

router.delete(
  "/question/:id",
  authMiddleware,
  quizController.deleteQuestion
);
module.exports = router;