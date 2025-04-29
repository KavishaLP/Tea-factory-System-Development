//routes/managerRoutes.js
import express from 'express';
import { addFarmer, addFarmerPayment, fectchpaymentHistory, addEmployee, addEmployeePayment, 
    getEmployeePaymentHistory, getFertilizerRequests, confirmFertilizer, deleteFertilizer, 
    searchFarmersInDB, getDEtailsRelatedTOUser, getAllFarmers, getAllEmployers,searchEmployeesInDB,
    fetchToPayments, 
    fetchTeaPrice,
    updateTeaPrice,
    approvePayment,
    fetchTeaPriceHistory,
    fetchTotalEmployees,
    fetchFertilizerDetails
} from '../controllers/managerControllers.js';

const router = express.Router();

router.post('/add-farmer', addFarmer);
router.post('/add-Farmer-Payment', addFarmerPayment);
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

//--------------------------------
router.get('/fetch-to-payments', fetchToPayments);
router.post('/fetch-Payment-History', fectchpaymentHistory);
router.get('/fetch-to-payments', fetchToPayments);  // Fetch TO payments for month/year
router.get('/fetch-tea-price', fetchTeaPrice);      // Fetch tea price for month/year
router.post('/update-tea-price', updateTeaPrice);   // Update tea price
router.put('/approve-payment', approvePayment);     // Approve payment
router.get('/fetch-tea-price-history', fetchTeaPriceHistory);
router.get('/fetch-total-employees', fetchTotalEmployees);
router.get('/fetch-fertilizer-details', fetchFertilizerDetails);

router.post('/get-details-related-to-user', getDEtailsRelatedTOUser);

export default router;