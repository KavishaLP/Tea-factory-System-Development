import sqldb from '../config/sqldb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

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


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const sql = "SELECT * FROM USER WHERE ADMINMAIL = ?";
        sqldb.query(sql, [email], async (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = results[0];

            // Generate reset token
            const resetToken = jwt.sign({ id: user.USERID }, SECRET_KEY, { expiresIn: '15m' });

            // Email setup
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
                subject: 'Password Reset Request',
                html: `<p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`
            };

            await transporter.sendMail(mailOptions);
            res.json({ message: "Password reset link sent to your email." });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const sql = "SELECT * FROM USER WHERE USERID = ?";

        sqldb.query(sql, [decoded.id], async (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (results.length === 0) {
                return res.status(400).json({ message: "Invalid token" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateSql = "UPDATE USER SET PASSWORD = ? WHERE USERID = ?";

            sqldb.query(updateSql, [hashedPassword, decoded.id], (err) => {
                if (err) return res.status(500).json({ message: "Error updating password", error: err });

                res.json({ message: "Password reset successfully!" });
            });
        });
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token" });
    }
};



export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
