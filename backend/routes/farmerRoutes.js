//routes/farmerRoutes

import express from 'express';
import { requestAdvance, requestFertilizer, FetchFertilizerPrices, getPaymentsByUserId } from '../controllers/farmerControllers.js';

const router = express.Router();

router.post('/request-advance', requestAdvance);
router.post('/fertilizer-request', requestFertilizer);
router.get('/fertilizer-prices', FetchFertilizerPrices);
router.get('/payments/:userId', getPaymentsByUserId);

export default router;