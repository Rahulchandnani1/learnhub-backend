const pool = require("../config/db");

exports.markCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.lessonId;

    // Already completed?
    const existing = await pool.query(
      `
      SELECT id
      FROM lesson_progress
      WHERE user_id=$1
      AND lesson_id=$2
      `,
      [userId, lessonId]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        message: "Already completed",
      });
    }

    await pool.query(
      `
      INSERT INTO lesson_progress
      (
        user_id,
        lesson_id
      )
      VALUES
      (
        $1,
        $2
      )
      `,
      [userId, lessonId]
    );

    res.json({
      success: true,
      message: "Lesson Completed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.checkCompleted = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM lesson_progress
      WHERE user_id=$1
      AND lesson_id=$2
      `,
      [
        req.user.id,
        req.params.lessonId,
      ]
    );

    res.json({
      completed:
        result.rows.length > 0,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ===============================
// Get Course Progress
// ===============================
exports.getCourseProgress = async (req, res) => {
  try {

    const userId = req.user.id;
    const courseId = req.params.courseId;

    // Total lessons
    const totalLessons = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM lessons
      WHERE course_id=$1
      `,
      [courseId]
    );

    // Completed lessons
    const completedLessons = await pool.query(
      `
      SELECT COUNT(*) AS completed
      FROM lesson_progress lp
      INNER JOIN lessons l
      ON lp.lesson_id = l.id
      WHERE lp.user_id=$1
      AND l.course_id=$2
      `,
      [userId, courseId]
    );

    const total = Number(totalLessons.rows[0].total);

    const completed = Number(
      completedLessons.rows[0].completed
    );

    const progress =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    res.json({
      success: true,
      totalLessons: total,
      completedLessons: completed,
      progress,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};