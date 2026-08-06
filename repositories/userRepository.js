const pool = require("../config/db");

exports.findAll = async () => {

    const result = await pool.query(

        "SELECT id,name,email,role FROM users ORDER BY id"

    );

    return result.rows;

};