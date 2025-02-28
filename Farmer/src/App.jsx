import './App.css';

import { Navigate, useLocation } from 'react-router-dom';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestAdvance from "./Pages/RequestAdvance/RequestAdvance";
import RequestFertilizer from './Pages/RequestFertilizer/RequestFertilizer';
import Viewpayment from './Pages/viewPayments/viewpayment';
import DashboardFarmer from './Pages/DashboardFarmer/DashboardFarmer';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/request-advance" element={<RequestAdvance />} />
        <Route path="/request-fertilizer" element={<RequestFertilizer/>} />
        <Route path="/view-payment" element={<Viewpayment/>} />
        <Route path="/dashboard-farmer" element={<DashboardFarmer/>} />

      </Routes>
    </Router>
  );
}

export default App;
