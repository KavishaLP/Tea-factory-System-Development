//routes/adminRoutes

import express from 'express';
import { getAdvanceRequests, confirmAdvance, deleteAdvance, addTeaSack, fetchRequestAdvance, fetchTotalUsers, getTeaPacketsRequests, confirmTeaPackets, deleteTeaPackets, searchUsers,
    fetchTeaInventory, addTeaProduction, distributeTea, addAdvancePayment,
    fetchTotalTeaWeight,  fetchDailyTeaWeights,fetchWeeklyTeaWeights,fetchMonthlyTeaWeights,fetchYearlyTeaWeights
 } from '../controllers/adminControllers.js'


const router = express.Router();

router.get('/get-advance-requests', getAdvanceRequests);
router.post('/confirm-advance', confirmAdvance);
router.post('/delete-advance', deleteAdvance);
router.post('/add-tea-sack', addTeaSack);
router.get('/fetch-pending-requests', fetchRequestAdvance);
router.get('/fetch-total-users', fetchTotalUsers);

router.get('/get-tea-packet-requests', getTeaPacketsRequests);
router.post('/confirm-tea-packets', confirmTeaPackets);
router.post('/delete-tea-packets', deleteTeaPackets);

router.get('/search', searchUsers);

router.get('/tea-inventory', fetchTeaInventory);
router.post('/add-tea-production', addTeaProduction);
router.post('/distribute-tea', distributeTea);

router.post('/add-advance', addAdvancePayment);

//dashboard data
router.get('/fetch-total-tea-weight', fetchTotalTeaWeight);
router.get('/fetch-daily-tea-weights', fetchDailyTeaWeights);
router.get('/fetch-weekly-tea-weights', fetchWeeklyTeaWeights);
router.get('/fetch-monthly-tea-weights', fetchMonthlyTeaWeights);
router.get('/fetch-yearly-tea-weights', fetchYearlyTeaWeights);


export default router;