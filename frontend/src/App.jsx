/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Navbar from './Component/Navbar/Navbar';
import Sidebar from './Component/Sidebar/Sidebar'; // User sidebar
import Footer from './Component/Footer/Footer';

// Updated import paths for AUTH_Pages
import Login from './Pages/AUTH_PAGES/LoginRegister';
import ForgetPassword from './Pages/AUTH_PAGES/ForgetPassword';
import CheckMail from './Pages/AUTH_PAGES/CheckMail';
import ForgetPasswordSuccess from './Pages/AUTH_PAGES/ForgetPasswordSuccess';
import UpdateNewPassword from './Pages/AUTH_PAGES/UpdateNewPassword';
import Dashboard from './Pages/DashBoard/Dashboard';
import AddNewPayment from './Pages/AddNewPayment/addnewpayment';
import CreateFarmerAccount from './Pages/createFarmerAccounts/CFA';
import Fertilizer from './Pages/fertilizer/fertilizer';
import ProductivityReport from './Pages/ProductivityReport/ProductivityReport';
import FertilizerHistory from './Pages/FertilizerHistory/FertilizerHistory';

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
            <Route path="/Mng-Dashboard" element={<Dashboard />} />
            <Route path="/Mng-AddNew-Payment" element={<AddNewPayment />} />
            <Route path="/Mng-Fertilizer-dis" element={<Fertilizer />} />
            <Route path="/Mng-User-dashboard" element={<Sidebar />} />
            <Route path="/Mng-Create-Farmer-Account" element={<CreateFarmerAccount />} />
            <Route path="/Mng-Productivity-Report" element={<ProductivityReport />} />
            <Route path="/Mng-Fertilizer-History" element={<FertilizerHistory />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/check-mail" element={<CheckMail />} />
            <Route path="/password-success" element={<ForgetPasswordSuccess />} />
            <Route path="/update-new-password" element={<UpdateNewPassword />} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
