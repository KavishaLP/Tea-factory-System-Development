// routes/authRoutes.js

import express from 'express';
import { logout } from '../controllers/managerAuthControllers.js';
import { mngLogin, mngForgotPassword, mngCheckCode, mngSendAgain, mngUpdatePassword } from '../controllers/managerAuthControllers.js';
import { fmrLogin, fmrForgotPassword, fmrCheckCode, fmrSendAgain, fmrUpdatePassword } from '../controllers/farmerAuthControllers.js';
import { admnLogin, admnForgotPassword, admnCheckCode, admnSendAgain, admnUpdatePassword } from '../controllers/adminAuthControllers.js';


const router = express.Router();

// Manager authentication routes
router.post('/mng-login', mngLogin);
router.post('/mng-forgot-password', mngForgotPassword);
router.post('/mng-check-code', mngCheckCode);
router.post('/mng-send-again', mngSendAgain);
router.post('/mng-update-password', mngUpdatePassword);

// Farmer authentication routes
router.post('/fmr-login', fmrLogin);
router.post('/fmr-forgot-password', fmrForgotPassword);
router.post('/fmr-check-code', fmrCheckCode);
router.post('/fmr-send-again', fmrSendAgain);
router.post('/fmr-update-password', fmrUpdatePassword);

// Admin authentication routes
router.post('/admn-login', admnLogin);
router.post('/admn-forgot-password', admnForgotPassword);
router.post('/admn-check-code', admnCheckCode);
router.post('/admn-send-again', admnSendAgain);
router.post('/admn-update-password', admnUpdatePassword);




export default router;