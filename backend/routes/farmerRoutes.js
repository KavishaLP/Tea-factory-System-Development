//routes/farmerRoutes

import express from 'express';
import { requestAdvance } from '../controllers/farmerControllers.js';

const router = express.Router();

router.post('/request-advance', requestAdvance);

export default router;