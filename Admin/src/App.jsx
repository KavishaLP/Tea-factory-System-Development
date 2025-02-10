import './App.css';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import AdvanceUpdate from './Pages/AdvanceUpdate/AdvanceUpdate';

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
          
            <Route path="/Admin-Advance-Update" element={<AdvanceUpdate/>} />
          </Routes>
        </main>
      </div>
      
      {shouldDisplayNavbar() && <Footer />}
    </div>
  );
}

export default App;
