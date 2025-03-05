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

    // Check if the farmer already exists by userId, gmail, or userName
    const sqlCheck = "SELECT * FROM farmeraccounts WHERE userId = ? OR gmail = ? OR userName = ?";
    sqldb.query(sqlCheck, [userId, gmail, userName], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Farmer with this user ID, email, or username already exists.' });
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

// Get payment history function
export const getFarmerPaymentHistory = (req, res) => {
    // SQL Query to fetch payment history from the farmer_payments table
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
        ORDER BY created_at DESC
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

export const addEmployee = async (req, res) => {
    console.log("Received Data:", req.body);

    const { userId, firstName, lastName, mobile1, mobile2 } = req.body;

    // Check for missing required fields
    if (!userId || !firstName || !lastName || !mobile1) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Check if the employee already exists by userId
    const sqlCheck = "SELECT * FROM employeeaccounts WHERE userId = ?";
    sqldb.query(sqlCheck, [userId], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Employee with this user ID already exists.' });
        }

        // Insert new employee into the database
        const sqlInsert = "INSERT INTO employeeaccounts (userId, firstName, lastName, mobile1, mobile2) VALUES (?, ?, ?, ?, ?)";
        sqldb.query(sqlInsert, [userId, firstName, lastName, mobile1, mobile2], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: 'Error inserting employee data into database', error: err });
            }
            return res.status(200).json({ message: 'Employee added successfully', employeeId: result.insertId });
        });
    });
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
