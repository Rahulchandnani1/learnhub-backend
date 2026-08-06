const pool = require("../config/db");

exports.getDashboardStats = async (req, res) => {

  try {

    const userId = req.user.id;

    const enrolledCourses = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM enrollments
      WHERE user_id = $1
      `,
      [userId]
    );

    const completedLessons = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM lesson_progress
      WHERE
        user_id = $1
        AND completed = true
      `,
      [userId]
    );

    const certificates = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM certificates
      WHERE user_id = $1
      `,
      [userId]
    );

    const totalLessons = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM lessons l
      JOIN enrollments e
      ON e.course_id = l.course_id
      WHERE e.user_id = $1
      `,
      [userId]
    );

    const completed =
      Number(completedLessons.rows[0].total);

    const total =
      Number(totalLessons.rows[0].total);

    const progress =
      total === 0
        ? 0
        : Math.round((completed * 100) / total);

    res.json({
      success: true,
      data: {
        enrolledCourses:
          Number(enrolledCourses.rows[0].total),
        completedLessons: completed,
        certificates:
          Number(certificates.rows[0].total),
        averageProgress: progress,
      },
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
exports.getContinueLearning = async (req, res) => {
  try {

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT

        c.id,
        c.title,
        c.thumbnail,

        COUNT(l.id) AS total_lessons,

        COUNT(lp.lesson_id) FILTER
        (
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
      c.thumbnail

      ORDER BY c.created_at DESC
      `,
      [userId]
    );

    const courses = result.rows.map((course) => {

      const total = Number(course.total_lessons);

      const completed =
        Number(course.completed_lessons);

      return {

        ...course,

        progress:
          total === 0
            ? 0
            : Math.round(
                (completed * 100) / total
              ),

      };

    });

    res.json({
      success: true,
      data: courses,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
exports.getPopularCourses = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT

        c.id,
        c.title,
        c.thumbnail,
        c.price,
        c.instructor,
        c.category,

        COUNT(e.id) AS total_enrollments,

        COALESCE(
          ROUND(AVG(r.rating),1),
          0
        ) AS average_rating

      FROM courses c

      LEFT JOIN enrollments e
      ON e.course_id = c.id

      LEFT JOIN course_reviews r
      ON r.course_id = c.id

      GROUP BY
      c.id,
      c.title,
      c.thumbnail,
      c.price,
      c.instructor,
      c.category

      ORDER BY
      total_enrollments DESC,
      average_rating DESC

      LIMIT 6
      `
    );

    res.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};
exports.searchCourses = async (req, res) => {
  try {

    const { search = "" } = req.query;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        thumbnail,
        instructor
      FROM courses
      WHERE
        LOWER(title)
        LIKE LOWER($1)
      ORDER BY title
      LIMIT 8
      `,
      [`%${search}%`]
    );

    res.json({
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
exports.getCategories = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        category,
        COUNT(*) AS total_courses
      FROM courses
      GROUP BY category
      ORDER BY category
      `
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
exports.getCoursesByCategory = async (req, res) => {

  try {

    const { category } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        thumbnail,
        instructor,
        price
      FROM courses
      WHERE category = $1
      ORDER BY created_at DESC
      `,
      [category]
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
exports.getRecommendedCourses = async (req, res) => {

  try {

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.title,
        c.thumbnail,
        c.price,
        c.instructor,
        c.category
      FROM courses c

      WHERE c.id NOT IN
      (
        SELECT course_id
        FROM enrollments
        WHERE user_id = $1
      )

      ORDER BY c.created_at DESC
      LIMIT 6
      `,
      [userId]
    );

    res.json({
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