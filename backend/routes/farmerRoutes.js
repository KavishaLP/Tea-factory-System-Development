//routes/farmerRoutes

import express from 'express';
import { requestAdvance, requestFertilizer } from '../controllers/farmerControllers.js';

const router = express.Router();

router.post('/request-advance', requestAdvance);
router.post('/fertilizer-request', requestFertilizer);
router.get('/fertilizer-prices', FetchFertilizerPrices);

export default router;