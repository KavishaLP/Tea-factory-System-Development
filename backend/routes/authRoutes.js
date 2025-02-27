// routes/authRoutes.js

import express from 'express';
import { login, logout } from '../controllers/authControllers.js';
import { forgotPassword, checkCode, sendAgain, updatePassword } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/check-code', checkCode);
router.post('/send-again', sendAgain);
router.post('/update-password', updatePassword);

export default router;