// controller/managerControllers_2_fertilizer.js

import sqldb from '../config/sqldb.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

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
        // First get the request details including payment option
        const getRequestQuery = `
            SELECT fr.*, fp.price, fp.fertilizerType, fp.packetType, fr.amount * fp.price AS total_cost, 
                   fa.gmail, fa.firstName, fa.lastName, fa.userId
            FROM fertilizer_requests fr
            JOIN fertilizer_prices fp ON fr.fertilizer_veriance_id = fp.fertilizer_veriance_id
            JOIN farmeraccounts fa ON fr.userId = fa.userId
            WHERE fr.request_id = ?
        `;
        
        sqldb.query(getRequestQuery, [requestId], async (err, requestResults) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (requestResults.length === 0) {
                return res.status(404).json({ message: "Fertilizer request not found." });
            }
            console.log("Request results:", requestResults);
            const request = requestResults[0];
            const userEmail = request.gmail;
            const userName = `${request.firstName} ${request.lastName}`;
            const totalCost = parseFloat(request.total_cost);
            const fertilizerDetails = `${request.fertilizerType} (${request.packetType})`;
            const quantity = request.amount;
            const unitPrice = request.price;
            const userId = request.userId;

            // Update request status to Approved
            const updateRequestQuery = "UPDATE fertilizer_requests SET status = 'Approved' WHERE request_id = ?";
            sqldb.query(updateRequestQuery, [requestId], async (updateErr) => {
                if (updateErr) {
                    console.error("Error updating request status:", updateErr);
                    return res.status(500).json({ message: "Error updating request", error: updateErr });
                }

                console.log("Fertilizer request approved successfully.");

                // Create notification record
                const notificationTitle = "Fertilizer Request Approved";
                const notificationMessage = `Your request for ${quantity} packets of ${fertilizerDetails} has been approved. Total cost: Rs.${totalCost.toFixed(2)}. Payment method: ${request.paymentOption === 'deductpayment' ? 'Monthly Payment Deduction' : 'Cash Payment'}.`;
                
                const createNotificationQuery = `
                    INSERT INTO notifications (receiver_id, receiver_type, title, message)
                    VALUES (?, 'farmer', ?, ?)
                `;
                
                sqldb.query(createNotificationQuery, [userId, notificationTitle, notificationMessage], (notifyErr) => {
                    if (notifyErr) {
                        console.error("Error creating notification:", notifyErr);
                        // Continue with the process even if notification creation fails
                    }
                });

                console.log("Sending email notification...");

                // Only update payment record if payment option is 'deductpayment'
                if (request.paymentoption === 'deductpayment') {
                    try {
                        // Calculate 1/3 of the fertilizer cost for each month
                        const fertilizerAmountPerMonth = parseFloat((totalCost / 3).toFixed(2));
                        console.log(`Dividing total fertilizer cost ${totalCost} into 3 monthly installments of ${fertilizerAmountPerMonth}`);
                        
                        // Get current date from request
                        const requestDate = new Date(request.requestDate);
                        const currentMonth = requestDate.getMonth(); // 0-11
                        const currentYear = requestDate.getFullYear();
                        
                        // Array to store the months to process
                        const monthsToProcess = [];
                        
                        // Add current month and next 2 months to the array
                        for (let i = 0; i < 3; i++) {
                            let month = currentMonth + i;
                            let year = currentYear;
                            
                            // Handle year transition
                            if (month > 11) {
                                month = month - 12;
                                year = year + 1;
                            }
                            
                            monthsToProcess.push({
                                month: month + 1, // Convert to 1-12 format for MySQL
                                year: year,
                                firstDayOfMonth: new Date(year, month, 1)
                            });
                        }
                        
                        console.log(`Processing payments for months: ${monthsToProcess.map(m => `${m.month}/${m.year}`).join(', ')}`);
                        
                        // Process each month
                        for (const monthData of monthsToProcess) {
                            // Check if a payment record exists for this month
                            const checkQuery = `
                                SELECT *
                                FROM farmer_payments
                                WHERE userId = ?
                                AND MONTH(created_at) = ?
                                AND YEAR(created_at) = ?
                            `;
                            
                            // Execute the check query
                            const existingRecords = await new Promise((resolve, reject) => {
                                sqldb.query(checkQuery, [userId, monthData.month, monthData.year], (err, results) => {
                                    if (err) {
                                        console.error(`Error checking payment record for ${monthData.month}/${monthData.year}:`, err);
                                        reject(err);
                                    } else {
                                        resolve(results);
                                    }
                                });
                            });
                            
                            if (existingRecords && existingRecords.length > 0) {
                                // Record exists - update only the fertilizer column
                                console.log(`Found existing payment record for ${monthData.month}/${monthData.year}`);
                                
                                const updateQuery = `
                                    UPDATE farmer_payments
                                    SET fertilizer = fertilizer + ?
                                    WHERE userId = ?
                                    AND MONTH(created_at) = ?
                                    AND YEAR(created_at) = ?
                                `;
                                
                                await new Promise((resolve, reject) => {
                                    sqldb.query(updateQuery, [
                                        fertilizerAmountPerMonth,
                                        userId,
                                        monthData.month,
                                        monthData.year
                                    ], (err, result) => {
                                        if (err) {
                                            console.error(`Error updating fertilizer amount for ${monthData.month}/${monthData.year}:`, err);
                                            reject(err);
                                        } else {
                                            console.log(`Successfully updated fertilizer amount for ${monthData.month}/${monthData.year}`);
                                            resolve(result);
                                        }
                                    });
                                });
                            } else {
                                // No record exists - create a new one with the fertilizer amount
                                console.log(`No payment record found for ${monthData.month}/${monthData.year} - creating new record`);
                                
                                const insertQuery = `
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
                                        finalPayment,
                                        status,
                                        created_at
                                    ) VALUES (
                                        ?,  -- userId
                                        0,  -- paymentPerKilo
                                        0,  -- finalTeaKilos
                                        0,  -- paymentForFinalTeaKilos
                                        0,  -- additionalPayments
                                        0,  -- transport
                                        0,  -- directPayments
                                        0,  -- finalAmount
                                        0,  -- advances
                                        0,  -- teaPackets
                                        ?,  -- fertilizer (installment amount)
                                        0,  -- finalPayment
                                        'Pending',  -- status
                                        ?   -- created_at (first day of the month)
                                    )
                                `;
                                
                                await new Promise((resolve, reject) => {
                                    sqldb.query(insertQuery, [
                                        userId,
                                        fertilizerAmountPerMonth,
                                        monthData.firstDayOfMonth
                                    ], (err, result) => {
                                        if (err) {
                                            console.error(`Error creating payment record for ${monthData.month}/${monthData.year}:`, err);
                                            reject(err);
                                        } else {
                                            console.log(`Successfully created payment record for ${monthData.month}/${monthData.year}`);
                                            resolve(result);
                                        }
                                    });
                                });
                            }
                        }
                        
                        console.log("Successfully updated fertilizer costs for all three months");
                        
                        // Create monthly payment description for email
                        const monthNames = ["January", "February", "March", "April", "May", "June", 
                                           "July", "August", "September", "October", "November", "December"];
                        
                        const monthsDescription = monthsToProcess.map(m => 
                            `${monthNames[m.month-1]} ${m.year}`
                        ).join(", ");
                        
                        const distributionNote = `The total fertilizer cost of Rs.${totalCost.toFixed(2)} has been divided into 3 equal installments of Rs.${fertilizerAmountPerMonth.toFixed(2)}, which will be deducted from your payments for: ${monthsDescription}.`;
                        
                        // Send email with payment distribution details
                        sendApprovalEmail(
                            userEmail, 
                            userName, 
                            fertilizerDetails, 
                            quantity, 
                            unitPrice, 
                            totalCost, 
                            'deductpayment', 
                            res, 
                            distributionNote
                        );
                    } catch (error) {
                        console.error("Error updating fertilizer payments:", error);
                        return res.status(200).json({
                            status: "Warning",
                            message: "Fertilizer request approved, but there was an error updating payment records",
                            error: error.message
                        });
                    }
                } else {
                    // For cash payments, just send email
                    sendApprovalEmail(userEmail, userName, fertilizerDetails, quantity, unitPrice, totalCost, 'cash', res);
                }
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: "An unexpected error occurred.", error: error });
    }
};

