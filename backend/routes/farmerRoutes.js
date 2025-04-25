//routes/farmerRoutes

import express from 'express';
import { requestAdvance, requestFertilizer, FetchFertilizerPrices } from '../controllers/farmerControllers.js';

const router = express.Router();

router.post('/request-advance', requestAdvance);
router.post('/fertilizer-request', requestFertilizer);
router.get('/fertilizer-prices', FetchFertilizerPrices);
router.get('/farmer-payments', getAllPayments);


export default router;