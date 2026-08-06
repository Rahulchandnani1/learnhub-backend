const pool = require("../config/db");
const userService = require("../services/userService");

exports.getUsers = async (req, res) => {
  try {
 const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";
    const users = await userService.getUsers(
      Number(page),
      Number(limit),
      search
    );

    res.status(200).json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
exports.getUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT id,name,email,role
    FROM users
    WHERE id=$1
    `,
    [id]
  );

  return result.rows[0];
};
exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.profile = async (req, res) => {

    const result = await pool.query(

        "SELECT id,name,email FROM users WHERE id=$1",

        [req.user.id]

    );

    res.json(result.rows[0]);

};