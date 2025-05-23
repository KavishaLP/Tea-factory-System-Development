//controllers/managerControllers_1.js

import bcrypt from 'bcryptjs';
import util from 'util';
import sqldb from '../config/sqldb.js';
import moment  from 'moment-timezone';
import nodemailer from 'nodemailer'; // make sure you import it at the top


const query = util.promisify(sqldb.query).bind(sqldb);

//---------------------------------------------------------------------------------------------------

export const addFarmer = async (req, res) => {
    console.log("Received Data:", req.body);

    const { userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password, reenterPassword } = req.body;

    if (!userId || !userName || !firstName || !lastName || !address || !mobile1 || !gmail || !password || !reenterPassword) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    if (password !== reenterPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ? OR gmail = ? OR userName = ?";
    sqldb.query(sqlCheck, [userId, gmail, userName], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Farmer with this user ID, email, or username already exists.' });
        }

        bcrypt.hash(password, 10)
            .then((hashedPassword) => {
                const sqlInsert = `
                    INSERT INTO farmeraccounts 
                    (userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                sqldb.query(sqlInsert, [userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, hashedPassword], (err, result) => {
                    if (err) {
                        console.error("Database Insert Error:", err);
                        return res.status(500).json({ message: 'Error inserting farmer data into database', error: err });
                    }

                    // If gmail is provided, send email
                    if (gmail) {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: process.env.MAIL_SENDER,
                                pass: process.env.MAIL_APP_PASSWORD,
                            },
                        });

                        const mailOptions = {
                            from: process.env.MAIL_SENDER,
                            to: gmail,
                            subject: "Your Farmer Account Created - Tea Factory",
                            html: `
                                <p>Dear ${firstName} ${lastName},</p>
                                <p>Your farmer account has been successfully created with our Tea Factory Management System.</p>
                                <p><strong>Username:</strong> ${userName}</p>
                                <p>You can now access the system and manage your fertilizer requests and other services easily.</p>
                                <br/>
                                <p>Thank you for joining us!</p>
                                <p>Tea Factory Team</p>
                            `,
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error sending email:', error);
                                // Do not fail, just log and continue
                            } else {
                                console.log('Email sent:', info.response);
                            }
                        });
                    }

                    return res.status(200).json({ message: 'Farmer account created successfully', farmerId: result.insertId });
                });
            })
            .catch((err) => {
                console.error("Password Hashing Error:", err);
                return res.status(500).json({ message: 'Error hashing password', error: err });
            });
    });
};

// Add payment function
export const addFarmerPayment = (req, res) => {
    const {
        userId,
        paymentPerKilo,
        finalTeaKilos,
        paymentForFinalTeaKilos,
        additionalPayments,
        transport,
        directPayments,
        finalAmount,
        advances,
        teaPackets,
        fertilizer,
        finalPayment
    } = req.body;

    console.log("Received formData:", req.body);

    // Validate input
    if (
        !userId ||
        !paymentPerKilo ||
        !finalTeaKilos ||
        !paymentForFinalTeaKilos ||
        !finalAmount ||
        !finalPayment
    ) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // SQL Query to insert payment data into the farmer_payments table
    const sql = `
        INSERT INTO farmer_payments (
            userId, 
            paymentPerKilo, 
            finalTeaKilos, 
            paymentForFinalTeaKilos, 
            additionalPayments, 
            transport, 
            directPayments, 
            finalAmount, 
            advances, 
            teaPackets, 
            fertilizer, 
            finalPayment
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        userId,
        paymentPerKilo,
        finalTeaKilos,
        paymentForFinalTeaKilos,
        additionalPayments || 0,
        transport || 0,
        directPayments || 0,
        finalAmount,
        advances || 0,
        teaPackets || 0,
        fertilizer || 0,
        finalPayment
    ];

    // Execute the query to insert the payment details
    sqldb.query(sql, values, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Error while saving payment data', error: err });
        }

        console.log("Payment added successfully:", results);

        // Send success response
        return res.status(200).json({ Status: "Success", message: "Payment added successfully!" });
    });
};

export const getAllFarmers = (req, res) => {
    const query = 'SELECT * FROM farmeraccounts';
  
    sqldb.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching farmer accounts:', err);
        return res.status(500).json({ status: 'error', message: 'Database query failed.' });
      }
  
      res.status(200).json({ status: 'success', data: results });
    });
};

