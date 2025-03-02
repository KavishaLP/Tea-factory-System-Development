import express from 'express';
import { addFarmer } from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);

export default router;