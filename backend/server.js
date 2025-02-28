// initialize backend - npm init -y
// to run - npm start

// npm install mysql2 dotenv bcrypt axios express body-parser cors
// npm install mysql2 dotenv bcrypt jsonwebtoken express cors cookie-parser mongoose

//npm i -D nodemon ->developer depemdancy

import authRoutes from './routes/authRoutes.js'; // Import auth routes

import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // ✅ Must be placed before routes

app.use(cors({
    origin: ["http://localhost:5174"],
    methods: ["POST", "GET"],
    credentials: true
}));

app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));