// Get details related to user
export const getDEtailsRelatedTOUser = async (req, res) => {
    const { userId } = req.body;
    console.log("Fetching details related to user:", userId);
    
    if (!userId) {
      return res.status(400).json({ Status: 'Error', Error: 'userId is required' });
    }
  
    try {
      // Get current month's start and end dates, converted to the Asia/Colombo timezone
      const now = moment().tz("Asia/Colombo"); // Get current time in Asia/Colombo timezone
      const firstDay = moment().tz("Asia/Colombo").startOf('month').format("YYYY-MM-DD");
      const lastDay = moment().tz("Asia/Colombo").endOf('month').format("YYYY-MM-DD");
  
      // Query 1: Sum of final_tea_sack_weight for the user in the selected month
      const teaSackWeightQuery = `
        SELECT SUM(final_tea_sack_weight) AS totalTeaSackWeight
        FROM tea_sack_updates
        WHERE userId = ? AND date BETWEEN ? AND ?
      `;
  
      // Query 2: Get the tea_delivery_method from farmeraccounts table for transport calculation
      const farmerAccountQuery = `
        SELECT tea_delivery_method
        FROM farmeraccounts
        WHERE userId = ?
      `;
  
      // Query 3: Sum of advance payments (approved ones) for the user in the selected month
      const advancePaymentQuery = `
        SELECT SUM(amount) AS advances
        FROM advance_payment
        WHERE userId = ? AND action = 'Approved' AND date BETWEEN ? AND ?
      `;
  
      // Query 4: Sum of tea packet request amounts for the user in the selected month
      const teaPacketRequestQuery = `
        SELECT SUM(amount) AS totalTeaPacketAmount
        FROM tea_packet_requests
        WHERE userId = ? AND requestDate BETWEEN ? AND ?
      `;
  
      // Start by querying the tea_sack_updates table
      sqldb.query(teaSackWeightQuery, [userId, firstDay, lastDay], (err, teaSackResults) => {
        if (err) {
          console.error("Database Error (tea sack weight):", err);
          return res.status(500).json({ Status: 'Error', Error: 'Database error' });
        }
  
        // Query farmeraccounts table for the tea_delivery_method
        sqldb.query(farmerAccountQuery, [userId], (err, farmerResults) => {
          if (err) {
            console.error("Database Error (farmer accounts):", err);
            return res.status(500).json({ Status: 'Error', Error: 'Database error' });
          }
  
          const teaDeliveryMethod = farmerResults[0]?.tea_delivery_method;
          const finalTeaKilos = teaSackResults[0]?.totalTeaSackWeight || 0;
          
          // Calculate transport cost based on tea_delivery_method
          let transport = 0;
          if (teaDeliveryMethod === 'factory_vehicle') {
            transport = 0;
          } else if (teaDeliveryMethod === 'farmer_vehicle') {
            transport = finalTeaKilos * 12; // Multiply final_tea_sack_weight by 12
          }
  
          // Query for advance payments
          sqldb.query(advancePaymentQuery, [userId, firstDay, lastDay], (err, advanceResults) => {
            if (err) {
              console.error("Database Error (advance payments):", err);
              return res.status(500).json({ Status: 'Error', Error: 'Database error' });
            }
  
            // Query for tea packet request amounts
            sqldb.query(teaPacketRequestQuery, [userId, firstDay, lastDay], (err, packetResults) => {
              if (err) {
                console.error("Database Error (tea packet requests):", err);
                return res.status(500).json({ Status: 'Error', Error: 'Database error' });
              }
  
              // Get values from results
              const advances = advanceResults[0]?.advances || 0;
              const totalTeaPacketAmount = packetResults[0]?.totalTeaPacketAmount || 0;
  
              // Send the final response
              res.json({
                Status: 'Success',
                finalTeaKilos,
                transport,
                advances,
              });
            });
          });
        });
      });
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ Status: 'Error', Error: 'Internal server error' });
    }
};

export const getDEtailsRelatedTOUser1 = (req, res) => {
    console.log("Fetching details related to user:", req.body);
    const { userId, month, year } = req.query;

    // Check if all required query params are present
    if (!userId || !month || !year) {
        return res.status(400).json({ message: "userId, month, and year are required" });
    }

    // SQL query
    const sql = `
        SELECT *
        FROM farmer_payments
        WHERE userId = ?
        AND MONTH(created_at) = ?
        AND YEAR(created_at) = ?
    `;

    db.query(sql, [userId, month, year], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ message: "Database query error", error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No payment details found for this user in the given month and year" });
        }

        res.status(200).json({ data: results });
    });
};

//---------------------------------------------------------------------------------------------------

