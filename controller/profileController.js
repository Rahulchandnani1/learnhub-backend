const pool = require("../config/db");

exports.getProfile = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT

      id,

      name,

      email,

      role,

      created_at

      FROM users

      WHERE id=$1
      `,
      [req.user.id]
    );

    res.json({

      success:true,

      data:result.rows[0]

    });

  } catch(error){

    console.log(error);

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};
exports.updateProfile = async (req, res) => {

  try {

    const { name } = req.body;

    if (!name || !name.trim()) {

      return res.status(400).json({
        success: false,
        message: "Name is required"
      });

    }

    const result = await pool.query(
      `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        role,
        created_at
      `,
      [name.trim(), req.user.id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};