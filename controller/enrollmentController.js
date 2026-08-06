const pool = require("../config/db");

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    // Check if already enrolled
    const check = await pool.query(
      "SELECT * FROM enrollments WHERE user_id=$1 AND course_id=$2",
      [userId, courseId]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({
        message: "Already enrolled in this course",
      });
    }

    // Insert enrollment
    const result = await pool.query(
      `
      INSERT INTO enrollments(user_id, course_id)
      VALUES($1,$2)
      RETURNING *
      `,
      [userId, courseId]
    );

    res.status(201).json({
      message: "Course enrolled successfully",
      enrollment: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};exports.getMyCourses = async (req, res) => {

  const userId = req.user.id;

  try {

    const result = await pool.query(
      `
      SELECT

        c.id,
        c.title,
        c.description,
        c.thumbnail,
        e.enrolled_at,

        COUNT(l.id) AS total_lessons,

        COUNT(lp.lesson_id)
        FILTER (
          WHERE lp.completed = true
        ) AS completed_lessons

      FROM enrollments e

      JOIN courses c
      ON e.course_id = c.id

      LEFT JOIN lessons l
      ON l.course_id = c.id

      LEFT JOIN lesson_progress lp
      ON lp.lesson_id = l.id
      AND lp.user_id = $1

      WHERE e.user_id = $1

      GROUP BY

        c.id,
        c.title,
        c.description,
        c.thumbnail,
        e.enrolled_at

      ORDER BY e.enrolled_at DESC
      `,
      [userId]
    );

    const courses = result.rows.map(course => {

      const total = Number(course.total_lessons);

      const completed = Number(course.completed_lessons);

      return {

        ...course,

        progress:
          total === 0
            ? 0
            : Math.round(
                (completed * 100) / total
              ),

        completed:
          total > 0 &&
          completed === total

      };

    });

    res.json(courses);

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};