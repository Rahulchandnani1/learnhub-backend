const pool = require("../config/db");

exports.getStats = async (req, res) => {

  try {

    const users = await pool.query(
      "SELECT COUNT(*) total FROM users"
    );

    const courses = await pool.query(
      "SELECT COUNT(*) total FROM courses"
    );

    const enrollments = await pool.query(
      "SELECT COUNT(*) total FROM enrollments"
    );

    const lessons = await pool.query(
      "SELECT COUNT(*) total FROM lessons"
    );

    const quizzes = await pool.query(
      "SELECT COUNT(*) total FROM quizzes"
    );

    const certificates = await pool.query(
      "SELECT COUNT(*) total FROM certificates"
    );

    const reviews = await pool.query(
      "SELECT COUNT(*) total FROM course_reviews"
    );

    res.json({

      success:true,

      data:{

        users:Number(users.rows[0].total),

        courses:Number(courses.rows[0].total),

        enrollments:Number(
          enrollments.rows[0].total
        ),

        lessons:Number(
          lessons.rows[0].total
        ),

        quizzes:Number(
          quizzes.rows[0].total
        ),

        certificates:Number(
          certificates.rows[0].total
        ),

        reviews:Number(
          reviews.rows[0].total
        )

      }

    });

  }
  catch(error){

    console.log(error);

    res.status(500).json({

      success:false,

      message:error.message

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
        c.instructor,
        c.thumbnail,

        COUNT(DISTINCT e.id) AS enrollments,

        COALESCE(
          ROUND(AVG(r.rating),1),
          0
        ) AS rating

      FROM courses c

      LEFT JOIN enrollments e
        ON c.id = e.course_id

      LEFT JOIN course_reviews r
        ON c.id = r.course_id

      GROUP BY
        c.id,
        c.title,
        c.instructor,
        c.thumbnail

      ORDER BY
        enrollments DESC,
        rating DESC

      LIMIT 5
      `
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
exports.getMonthlyUsers = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT

      TO_CHAR(created_at,'Mon') AS month,

      COUNT(*) AS users

      FROM users

      GROUP BY

      EXTRACT(MONTH FROM created_at),

      TO_CHAR(created_at,'Mon')

      ORDER BY

      EXTRACT(MONTH FROM created_at)

      `
    );

    res.json({

      success:true,

      data:result.rows

    });

  }
  catch(error){

    console.log(error);

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};
exports.getMonthlyEnrollments = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        TO_CHAR(enrolled_at,'Mon') AS month,

        COUNT(*) AS enrollments,

        EXTRACT(MONTH FROM enrolled_at) AS month_number

      FROM enrollments

      GROUP BY
        month_number,
        TO_CHAR(enrolled_at,'Mon')

      ORDER BY month_number
      `
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};