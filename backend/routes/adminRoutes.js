//routes/adminRoutes

import express from 'express';
import { getAdvanceRequests, confirmAdvance, deleteAdvance} from '../controllers/adminControllers.js'

const router = express.Router();

router.get('/get-advance-requests', getAdvanceRequests);
router.post('/confirm-advance', confirmAdvance);
router.post('/delete-advance', deleteAdvance);
router.post('/add-tea-sack', addTeaSack);

export default router;