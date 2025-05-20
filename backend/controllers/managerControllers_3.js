import sqldb from '../config/sqldb.js';

// Get all fertilizer prices
export const getAllFertilizerPrices = (req, res) => {
    const sql = `
        SELECT * 
        FROM fertilizer_prices 
        ORDER BY fertilizerType, packetType
    `;
    
    sqldb.query(sql, (error, results) => {
        if (error) {
            console.error("Error fetching fertilizer prices:", error);
            return res.status(500).json({
                status: "Error",
                message: "Failed to fetch fertilizer prices",
                error: error.message
            });
        }
        
        return res.status(200).json({
            status: "Success",
            fertilizerPrices: results
        });
    });
};

// Add new fertilizer price
export const addFertilizerPrice = (req, res) => {
    const { fertilizerType, packetType, price, count } = req.body;

    // Validation
    if (!fertilizerType || !packetType || !price) {
        return res.status(400).json({
            status: "Error",
            message: "Fertilizer type, packet type, and price are required"
        });
    }

    // Check if a record with the same type and packet already exists
    const checkSql = `
        SELECT * FROM fertilizer_prices 
        WHERE fertilizerType = ? AND packetType = ?
    `;
    
    sqldb.query(checkSql, [fertilizerType, packetType], (checkError, existingRecords) => {
        if (checkError) {
            console.error("Error checking for existing fertilizer records:", checkError);
            return res.status(500).json({
                status: "Error",
                message: "Failed to check for existing records",
                error: checkError.message
            });
        }
        
        if (existingRecords.length > 0) {
            return res.status(400).json({
                status: "Error",
                message: "A fertilizer price record with this type and packet already exists"
            });
        }

        // Insert new record
        const insertSql = `
            INSERT INTO fertilizer_prices (fertilizerType, packetType, price, count)
            VALUES (?, ?, ?, ?)
        `;
        
        sqldb.query(insertSql, [
            fertilizerType,
            packetType,
            price,
            count || 0 // Default to 0 if count isn't provided
        ], (insertError, result) => {
            if (insertError) {
                console.error("Error adding fertilizer price:", insertError);
                return res.status(500).json({
                    status: "Error",
                    message: "Failed to add fertilizer price",
                    error: insertError.message
                });
            }
            
            return res.status(201).json({
                status: "Success",
                message: "Fertilizer price added successfully",
                fertilizerPriceId: result.insertId
            });
        });
    });
};

// Update fertilizer price
export const updateFertilizerPrice = (req, res) => {
    const { fertilizer_veriance_id, fertilizerType, packetType, price, count } = req.body;

    // Validation
    if (!fertilizer_veriance_id) {
        return res.status(400).json({
            status: "Error",
            message: "Fertilizer variance ID is required"
        });
    }

    // Check if the record exists
    const checkSql = `
        SELECT * FROM fertilizer_prices 
        WHERE fertilizer_veriance_id = ?
    `;
    
    sqldb.query(checkSql, [fertilizer_veriance_id], (checkError, existingRecords) => {
        if (checkError) {
            console.error("Error checking for existing fertilizer record:", checkError);
            return res.status(500).json({
                status: "Error",
                message: "Failed to check if record exists",
                error: checkError.message
            });
        }
        
        if (existingRecords.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "Fertilizer price record not found"
            });
        }

        // If updating type and packet type, check for duplicates
        if (fertilizerType && packetType) {
            const duplicateCheckSql = `
                SELECT * FROM fertilizer_prices 
                WHERE fertilizerType = ? AND packetType = ? 
                AND fertilizer_veriance_id != ?
            `;
            
            sqldb.query(duplicateCheckSql, [
                fertilizerType, 
                packetType, 
                fertilizer_veriance_id
            ], (duplicateError, duplicates) => {
                if (duplicateError) {
                    console.error("Error checking for duplicate fertilizer records:", duplicateError);
                    return res.status(500).json({
                        status: "Error",
                        message: "Failed to check for duplicates",
                        error: duplicateError.message
                    });
                }
                
                if (duplicates.length > 0) {
                    return res.status(400).json({
                        status: "Error",
                        message: "Another fertilizer record with this type and packet already exists"
                    });
                }
                
                // No duplicates, proceed with update
                proceedWithUpdate();
            });
        } else {
            // No need to check for duplicates, proceed with update
            proceedWithUpdate();
        }
        
        // Function to execute the update
        function proceedWithUpdate() {
            // Build update query dynamically based on provided fields
            let updateSql = 'UPDATE fertilizer_prices SET ';
            const updateValues = [];
            let hasUpdates = false;

            if (fertilizerType !== undefined) {
                updateSql += 'fertilizerType = ?, ';
                updateValues.push(fertilizerType);
                hasUpdates = true;
            }

            if (packetType !== undefined) {
                updateSql += 'packetType = ?, ';
                updateValues.push(packetType);
                hasUpdates = true;
            }

            if (price !== undefined) {
                updateSql += 'price = ?, ';
                updateValues.push(price);
                hasUpdates = true;
            }

            if (count !== undefined) {
                updateSql += 'count = ?, ';
                updateValues.push(count);
                hasUpdates = true;
            }

            if (!hasUpdates) {
                return res.status(400).json({
                    status: "Error",
                    message: "No fields provided for update"
                });
            }

            // Remove the trailing comma and space
            updateSql = updateSql.slice(0, -2);
            updateSql += ' WHERE fertilizer_veriance_id = ?';
            updateValues.push(fertilizer_veriance_id);

            // Execute the update
            sqldb.query(updateSql, updateValues, (updateError, updateResult) => {
                if (updateError) {
                    console.error("Error updating fertilizer price:", updateError);
                    return res.status(500).json({
                        status: "Error",
                        message: "Failed to update fertilizer price",
                        error: updateError.message
                    });
                }
                
                return res.status(200).json({
                    status: "Success",
                    message: "Fertilizer price updated successfully"
                });
            });
        }
    });
};

// Delete fertilizer price
export const deleteFertilizerPrice = (req, res) => {
    const { fertilizer_veriance_id } = req.body;

    // Validation
    if (!fertilizer_veriance_id) {
        return res.status(400).json({
            status: "Error",
            message: "Fertilizer variance ID is required"
        });
    }

    // Check if there are any fertilizer requests using this price record
    const checkRequestsSql = `
        SELECT COUNT(*) as requestCount 
        FROM fertilizer_requests 
        WHERE fertilizer_veriance_id = ?
    `;
    
    sqldb.query(checkRequestsSql, [fertilizer_veriance_id], (checkError, requestCount) => {
        if (checkError) {
            console.error("Error checking for fertilizer requests:", checkError);
            return res.status(500).json({
                status: "Error",
                message: "Failed to check for fertilizer requests",
                error: checkError.message
            });
        }
        
        if (requestCount[0].requestCount > 0) {
            return res.status(400).json({
                status: "Error",
                message: "Cannot delete this fertilizer price as it is referenced in fertilizer requests"
            });
        }

        // Delete the record
        const deleteSql = `
            DELETE FROM fertilizer_prices 
            WHERE fertilizer_veriance_id = ?
        `;
        
        sqldb.query(deleteSql, [fertilizer_veriance_id], (deleteError, result) => {
            if (deleteError) {
                console.error("Error deleting fertilizer price:", deleteError);
                return res.status(500).json({
                    status: "Error",
                    message: "Failed to delete fertilizer price",
                    error: deleteError.message
                });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "Error",
                    message: "Fertilizer price record not found"
                });
            }
            
            return res.status(200).json({
                status: "Success",
                message: "Fertilizer price deleted successfully"
            });
        });
    });
};