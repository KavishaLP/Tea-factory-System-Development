import sqldb from '../config/sqldb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = (req, res) => {
    console.log("Received Login Request Headers:", req.headers);
    console.log("Received Login Request Body:", req.body);
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const sql = "SELECT * FROM users WHERE username = ?";
    sqldb.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict'
            });

            res.json({ message: 'Login successful', token });
        });
    });
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
