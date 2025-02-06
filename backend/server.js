// initialize backend - npm init -y
// to run - npm start

// npm install mysql2 dotenv bcrypt axios express body-parser cors
// npm install mysql2 dotenv bcrypt jsonwebtoken express cors cookie-parser mongoose

//npm i -D nodemon ->developer depemdancy

import sqldb from './config/sqldb.js';

import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({          //---------------------------------Allows requests from different origins
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET"],
    credentials: true   //-----------------------------------allows the browser to send cookies and authentication credentials
}));

app.use(cookieParser());










const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));