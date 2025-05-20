import { useState, useEffect } from 'react';
import axios from 'axios';
import './Navbar.css';
import FarmerNotifications from './FarmerNotifications';
import { FaBell, FaRegBell, FaUser } from 'react-icons/fa';

const Navbar = ({ userId }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/farmer/notifications/unread-count?userId=${userId}`, {
        withCredentials: true
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch unread count on component mount and set up periodic refresh
  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh notification count every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [userId]);

  // Update count when notifications panel is closed (in case notifications were read)
  const handleCloseNotifications = () => {
    setShowNotifications(false);
    fetchUnreadCount();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* <img src={assets.logo} alt="Logo" className="logo" /> */}
      </div>
      <div className="navbar-center">
        <i className="ri-menu-2-line"></i>
      </div>
      <div className="navbar-right">
        <div className="notification-container">
          <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
            {unreadCount > 0 ? (
              <FaBell className="animated-icon" />
            ) : (
              <FaRegBell />
            )}
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          {showNotifications && <FarmerNotifications onClose={handleCloseNotifications} userId={userId} />}
        </div>
        <div className="profile">
          <div className="profile-pic">
            <FaUser />
          </div>
          <span className="farmer-name">{userId || 'Farmer'}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
