import sqldb from '../config/sqldb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const login = (req, res) => {
    const { usernamemail, password } = req.body;
    console.log(req.body)

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
        console.log(results)
        // If no user found
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid Username Or Email' });
        }

        const user = results[0];
        const hashedPassword = user.PASSWORD;

        // Compare passwords
        bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error Comparing Passwords' });
            }

            // If passwords don't match
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid Password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                SECRET_KEY,
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


export const forgotPassword = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const sql = "SELECT * FROM USER WHERE ADMINMAIL = ?";
    sqldb.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const resetCode = generateResetCode();
        const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // Code valid for 15 minutes

        // Update user record with reset code and expiry time
        const updateSql = "UPDATE USER SET RESET_CODE = ?, RESET_EXPIRY = ? WHERE ADMINMAIL = ?";
        sqldb.query(updateSql, [resetCode, expiryTime, email], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error updating reset code', error: updateErr });

            // Send the reset code via email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Code',
                text: `Your password reset code is: ${resetCode}. This code is valid for 15 minutes.`
            };

            transporter.sendMail(mailOptions, (mailErr, info) => {
                if (mailErr) return res.status(500).json({ message: 'Error sending email', error: mailErr });
                return res.status(200).json({ message: 'Reset code sent to your email' });
            });
        });
    });
};


export const sendAgain = (req, res) => {
    const { email } = req.body;
    console.log(req)

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a new reset code
    const resetCode = generateResetCode();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // Code valid for 15 minutes

    // Update the user's reset code and expiry time in the database
    const updateSql = "UPDATE USER SET RESET_CODE = ?, RESET_EXPIRY = ? WHERE ADMINMAIL = ?";
    sqldb.query(updateSql, [resetCode, expiryTime, email], (updateErr, results) => {
        console.log('Update query result:', results); // Log query result
        console.log('Update query error:', updateErr); // Log query error, if any

        if (updateErr) return res.status(500).json({ message: 'Error updating reset code', error: updateErr });

        // If no user found
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        // Send the reset code via email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error); // Log error
                return res.status(500).json({ message: 'Error sending email', error });
            }

            console.log('Email sent: ' + info.response); // Log successful email send
        });

        // Send success response
        return res.status(200).json({ message: 'A new reset code has been sent to your email' });
    });
};


export const checkCode = (req, res) => {
    const { email, resetCode } = req.body;

    console.log('Request Body:', req.body); // Add this line to inspect the incoming data

    if (!email || !resetCode) {
        return res.status(400).json({ message: 'Email and reset code are required' });
    }

    // SQL query to check if the code and email match
    const sql = "SELECT * FROM USER WHERE ADMINMAIL = ? AND RESET_CODE = ?";
    sqldb.query(sql, [email, resetCode], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or reset code' });
        }

        const user = results[0];
        const expiryTime = new Date(user.RESET_EXPIRY);

        // Check if the reset code has expired
        if (expiryTime < new Date()) {
            return res.status(400).json({ message: 'Reset code expired' });
        }

        return res.status(200).json({ message: 'Reset code is valid' });
    });
};


export const updatePassword = (req, res) => {
    const { email, password, compassword } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !compassword) {
        return res.status(400).json({ message: 'Email, password, and confirm password are required.' });
    }

    // Check if the passwords match
    if (password !== compassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Hash the new password for security
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing the password', error: err });
        }

        // SQL query to update the password in the database
        const sql = "UPDATE USER SET PASSWORD = ? WHERE ADMINMAIL = ?";

        sqldb.query(sql, [hashedPassword, email], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
            }

            // If no rows were affected, the email was not found
            if (results.affectedRows === 0) {
                return res.status(400).json({ message: 'Email not found or does not match.' });
            }

            // SQL query to clear the RESET_CODE and RESET_EXPIRY fields
            const clearCodeSql = "UPDATE USER SET RESET_CODE = NULL, RESET_EXPIRY = NULL WHERE ADMINMAIL = ?";

            sqldb.query(clearCodeSql, [email], (err, clearResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Error clearing reset code and expiry', error: err });
                }

                // Respond with a success message
                return res.status(200).json({ message: 'Password updated and reset code cleared successfully' });
            });
        });
    });
};


export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
