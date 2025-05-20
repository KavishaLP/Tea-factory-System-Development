//controllers/adminControllers.js
import sqldb from '../config/sqldb.js';


//Add tea sack data
export const addTeaSack = async (req, res) => {
  console.log("Received Data:", req.body);

  const {
    userId,
    date,
    teaSackWeight,
    deductions = {}, // Default to empty object to avoid undefined errors
    totalTeaSackAmount
  } = req.body;

  // Validate required fields
  if (!userId || !date || !teaSackWeight || !totalTeaSackAmount) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    // Check if the user exists in the farmeraccounts table
    const checkUserQuery = "SELECT * FROM farmeraccounts WHERE userId = ?";
    sqldb.query(checkUserQuery, [userId], (err, results) => {
      if (err) {
        console.error("Database Check Error:", err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Insert tea sack data into the tea_sack_updates table
      const insertQuery = `
        INSERT INTO tea_sack_updates (
          userId,
          date,
          tea_sack_weight,
          deduction_water,
          deduction_damage_tea,
          deduction_sack_weight,
          deduction_sharped_tea,
          deduction_other,
          final_tea_sack_weight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userId,
        date,
        teaSackWeight,
        deductions.water || 0.00,
        deductions.damageTea || 0.00,
        deductions.sackWeight || 0.00,
        deductions.sharpedTea || 0.00,
        deductions.other || 0.00,
        totalTeaSackAmount
      ];

      sqldb.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Database Insert Error:", err);
          return res.status(500).json({ message: 'Error inserting tea sack data into database', error: err });
        }

        // Get the month and year from the date of the tea sack update
        const updateMonth = new Date(date).getMonth() + 1; // Months are 0-based in JavaScript
        const updateYear = new Date(date).getFullYear();

        // Check if there is an existing payment record for this user in the same month and year
        const checkPaymentQuery = `
          SELECT * FROM farmer_payments
          WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
        `;

        sqldb.query(checkPaymentQuery, [userId, updateMonth, updateYear], (err, paymentResults) => {
          if (err) {
            console.error("Database Payment Check Error:", err);
            return res.status(500).json({ message: 'Error checking payment record', error: err });
          }

          // If payment record exists, update the finalTeaKilos column
          if (paymentResults.length > 0) {
            const paymentUpdateQuery = `
              UPDATE farmer_payments
              SET finalTeaKilos = finalTeaKilos + ?
              WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
            `;

            sqldb.query(paymentUpdateQuery, [totalTeaSackAmount, userId, updateMonth, updateYear], (err) => {
              if (err) {
                console.error("Database Payment Update Error:", err);
                return res.status(500).json({ message: 'Error updating payment record', error: err });
              }
              // Success response for updating payment record
              return res.status(200).json({
                status: "Success",
                message: "Tea sack data and payment record updated successfully.",
                teaSackId: result.insertId
              });
            });
          } else {
            // If no payment record exists for the month, create a new payment record
            const insertPaymentQuery = `
              INSERT INTO farmer_payments (
                userId, finalTeaKilos, created_at
              ) VALUES (?, ?, ?)
            `;

            const insertPaymentValues = [
              userId,
              totalTeaSackAmount,
              date
            ];

            sqldb.query(insertPaymentQuery, insertPaymentValues, (err, paymentResult) => {
              if (err) {
                console.error("Database Payment Insert Error:", err);
                return res.status(500).json({ message: 'Error inserting payment record', error: err });
              }

              // Success response for inserting a new payment record
              return res.status(200).json({
                status: "Success",
                message: "Tea sack data submitted and new payment record created successfully.",
                teaSackId: result.insertId
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};


//----------------------------------------------------------------------------------------


// Function to fetch the count of pending advances
export const fetchRequestAdvance = (req, res) => {
    // Query the database to count pending advances
    const query = "SELECT COUNT(*) AS count FROM advance_payment WHERE action = 'pending'";
  
    sqldb.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching pending advances:', err);
        return res.status(500).json({ error: 'Failed to fetch pending advances' });
      }
  
      // Send the count as a response
      res.status(200).json({ count: results[0].count });
    });
};

export const fetchTotalUsers = (req, res) => {
    // Query the database to count total users
    const query = "SELECT COUNT(DISTINCT id) AS totalUsers FROM farmeraccounts";
  
    sqldb.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching total users:', err);
        return res.status(500).json({ error: 'Failed to fetch total users' });
      }
  
      // Send the total number of users as a response
      res.status(200).json({ totalUsers: results[0].totalUsers });
    });
};


//----------------------------------------------------------------------------------------


// Function to fetch the count of pending fertilizer requests
// Get fertilizer requests
export const getTeaPacketsRequests = (req, res) => {
    const query = `
      SELECT 
        tpr.request_id,
        tpr.userId,
        tpr.teaPacketType,
        tpr.teaPacketSize,
        tpr.amount,
        tpr.requestDate,
        tpr.status,
        tpr.paymentOption,
        fa.userName
      FROM tea_packet_requests tpr
      JOIN farmeraccounts fa ON tpr.userId = fa.userId
      ORDER BY tpr.requestDate DESC;
    `;
  
    sqldb.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching tea packet requests:", err);
        return res.status(500).json({
          status: "Error",
          message: "An error occurred while fetching tea packet requests.",
        });
      }
  
      // Always return 200, even if no results are found
      res.status(200).json({
        status: "Success",
        message: results.length === 0 ? "No tea packet requests found." : "Tea packet requests fetched successfully.",
        teaPacketRequests: results, // This will be an empty array if no results are found
      });
    });
};

// Confirm fertilizer request
export const confirmTeaPackets = async (req, res) => {
    const { requestId } = req.body;
  
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required." });
    }
  
    const sqlQuery = "UPDATE tea_packet_requests SET status = 'Approved' WHERE request_id = ?";
    sqldb.query(sqlQuery, [requestId], (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Tea packet request not found." });
      }
  
      return res.status(200).json({
        status: "Success",
        message: "Tea packet request confirmed successfully.",
      });
    });
};

// Delete fertilizer request
export const deleteTeaPackets = async (req, res) => {
  console.log("Deleting tea packet request:", req.body);
    const { requestId } = req.body;
  
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required." });
    }
  
    const sqlQuery = "UPDATE tea_packet_requests SET status = 'Rejected' WHERE request_id = ?";
    sqldb.query(sqlQuery, [requestId], (err, result) => {
      if (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Tea packet request not found." });
      }
  
      return res.status(200).json({
        status: "Success",
        message: "Tea packet request deleted successfully.",
      });
    });
};

export const searchUsers = async (req, res) => {
      const { term } = req.query;
  
      // Validate search term
      if (!term || term.trim() === '') {
          return res.status(400).json({
              status: "Error",
              message: "Search term is required"
          });
      }
  
      try {
          // Search query using promise wrapper
          const query = `
              SELECT 
                  id,
                  userId,
                  userName,
                  firstName,
                  lastName,
                  address,
                  mobile1,
                  mobile2,
                  gmail,
                  tea_delivery_method
              FROM farmeraccounts
              WHERE 
                  userId LIKE ? OR
                  userName LIKE ? OR
                  firstName LIKE ? OR
                  lastName LIKE ? OR
                  mobile1 LIKE ? OR
                  mobile2 LIKE ?
              LIMIT 10`;
  
          const searchTerm = `%${term}%`;
          
          // Using promise-based query
          const [results] = await sqldb.promise().query(query, [
              searchTerm, searchTerm, searchTerm,
              searchTerm, searchTerm, searchTerm
          ]);
  
          // Format results
          const users = results.map(user => ({
              id: user.id,
              userId: user.userId,
              userName: user.userName,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName,
              address: user.address,
              mobile: user.mobile1,
              alternateMobile: user.mobile2,
              email: user.gmail,
              teaDeliveryMethod: user.tea_delivery_method
          }));
  
          res.status(200).json(users);
  
      } catch (error) {
          console.error("Search error:", error);
          res.status(500).json({
              status: "Error",
              message: "Internal server error"
          });
      }
};


// tra pakets
export const fetchTeaInventory = (req, res) => {
    // Query to get all tea inventory items with their details
    const query = `
        SELECT 
            id,
            tea_type AS teaType,
            packet_size AS packetSize,
            packet_count AS packetCount,
            last_updated AS lastUpdated
        FROM tea_inventory
        ORDER BY tea_type, packet_size
    `;

    sqldb.query(query, (err, results) => {
      console.log("Results:", results)
        if (err) {
            console.error('Error fetching tea inventory:', err);
            return res.status(500).json({ 
                status: "Error",
                message: 'Failed to fetch tea inventory data'
            });
        }

        // Send the inventory data as a response
        res.status(200).json({
            status: "Success",
            inventory: results
        });
    });
};

export const addTeaProduction = (req, res) => {
  const { id, packetCount } = req.body;

  if (!id || !packetCount || packetCount <= 0) {
    return res.status(400).json({ 
      status: "Error", 
      message: "Invalid input data" 
    });
  }

  // First check if the item exists
  const checkQuery = 'SELECT id FROM tea_inventory WHERE id = ?';
  sqldb.query(checkQuery, [id], (err, checkResult) => {
    if (err) {
      console.error("Error checking tea inventory:", err);
      return res.status(500).json({ 
        status: "Error", 
        message: "Server error while checking inventory" 
      });
    }

    if (checkResult.length === 0) {
      return res.status(404).json({ 
        status: "Error", 
        message: "Tea inventory item not found" 
      });
    }

    // Update the inventory
    const updateQuery = `
      UPDATE tea_inventory 
      SET packet_count = packet_count + ?, 
          last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    sqldb.query(updateQuery, [packetCount, id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating tea inventory:", updateErr);
        return res.status(500).json({ 
          status: "Error", 
          message: "Server error while updating inventory" 
        });
      }

      if (updateResult.affectedRows === 1) {
        return res.status(200).json({ 
          status: "Success", 
          message: "Production added successfully" 
        });
      } else {
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to update inventory" 
        });
      }
    });
  });
};

