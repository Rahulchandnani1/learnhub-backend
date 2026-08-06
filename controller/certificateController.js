const PDFDocument = require("pdfkit");

const pool = require("../config/db");
exports.downloadCertificate = async (req, res) => {
  try {

    const userId = req.user.id;
    const { courseId } = req.params;

    // Total lessons in course
    const totalLessons = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM lessons
      WHERE course_id = $1
      `,
      [courseId]
    );

    // Completed lessons by user
    const completedLessons = await pool.query(
      `
      SELECT COUNT(*) AS completed
      FROM lesson_progress lp
      JOIN lessons l
        ON lp.lesson_id = l.id
      WHERE
        lp.user_id = $1
        AND l.course_id = $2
        AND lp.completed = true
      `,
      [userId, courseId]
    );

    const total = Number(totalLessons.rows[0].total);
    const completed = Number(completedLessons.rows[0].completed);

    if (total === 0) {
      return res.status(400).json({
        success: false,
        message: "No lessons found for this course",
      });
    }

    if (completed < total) {
      return res.status(400).json({
        success: false,
        message: "Complete all lessons before downloading the certificate",
      });
    }

    // Next step:
    // 1. Get user details
    // 2. Get course details
    // 3. Save certificate if not already created
    // 4. Generate PDF
      const userResult = await pool.query(
      `
      SELECT name
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const courseResult = await pool.query(
      `
      SELECT title
      FROM courses
      WHERE id = $1
      `,
      [courseId]
    );

    const user = userResult.rows[0];
    const course = courseResult.rows[0];
    const existingCertificate = await pool.query(
  `
  SELECT *
  FROM certificates
  WHERE user_id = $1
  AND course_id = $2
  `,
  [userId, courseId]
);

let certificateNo;

if (existingCertificate.rows.length > 0) {

  certificateNo =
    existingCertificate.rows[0].certificate_no;

} else {

  certificateNo =
    `CERT-${Date.now()}`;

  await pool.query(
    `
    INSERT INTO certificates
    (
      user_id,
      course_id,
      certificate_no
    )
    VALUES ($1,$2,$3)
    `,
    [
      userId,
      courseId,
      certificateNo,
    ]
  );

}
const doc = new PDFDocument({
  layout: "landscape",
  size: "A4",
});

res.setHeader(
  "Content-Type",
  "application/pdf"
);

res.setHeader(
  "Content-Disposition",
  `attachment; filename=${certificateNo}.pdf`
);

doc.pipe(res);
doc
  .rect(20, 20, 800, 550)
  .stroke("#0d6efd");

doc
  .rect(30, 30, 780, 530)
  .stroke("#0d6efd");
  doc
  .fontSize(30)
  .fillColor("#0d6efd")
  .text(
    "LearnHub LMS",
    {
      align: "center",
    }
  );

doc.moveDown();

doc
  .fontSize(24)
  .fillColor("black")
  .text(
    "Certificate of Completion",
    {
      align: "center",
    }
  );
  doc.moveDown(2);

doc
  .fontSize(18)
  .text(
    "This certifies that",
    {
      align: "center",
    }
  );

doc.moveDown();

doc
  .fontSize(28)
  .fillColor("#0d6efd")
  .text(
    user.name,
    {
      align: "center",
    }
  );
  doc.moveDown();

doc
  .fontSize(18)
  .fillColor("black")
  .text(
    "has successfully completed",
    {
      align: "center",
    }
  );

doc.moveDown();

doc
  .fontSize(24)
  .fillColor("#198754")
  .text(
    course.title,
    {
      align: "center",
    }
  );
  doc.moveDown(2);

doc
  .fontSize(14)
  .fillColor("black")
  .text(
    `Certificate No: ${certificateNo}`,
    {
      align: "center",
    }
  );

doc.text(
  `Date: ${new Date().toLocaleDateString()}`,
  {
    align: "center",
  }
);

doc.moveDown(3);

doc.text(
  "Authorized Signature",
  {
    align: "right",
  }
);

doc.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};