import './Sidebar.css';

import assets from '../../assets/assets.js';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/Mng-Fertilizer-dis') {
            return location.pathname === path || location.pathname === '/Mng-Fertilizer-History';
        }
        return location.pathname === path;
    };

    return (
        <div className="sidebar">
            <div className={`sidebar-item ${isActive('/Mng-Dashboard') ? 'active' : ''}`} 
                onClick={() => navigate('/Mng-Dashboard')}>
                <img src={assets.b} alt="Logo"/> <p>Dashboard</p>
            </div>
            <div className={`sidebar-item ${isActive('/Mng-Create-Farmer-Account') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Create-Farmer-Account')}>
                <img src={assets.g} alt="Logo"/> <p>Create Farmer Account</p>
            </div>
            <div className={`sidebar-item ${isActive('/Mng-Payment-Logs') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Payment-Logs')}>
                <img src={assets.h} alt="Logo"/> <p>Farmer Payment Logs</p>
            </div>

{/* -------------------------------------------------------------------------------- */}
            <div className={`sidebar-item ${isActive('/test-Mng-Payment-Logs') ? 'active' : ''}`}
                onClick={() => navigate('/test-Mng-Payment-Logs')}>
                <img src={assets.h} alt="Logo"/> <p>Tast Farmer Payment Logs</p>
            </div>


            <div className={`sidebar-item ${isActive('/Mng-Create-Employee-Account') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Create-Employee-Account')}>
                <img src={assets.g} alt="Logo"/> <p>Create Employee Account</p>
            </div>
            <div className={`sidebar-item ${isActive('/Mng-Employee-Payment') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Employee-Payment')}>
                <img src={assets.h} alt="Logo"/> <p>Employee Payment Logs</p>
            </div>
            <div className={`sidebar-item ${isActive('/Mng-Productivity-Report') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Productivity-Report')}>
                <img src={assets.k} alt="Logo"/> <p>Productivity Reports</p>
            </div>
            <div className={`sidebar-item ${isActive('/Mng-Fertilizer-dis') ? 'active' : ''}`}
                onClick={() => navigate('/Mng-Fertilizer-dis')}>
                <img src={assets.i} alt="Logo"/> <p>Fertilizer Distribution</p>
            </div>
           
            <div className="sidebar-item" onClick={() => navigate('/')}>
                <img src={assets.j} alt="Logo"/> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar;
