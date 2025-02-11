/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AddNewPayment from './Pages/AddNewPayment/addnewpayment';
import Dashboard from './Pages/DashBoard/Dashboard';
import Footer from './Component/Footer/Footer';
import Login from './Pages/LoginRegister/login';
import Navbar from './Component/Navbar/Navbar';
import Register from './Pages/LoginRegister/register';
import Sidebar from './Component/Sidebar/Sidebar'; // User sidebar
import CreateFarmerAccount from './Pages/createFarmerAccounts/CFA';
import Fertilizer from './Pages/fertilizer/fertilizer';
import ProductivityReport from './Pages/ProductivityReport/ProductivityReport';

function App() {
  const location = useLocation();

  // Sidebar visibility logic
  const shouldDisplaySidebar = () => location.pathname !== '/';

  // Navbar visibility logic
  const shouldDisplayNavbar = () => location.pathname !== '/';

  return (
    <div className="container">
      {shouldDisplayNavbar() && <Navbar />}
      <div className="content-wrapper">
        {shouldDisplaySidebar() && <Sidebar />}
        
        <main className={`main-content ${shouldDisplaySidebar() ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/Mng-Dashboard" element={<Dashboard />} />
            <Route path="/Mng-AddNew-Payment" element={<AddNewPayment />} />
            <Route path="/Mng-Fertilizer-dis" element={<Fertilizer />} />
            <Route path="/Mng-User-dashboard" element={<Sidebar />} />
            <Route path="/Mng-Create-Farmer-Account" element={<CreateFarmerAccount/>} />
            <Route path="/Mng-Productivity-Report" element={<ProductivityReport/>} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
