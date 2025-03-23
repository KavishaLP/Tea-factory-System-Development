//routes/managerRoutes.js
import express from 'express';
import { addFarmer, addFarmerPayment, getFarmerPaymentHistory, addEmployee, addEmployeePayment, getEmployeePaymentHistory, getFertilizerRequests, confirmFertilizer, deleteFertilizer } from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Farmer-Payment', addFarmerPayment);
router.post('/get-Farmer-Payment-History', getFarmerPaymentHistory);

router.post('/add-employee', addEmployee);
router.post('/add-Employee-Payment', addEmployeePayment);
router.post('/get-Employee-Payment-History', getEmployeePaymentHistory);

router.get('/get-fertilizer-requests', getFertilizerRequests);
router.post('/confirm-fertilizer', confirmFertilizer);
router.post('/delete-fertilizer', deleteFertilizer);

export default router;