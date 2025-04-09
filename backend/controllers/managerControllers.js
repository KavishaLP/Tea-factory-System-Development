//controllers/managerControllers.js

import bcrypt from 'bcryptjs';
import util from 'util';
import sqldb from '../config/sqldb.js';
import moment  from 'moment-timezone';
import nodemailer from 'nodemailer'; // make sure you import it at the top


const query = util.promisify(sqldb.query).bind(sqldb);

//---------------------------------------------------------------------------------------------------




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

// Get payment history function (Approved only)
export const getFarmerPaymentHistory = (req, res) => {
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


// Get fertilizer requests
export const getFertilizerRequests = (req, res) => {
    // Updated query to fetch fertilizer request + fertilizer details
    const query = `
      SELECT 
        fr.request_id,
        fr.userId,
        fr.fertilizer_veriance_id,
        fr.amount,
        fr.requestDate,
        fr.status,
        fr.paymentOption,
        fa.userName,
        fp.fertilizerType,
        fp.packetType,
        fp.price
      FROM fertilizer_requests fr
      JOIN farmeraccounts fa ON fr.userId = fa.userId
      JOIN fertilizer_prices fp ON fr.fertilizer_veriance_id = fp.fertilizer_veriance_id
      ORDER BY fr.requestDate DESC;
    `;

    // Execute the query
    sqldb.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching fertilizer requests:", err);
        return res.status(500).json({
          status: "Error",
          message: "An error occurred while fetching fertilizer requests.",
        });
      }

      // Check if requests exist
      if (results.length === 0) {
        return res.status(404).json({
          status: "Success",
          message: "No fertilizer requests found.",
          fertilizerRequests: [],
        });
      }

      // Return the fetched requests
      res.status(200).json({
        status: "Success",
        message: "Fertilizer requests fetched successfully.",
        fertilizerRequests: results,
      });
    });
};

// Approve fertilizer request and send email
export const confirmFertilizer = async (req, res) => {
    console.log("Confirming fertilizer request:", req.body);

    const { requestId } = req.body;

    if (!requestId) {
        return res.status(400).json({ message: "Request ID is required." });
    }

    try {
        const sqlQuery = "UPDATE fertilizer_requests SET status = 'Approved' WHERE request_id = ?";
        sqldb.query(sqlQuery, [requestId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Fertilizer request not found." });
            }

            // After approving, get user's email
            const getEmailQuery = `
                SELECT fa.gmail 
                FROM fertilizer_requests fr
                JOIN farmeraccounts fa ON fr.userId = fa.userId
                WHERE fr.request_id = ?
            `;
            sqldb.query(getEmailQuery, [requestId], (emailErr, emailResults) => {
                if (emailErr) {
                    console.error("Error fetching user email:", emailErr);
                    return res.status(500).json({ message: "Error fetching user email", error: emailErr });
                }

                if (emailResults.length === 0) {
                    return res.status(404).json({ message: "User email not found." });
                }

                const userEmail = emailResults[0].gmail;

                if (!userEmail) {
                    // User doesn't have an email -> just return success (no mail sending)
                    return res.status(200).json({
                        status: "Success",
                        message: "Fertilizer request confirmed successfully. (No email sent - user has no email)",
                    });
                }

                // Setup nodemailer transporter
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });

                // Email content
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: 'Tea Factory Fertilizer Request Approved',
                    text: `Dear Farmer,

Your fertilizer request has been approved successfully.

Please follow the next steps as informed by the Tea Factory.

Thank you,
Tea Factory Management`,
                };

                transporter.sendMail(mailOptions, (mailErr, info) => {
                    if (mailErr) {
                        console.error("Error sending email:", mailErr);
                        return res.status(500).json({ message: "Error sending email", error: mailErr });
                    }

                    return res.status(200).json({
                        status: "Success",
                        message: "Fertilizer request confirmed and email notification sent successfully.",
                    });
                });
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: "An unexpected error occurred.", error: error });
    }
};

// Delete fertilizer request
export const deleteFertilizer = async (req, res) => {
    console.log("Deleting fertilizer request:", req.body);

    const { requestId } = req.body;

    if (!requestId) {
        return res.status(400).json({ message: "Request ID is required." });
    }

    try {
        const sqlQuery = "UPDATE fertilizer_requests SET status = 'Rejected' WHERE request_id = ?";
        sqldb.query(sqlQuery, [requestId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Fertilizer request not found." });
            }

            // After rejecting, get user's email
            const getEmailQuery = `
                SELECT fa.gmail 
                FROM fertilizer_requests fr
                JOIN farmeraccounts fa ON fr.userId = fa.userId
                WHERE fr.request_id = ?
            `;
            sqldb.query(getEmailQuery, [requestId], (emailErr, emailResults) => {
                if (emailErr) {
                    console.error("Error fetching user email:", emailErr);
                    return res.status(500).json({ message: "Error fetching user email", error: emailErr });
                }

                if (emailResults.length === 0) {
                    return res.status(404).json({ message: "User email not found." });
                }

                const userEmail = emailResults[0].gmail;

                if (!userEmail) {
                    // User has no email -> just return success
                    return res.status(200).json({
                        status: "Success",
                        message: "Fertilizer request rejected successfully. (No email sent - user has no email)",
                    });
                }

                // If user has email -> send rejection email
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: 'Tea Factory Fertilizer Request Update',
                    text: `Dear Farmer,\n\nWe regret to inform you that your fertilizer request has been rejected.\n\nPlease contact the Tea Factory for more details if needed.\n\nThank you.`,
                };

                transporter.sendMail(mailOptions, (mailErr, info) => {
                    if (mailErr) {
                        console.error("Error sending rejection email:", mailErr);
                        // Even if email fails, we still treat the request as rejected
                        return res.status(200).json({
                            status: "Success",
                            message: "Fertilizer request rejected successfully. (Failed to send email)",
                        });
                    }

                    return res.status(200).json({
                        status: "Success",
                        message: "Fertilizer request rejected successfully and email notification sent.",
                    });
                });
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: "An unexpected error occurred.", error: error });
    }
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
            SELECT userId as id 
            FROM farmeraccounts 
            WHERE userId LIKE ?
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

// Get details related to user
export const getDEtailsRelatedTOUser = async (req, res) => {
  const { userId } = req.body;
  
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