export const addEmployee = async (req, res) => {
    try {
        const { userId, firstName, lastName, mobile1, mobile2 } = req.body;

        // Validate required fields
        if (!userId || !firstName || !lastName || !mobile1) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: userId, firstName, lastName, mobile1'
            });
        }

        // Check if employee exists
        const existing = await query(
            "SELECT userId FROM employeeaccounts WHERE userId = ?", 
            [userId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Employee with this ID already exists'
            });
        }

        // Insert new employee
        const result = await query(
            "INSERT INTO employeeaccounts (userId, firstName, lastName, mobile1, mobile2) VALUES (?, ?, ?, ?, ?)",
            [userId, firstName, lastName, mobile1, mobile2 || null]
        );

        // Get the newly created employee
        const newEmployee = await query(
            "SELECT id, userId, firstName, lastName, mobile1, mobile2 FROM employeeaccounts WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            data: newEmployee[0]
        });
    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to add employee',
            error: error.message
        });
    }
};

export const getAllEmployers = async (req, res) => {
    console.log("Fetching all employee accounts", req.body);
    try {
        const sql = `
            SELECT 
                id,
                userId,
                firstName,
                lastName,
                mobile1,
                mobile2,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM employeeaccounts
            ORDER BY created_at DESC
        `;
        
        const results = await query(sql);
        
        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (error) {
        console.error("Error fetching employee accounts:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee accounts',
            error: error.message
        });
    }
};

