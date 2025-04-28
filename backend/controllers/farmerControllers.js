//controllers/farmerControllers.js

import sqldb from '../config/sqldb.js';

export const requestAdvance = async (req, res) => {
    console.log("Received Data:", req.body);

    const { farmerId, amount } = req.body;

    // Check for missing required fields
    if (!farmerId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Get the current date
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Check if the farmer exists in the farmeraccounts table
    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ?";
    sqldb.query(sqlCheck, [farmerId], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Farmer with this user ID does not exist.' });
        }

        // Insert the advance request into the advance_payment table
        const sqlInsert = `
            INSERT INTO advance_payment (userId, amount, date, action)
            VALUES (?, ?, ?, 'Pending')
        `;
        sqldb.query(sqlInsert, [farmerId, amount, date], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: 'Error inserting advance request into database', error: err });
            }

            // Success response
            return res.status(200).json({
                message: 'Advance request submitted successfully.',
                advanceId: result.insertId,
                Status: "Success"
            });
        });
    });
};

export const requestFertilizer = async (req, res) => {
    console.log("Received Data:", req.body);

    const { userId, paymentOption, items, totalAmount } = req.body;

    // Check for missing required fields
    if (!userId || !paymentOption || !items || !Array.isArray(items) || items.length === 0) {
        console.log("All required fields must be provided.");
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Validate each item
    for (const item of items) {
        if (!item.fertilizer_veriance_id || !item.amount || item.amount <= 0) {
            return res.status(400).json({ 
                message: 'All items must have a valid fertilizer variance ID and positive amount' 
            });
        }
    }

    // Get the current date
    const requestDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Determine status based on payment option
    const status = paymentOption.toLowerCase() === "cash" ? "Approved" : "Pending";

    try {
        // Check if the user exists in the farmeraccounts table
        const userCheck = await new Promise((resolve, reject) => {
            const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ?";
            sqldb.query(sqlCheck, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (userCheck.length === 0) {
            return res.status(400).json({ message: 'User with this ID does not exist.' });
        }

        // Begin transaction
        await new Promise((resolve, reject) => {
            sqldb.query("START TRANSACTION", (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Insert the main request record (if you have a table for request headers)
        // This is optional if you only want to store individual items
        // const requestInsert = await new Promise((resolve, reject) => {
        //     const sqlInsert = `
        //         INSERT INTO fertilizer_request_headers 
        //         (userId, paymentOption, requestDate, status, totalAmount)
        //         VALUES (?, ?, ?, ?, ?)
        //     `;
        //     sqldb.query(sqlInsert, 
        //         [userId, paymentOption, requestDate, status, totalAmount], 
        //         (err, result) => {
        //             if (err) return reject(err);
        //             resolve(result.insertId);
        //         }
        //     );
        // });

        // Insert each fertilizer request item
        for (const item of items) {
            // First get the fertilizer details from fertilizer_prices table
            const fertilizerDetails = await new Promise((resolve, reject) => {
                const sqlDetails = `
                    SELECT fertilizerType, packetType, price 
                    FROM fertilizer_prices 
                    WHERE fertilizer_veriance_id = ?
                `;
                sqldb.query(sqlDetails, [item.fertilizer_veriance_id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });

            if (!fertilizerDetails) {
                await new Promise((resolve) => sqldb.query("ROLLBACK", () => resolve()));
                return res.status(400).json({ 
                    message: `Invalid fertilizer variance ID: ${item.fertilizer_veriance_id}` 
                });
            }

            // Insert into fertilizer_requests table
            await new Promise((resolve, reject) => {
                const sqlInsert = `
                    INSERT INTO fertilizer_requests 
                    (userId, fertilizer_veriance_id, amount, paymentoption, requestDate, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                sqldb.query(sqlInsert, [
                    userId,
                    item.fertilizer_veriance_id,
                    item.amount,
                    paymentOption,
                    requestDate,
                    status,
                ], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        // Commit transaction
        await new Promise((resolve, reject) => {
            sqldb.query("COMMIT", (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Success response
        return res.status(200).json({
            message: 'Fertilizer request submitted successfully.',
            status: status,
            itemsCount: items.length,
            totalAmount: totalAmount
        });

    } catch (error) {
        // Rollback transaction if error occurs
        await new Promise((resolve) => sqldb.query("ROLLBACK", () => resolve()));
        
        console.error("Database Error:", error);
        return res.status(500).json({ 
            message: 'Error processing fertilizer request', 
            error: error.message 
        });
    }
};

export const FetchFertilizerPrices = async (req, res) => {
    console.log("Fetching fertilizer prices...");

    const sql = `
        SELECT fertilizer_veriance_id, fertilizerType, packetType, price 
        FROM fertilizer_prices
    `;

    sqldb.query(sql, (err, results) => {
        if (err) {
            console.error("Database Fetch Error:", err);
            return res.status(500).json({ message: 'Database error while fetching fertilizer prices', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No fertilizer prices found.' });
        }

        return res.status(200).json(results);
    });
};

export const getPaymentsByUserId = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      id,
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
    WHERE userId = ?
    ORDER BY created_at DESC
  `;

  sqldb.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching payments by userId:", err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No payments found for this user.' });
    }

    return res.status(200).json(results);
  });
};

//------------------------------------------------------------

// Get tea delivery summary for a specific month/year
export const getTeaDeliveries = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;

        const [year, month] = monthYear.split('-');

        const query = `
            SELECT 
                finalTeaKilos
            FROM farmer_payments
            WHERE userId = ? 
            AND YEAR(created_at) = ? 
            AND MONTH(created_at) = ?
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [results] = await sqldb.promise().query(query, [userId, year, month]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No payment record found for the given month and user'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                total: results[0].finalTeaKilos || 0,
                details: results[0]
            }
        });
    } catch (error) {
        console.error('Error fetching tea deliveries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tea delivery data'
        });
    }
};

// Get tea delivery details for popup
export const getTeaDeliveryDetails = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');
        
        const query = `
            SELECT 
                id,
                date,
                tea_sack_weight,
                deduction_water,
                deduction_damage_tea,
                deduction_sack_weight,
                deduction_sharped_tea,
                deduction_other,
                final_tea_sack_weight
            FROM tea_sack_updates
            WHERE userId = ?
            AND YEAR(date) = ?
            AND MONTH(date) = ?
            ORDER BY date DESC
        `;
        
        const [results] = await sqldb.promise().query(query, [userId, year, month]);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching tea delivery details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tea delivery details'
        });
    }
};



// Get payment summary for a specific month/year
export const getPayments = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');

        const query = `
            SELECT 
                finalPayment
            FROM farmer_payments
            WHERE userId = ? 
            AND YEAR(created_at) = ? 
            AND MONTH(created_at) = ?
            AND status = 'Approved'
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [results] = await sqldb.promise().query(query, [userId, year, month]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No approved payment record found for the given month and user'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                amount: results[0].finalPayment || 0,
                details: results[0]
            }
        });
    } catch (error) {
        console.error('Error fetching payment data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment data'
        });
    }
};



// Get advance summary for a specific month/year
export const getAdvances = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');

        const query = `
            SELECT
                SUM(CASE WHEN action = 'Pending' THEN amount ELSE 0 END) AS pending_amount,
                COUNT(CASE WHEN action = 'Pending' THEN 1 ELSE NULL END) AS pending_count,
                SUM(CASE WHEN action = 'Approved' THEN amount ELSE 0 END) AS approved_amount,
                COUNT(CASE WHEN action = 'Approved' THEN 1 ELSE NULL END) AS approved_count,
                SUM(CASE WHEN action = 'Rejected' THEN amount ELSE 0 END) AS rejected_amount,
                COUNT(CASE WHEN action = 'Rejected' THEN 1 ELSE NULL END) AS rejected_count
            FROM advance_payment
            WHERE userId = ?
            AND YEAR(date) = ?
            AND MONTH(date) = ?
        `;

        const [results] = await sqldb.promise().query(query, [userId, year, month]);
        const data = results[0];

        res.status(200).json({
            success: true,
            data: {
                pending: {
                    count: data.pending_count || 0,
                    amount: data.pending_amount || 0
                },
                approved: {
                    count: data.approved_count || 0,
                    amount: data.approved_amount || 0
                },
                rejected: {
                    count: data.rejected_count || 0,
                    amount: data.rejected_amount || 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching advances:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch advance data'
        });
    }
};

// Get advance details for popup
export const getAdvanceDetails = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');
        
        const query = `
            SELECT 
                advn_id as id,
                date,
                amount,
                action as status
            FROM advance_payment
            WHERE userId = ?
            AND YEAR(date) = ?
            AND MONTH(date) = ?
            ORDER BY date DESC
        `;
        
        const [results] = await sqldb.promise().query(query, [userId, year, month]);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching advance details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch advance details'
        });
    }
};



// Get fertilizer request summary for a specific month/year (only counts)
export const getFertilizerRequests = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');

        const query = `
            SELECT 
                COUNT(CASE WHEN status = 'Pending' THEN 1 ELSE NULL END) AS pending_count,
                COUNT(CASE WHEN status = 'Approved' THEN 1 ELSE NULL END) AS approved_count,
                COUNT(CASE WHEN status = 'Rejected' THEN 1 ELSE NULL END) AS rejected_count
            FROM fertilizer_requests
            WHERE userId = ?
            AND YEAR(requestDate) = ?
            AND MONTH(requestDate) = ?
        `;

        const [results] = await sqldb.promise().query(query, [userId, year, month]);
        const data = results[0];

        res.status(200).json({
            success: true,
            data: {
                pending: data.pending_count || 0,
                approved: data.approved_count || 0,
                rejected: data.rejected_count || 0
            }
        });
    } catch (error) {
        console.error('Error fetching fertilizer requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fertilizer request data'
        });
    }
};

// Get fertilizer details for popup
export const getFertilizerDetails = async (req, res) => {
    try {
        const { userId, monthYear } = req.query;
        const [year, month] = monthYear.split('-');
        
        const query = `
            SELECT 
                fr.request_id as id,
                fr.requestDate as date,
                fp.fertilizerType,
                fp.packetType,
                fr.amount,
                fr.paymentoption as paymentMethod,
                fr.status
            FROM fertilizer_requests fr
            JOIN fertilizer_prices fp ON fr.fertilizer_veriance_id = fp.fertilizer_veriance_id
            WHERE fr.userId = ?
            AND YEAR(fr.requestDate) = ?
            AND MONTH(fr.requestDate) = ?
            ORDER BY fr.requestDate DESC
        `;
        
        const [results] = await sqldb.promise().query(query, [userId, year, month]);
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching fertilizer details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fertilizer details'
        });
    }
};



