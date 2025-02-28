import './Sidebar.css';

// import assets from '../../assets/assets.js';
import { useNavigate } from 'react-router-dom';

const Sidebar2 = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userRole'); // Clear stored user role
        navigate('/'); // Redirect to login page
    };

    return (
        <div className="sidebar">
            <div className="sidebar-item active" onClick={() => navigate('/dashboard')}>
                <img src={assets.b} alt="Logo"/> <p>Dashboard</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/teasack')}>
                <img src={assets.l} alt="Logo"/> <p>Tea Sack Update</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/advance-update')}>
                <img src={assets.h} alt="Logo"/> <p>Advance Update</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/tea-packet-distribution')}>
                <img src={assets.m} alt="Logo"/> <p>Tea Packet Distribution</p>
            </div>
            <div className="sidebar-item" onClick={() => navigate('/settings')}>
                <img src={assets.k} alt="Logo"/> <p>Settings</p>
            </div>
            <div className="sidebar-item" onClick={handleLogout}>
                <img src={assets.j} alt="Logo"/> <p>Logout</p>
            </div>
        </div>
    );
};

export default Sidebar2;
