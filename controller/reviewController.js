const pool = require("../config/db");

// ===============================
// Add / Update Review
// ===============================
exports.addReview = async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      course_id,
      rating,
      review,
    } = req.body;

    if (!course_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Course and rating are required",
      });
    }

    // Check if review already exists
    const existing = await pool.query(
      `
      SELECT id
      FROM course_reviews
      WHERE course_id = $1
      AND user_id = $2
      `,
      [course_id, userId]
    );

    let result;

    if (existing.rows.length > 0) {

      result = await pool.query(
        `
        UPDATE course_reviews
        SET
          rating = $1,
          review = $2
        WHERE
          course_id = $3
          AND user_id = $4
        RETURNING *
        `,
        [
          rating,
          review,
          course_id,
          userId,
        ]
      );

    } else {

      result = await pool.query(
        `
        INSERT INTO course_reviews
        (
          course_id,
          user_id,
          rating,
          review
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4
        )
        RETURNING *
        `,
        [
          course_id,
          userId,
          rating,
          review,
        ]
      );

    }

    res.json({
      success: true,
      message: "Review saved successfully",
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
exports.getCourseReviews = async (req, res) => {
  try {

    const { courseId } = req.params;

    // Get Reviews
    const reviews = await pool.query(
      `
      SELECT
        cr.id,
        cr.rating,
        cr.review,
        cr.created_at,
        u.name
      FROM course_reviews cr
      JOIN users u
      ON cr.user_id = u.id
      WHERE cr.course_id = $1
      ORDER BY cr.created_at DESC
      `,
      [courseId]
    );

    // Average Rating
    const ratingResult = await pool.query(
      `
      SELECT
        ROUND(AVG(rating),1) AS average_rating,
        COUNT(*) AS total_reviews
      FROM course_reviews
      WHERE course_id = $1
      `,
      [courseId]
    );

    res.json({
      success: true,
      averageRating:
        ratingResult.rows[0].average_rating || 0,

      totalReviews:
        Number(
          ratingResult.rows[0].total_reviews
        ),

      reviews: reviews.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};