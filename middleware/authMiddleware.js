const jwt = require("jsonwebtoken");
const pool = require("../config/db");

module.exports = async (req, res, next) => {

    try{

        const authHeader = req.headers.authorization;
console.log("Authorization Header:", authHeader);
        if(!authHeader){

            return res.status(401).json({
                message:"Token Missing"
            });

        }

        const token = authHeader.split(" ")[1];
console.log("token:", token);
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
console.log("decoded:", decoded);
        const result = await pool.query(

            `
            SELECT
            id,
            name,
            email,
            role

            FROM users

            WHERE id=$1
            `,
            [decoded.id]

        );

        if(result.rows.length===0){

            return res.status(401).json({
                message:"User not found"
            });

        }

        req.user = result.rows[0];

        next();

    }

    catch(error){

        return res.status(401).json({
            message:"Invalid Token"
        });

    }

};