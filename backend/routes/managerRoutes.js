import express from 'express';
import { addFarmer, addPayment, getPaymentHistory, addEmployee } from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Payment', addPayment);
router.post('/get-Payment-History', getPaymentHistory);

router.post('/add-employee', addEmployee);


export default router;