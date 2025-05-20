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
                   fa.gmail, fa.firstName, fa.lastName
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
            const totalCost = request.total_cost;
            const fertilizerDetails = `${request.fertilizerType} (${request.packetType})`;
            const quantity = request.amount;
            const unitPrice = request.price;

            // Update request status to Approved
            const updateRequestQuery = "UPDATE fertilizer_requests SET status = 'Approved' WHERE request_id = ?";
            sqldb.query(updateRequestQuery, [requestId], async (updateErr) => {
                if (updateErr) {
                    console.error("Error updating request status:", updateErr);
                    return res.status(500).json({ message: "Error updating request", error: updateErr });
                }

                // Only update payment record if payment option is 'deductpayment'
                if (request.paymentOption === 'deductpayment') {
                    try {
                        // Find the payment record for the same month as the request
                        const requestMonth = new Date(request.requestDate).getMonth() + 1; // 1-12
                        const requestYear = new Date(request.requestDate).getFullYear();
                        
                        // Calculate amount per month (divide by 3)
                        const amountPerMonth = parseFloat((totalCost / 3).toFixed(2));
                        
                        // Array to store the months we need to update
                        const monthsToUpdate = [];
                        
                        // Add current month and next two months to the array
                        for (let i = 0; i < 3; i++) {
                            let targetMonth = requestMonth + i;
                            let targetYear = requestYear;
                            
                            // Adjust year if months exceed 12
                            if (targetMonth > 12) {
                                targetMonth = targetMonth - 12;
                                targetYear++;
                            }
                            
                            monthsToUpdate.push({ month: targetMonth, year: targetYear });
                        }
                        
                        // Process updates for all three months
                        const processAllMonths = async () => {
                            let successCount = 0;
                            
                            // Process each month
                            for (const { month, year } of monthsToUpdate) {
                                // Check if record exists for this month
                                const checkExistingQuery = `
                                    SELECT * FROM farmer_payments
                                    WHERE userId = ? 
                                    AND MONTH(created_at) = ? 
                                    AND YEAR(created_at) = ?
                                `;
                                
                                const existingRecord = await new Promise((resolve, reject) => {
                                    sqldb.query(checkExistingQuery, [request.userId, month, year], (err, results) => {
                                        if (err) reject(err);
                                        resolve(results);
                                    });
                                });
                                
                                if (existingRecord.length > 0) {
                                    // Update existing record
                                    const updateQuery = `
                                        UPDATE farmer_payments 
                                        SET fertilizer = COALESCE(fertilizer, 0) + ?
                                        WHERE userId = ? 
                                        AND MONTH(created_at) = ? 
                                        AND YEAR(created_at) = ?
                                    `;
                                    
                                    await new Promise((resolve, reject) => {
                                        sqldb.query(updateQuery, [amountPerMonth, request.userId, month, year], (err) => {
                                            if (err) reject(err);
                                            successCount++;
                                            resolve();
                                        });
                                    });
                                } else {
                                    // Create new record for this month
                                    let recordDate = new Date(year, month - 1, 1); // month is 0-based in Date constructor
                                    
                                    const insertQuery = `
                                        INSERT INTO farmer_payments 
                                        (userId, paymentPerKilo, finalTeaKilos, paymentForFinalTeaKilos, 
                                        additionalPayments, transport, directPayments, finalAmount, 
                                        advances, teaPackets, fertilizer, finalPayment, status, created_at)
                                        VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, 0, 'Pending', ?)
                                    `;
                                    
                                    await new Promise((resolve, reject) => {
                                        sqldb.query(insertQuery, [request.userId, amountPerMonth, recordDate], (err) => {
                                            if (err) reject(err);
                                            successCount++;
                                            resolve();
                                        });
                                    });
                                }
                            }
                            
                            return successCount;
                        };
                        
                        // Process all months and then send email
                        const updatedMonths = await processAllMonths();
                        
                        console.log(`Successfully updated/created ${updatedMonths} payment records for fertilizer distribution`);
                        
                        // Send approval email with explanation about distributed payment
                        const distributionNote = `The fertilizer cost of ${totalCost} has been divided into 3 equal installments of ${amountPerMonth} each, to be deducted over the next 3 months.`;
                        
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
                        console.error("Error in payment update process:", error);
                        return res.status(500).json({ 
                            message: "Request approved but error in payment update", 
                            error: error 
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
                   fa.gmail, fa.firstName, fa.lastName
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