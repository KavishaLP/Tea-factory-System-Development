//controllers/farmerControllers.js

import sqldb from '../config/sqldb.js';

export const requestAdvance = async (req, res) => {
    console.log("Received Data:", req.body);

    const { farmerId, amount } = req.body;

    if (!farmerId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if the farmer exists
    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ?";
    sqldb.query(sqlCheck, [farmerId], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Farmer with this user ID does not exist.' });
        }

        // Insert into advance_payment table
        const sqlInsertAdvance = `
            INSERT INTO advance_payment (userId, amount, date, action)
            VALUES (?, ?, ?, 'Pending')
        `;
        sqldb.query(sqlInsertAdvance, [farmerId, amount, date], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: 'Error inserting advance request into database', error: err });
            }

            // Notify all managers (or you can target one manager if needed)
            const getManagersSql = "SELECT ID FROM manageraccounts"; // assuming ID is primary key in manageraccounts
            sqldb.query(getManagersSql, (err, managers) => {
                if (err) {
                    console.error("Error fetching managers:", err);
                    return res.status(500).json({ message: 'Advance saved, but failed to notify manager(s)' });
                }

                const title = "New Advance Request";
                const message = `Farmer ID ${farmerId} has requested an advance of Rs. ${amount}.`;

                const insertNotificationSql = `
                    INSERT INTO notifications (receiver_id, receiver_type, title, message)
                    VALUES ?
                `;

                const values = managers.map(manager => [manager.ID, 'manager', title, message]);

                if (values.length > 0) {
                    sqldb.query(insertNotificationSql, [values], (err) => {
                        if (err) {
                            console.error("Error inserting notifications:", err);
                            return res.status(500).json({ message: 'Advance request saved, but failed to notify manager(s)', error: err });
                        }

                        return res.status(200).json({
                            message: 'Advance request submitted and managers notified successfully.',
                            advanceId: result.insertId,
                            Status: "Success"
                        });
                    });
                } else {
                    return res.status(200).json({
                        message: 'Advance request submitted, but no managers found to notify.',
                        advanceId: result.insertId,
                        Status: "Success"
                    });
                }
            });
        });
    });
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



