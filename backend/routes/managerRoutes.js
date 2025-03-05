import express from 'express';
import { addFarmer, addPayment } from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Payment', addPayment);

export default router;