export const distributeTea = (req, res) => {
  const { distributions } = req.body;
  
  if (!distributions || !Array.isArray(distributions) || distributions.length === 0) {
      return res.status(400).json({
          status: "Error",
          message: "Invalid distribution data"
      });
  }

  // Start transaction
  sqldb.beginTransaction(err => {
      if (err) {
          console.error("Error starting transaction:", err);
          return res.status(500).json({
              status: "Error",
              message: "Failed to start transaction"
          });
      }

      const updateQueries = distributions.map(dist => {
          return new Promise((resolve, reject) => {
              const updateQuery = `
                  UPDATE tea_inventory
                  SET packet_count = packet_count - ?
                  WHERE tea_type = ? AND packet_size = ? AND packet_count >= ?
              `;
              
              sqldb.query(
                  updateQuery,
                  [dist.packetCount, dist.teaType, dist.packetSize, dist.packetCount],
                  (err, result) => {
                      if (err) return reject(err);
                      if (result.affectedRows !== 1) {
                          return reject(new Error(`Insufficient stock for ${dist.teaType} ${dist.packetSize}`));
                      }
                      resolve();
                  }
              );
          });
      });

      Promise.all(updateQueries)
          .then(() => {
              sqldb.commit(err => {
                  if (err) {
                      console.error("Error committing transaction:", err);
                      return sqldb.rollback(() => {
                          res.status(500).json({
                              status: "Error",
                              message: "Failed to commit transaction"
                          });
                      });
                  }
                  res.status(200).json({
                      status: "Success",
                      message: "Tea distributed successfully"
                  });
              });
          })
          .catch(error => {
              sqldb.rollback(() => {
                  res.status(400).json({
                      status: "Error",
                      message: error.message || "Distribution failed"
                  });
              });
          });
  });
};


