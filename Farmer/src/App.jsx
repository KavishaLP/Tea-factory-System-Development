import './App.css';
import { Navigate, useLocation } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";
import Navbar from './Component/Navbar/Navbar2';
import Sidebar from './Component/sidebar/sidebar2';
import Footer from './Component/Footer/Footer';

import RequestAdvance from "./Pages/RequestAdvance/RequestAdvance";
import RequestFertilizer from './Pages/RequestFertilizer/RequestFertilizer';
import Viewpayment from './Pages/viewPayments/viewpayment';
import DashboardFarmer from './Pages/DashboardFarmer/DashboardFarmer';
// import AdvanceUpdate from './Pages/AdvanceUpdate/AdvanceUpdate';


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
        <Route path="/request-advance" element={<RequestAdvance />} />
        <Route path="/request-fertilizer" element={<RequestFertilizer />} />
        <Route path="/view-payment" element={<Viewpayment />} />
        <Route path="/dashboard-farmer" element={<DashboardFarmer />} />
        {/* <Route path="/aaa" element={<AdvanceUpdate/>} /> */}
      </Routes>
      </main>
      </div>
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
