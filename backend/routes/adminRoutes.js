import express from 'express';
import { fetchRequestAdvance, fetchTotalUsers } from '../controllers/adminControllers.js';

const router = express.Router();

router.get('/fetch-pending-requests', fetchRequestAdvance);

// Route to fetch total number of users
router.get('/fetch-total-users', fetchTotalUsers);

// Export the router
export default router;