// dashboard data
// Fetch total final tea sack weight for a specific date
export const fetchTotalTeaWeight = (req, res) => {
  const { date } = req.query;
  console.log("Received date:", date);

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const query = `
    SELECT COALESCE(SUM(final_tea_sack_weight), 0) AS totalTeaWeight
    FROM tea_sack_updates
    WHERE date = ?
  `;

  sqldb.query(query, [date], (err, results) => {
    if (err) {
      console.error("Error fetching total tea weight:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    const totalWeight = results[0].totalTeaWeight; // Rename the field here
    res.json({ totalWeight }); // Send the renamed field
  });
};

export const fetchDailyTeaWeights = (req, res) => {
  const { days = 7 } = req.query;
  
  const query = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m-%d') AS date,
      SUM(final_tea_sack_weight) AS totalWeight
    FROM tea_sack_updates
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY date
    ORDER BY date ASC
  `;

  sqldb.query(query, [days], (err, results) => {
    if (err) {
      console.error("Error fetching daily tea weights:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
};

export const fetchWeeklyTeaWeights = (req, res) => {
  const { weeks = 8 } = req.query;
  
  const query = `
    SELECT 
      YEAR(date) AS year,
      WEEK(date) AS week,
      CONCAT(YEAR(date), '-W', LPAD(WEEK(date), 2, '0')) AS weekLabel,
      SUM(final_tea_sack_weight) AS totalWeight
    FROM tea_sack_updates
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)
    GROUP BY year, week
    ORDER BY year, week ASC
  `;

  sqldb.query(query, [weeks], (err, results) => {
    if (err) {
      console.error("Error fetching weekly tea weights:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
};

export const fetchMonthlyTeaWeights = (req, res) => {
  const { months = 12 } = req.query;
  
  const query = `
    SELECT 
      YEAR(date) AS year,
      MONTH(date) AS month,
      DATE_FORMAT(date, '%Y-%m') AS monthLabel,
      SUM(final_tea_sack_weight) AS totalWeight
    FROM tea_sack_updates
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    GROUP BY year, month
    ORDER BY year, month ASC
  `;

  sqldb.query(query, [months], (err, results) => {
    if (err) {
      console.error("Error fetching monthly tea weights:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
};

export const fetchYearlyTeaWeights = (req, res) => {
  const { years = 5 } = req.query;
  
  const query = `
    SELECT 
      YEAR(date) AS year,
      SUM(final_tea_sack_weight) AS totalWeight
    FROM tea_sack_updates
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)
    GROUP BY year
    ORDER BY year ASC
  `;

  sqldb.query(query, [years], (err, results) => {
    if (err) {
      console.error("Error fetching yearly tea weights:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(results);
  });
};


// Get notifications for admin
export const getNotifications = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE receiver_type = 'admin' 
      ORDER BY created_at DESC
      LIMIT 20
    `;

    sqldb.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching notifications:", err);
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to fetch notifications" 
        });
      }
      
      return res.status(200).json({
        status: "Success",
        notifications: results
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      status: "Error", 
      message: "An unexpected error occurred" 
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE receiver_type = 'admin' AND is_read = FALSE
    `;

    sqldb.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching unread count:", err);
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to fetch unread count" 
        });
      }
      
      return res.status(200).json({
        status: "Success",
        count: results[0].count
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      status: "Error", 
      message: "An unexpected error occurred" 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { notificationId } = req.body;
  
  if (!notificationId) {
    return res.status(400).json({ 
      status: "Error", 
      message: "Notification ID is required" 
    });
  }

  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
    `;

    sqldb.query(query, [notificationId], (err, result) => {
      if (err) {
        console.error("Error updating notification:", err);
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to mark notification as read" 
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: "Error",
          message: "Notification not found"
        });
      }
      
      return res.status(200).json({
        status: "Success",
        message: "Notification marked as read"
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      status: "Error", 
      message: "An unexpected error occurred" 
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE receiver_type = 'admin' AND is_read = FALSE
    `;

    sqldb.query(query, (err, result) => {
      if (err) {
        console.error("Error updating notifications:", err);
        return res.status(500).json({ 
          status: "Error", 
          message: "Failed to mark notifications as read" 
        });
      }
      
      return res.status(200).json({
        status: "Success",
        message: "All notifications marked as read",
        updatedCount: result.affectedRows
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      status: "Error", 
      message: "An unexpected error occurred" 
    });
  }
};
