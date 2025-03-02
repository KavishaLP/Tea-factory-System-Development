import express from 'express';


const router = express.Router();

router.post('/add-farmer', addFarmer);

export default router;