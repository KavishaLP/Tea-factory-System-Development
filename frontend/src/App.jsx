/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import ProtectedRoute from './Pages/ProtectedRoute';

import Navbar from './Component/Navbar/Navbar';
import Sidebar from './Component/Sidebar/Sidebar'; // User sidebar
import Footer from './Component/Footer/Footer';

// Updated import paths for AUTH_Pages
import Login from './Pages/AuthPages/LoginRegister/login';
import ForgetPassword from './Pages/AuthPages/ForgetPassword/ForgetPassword';
import CheckMail from './Pages/AuthPages/CheckMail/CheckMail';
import ForgetPasswordSuccess from './Pages/AuthPages/ForgetPasswordSuccess/ForgetPasswordSuccess';
import UpdateNewPassword from './Pages/AuthPages/UpdateNewPassword/UpdateNewPassword';

import AddNewPaymentCopy from './Pages/AddNewPaymentCopy/Copyaddnewpayment';
import Dashboard from './Pages/DashBoard/Dashboard';
import Employeepayment from './Pages/EmployeePayment/Employeepayment';
import CreateFarmerAccount from './Pages/createFarmerAccounts/CFA';
import CreateEmployeeAccount from './Pages/createEmployeeAccounts/CEA';
import Fertilizer from './Pages/fertilizer/fertilizer';
import FertilizerConfigurations from './Pages/Configurations/FertilizerConfigurations';

function App() {
  const location = useLocation();

  // Sidebar visibility logic
  const shouldDisplaySidebar = () => {
    const hiddenPaths = ['/', '/forgot-password', '/check-mail', '/password-success', '/update-new-password'];
    return !hiddenPaths.includes(location.pathname);
  };

  // Navbar visibility logic
  const shouldDisplayNavbar = () => {
    const hiddenPaths = ['/', '/forgot-password', '/check-mail', '/password-success', '/update-new-password'];
    return !hiddenPaths.includes(location.pathname);
  };

  return (
    <div className="container">
      {shouldDisplayNavbar() && <Navbar />}
      <div className="content-wrapper">
        {shouldDisplaySidebar() && <Sidebar />}
        
        <main className={`main-content ${shouldDisplaySidebar() ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/check-mail" element={<CheckMail />} />
            <Route path="/password-success" element={<ForgetPasswordSuccess />} />
            <Route path="/update-new-password" element={<UpdateNewPassword />} />
            
            {/* Protected Routes */}
            <Route path="/Mng-Dashboard" element={<Dashboard />} />
            <Route path="/Mng-Create-Farmer-Account" element={<CreateFarmerAccount />} />
            <Route path="/Mng-Create-Employee-Account" element={<CreateEmployeeAccount />} />
            <Route path="/Mng-Employee-Payment" element={<Employeepayment />} />
            <Route path="/test-Mng-Payment-Logs" element={<AddNewPaymentCopy />} />
            <Route path="/Mng-configurations" element={<FertilizerConfigurations />} />
            <Route path="/Mng-Fertilizer-dis" element={<Fertilizer />} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
