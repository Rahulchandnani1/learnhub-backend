const pool = require("../config/db");

exports.saveFile = async (file) => {
  const result = await pool.query(
    `
    INSERT INTO files
    (
        original_name,
        stored_name,
        file_path,
        file_size,
        mime_type
    )
    VALUES($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      file.originalname,
      file.filename,
      file.path,
      file.size,
      file.mimetype,
    ]
  );

  return result.rows[0];
};

exports.getFiles = async () => {
  const result = await pool.query(
    "SELECT * FROM files ORDER BY id DESC"
  );

  return result.rows;
};
exports.getFileById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM files WHERE id=$1",
    [id]
  );

  return result.rows[0];
};

// Delete File
exports.deleteFile = async (id) => {
  const file = await exports.getFileById(id);

  if (!file) {
    return null;
  }

  if (fs.existsSync(file.file_path)) {
    fs.unlinkSync(file.file_path);
  }

  await pool.query(
    "DELETE FROM files WHERE id=$1",
    [id]
  );

  return file;
};