//routes/managerRoutes.js
import express from 'express';
import { addFarmer, addFarmerPayment, getFarmerPaymentHistory, addEmployee, addEmployeePayment, 
    getEmployeePaymentHistory, getFertilizerRequests, confirmFertilizer, deleteFertilizer, 
    searchFarmersInDB, getDEtailsRelatedTOUser, getAllFarmers, getAllEmployers,searchEmployeesInDB
} from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Farmer-Payment', addFarmerPayment);
router.post('/get-Farmer-Payment-History', getFarmerPaymentHistory);
router.get('/get-farmer-accounts',getAllFarmers)

router.post('/add-employee', addEmployee);
router.post('/add-Employee-Payment', addEmployeePayment);
router.post('/get-Employee-Payment-History', getEmployeePaymentHistory);
router.get('/get-employee-accounts', getAllEmployers);

router.get('/get-fertilizer-requests', getFertilizerRequests);
router.post('/confirm-fertilizer', confirmFertilizer);
router.post('/delete-fertilizer', deleteFertilizer);

router.post('/search-farmers-indb', searchFarmersInDB);
router.post('/search-employees-indb', searchEmployeesInDB);

router.post('/get-details-related-to-user', getDEtailsRelatedTOUser);





export default router;