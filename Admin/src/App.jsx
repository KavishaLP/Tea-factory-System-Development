import './App.css';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AdvanceUpdate from './Pages/AdvanceUpdate/AdvanceUpdate';
import TeaSackUpdate from './Pages/Teasackupdate/teasack';
import Footer from './Component/Footer/Footer';
import Navbar from './Component/Navbar/Navbar2';
import Sidebar from './Component/sidebar/sidebar2';


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
            <Route path="/tea-sack-update" element={<TeaSackUpdate/>} />
            <Route path="/advance-update" element={<AdvanceUpdate/>} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
