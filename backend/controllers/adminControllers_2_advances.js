//controllers/adminControllers_2_advances.js
import sqldb from '../config/sqldb.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


// Utility function to send emails
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'youremail@gmail.com', // Use environment variable or default
        pass: process.env.EMAIL_PASSWORD || 'yourpassword' // Use environment variable or default
      }
    });

    // Set mail options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Tea Factory <youremail@gmail.com>',
      to,
      subject,
      html: htmlContent
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Keep existing getAdvanceRequests function unchanged
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

// Updated confirmAdvance function with email notification
export const confirmAdvance = async (req, res) => {
  console.log("Confirming advance request:", req.body);

  const { advanceId } = req.body;

  // Validate required fields
  if (!advanceId) {
    return res.status(400).json({ message: 'Advance ID is required.' });
  }

  try {
    // Step 1: Get the advance details including farmer information
    const getAdvanceQuery = `
      SELECT ap.*, fa.firstName, fa.lastName, fa.gmail 
      FROM advance_payment ap
      JOIN farmeraccounts fa ON ap.userId = fa.userId
      WHERE ap.advn_id = ?
    `;
    
    const advanceDetails = await new Promise((resolve, reject) => {
      sqldb.query(getAdvanceQuery, [advanceId], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (advanceDetails.length === 0) {
      return res.status(404).json({ message: 'Advance request not found.' });
    }

    const { userId, amount, date, firstName, lastName, gmail } = advanceDetails[0];

    // Step 2: Update the advance request action to "Approved"
    const updateAdvanceQuery = "UPDATE advance_payment SET action = 'Approved' WHERE advn_id = ?";
    await new Promise((resolve, reject) => {
      sqldb.query(updateAdvanceQuery, [advanceId], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    // Create notification record
    const notificationTitle = "Advance Payment Approved";
    const formattedAmount = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
    
    const notificationMessage = `Your advance payment request of ${formattedAmount} has been approved. You can collect it from the factory office.`;
    
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

    // Step 3: Update the advances column in farmer_payments for the specific user
    const advanceMonth = new Date(date).getMonth() + 1; // Months are 0-based in JavaScript
    const advanceYear = new Date(date).getFullYear();

    // Check if there is an existing payment record for this user in the same month and year
    const checkPaymentQuery = `
      SELECT * FROM farmer_payments
      WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
    `;

    const paymentResults = await new Promise((resolve, reject) => {
      sqldb.query(checkPaymentQuery, [userId, advanceMonth, advanceYear], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (paymentResults.length > 0) {
      // Update the advances column for the existing record
      const updatePaymentQuery = `
        UPDATE farmer_payments
        SET advances = advances + ?
        WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
      `;

      await new Promise((resolve, reject) => {
        sqldb.query(updatePaymentQuery, [amount, userId, advanceMonth, advanceYear], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    } else {
      // If no payment record exists, create a new payment record with proper initialization
      const insertPaymentQuery = `
        INSERT INTO farmer_payments 
        (userId, paymentPerKilo, finalTeaKilos, paymentForFinalTeaKilos, 
        additionalPayments, transport, directPayments, finalAmount, 
        advances, teaPackets, fertilizer, finalPayment, status)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?, 0, 0, 0, 'Pending')
      `;

      await new Promise((resolve, reject) => {
        sqldb.query(insertPaymentQuery, [userId, amount], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }

    // Step 4: Send email notification if email is available
    let emailStatus = 'No email available';
    
    if (gmail) {
      // Format amount for display
      const formattedAmount = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
      }).format(amount);
      
      // Create HTML email content
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
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 15px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .info-box {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            .note {
              background-color: #fff8e1;
              padding: 10px;
              border-left: 4px solid #ffca28;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Advance Payment Approved</h2>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              
              <p>We are pleased to inform you that your advance payment request has been <strong>approved</strong>.</p>
              
              <div class="info-box">
                <p><strong>Advance Payment Details:</strong></p>
                <ul>
                  <li><strong>Reference Number:</strong> #${advanceId}</li>
                  <li><strong>Amount:</strong> <span class="amount">${formattedAmount}</span></li>
                  <li><strong>Request Date:</strong> ${new Date(date).toDateString()}</li>
                  <li><strong>Approval Date:</strong> ${new Date().toDateString()}</li>
                </ul>
              </div>
              
              <p>Your advance payment is now ready for collection. Please visit our office during working hours with your identification card.</p>
              
              <div class="note">
                <p><strong>Note:</strong> This amount will be deducted from your next monthly tea payment settlement.</p>
              </div>
              
              <p>If you have any questions, please contact our office at 011-2345678.</p>
              
              <p>Thank you for your continued partnership with us.</p>
              
              <p>Best regards,<br>Tea Factory Management</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© 2025 Tea Factory. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Send the email
      const sent = await sendEmail(
        gmail, 
        'Tea Factory: Advance Payment Approved', 
        htmlContent
      );
      
      emailStatus = sent ? 'Email notification sent successfully' : 'Failed to send email notification';
    }

    return res.json({
      status: 'Success',
      message: 'Advance request confirmed and payment record updated successfully',
      emailStatus
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    return res.status(500).json({
      status: 'Error',
      message: 'An unexpected error occurred.',
      error: error
    });
  }
};

// Updated deleteAdvance function with notification creation
export const deleteAdvance = async (req, res) => {
    console.log("Rejecting advance request:", req.body);

    const { advanceId } = req.body;

    // Validate required fields
    if (!advanceId) {
        return res.status(400).json({ message: 'Advance ID is required.' });
    }

    try {
        // Get advance details including farmer information
        const getAdvanceQuery = `
          SELECT ap.*, fa.firstName, fa.lastName, fa.gmail 
          FROM advance_payment ap
          JOIN farmeraccounts fa ON ap.userId = fa.userId
          WHERE ap.advn_id = ?
        `;
        
        const advanceDetails = await new Promise((resolve, reject) => {
          sqldb.query(getAdvanceQuery, [advanceId], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });

        if (advanceDetails.length === 0) {
          return res.status(404).json({ message: 'Advance request not found.' });
        }

        const { userId, amount, date, firstName, lastName, gmail } = advanceDetails[0];

        // Query to update the action to "Rejected"
        const sqlQuery = "UPDATE advance_payment SET action = 'Rejected' WHERE advn_id = ?";
        const result = await new Promise((resolve, reject) => {
          sqldb.query(sqlQuery, [advanceId], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Advance request not found.' });
        }

        // Create notification record
        const notificationTitle = "Advance Payment Request Declined";
        const formattedAmount = new Intl.NumberFormat('en-LK', {
          style: 'currency',
          currency: 'LKR',
          minimumFractionDigits: 2
        }).format(amount);
        
        const notificationMessage = `Your advance payment request of ${formattedAmount} has been declined. Please contact the factory office for more information.`;
        
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

        // Send email notification if email is available
        let emailStatus = 'No email available';
        
        if (gmail) {
          // Format amount for display
          const formattedAmount = new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2
          }).format(amount);
          
          // Create HTML email content
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
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  background-color: #f44336;
                  color: white;
                  padding: 15px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  padding: 20px;
                }
                .info-box {
                  background-color: #f9f9f9;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .amount {
                  font-size: 20px;
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #777;
                }
                .contact-box {
                  background-color: #e1f5fe;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 15px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Advance Payment Request Declined</h2>
                </div>
                <div class="content">
                  <p>Dear ${firstName} ${lastName},</p>
                  
                  <p>We regret to inform you that your advance payment request has been <strong>declined</strong>.</p>
                  
                  <div class="info-box">
                    <p><strong>Request Details:</strong></p>
                    <ul>
                      <li><strong>Reference Number:</strong> #${advanceId}</li>
                      <li><strong>Amount Requested:</strong> <span class="amount">${formattedAmount}</span></li>
                      <li><strong>Request Date:</strong> ${new Date(date).toDateString()}</li>
                      <li><strong>Decision Date:</strong> ${new Date().toDateString()}</li>
                    </ul>
                  </div>
                  
                  <p>Your advance payment request may have been declined due to one of the following reasons:</p>
                  <ul>
                    <li>Insufficient tea deliveries in recent months</li>
                    <li>Existing advances that have not been fully settled</li>
                    <li>The requested amount exceeds the allowable limit based on your tea deliveries</li>
                    <li>Other administrative or policy considerations</li>
                  </ul>
                  
                  <p>You may submit a new request after 30 days or with a lower amount if needed.</p>
                  
                  <div class="contact-box">
                    <p><strong>If you need further clarification, please contact us:</strong></p>
                    <p>Phone: 011-2345678</p>
                    <p>Email: support@teafactory.com</p>
                    <p>Office Hours: Monday to Friday, 8:30 AM to 5:00 PM</p>
                  </div>
                  
                  <p>Thank you for your understanding.</p>
                  
                  <p>Regards,<br>Tea Factory Management</p>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>© 2025 Tea Factory. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `;
          
          // Send the email
          const sent = await sendEmail(
            gmail, 
            'Tea Factory: Advance Payment Request Declined', 
            htmlContent
          );
          
          emailStatus = sent ? 'Email notification sent successfully' : 'Failed to send email notification';
        }

        // Success response
        return res.status(200).json({
            status: "Success",
            message: "Advance request rejected successfully.",
            emailStatus
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};

// Updated addAdvancePayment function with email notification
export const addAdvancePayment = async (req, res) => {
  const { userId, amount, date } = req.body;

  if (!userId || !amount || !date) {
    return res.status(400).json({ 
        status: 'Error', 
        message: 'All fields are required' 
    });
  }

  try {
    // Check if the farmer exists and get their details
    const farmerCheck = await new Promise((resolve, reject) => {
      sqldb.query(
        'SELECT userId, firstName, lastName, gmail FROM farmeraccounts WHERE userId = ?',
        [userId],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    if (farmerCheck.length === 0) {
      return res.status(404).json({ 
        status: 'Error', 
        message: 'Farmer not found' 
      });
    }

    const farmer = farmerCheck[0];
    const { firstName, lastName, gmail } = farmer;

    // Insert advance payment into advance_payment table
    const insertAdvance = await new Promise((resolve, reject) => {
      sqldb.query(
        'INSERT INTO advance_payment (userId, amount, date, action) VALUES (?, ?, ?, "Approved")',
        [userId, amount, date],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    const advanceId = insertAdvance.insertId;

    // Get the month and year from the advance payment date
    const advanceMonth = new Date(date).getMonth() + 1; // Months are 0-based in JavaScript
    const advanceYear = new Date(date).getFullYear();

    // Check if there is an existing payment record for this user in the same month and year
    const checkPaymentQuery = `
      SELECT * FROM farmer_payments
      WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
    `;

    const paymentResults = await new Promise((resolve, reject) => {
      sqldb.query(checkPaymentQuery, [userId, advanceMonth, advanceYear], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (paymentResults.length > 0) {
      // Update the advances column for the existing record
      const updatePaymentQuery = `
        UPDATE farmer_payments
        SET advances = advances + ?
        WHERE userId = ? AND MONTH(created_at) = ? AND YEAR(created_at) = ?
      `;

      await new Promise((resolve, reject) => {
        sqldb.query(updatePaymentQuery, [amount, userId, advanceMonth, advanceYear], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    } else {
      // If no payment record exists, create a new payment record with proper initialization
      const insertPaymentQuery = `
        INSERT INTO farmer_payments 
        (userId, paymentPerKilo, finalTeaKilos, paymentForFinalTeaKilos, 
        additionalPayments, transport, directPayments, finalAmount, 
        advances, teaPackets, fertilizer, finalPayment, status)
        VALUES (?, 0, 0, 0, 0, 0, 0, 0, ?, 0, 0, 0, 'Pending')
      `;

      await new Promise((resolve, reject) => {
        sqldb.query(insertPaymentQuery, [userId, amount], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }

    // Send email notification if email is available
    let emailStatus = 'No email available';
    
    if (gmail) {
      // Format amount for display
      const formattedAmount = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
      }).format(amount);
      
      // Create HTML email content
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
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #3f51b5;
              color: white;
              padding: 15px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
            }
            .info-box {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              color: #3f51b5;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #777;
            }
            .note {
              background-color: #e8eaf6;
              padding: 10px;
              border-left: 4px solid #3f51b5;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Advance Payment Notification</h2>
            </div>
            <div class="content">
              <p>Dear ${firstName} ${lastName},</p>
              
              <p>This email is to inform you that an advance payment has been processed to your account.</p>
              
              <div class="info-box">
                <p><strong>Advance Payment Details:</strong></p>
                <ul>
                  <li><strong>Reference Number:</strong> #${advanceId}</li>
                  <li><strong>Amount:</strong> <span class="amount">${formattedAmount}</span></li>
                  <li><strong>Processing Date:</strong> ${new Date(date).toDateString()}</li>
                </ul>
              </div>
              
              <p>This payment is available for collection at our office. Please bring your identification card when collecting the payment.</p>
              
              <div class="note">
                <p><strong>Note:</strong> This amount will be deducted from your next monthly tea payment settlement.</p>
              </div>
              
              <p>If you did not expect this advance or have any questions, please contact our office at 011-2345678 immediately.</p>
              
              <p>Thank you for your continued partnership with us.</p>
              
              <p>Best regards,<br>Tea Factory Management</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© 2025 Tea Factory. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Send the email
      const sent = await sendEmail(
        gmail, 
        'Tea Factory: Advance Payment Notification', 
        htmlContent
      );
      
      emailStatus = sent ? 'Email notification sent successfully' : 'Failed to send email notification';
    }

    return res.json({
      status: 'Success',
      message: 'Advance payment added and payment record updated successfully',
      advanceId,
      emailStatus
    });
  } catch (error) {
    console.error('Error adding advance:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};