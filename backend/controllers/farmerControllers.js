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

    const { userId, fertilizerType, fertilizerPacketType, paymentOption, amount } = req.body;

    // Check for missing required fields
    if (!userId || !fertilizerType || !fertilizerPacketType || !amount || !paymentOption || amount <= 0) {
        console.log("All required fields must be provided.");
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    console.log("Current Date:", new Date());

    // Get the current date
    const requestDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    // console.log("Request Date:", requestDate);

    // Check if the user exists in the farmeraccounts table
    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ?";
    sqldb.query(sqlCheck, [userId], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'User with this ID does not exist.' });
        }

        // Insert the fertilizer request into the fertilizer_requests table
        const sqlInsert = `
            INSERT INTO fertilizer_requests (userId, fertilizerType, packetType, amount, paymentoption, requestDate, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `;
        sqldb.query(sqlInsert, [userId, fertilizerType, fertilizerPacketType, amount, paymentOption, requestDate], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: 'Error inserting fertilizer request into database', error: err });
            }

            // Success response
            return res.status(200).json({
                message: 'Fertilizer request submitted successfully.',
                requestId: result.insertId,
                status: "Success"
            });
        });
    });
};