// Function to send fertilizer approval email
const sendApprovalEmail = (email, name, fertilizerDetails, quantity, unitPrice, totalCost, paymentMethod, res, distributionNote = '') => {
    // If no email is provided, just return success
    if (!email) {
        return res.status(200).json({
            status: "Success",
            message: "Fertilizer request approved successfully. (No email sent - user has no email)",
        });
    }

    // Format the payment method text
    const paymentMethodText = paymentMethod === 'deductpayment' 
        ? 'Deduction from Monthly Payment' 
        : 'Cash Payment';

    // Create a formatted date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format currency
    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
        }).replace('LKR', 'Rs.');
    };

    // Create the email HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                }
                .header {
                    background-color: #27ae60;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                    margin-bottom: 20px;
                }
                .content {
                    padding: 0 20px;
                }
                .details {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .details table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .details th, .details td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                .details th {
                    font-weight: bold;
                    color: #555;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #777;
                    font-size: 0.9em;
                }
                .payment-method {
                    font-weight: bold;
                    color: #27ae60;
                }
                .total {
                    font-weight: bold;
                    font-size: 1.1em;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Fertilizer Request Approved</h2>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>We are pleased to inform you that your fertilizer request has been <strong>approved</strong>.</p>
                    
                    <div class="details">
                        <h3>Request Details:</h3>
                        <table>
                            <tr>
                                <th>Fertilizer Type:</th>
                                <td>${fertilizerDetails}</td>
                            </tr>
                            <tr>
                                <th>Quantity:</th>
                                <td>${quantity} packets</td>
                            </tr>
                            <tr>
                                <th>Unit Price:</th>
                                <td>${formatCurrency(unitPrice)}</td>
                            </tr>
                            <tr>
                                <th>Total Cost:</th>
                                <td class="total">${formatCurrency(totalCost)}</td>
                            </tr>
                            <tr>
                                <th>Payment Method:</th>
                                <td class="payment-method">${paymentMethodText}</td>
                            </tr>
                            <tr>
                                <th>Approval Date:</th>
                                <td>${formattedDate}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p>You can collect your fertilizer from the factory during working hours. Please bring your ID card for verification.</p>
                    
                    ${paymentMethod === 'deductpayment' ? 
                        `<p><strong>Note:</strong> The total cost will be deducted from your monthly payment.</p>` : 
                        `<p><strong>Note:</strong> Please prepare the cash payment when collecting your fertilizer.</p>`
                    }
                    
                    ${distributionNote ? `<p>${distributionNote}</p>` : ''}
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <p>Thank you for your request.</p>
                    
                    <p>Best regards,<br>Tea Factory Management</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Configure email transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_SENDER || process.env.EMAIL_USER,
            pass: process.env.MAIL_APP_PASSWORD || process.env.EMAIL_PASS
        }
    });

    // Set up email options
    const mailOptions = {
        from: process.env.MAIL_SENDER || process.env.EMAIL_USER,
        to: email,
        subject: 'Tea Factory: Fertilizer Request Approved',
        html: htmlContent
    };

    // Send the email
    transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
            console.error("Error sending approval email:", mailErr);
            return res.status(200).json({
                status: "Success",
                message: "Fertilizer request approved successfully. (Email delivery failed)",
                error: mailErr.message
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "Fertilizer request approved successfully and email notification sent.",
            emailInfo: info.response
        });
    });
};

