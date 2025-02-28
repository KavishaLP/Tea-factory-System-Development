import './App.css';

import { Navigate, useLocation } from 'react-router-dom';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestAdvance from "./Pages/RequestAdvance/RequestAdvance";
import RequestFertilizer from './Pages/RequestFertilizer/RequestFertilizer';
import viewpayment from './Pages/viewPayments/viewpayment';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/request-advance" element={<RequestAdvance />} />
        <Route path="/request-fertilizer" element={<RequestFertilizer/>} />
        <Route path="/request-fertilizer" element={<RequestFertilizer/>} />

      </Routes>
    </Router>
  );
}

export default App;
