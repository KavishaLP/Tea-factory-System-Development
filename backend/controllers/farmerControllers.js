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

