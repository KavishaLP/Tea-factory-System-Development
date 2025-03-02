import bcrypt from 'bcryptjs';
// import { validationResult } from 'express-validator';
import sqldb from '../config/db.js'; // Assuming your database connection is set up in db.js

// Add Farmer Controller
export const addFarmer = async (req, res) => {
    const { userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password } = req.body;

    // Validation checks
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    // Check if the farmer already exists by userId or Gmail
    const sqlCheck = "SELECT * FROM farmers WHERE userId = ? OR gmail = ?";
    sqldb.query(sqlCheck, [userId, gmail], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Farmer with this user ID or email already exists' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: 'Error hashing password', error: err });
            }

            // SQL query to insert new farmer into the database
            const sqlInsert = "INSERT INTO farmers (userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            sqldb.query(sqlInsert, [userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, hashedPassword], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error inserting farmer data into database', error: err });
                }

                // Send success response
                return res.status(200).json({ message: 'Farmer account created successfully', farmerId: result.insertId });
            });
        });
    });
};
