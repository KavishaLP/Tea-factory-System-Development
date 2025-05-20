import sqldb from '../config/sqldb.js';


// Get notifications for a specific farmer
export const getFarmerNotifications = async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      SELECT * FROM notifications 
      WHERE recipient_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    sqldb.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching farmer notifications:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      return res.json({ 
        status: 'Success',
        notifications: results 
      });
    });
  } catch (error) {
    console.error('Error in notification fetch:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get count of unread notifications
export const getUnreadCount = async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      SELECT COUNT(*) AS count 
      FROM notifications 
      WHERE recipient_id = ? AND is_read = 0
    `;
    
    sqldb.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error counting unread notifications:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      return res.json({ 
        count: results[0].count 
      });
    });
  } catch (error) {
    console.error('Error in unread count:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  const { notificationId, userId } = req.body;
  
  if (!notificationId || !userId) {
    return res.status(400).json({ message: 'Notification ID and User ID are required' });
  }

  try {
    const query = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND recipient_id = ?
    `;
    
    sqldb.query(query, [notificationId, userId], (err, result) => {
      if (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      return res.json({ 
        status: 'Success',
        message: 'Notification marked as read'
      });
    });
  } catch (error) {
    console.error('Error in mark as read:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const query = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE recipient_id = ? AND is_read = 0
    `;
    
    sqldb.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      return res.json({ 
        status: 'Success',
        message: 'All notifications marked as read',
        affected: result.affectedRows
      });
    });
  } catch (error) {
    console.error('Error in mark all as read:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};