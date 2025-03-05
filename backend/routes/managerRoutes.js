import express from 'express';
import { addFarmer, addFarmerPayment, getFarmerPaymentHistory, addEmployee } from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Farmer-Payment', addFarmerPayment);
router.post('/get-Farmer-Payment-History', getFarmerPaymentHistory);

router.post('/add-employee', addEmployee);
router.post('/add-Employee-Payment', addEmployeePayment);



export default router;