//routes/farmerRoutes

import express from 'express';
import { requestAdvance, requestFertilizer, FetchFertilizerPrices, getPaymentsByUserId,
    getTeaDeliveries,
    getTeaDeliveryDetails,
    getPayments,
    getPaymentDetails,
    getAdvances,
    getAdvanceDetails,
    getFertilizerRequests,
    getFertilizerDetails
 } from '../controllers/farmerControllers.js';

const router = express.Router();

router.post('/request-advance', requestAdvance);
router.post('/fertilizer-request', requestFertilizer);
router.get('/fertilizer-prices', FetchFertilizerPrices);
router.get('/payments/:userId', getPaymentsByUserId);

// Dashboard summary endpoints
router.get('/tea-deliveries', getTeaDeliveries);
router.get('/last-payment', getPayments);
router.get('/advances', getAdvances);
router.get('/fertilizer-requests', getFertilizerRequests);

export default router;