
const pool = require("../config/db");

exports.getUsers = async (page = 1, limit = 10, search = "") => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT id,name,email,role
     FROM users
     WHERE name ILIKE $1 OR email ILIKE $1
     ORDER BY id DESC
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );

  return result.rows;
};exports.updateUser = async (id, data) => {
  const { name, email, role } = data;

  const result = await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2,
      role = $3
    WHERE id = $4
    RETURNING id, name, email, role
    `,
    [name, email, role, id]
  );

  return result.rows[0];
};
exports.deleteUser = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};