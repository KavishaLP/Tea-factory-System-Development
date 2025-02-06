import './App.css';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AddNewPayment from './Pages/AddNewPayment/addnewpayment';
import Dashboard from './Pages/DashBoard/Dashboard';
import Footer from './Component/Footer/Footer';
import Login from './Pages/LoginRegister/login';
import Navbar from './Component/Navbar/Navbar';
import Register from './Pages/LoginRegister/register';
import Sidebar from './Component/Sidebar/Sidebar'; // User sidebar
import Sidebar2 from './Component/Sidebar/sidebar2'; // Admin sidebar
import CreateFarmerAccount from './Pages/createFarmerAccounts/CFA';
import Fertilizer from './Pages/fertilizer/fertilizer';

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/addnewpayment" element={<AddNewPayment />} />
            <Route path="/admin-dashboard" element={<Sidebar2 />} />
            <Route path="/user-dashboard" element={<Sidebar />} />
            <Route path="/CreateFarmerAccount" element={<CreateFarmerAccount/>} />
            <Route path="/fertilizer" element={<Fertilizer/>} />
          </Routes>
        </main>
      </div>
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
