//routes/managerRoutes.js
import express from 'express';
import { addFarmer, addFarmerPayment, fectchpaymentHistory, addEmployee, addEmployeePayment, 
    getEmployeePaymentHistory,
    searchFarmersInDB, getDEtailsRelatedTOUser, getAllFarmers, getAllEmployers,searchEmployeesInDB,
    fetchToPayments, 
    fetchTeaPrice,
    updateTeaPrice,
    approvePayment,
    fetchTeaPriceHistory,
    fetchTotalEmployees,
    fetchFertilizerDetails,
    fetchTeaInventory,
    getManagerNotifications,
    getManagerUnreadCount,
    markManagerNotificationAsRead,
    markAllManagerNotificationsAsRead
} from '../controllers/managerControllers_1.js';

import {getFertilizerRequests, confirmFertilizer, deleteFertilizer} from '../controllers/managerControllers_2_fertilizer.js';

import { 
    getAllFertilizerPrices, 
    addFertilizerPrice, 
    updateFertilizerPrice, 
    deleteFertilizerPrice 
} from '../controllers/managerControllers_3.js';

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
router.post('/fetch-Payment-History', fectchpaymentHistory);
router.get('/fetch-to-payments', fetchToPayments);  // Fetch TO payments for month/year
router.get('/fetch-tea-price', fetchTeaPrice);      // Fetch tea price for month/year
router.post('/update-tea-price', updateTeaPrice);   // Update tea price
router.put('/approve-payment', approvePayment);     // Approve payment

router.get('/fetch-tea-price-history', fetchTeaPriceHistory);
router.get('/fetch-total-employees', fetchTotalEmployees);
router.get('/fetch-fertilizer-details', fetchFertilizerDetails);
router.get('/fetch-tea-inventory', fetchTeaInventory);

router.post('/get-details-related-to-user', getDEtailsRelatedTOUser);

// Add these notification routes
router.get('/notifications', getManagerNotifications);
router.get('/notifications/unread-count', getManagerUnreadCount);
router.post('/notifications/mark-read', markManagerNotificationAsRead);
router.post('/notifications/mark-all-read', markAllManagerNotificationsAsRead);

// Fertilizer prices management
router.get('/fertilizer-prices', getAllFertilizerPrices);
router.post('/fertilizer-prices/add', addFertilizerPrice);
router.put('/fertilizer-prices/update', updateFertilizerPrice);
router.post('/fertilizer-prices/delete', deleteFertilizerPrice);

export default router;