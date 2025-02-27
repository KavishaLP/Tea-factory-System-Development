// routes/authRoutes.js

import express from 'express';
import { login, logout } from '../controllers/authControllers.js';
import { forgotPassword,resetPassword, checkCode,sendAgain } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/check-code', checkCode);
router.post('/send-again', sendAgain);


router.post('/reset-password', resetPassword);

export default router;