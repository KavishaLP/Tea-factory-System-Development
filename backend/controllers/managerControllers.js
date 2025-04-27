//controllers/managerControllers.js

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
        // Query to get the fertilizer request details along with the price information and created_at date
        const getFertilizerDetailsQuery = `
            SELECT fr.userId, fr.amount, fp.price, fr.created_at
            FROM fertilizer_requests fr
            JOIN fertilizer_prices fp ON fr.fertilizer_veriance_id = fp.fertilizer_veriance_id
            WHERE fr.request_id = ? AND fr.status = 'Pending'
        `;
        sqldb.query(getFertilizerDetailsQuery, [requestId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Fertilizer request not found or already processed." });
            }

            const { userId, amount, price, created_at } = result[0];

            // Calculate the total fertilizer amount
            const totalFertilizerAmount = amount * price;

            // Extract the year and month from the created_at field
            const createdDate = new Date(created_at);
            const requestYear = createdDate.getFullYear();
            const requestMonth = createdDate.getMonth() + 1; // Months are 0-based, so adding 1

            // Update fertilizer request status to 'Approved'
            const updateRequestQuery = "UPDATE fertilizer_requests SET status = 'Approved' WHERE request_id = ?";
            sqldb.query(updateRequestQuery, [requestId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating fertilizer request status:", updateErr);
                    return res.status(500).json({ message: "Error updating fertilizer request status", error: updateErr });
                }

                // Now update the farmer_payments table with the fertilizer cost for the correct month and year
                const updatePaymentQuery = `
                    INSERT INTO farmer_payments (userId, fertilizer, year, month, created_at)
                    VALUES (?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE fertilizer = fertilizer + ?;
                `;
                sqldb.query(updatePaymentQuery, [userId, totalFertilizerAmount, requestYear, requestMonth, totalFertilizerAmount], (paymentErr, paymentResult) => {
                    if (paymentErr) {
                        console.error("Error updating farmer payments:", paymentErr);
                        return res.status(500).json({ message: "Error updating farmer payments", error: paymentErr });
                    }

                    // Fetch the user's email for the notification
                    const getEmailQuery = `
                        SELECT fa.gmail 
                        FROM farmeraccounts fa
                        WHERE fa.userId = ?
                    `;
                    sqldb.query(getEmailQuery, [userId], (emailErr, emailResults) => {
                        if (emailErr) {
                            console.error("Error fetching user email:", emailErr);
                            return res.status(500).json({ message: "Error fetching user email", error: emailErr });
                        }

                        if (emailResults.length === 0) {
                            return res.status(404).json({ message: "User email not found." });
                        }

                        const userEmail = emailResults[0].gmail;

                        if (!userEmail) {
                            // User doesn't have an email, just return success
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

Total Amount: ${totalFertilizerAmount.toFixed(2)}.

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


//-------------------------------------------------
//-----------------------------------------------

// Function to initialize empty payment records every month start
export const initializeMonthlyPayments = async (req, res) => {
    try {
      // Fetch all farmer userIds
      const [farmers] = await sqldb.promise().query('SELECT userId FROM farmeraccounts');
  
      if (farmers.length === 0) {
        return res.status(404).json({ message: 'No farmers found to initialize payments.' });
      }
  
      // Prepare insert values
      const paymentValues = farmers.map(farmer => [
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
  
      await sqldb.promise().query(insertQuery, [paymentValues]);
  
      return res.status(200).json({ message: 'Monthly payment records initialized successfully.' });
    } catch (error) {
      console.error('Error initializing monthly payments:', error);
      return res.status(500).json({ message: 'Server error while initializing payments.', error: error.message });
    }
};

// Fetch payments history function
export const fetchPaymentsHistory = async (req, res) => {
    try {
      // Extract month and year from query parameters
      const { month, year } = req.query;
  
      // Validate if month and year are provided
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }
  
      // Query to get payments history for the specific month and year
      const query = `
        SELECT * FROM farmer_payments 
        WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND status = 'Pending'
      `;
      const [payments] = await sqldb.promise().query(query, [month, year]);
  
      // Check if there are payments, and return appropriate response
      if (payments.length > 0) {
        res.status(200).json(payments);
      } else {
        res.status(200).json([]); // Send empty array if no records found
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Error fetching payment history.' });
    }
};
  



