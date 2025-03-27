//routes/managerRoutes.js
import express from 'express';
import { addFarmer, addFarmerPayment, getFarmerPaymentHistory, addEmployee, addEmployeePayment, getEmployeePaymentHistory, getFertilizerRequests, confirmFertilizer, deleteFertilizer, searchFarmersInDB, getDEtailsRelatedTOUser } from '../controllers/managerControllers.js';

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
router.post('/search-farmers-indb', searchFarmersInDB);
router.post('/get-user-tea-kilos', getDEtailsRelatedTOUser);


export default router;