// Delete fertilizer request
export const deleteFertilizer = async (req, res) => {
    console.log("Deleting fertilizer request:", req.body);

    const { requestId } = req.body;

    if (!requestId) {
        return res.status(400).json({ message: "Request ID is required." });
    }

    try {
        // Get the request details first
        const getRequestQuery = `
            SELECT fr.*, fp.fertilizerType, fp.packetType, fr.amount * fp.price AS total_cost, 
                   fa.gmail, fa.firstName, fa.lastName, fa.userId
            FROM fertilizer_requests fr
            JOIN fertilizer_prices fp ON fr.fertilizer_veriance_id = fp.fertilizer_veriance_id
            JOIN farmeraccounts fa ON fr.userId = fa.userId
            WHERE fr.request_id = ?
        `;
        
        sqldb.query(getRequestQuery, [requestId], async (err, requestResults) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (requestResults.length === 0) {
                return res.status(404).json({ message: "Fertilizer request not found." });
            }

            const request = requestResults[0];
            const userEmail = request.gmail;
            const userName = `${request.firstName} ${request.lastName}`;
            const fertilizerDetails = `${request.fertilizerType} (${request.packetType})`;
            const quantity = request.amount;
            const userId = request.userId;

            // Update request status to Rejected
            const sqlQuery = "UPDATE fertilizer_requests SET status = 'Rejected' WHERE request_id = ?";
            sqldb.query(sqlQuery, [requestId], (err, result) => {
                if (err) {
                    console.error("Database Query Error:", err);
                    return res.status(500).json({ message: "Database error", error: err });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Fertilizer request not found." });
                }

                // Create notification record
                const notificationTitle = "Fertilizer Request Rejected";
                const notificationMessage = `Your request for ${quantity} packets of ${fertilizerDetails} has been rejected. Please contact the factory office for more information.`;
                
                const createNotificationQuery = `
                    INSERT INTO notifications (receiver_id, receiver_type, title, message)
                    VALUES (?, 'farmer', ?, ?)
                `;
                
                sqldb.query(createNotificationQuery, [userId, notificationTitle, notificationMessage], (notifyErr) => {
                    if (notifyErr) {
                        console.error("Error creating notification:", notifyErr);
                        // Continue with the process even if notification creation fails
                    }
                });

                // Send rejection email
                sendRejectionEmail(userEmail, userName, fertilizerDetails, quantity, res);
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: "An unexpected error occurred.", error: error });
    }
};

// Function to send fertilizer rejection email
const sendRejectionEmail = (email, name, fertilizerDetails, quantity, res) => {
    // If no email is provided, just return success
    if (!email) {
        return res.status(200).json({
            status: "Success",
            message: "Fertilizer request rejected successfully. (No email sent - user has no email)",
        });
    }

    // Create a formatted date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create the email HTML content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                }
                .header {
                    background-color: #e74c3c;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                    margin-bottom: 20px;
                }
                .content {
                    padding: 0 20px;
                }
                .details {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .details table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .details th, .details td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                .details th {
                    font-weight: bold;
                    color: #555;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #777;
                    font-size: 0.9em;
                }
                .contact-info {
                    margin-top: 15px;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Fertilizer Request Rejected</h2>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>We regret to inform you that your recent fertilizer request has been <strong>rejected</strong>.</p>
                    
                    <div class="details">
                        <h3>Request Details:</h3>
                        <table>
                            <tr>
                                <th>Fertilizer Type:</th>
                                <td>${fertilizerDetails}</td>
                            </tr>
                            <tr>
                                <th>Quantity:</th>
                                <td>${quantity} packets</td>
                            </tr>
                            <tr>
                                <th>Rejection Date:</th>
                                <td>${formattedDate}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p>Your request might have been rejected due to one of the following reasons:</p>
                    <ul>
                        <li>Insufficient stock available</li>
                        <li>Incomplete or incorrect information in the request</li>
                        <li>High volume of requests at this time</li>
                        <li>Other administrative reasons</li>
                    </ul>
                    
                    <p>If you believe this is a mistake or would like more information about the rejection, please contact our office.</p>
                    
                    <div class="contact-info">
                        <p><strong>Contact Information:</strong></p>
                        <p>Phone: 011-2226633</p>
                        <p>Email: support@teafactory.com</p>
                    </div>
                    
                    <p>You are welcome to submit a new request if needed.</p>
                    
                    <p>Thank you for your understanding.</p>
                    
                    <p>Regards,<br>Tea Factory Management</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Configure email transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_SENDER || process.env.EMAIL_USER,
            pass: process.env.MAIL_APP_PASSWORD || process.env.EMAIL_PASS
        }
    });

    // Set up email options
    const mailOptions = {
        from: process.env.MAIL_SENDER || process.env.EMAIL_USER,
        to: email,
        subject: 'Tea Factory: Fertilizer Request Rejected',
        html: htmlContent
    };

    // Send the email
    transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
            console.error("Error sending rejection email:", mailErr);
            return res.status(200).json({
                status: "Success",
                message: "Fertilizer request rejected successfully. (Email delivery failed)",
                error: mailErr.message
            });
        }

        return res.status(200).json({
            status: "Success",
            message: "Fertilizer request rejected successfully and email notification sent.",
            emailInfo: info.response
        });
    });
};