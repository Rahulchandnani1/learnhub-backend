const pool = require("../config/db");

// ===============================
// Create Course
// ===============================
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      instructor,
      category,
      level,
      language,
      duration,
      thumbnail,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO courses
      (
        title,
        description,
        price,
        instructor,
        category,
        level,
        language,
        duration,
        thumbnail,
        created_by
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING *
      `,
      [
        title,
        description,
        price,
        instructor,
        category,
        level,
        language,
        duration,
        thumbnail || null,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ====================================
// Get All Courses
// ====================================
exports.getCourses = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 5,
      search = "",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    // Get Courses
    const courses = await pool.query(
      `
      SELECT
        c.*,
        u.name AS instructor
      FROM courses c
      LEFT JOIN users u
      ON c.created_by = u.id
      WHERE
        c.title ILIKE $1
        OR c.category ILIKE $1
      ORDER BY c.created_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [
        `%${search}%`,
        limit,
        offset,
      ]
    );

    // Total Count
    const total = await pool.query(
      `
      SELECT COUNT(*)
      FROM courses
      WHERE
        title ILIKE $1
        OR category ILIKE $1
      `,
      [`%${search}%`]
    );

    res.status(200).json({
      success: true,
      currentPage: page,
      totalCourses: Number(total.rows[0].count),
      totalPages: Math.ceil(
        total.rows[0].count / limit
      ),
      data: courses.rows,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ====================================
// Get Course By Id
// ====================================
exports.getCourseById = async (req, res) => {
  try {

    const { id } = req.params;

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.*,
        EXISTS (
          SELECT 1
          FROM enrollments e
          WHERE e.course_id = c.id
          AND e.user_id = $2
        ) AS "isEnrolled"
      FROM courses c
      WHERE c.id = $1
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
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
// ====================================
// Update Course
// ====================================
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      price,
      instructor,
      category,
      level,
      language,
      duration,
      thumbnail,
      published,
    } = req.body;

    // Check if course exists
    const course = await pool.query(
      "SELECT * FROM courses WHERE id=$1",
      [id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const result = await pool.query(
      `
      UPDATE courses
      SET
        title=$1,
        description=$2,
        price=$3,
        instructor=$4,
        category=$5,
        level=$6,
        language=$7,
        duration=$8,
        thumbnail=$9,
        published=$10
      WHERE id=$11
      RETURNING *
      `,
      [
        title,
        description,
        price,
        instructor,
        category,
        level,
        language,
        duration,
        thumbnail || null,
        published,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
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
// ====================================
// Delete Course
// ====================================
exports.deleteCourse = async (req, res) => {

  try {

    const { id } = req.params;

    const course = await pool.query(
      "SELECT id FROM courses WHERE id=$1",
      [id]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await pool.query(
      "DELETE FROM courses WHERE id=$1",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
