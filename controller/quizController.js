const pool = require("../config/db");

// ===============================
// Create Quiz
// ===============================
exports.createQuiz = async (req, res) => {
  try {

    const {
      lesson_id,
      title,
      passing_marks,
    } = req.body;

    if (!lesson_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Lesson and title are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO quizzes
      (
        lesson_id,
        title,
        passing_marks
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING *
      `,
      [
        lesson_id,
        title,
        passing_marks || 60,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.addQuestion = async (req, res) => {
  try {

    const {
      quiz_id,
      question,
      option1,
      option2,
      option3,
      option4,
      correct_option,
    } = req.body;

    if (
      !quiz_id ||
      !question ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correct_option
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (
      correct_option < 1 ||
      correct_option > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Correct option must be between 1 and 4",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO quiz_questions
      (
        quiz_id,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING *
      `,
      [
        quiz_id,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Question Added Successfully",
      data: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.getQuizByLesson = async (req, res) => {
  try {

    const { lessonId } = req.params;

    // Get quiz
    const quizResult = await pool.query(
      `
      SELECT *
      FROM quizzes
      WHERE lesson_id = $1
      `,
      [lessonId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = quizResult.rows[0];

    // Get questions (without correct answer)
    const questionResult = await pool.query(
      `
      SELECT
        id,
        question,
        option1,
        option2,
        option3,
        option4
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
      `,
      [quiz.id]
    );

    res.json({
      success: true,
      quiz,
      questions: questionResult.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.getQuestions = async (req, res) => {
  try {

    const { quizId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
      `,
      [quizId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.updateQuestion = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      question,
      option1,
      option2,
      option3,
      option4,
      correct_option,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE quiz_questions
      SET
        question=$1,
        option1=$2,
        option2=$3,
        option3=$4,
        option4=$5,
        correct_option=$6
      WHERE id=$7
      RETURNING *
      `,
      [
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option,
        id,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.deleteQuestion = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM quiz_questions
      WHERE id=$1
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Question Deleted",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.submitQuiz = async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      quiz_id,
      answers,
    } = req.body;

    if (!quiz_id || !answers) {
      return res.status(400).json({
        success: false,
        message: "Quiz answers are required",
      });
    }

    // Get quiz
    const quizResult = await pool.query(
      `
      SELECT *
      FROM quizzes
      WHERE id = $1
      `,
      [quiz_id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quiz = quizResult.rows[0];

    // Get correct answers
    const questionResult = await pool.query(
      `
      SELECT
        id,
        correct_option
      FROM quiz_questions
      WHERE quiz_id = $1
      `,
      [quiz_id]
    );

    const questions = questionResult.rows;

    let score = 0;

    questions.forEach((question) => {

      const answer = answers.find(
        (a) => a.question_id === question.id
      );

      if (
        answer &&
        answer.selected_option === question.correct_option
      ) {
        score++;
      }

    });

    const totalQuestions = questions.length;

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const passed =
      percentage >= quiz.passing_marks;

    // Save attempt
    await pool.query(
      `
      INSERT INTO quiz_attempts
      (
        quiz_id,
        user_id,
        score,
        total_questions,
        passed
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      `,
      [
        quiz_id,
        userId,
        score,
        totalQuestions,
        passed,
      ]
    );

    // If passed, mark lesson completed
    if (passed) {

      await pool.query(
        `
        INSERT INTO lesson_progress
        (
          user_id,
          lesson_id,
          completed
        )
        VALUES
        (
          $1,
          $2,
          true
        )
        ON CONFLICT
        (
          user_id,
          lesson_id
        )
        DO NOTHING
        `,
        [
          userId,
          quiz.lesson_id,
        ]
      );

    }

    res.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      passed,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};