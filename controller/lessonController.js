const pool = require("../config/db");

// ===============================
// Create Lesson
// ===============================
exports.createLesson = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      video_url,
      pdf_url,
      lesson_order,
      duration,
    } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Course and Title are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO lessons
      (
        course_id,
        title,
        description,
        video_url,
        pdf_url,
        lesson_order,
        duration
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7
      )
      RETURNING *
      `,
      [
        course_id,
        title,
        description,
        video_url,
        pdf_url,
        lesson_order,
        duration,
      ]
    );

    res.status(201).json({
      success: true,
      lesson: result.rows[0],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Lessons By Course
// ===============================
exports.getLessonsByCourse = async (req, res) => {
  try {

    const result = await pool.query(
      `
    SELECT
l.*,
EXISTS(
    SELECT 1
    FROM lesson_progress lp
    WHERE lp.lesson_id=l.id
    AND lp.user_id=$2
) AS completed,
EXISTS(
    SELECT 1
    FROM quizzes q
    WHERE q.lesson_id=l.id
) AS has_quiz
FROM lessons l
WHERE l.course_id=$1
ORDER BY lesson_order;
      `,
      [req.params.courseId,
req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ===============================
// Get Lesson By Id
// ===============================
exports.getLessonById = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM lessons
      WHERE id=$1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.json({
      success: true,
      lesson: result.rows[0],
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ===============================
// Update Lesson
// ===============================
exports.updateLesson = async (req, res) => {

  try {

    const {
      title,
      description,
      video_url,
      pdf_url,
      lesson_order,
      duration,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE lessons
      SET
        title=$1,
        description=$2,
        video_url=$3,
        pdf_url=$4,
        lesson_order=$5,
        duration=$6
      WHERE id=$7
      RETURNING *
      `,
      [
        title,
        description,
        video_url,
        pdf_url,
        lesson_order,
        duration,
        req.params.id,
      ]
    );

    res.json({
      success: true,
      lesson: result.rows[0],
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ===============================
// Delete Lesson
// ===============================
exports.deleteLesson = async (req, res) => {

  try {

    await pool.query(
      `
      DELETE FROM lessons
      WHERE id=$1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};