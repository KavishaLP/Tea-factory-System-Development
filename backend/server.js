// initialize backend - npm init -y
// to run - npm start

// npm install mysql2 dotenv bcrypt axios express body-parser cors
// npm install mysql2 dotenv bcrypt jsonwebtoken express cors cookie-parser mongoose
//npm install node-cron


//npm i -D nodemon ->developer depemdancy


//server.js
import verifyUser from './middleware/authMiddleware.js'
import  authRoutes from './routes/authRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initializeMonthlyPayments } from './controllers/managerControllers.js';

import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // ✅ Must be placed before routes

app.use(cors({
    origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

app.use(cookieParser());

cron.schedule('1 0 1 * *', async () => {
  console.log('Running monthly payment initialization...');
  try {
    await initializeMonthlyPayments(
      {}, // empty req
      { 
        status: () => ({ json: (msg) => console.log('Cron Job:', msg) }) 
      }
    );
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/admin', adminRoutes);

app.post('/verify-token', verifyUser, (req, res) => {
  return res.json({
    Status: "Success",
    userId: req.userId, // sending userId
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));