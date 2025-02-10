import './App.css';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestAdvance from "./Pages/RequestAdvance/RequestAdvance";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/request-advance" element={<RequestAdvance />} />
      </Routes>
    </Router>
  );
}

export default App;
