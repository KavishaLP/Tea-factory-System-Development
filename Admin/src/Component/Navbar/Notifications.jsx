import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Notifications.css';

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationRef = useRef(null);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8081/api/admin/notifications', {
          withCredentials: true
        });
        setNotifications(response.data.notifications);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.post('http://localhost:8081/api/admin/notifications/mark-read', 
        { notificationId: id },
        { withCredentials: true }
      );
      
      // Update state to mark notification as read
      setNotifications(notifications.map(notification => 
        notification.id === id 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post('http://localhost:8081/api/admin/notifications/mark-all-read', 
        {},
        { withCredentials: true }
      );
      
      // Update all notifications in state
      setNotifications(notifications.map(notification => ({ 
        ...notification, 
        is_read: true 
      })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div className="notifications-panel" ref={notificationRef}>
      <div className="notifications-header">
        <h3>Notifications</h3>
        <button 
          className="mark-all-read-btn"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      
      <div className="notifications-list">
        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : error ? (
          <div className="notification-error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications to display</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-time">
                  {formatDate(notification.created_at)}
                </div>
              </div>
              {!notification.is_read && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;