//routes/adminRoutes

import express from 'express';
import { getAdvanceRequests, confirmAdvance, deleteAdvance, addTeaSack, fetchRequestAdvance, fetchTotalUsers } from '../controllers/adminControllers.js'

const router = express.Router();

router.get('/get-advance-requests', getAdvanceRequests);
router.post('/confirm-advance', confirmAdvance);
router.post('/delete-advance', deleteAdvance);
router.post('/add-tea-sack', addTeaSack);
router.get('/fetch-pending-requests', fetchRequestAdvance);
router.get('/fetch-total-users', fetchTotalUsers);

export default router;