import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardAdmin from './Pages/DashboardAdmin/DashboardAdmin';
import AdvanceUpdate from './Pages/AdvanceUpdate/AdvanceUpdate';
import TeaSackUpdate from './Pages/Teasackupdate/teasack';
import TeaPacketDistribution from './Pages/TeaPaketDistribution/TeaPaketDistribution';
import Login from './Pages/AuthPages/LoginRegister/login';
import ForgetPassword from './Pages/AuthPages/ForgetPassword/ForgetPassword';
import CheckMail from './Pages/AuthPages/CheckMail/CheckMail';
import ForgetPasswordSuccess from './Pages/AuthPages/ForgetPasswordSuccess/ForgetPasswordSuccess';
import UpdateNewPassword from './Pages/AuthPages/UpdateNewPassword/UpdateNewPassword';
import Footer from './Component/Footer/Footer';
import Navbar from './Component/Navbar/Navbar2';
import Sidebar from './Component/sidebar/sidebar2';

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
            
            <Route path="/dashboard-admin" element={<DashboardAdmin />} /> 
            <Route path="/tea-sack-update" element={<TeaSackUpdate />} />
            <Route path="/advance-update" element={<AdvanceUpdate />} />
            <Route path="/tea-packet-distribution" element={<TeaPacketDistribution />} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;