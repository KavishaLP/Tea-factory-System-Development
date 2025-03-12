import sqldb from '../config/sqldb.js';

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
            // console.log(results)
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

export const confirmAdvance = async (req, res) => {
    console.log("Confirming advance request:", req.body);

    const { advanceId } = req.body;
    console.log(advanceId)
    // Validate required fields
    if (!advanceId) {
        return res.status(400).json({ message: 'Advance ID is required.' });
    }

    try {
        // Query to update the action to "Approved"
        const sqlQuery = "UPDATE advance_payment SET action = 'Approved' WHERE advn_id = ?";
        sqldb.query(sqlQuery, [advanceId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Advance request not found.' });
            }

            // Success response
            return res.status(200).json({
                status: "Success",
                message: "Advance request confirmed successfully.",
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};

export const deleteAdvance = async (req, res) => {
    console.log("Deleting advance request:", req.body);

    const { advanceId } = req.body;

    // Validate required fields
    if (!advanceId) {
        return res.status(400).json({ message: 'Advance ID is required.' });
    }

    try {
        // Query to update the action to "Rejected"
        const sqlQuery = "UPDATE advance_payment SET action = 'Rejected' WHERE advn_id = ?";
        sqldb.query(sqlQuery, [advanceId], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Advance request not found.' });
            }

            // Success response
            return res.status(200).json({
                status: "Success",
                message: "Advance request deleted successfully.",
            });
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return res.status(500).json({ message: 'An unexpected error occurred.', error: error });
    }
};