export const addEmployeePayment = (req, res) => {
    const {
        userId,
        salaryAmount,
        additionalPayments,
        deductions,
        finalPayment
    } = req.body;

    console.log("Received formData:", req.body);

    // Validate required fields
    if (!userId || !salaryAmount || !finalPayment) {
        return res.status(400).json({ message: 'User ID, Salary Amount, and Final Payment are required.' });
    }

    // SQL Query to insert payment data into the employee_payments table
    const sql = `
        INSERT INTO employee_payments (
            userId, 
            salaryAmount, 
            additionalPayments, 
            deductions, 
            finalPayment
        ) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        userId,
        salaryAmount,
        additionalPayments || 0, // Default to 0 if not provided
        deductions || 0,         // Default to 0 if not provided
        finalPayment
    ];

    // Execute the query
    sqldb.query(sql, values, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Error while saving payment data', error: err });
        }

        console.log("Employee payment added successfully:", results);

        // Send success response
        return res.status(200).json({ status: "Success", message: "Employee payment added successfully!" });
    });
};

export const getEmployeePaymentHistory = (req, res) => {
    // SQL Query to fetch payment history from the employee_payments table
    const sql = `
        SELECT 
            userId,
            salaryAmount,
            additionalPayments,
            deductions,
            finalPayment,
            createdAt
        FROM employee_payments 
        ORDER BY createdAt DESC
    `;

    // Execute the query to fetch the payment history
    sqldb.query(sql, (err, results) => {
        console.log(results)
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Error while fetching payment history', error: err });
        }

        // Check if there are any records found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No payment history found.' });
        }

        console.log("Payment history fetched successfully:", results);

        // Send the fetched data as a response
        return res.status(200).json({ Status: "Success", paymentHistory: results });
    });
};

//---------------------------------------------------------------------------------------------------

// Backend function to search farmers by ID only
export const searchFarmersInDB = async (req, res) => {
    
    const date = moment().tz("Asia/Colombo").format("YYYY-MM-DD HH:mm:ss");
    console.log(date); // Outputs time in your timezone
    
    // console.log("Searching Farmers:", req.body);
    const { query } = req.body;
    
    // Validate query exists and is at least 2 characters
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ 
            Status: 'Error', 
            Error: 'Search query must be at least 2 characters long' 
        });
    }

    try {
        const searchTerm = `%${query}%`;
        
        // Search only by userId (case insensitive)
        const sql = `
            SELECT userId as id, firstName, lastName
            FROM farmeraccounts 
            WHERE userName OR firstName OR lastName LIKE ?
            ORDER BY userId
            LIMIT 10
        `;

        
        sqldb.query(sql, [searchTerm], (err, results) => {
            if (err) {
                console.error("Database Search Error:", err);
                return res.status(500).json({ 
                    Status: 'Error', 
                    Error: 'Database search error' 
                });
            }

            return res.json({ 
                Status: 'Success', 
                farmers: results 
            });
        });
    } catch (error) {
        console.error("Search Farmers Error:", error);
        return res.status(500).json({ 
            Status: 'Error', 
            Error: 'Internal server error' 
        });
    }
};

// Backend function to search Employees by ID only
export const searchEmployeesInDB = async (req, res) => {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ 
            Status: 'Error', 
            Error: 'Search query must be at least 2 characters long' 
        });
    }

    try {
        const searchTerm = `%${query}%`;
        
        const sql = `
            SELECT userId, firstName, lastName 
            FROM employeeaccounts 
            WHERE userId LIKE ? OR firstName LIKE ? OR lastName LIKE ?
            ORDER BY userId
            LIMIT 10
        `;
        
        sqldb.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
            if (err) {
                console.error("Database Search Error:", err);
                return res.status(500).json({ 
                    Status: 'Error', 
                    Error: 'Database search error' 
                });
            }

            return res.json({ 
                Status: 'Success', 
                employees: results 
            });
        });
    } catch (error) {
        console.error("Search Employees Error:", error);
        return res.status(500).json({ 
            Status: 'Error', 
            Error: 'Internal server error' 
        });
    }
};

// Fetch payments history function
export const fetchToPayments = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ 
                success: false,
                message: 'Month and year are required as query parameters' 
            });
        }

        const monthInt = parseInt(month);
        const yearInt = parseInt(year);

        if (isNaN(monthInt) || isNaN(yearInt)) {
            return res.status(400).json({
                success: false,
                message: 'Month and year must be valid numbers'
            });
        }

        const query = `
            SELECT * FROM farmer_payments 
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? 
            AND status = 'Pending'
            ORDER BY created_at DESC
        `;
        
        const [payments] = await sqldb.promise().query(query, [monthInt, yearInt]);

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching TO payments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching payment history'
        });
    }
};

// Get payment history function (Approved only)
export const fectchpaymentHistory = (req, res) => {
    console.log("Fetching hhhhh payment history:", req.body);
    // SQL Query to fetch only approved payment history
    const sql = `
        SELECT 
            userId, 
            paymentPerKilo, 
            finalTeaKilos, 
            paymentForFinalTeaKilos, 
            additionalPayments, 
            transport, 
            directPayments, 
            finalAmount, 
            advances, 
            teaPackets, 
            fertilizer, 
            finalPayment, 
            created_at 
        FROM farmer_payments 
        WHERE status = 'Approved' 
        ORDER BY created_at DESC
    `;

    // Execute the query to fetch the approved payment history
    sqldb.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ message: 'Error while fetching payment history', error: err });
        }

        // Check if there are any approved records found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No approved payment history found.' });
        }

        console.log("Approved payment history fetched successfully:", results);

        // Send the fetched data as a response
        return res.status(200).json({ Status: "Success", paymentHistory: results });
    });
};

// Fetch tea price for specific month/year
export const fetchTeaPrice = async (req, res) => {
    try {
        const { month_year } = req.query;

        if (!month_year) {
            return res.status(400).json({ 
                success: false,
                message: 'Month_year parameter is required' 
            });
        }

        const query = `
            SELECT price FROM tea_price_per_kilo 
            WHERE month_year = ?
        `;
        
        const [result] = await sqldb.promise().query(query, [month_year]);

        if (result.length > 0) {
            res.status(200).json({ price: result[0].price });
        } else {
            res.status(200).json({ price: null });
        }
    } catch (error) {
        console.error('Error fetching tea price:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching tea price'
        });
    }
};

// Update or create tea price
export const updateTeaPrice = async (req, res) => {
    try {
        const { price, month_year } = req.body;
        console.log("Received formData:", req.body);
        if (!price || !month_year) {
            return res.status(400).json({ 
                success: false,
                message: 'Price and month_year are required' 
            });
        }

        const priceFloat = parseFloat(price);
        if (isNaN(priceFloat) || priceFloat <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Price must be a positive number' 
            });
        }

        const query = `
            INSERT INTO tea_price_per_kilo (price, month_year)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE price = ?
        `;
        
        await sqldb.promise().query(query, [priceFloat, month_year, priceFloat]);

        res.status(200).json({ 
            success: true,
            message: 'Tea price updated successfully'
        });
    } catch (error) {
        console.error('Error updating tea price:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating tea price'
        });
    }
};

// Approve a payment
// Approve a payment
export const approvePayment = async (req, res) => {
    try {
        const { paymentId, finalPayment } = req.body;

        if (!paymentId) {
            return res.status(400).json({ 
                success: false,
                message: 'Payment ID is required' 
            });
        }

        if (finalPayment === undefined || finalPayment === null) {
            return res.status(400).json({
                success: false,
                message: 'Final payment amount is required'
            });
        }

        const query = `
            UPDATE farmer_payments
            SET status = 'Approved', finalPayment = ?
            WHERE id = ?
        `;
        
        const [result] = await sqldb.promise().query(query, [finalPayment, paymentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Payment not found' 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: 'Payment approved successfully'
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while approving payment'
        });
    }
};


//dashboard related functions
export const fetchTeaPriceHistory = async (req, res) => {
  try {
    const query = `
      SELECT month_year, price 
      FROM tea_price_per_kilo 
      ORDER BY month_year ASC 
      LIMIT 12
    `;
    
    sqldb.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const fetchTotalEmployees = async (req, res) => {
  try {
    const query = "SELECT COUNT(*) as totalEmployees FROM employeeaccounts";
    sqldb.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json({ totalEmployees: results[0].totalEmployees });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const fetchFertilizerDetails = async (req, res) => {
  try {
    const query = `
      SELECT 
        fertilizerType,
        packetType,
        price
      FROM fertilizer_prices
      ORDER BY fertilizerType, packetType
    `;
    
    sqldb.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const fetchTeaInventory = async (req, res) => {
  try {
    const query = `
      SELECT 
        tea_type,
        packet_size,
        packet_count,
        last_updated
      FROM tea_inventory
      ORDER BY tea_type, packet_size
    `;
    
    sqldb.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notifications for manager
export const getManagerNotifications = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE receiver_type = 'manager' 
      ORDER BY created_at DESC
      LIMIT 20
    `;

    sqldb.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching manager notifications:", err);
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

// Get unread notification count for manager
export const getManagerUnreadCount = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE receiver_type = 'manager' AND is_read = FALSE
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

// Mark notification as read for manager
export const markManagerNotificationAsRead = async (req, res) => {
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
      WHERE id = ? AND receiver_type = 'manager'
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
          message: "Notification not found or not for manager"
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

// Mark all notifications as read for manager
export const markAllManagerNotificationsAsRead = async (req, res) => {
  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE receiver_type = 'manager' AND is_read = FALSE
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

//---------------------------------------------------------------
//---------------------------------------------------------------

// Function to initialize empty payment records every month start
export const initializeMonthlyPayments = async (req, res) => {
  try {
    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    console.log(`Initializing monthly payments for ${currentMonth}/${currentYear}`);

    // Fetch all farmer userIds
    const [farmers] = await sqldb.promise().query('SELECT userId FROM farmeraccounts');

    if (farmers.length === 0) {
      return res.status(404).json({ message: 'No farmers found to initialize payments.' });
    }

    // Check which farmers already have records for this month
    const checkQuery = `
      SELECT userId 
      FROM farmer_payments 
      WHERE MONTH(created_at) = ? 
      AND YEAR(created_at) = ?
    `;
    
    const [existingRecords] = await sqldb.promise().query(checkQuery, [currentMonth, currentYear]);
    
    // Create a Set of userIds who already have records for easier lookup
    const existingUserIds = new Set(existingRecords.map(record => record.userId));
    
    // Filter out farmers who already have records
    const farmersToAdd = farmers.filter(farmer => !existingUserIds.has(farmer.userId));
    
    if (farmersToAdd.length === 0) {
      return res.status(200).json({ 
        message: 'All farmers already have payment records for this month.',
        existing: existingUserIds.size,
        added: 0
      });
    }

    // Prepare insert values only for farmers without existing records
    const paymentValues = farmersToAdd.map(farmer => [
      farmer.userId,
      0.00, // paymentPerKilo
      0.00, // finalTeaKilos
      0.00, // paymentForFinalTeaKilos
      0.00, // additionalPayments
      0.00, // transport
      0.00, // directPayments
      0.00, // finalAmount
      0.00, // advances
      0.00, // teaPackets
      0.00, // fertilizer
      0.00, // finalPayment
      'Pending' // status
    ]);

    // Insert query
    const insertQuery = `
      INSERT INTO farmer_payments 
        (userId, paymentPerKilo, finalTeaKilos, paymentForFinalTeaKilos, 
         additionalPayments, transport, directPayments, finalAmount, 
         advances, teaPackets, fertilizer, finalPayment, status)
      VALUES ?
    `;

    // Only execute insert if there are farmers to add
    if (paymentValues.length > 0) {
      await sqldb.promise().query(insertQuery, [paymentValues]);
    }

    return res.status(200).json({ 
      message: 'Monthly payment records initialized successfully.', 
      existing: existingUserIds.size,
      added: farmersToAdd.length
    });
  } catch (error) {
    console.error('Error initializing monthly payments:', error);
    return res.status(500).json({ 
      message: 'Server error while initializing payments.', 
      error: error.message 
    });
  }
};




