//controllers/adminControllers.js

import sqldb from '../config/sqldb.js';

export const getAdvanceRequests = async (req, res) => {
    console.log("Fetching advance requests...");

    try {
        // Query to fetch all advance requests with farmer's name
        const sqlQuery = `
            SELECT 
                ap.advn_id, 
                ap.userId, 
                fa.firstName, 
                fa.lastName, 
                ap.amount, 
                ap.date, 
                ap.action
            FROM 
                advance_payment ap
            INNER JOIN 
                farmeraccounts fa
            ON 
                ap.userId = fa.userId
        `;
        sqldb.query(sqlQuery, (err, results) => {
            // console.log(results)
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            // Return the list of advance requests with farmer's name
            return res.status(200).json({
                status: "Success",
                advanceRequests: results,
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};

export const confirmAdvance = async (req, res) => {
    console.log("Confirming advance request:", req.body);

    const { advanceId } = req.body;
    console.log(advanceId)
    // Validate required fields
    if (!advanceId) {
        return res.status(400).json({ message: 'Advance ID is required.' });
    }

    try {
        // Query to update the action to "Approved"
        const sqlQuery = "UPDATE advance_payment SET action = 'Approved' WHERE advn_id = ?";
        sqldb.query(sqlQuery, [advanceId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Advance request not found.' });
            }

            // Success response
            return res.status(200).json({
                status: "Success",
                message: "Advance request confirmed successfully.",
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};

export const deleteAdvance = async (req, res) => {
    console.log("Deleting advance request:", req.body);

    const { advanceId } = req.body;

    // Validate required fields
    if (!advanceId) {
        return res.status(400).json({ message: 'Advance ID is required.' });
    }

    try {
        // Query to update the action to "Rejected"
        const sqlQuery = "UPDATE advance_payment SET action = 'Rejected' WHERE advn_id = ?";
        sqldb.query(sqlQuery, [advanceId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Advance request not found.' });
            }

            // Success response
            return res.status(200).json({
                status: "Success",
                message: "Advance request deleted successfully.",
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};


//----------------------------------------------------------------------------------------


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

        // Success response
        return res.status(200).json({
          status: "Success",
          message: "Tea sack data submitted successfully.",
          teaSackId: result.insertId
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