// routes/authRoutes.js

import express from 'express';
import { logout } from '../controllers/authControllers.js';
import { mngLogin, mngForgotPassword, mngCheckCode, mngSendAgain, mngUpdatePassword } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/mng-login', mngLogin);
router.post('/mng-forgot-password', mngForgotPassword);
router.post('/mng-check-code', mngCheckCode);
router.post('/mng-send-again', mngSendAgain);
router.post('/mng-update-password', mngUpdatePassword);



export default router;