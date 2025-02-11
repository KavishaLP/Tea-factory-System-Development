// initialize backend - npm init -y
// to run - npm start

// npm install mysql2 dotenv bcrypt axios express body-parser cors
// npm install mysql2 dotenv bcrypt jsonwebtoken express cors cookie-parser mongoose

//npm i -D nodemon ->developer depemdancy

import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Import auth routes
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'], // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow these HTTP methods
    credentials: true, // Allow cookies and credentials
  })
);

// Routes
app.use('/api/auth', authRoutes); // Use auth routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));