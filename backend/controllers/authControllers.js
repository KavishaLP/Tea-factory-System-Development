import sqldb from '../config/sqldb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = (req, res) => {
    const { usernamemail, password } = req.body;

    // Validate input
    if (!usernamemail || !password) {
        return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    // Check if the input is an email or username
    const isEmail = usernamemail.includes('@');

    // SQL query to find user by username or email
    const sql = isEmail
        ? "SELECT * FROM USER WHERE ADMINMAIL = ?" // Check for email
        : "SELECT * FROM USER WHERE username = ?"; // Check for username

    sqldb.query(sql, [usernamemail], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        // If no user found
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username/email or password' });
        }

        const user = results[0];
        const hashedPassword = user.PASSWORD;

        // Compare passwords
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords' });
            }

            // If passwords don't match
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username/email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1D' }
            );

            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            console.log("Token created and sent:", token);

            // Send success response
            return res.status(200).json({ Status: "Success", token });
        });
    });
};


export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
