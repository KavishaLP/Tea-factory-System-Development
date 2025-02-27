// routes/authRoutes.js

import express from 'express';
import { login, logout } from '../controllers/authControllers.js';
import { forgotPassword, resetPassword } from '../controllers/authControllers';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;