import './Sidebar.css';

import assets from '../../assets/assets.js';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <div className="sidebar-item active" onClick={() => navigate('/dashboard')}>
                <img src={assets.b} alt="Logo"/> <p>Dashboard</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/create-farmer')}>
                <img src={assets.g} alt="Logo"/> <p>Create Farmer Account</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/payment-logs')}>
                <img src={assets.h} alt="Logo"/> <p>Payment Logs</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/productivity-reports')}>
                <img src={assets.k} alt="Logo"/> <p>Productivity Reports</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/fertilizer-distribution')}>
                <img src={assets.i} alt="Logo"/> <p>Fertilizer Distribution</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/')}>
                <img src={assets.j} alt="Logo"/> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar;
