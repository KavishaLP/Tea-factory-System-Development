//routes/farmerRoutes

import express from 'express';
import { requestAdvance, requestFertilizer, FetchFertilizerPrices, getPaymentsByUserId,
    getTeaDeliveries,
    getTeaDeliveryDetails,
    getPayments,
    getAdvances,
    getAdvanceDetails,
    getFertilizerRequests,
    getFertilizerDetails
 } from '../controllers/farmerControllers_1.js';

 import {getFarmerNotifications, getUnreadCount, markAsRead, markAllAsRead} from '../controllers/farmerControllers_2.js';

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

// Detailed popup endpoints
router.get('/tea-delivery-details', getTeaDeliveryDetails);
router.get('/advance-details', getAdvanceDetails);
router.get('/fertilizer-request-details', getFertilizerDetails);

// Add these routes to your existing farmerRoutes
router.get('/notifications', getFarmerNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.post('/notifications/mark-read', markAsRead);
router.post('/notifications/mark-all-read', markAllAsRead);

export default router;