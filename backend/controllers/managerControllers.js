import bcrypt from 'bcryptjs';
import sqldb from '../config/sqldb.js';

export const addFarmer = async (req, res) => {
    console.log("Received Data:", req.body);

    const { userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password, reenterPassword } = req.body;

    // Check for missing required fields
    if (!userId || !userName || !firstName || !lastName || !address || !mobile1 || !gmail || !password || !reenterPassword) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Check if passwords match
    if (password !== reenterPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check if the farmer already exists by userId or Gmail
    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ? OR gmail = ?";
    sqldb.query(sqlCheck, [userId, gmail], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Farmer with this user ID or email already exists.' });
        }

        // Hash the password securely
        bcrypt.hash(password, 10)
            .then((hashedPassword) => {
                const sqlInsert = "INSERT INTO farmeraccounts (userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                sqldb.query(sqlInsert, [userId, userName, firstName, lastName, address, mobile1, mobile2, gmail, hashedPassword], (err, result) => {
                    if (err) {
                        console.error("Database Insert Error:", err);
                        return res.status(500).json({ message: 'Error inserting farmer data into database', error: err });
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
export const addPayment = (req, res) => {
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
