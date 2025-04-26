import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeaPaketDistribution.css";

const TeaPacketDistribution = () => {
  const [activeTab, setActiveTab] = useState("addProduction");
  const [inventory, setInventory] = useState([]);
  const [distributionData, setDistributionData] = useState({
    farmerId: "",
    distributions: [{
      teaType: "",
      packetSize: "",
      packetCount: ""
    }]
  });
  const [newProduction, setNewProduction] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch inventory when tab changes or after updates
  useEffect(() => {
    if (activeTab === "addProduction") {
      fetchInventory();
    }
  }, [activeTab]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/tea-inventory",
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setInventory(response.data.inventory || []);
        // Initialize newProduction with all inventory items
        const initialProduction = {};
        response.data.inventory.forEach(item => {
          initialProduction[`${item.teaType}_${item.packetSize}`] = "";
        });
        setNewProduction(initialProduction);
      } else {
        throw new Error(response.data.message || "Failed to fetch inventory");
      }
    } catch (error) {
      setError("Failed to fetch inventory data.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductionChange = (teaType, packetSize, value) => {
    setNewProduction(prev => ({
      ...prev,
      [`${teaType}_${packetSize}`]: value
    }));
  };

  const handleAddProduction = async (id, teaType, packetSize) => {
    const count = newProduction[`${teaType}_${packetSize}`];
  
    if (!count || count <= 0) {
      setError(`Please enter a valid count for ${teaType} ${packetSize}`);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-tea-production",
        {
          id, // Send id
          packetCount: count,
          productionDate: new Date().toISOString().split('T')[0]
        },
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        setSuccess(`Added ${count} ${packetSize} ${teaType} packets successfully!`);
        setNewProduction(prev => ({
          ...prev,
          [`${teaType}_${packetSize}`]: ""
        }));
        fetchInventory();
      } else {
        throw new Error(response.data.message || "Failed to add production");
      }
    } catch (error) {
      setError(error.message || `Failed to add ${teaType} ${packetSize} production`);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Distribution functions
  const handleDistributionInputChange = (e, index) => {
    const { name, value } = e.target;
    setDistributionData(prev => {
      const updatedDistributions = [...prev.distributions];
      updatedDistributions[index] = {
        ...updatedDistributions[index],
        [name]: value
      };
      return {
        ...prev,
        distributions: updatedDistributions
      };
    });
  };

  const handleFarmerIdChange = (e) => {
    setDistributionData(prev => ({
      ...prev,
      farmerId: e.target.value
    }));
  };

  const addDistributionRow = () => {
    setDistributionData(prev => ({
      ...prev,
      distributions: [
        ...prev.distributions,
        { teaType: "", packetSize: "", packetCount: "" }
      ]
    }));
  };

  const removeDistributionRow = (index) => {
    if (distributionData.distributions.length > 1) {
      setDistributionData(prev => ({
        ...prev,
        distributions: prev.distributions.filter((_, i) => i !== index)
      }));
    }
  };

  const getAvailableSizesForType = (teaType) => {
    if (!teaType) return [];
    return inventory
      .filter(item => item.teaType === teaType)
      .map(item => item.packetSize)
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  const handleDistributeTea = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!distributionData.farmerId) {
      setError("Please enter Farmer ID");
      return;
    }

    // Validate all distribution rows
    for (const [index, dist] of distributionData.distributions.entries()) {
      if (!dist.teaType || !dist.packetSize || !dist.packetCount) {
        setError(`Please fill all fields in distribution row ${index + 1}`);
        return;
      }

      if (dist.packetCount <= 0) {
        setError(`Packet count must be greater than 0 in row ${index + 1}`);
        return;
      }

      // Check inventory availability
      const availableItem = inventory.find(
        item => item.teaType === dist.teaType && 
               item.packetSize === dist.packetSize
      );

      if (!availableItem || availableItem.packetCount < dist.packetCount) {
        setError(`Not enough inventory for ${dist.teaType} ${dist.packetSize} in row ${index + 1}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/distribute-tea",
        distributionData,
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setSuccess("Tea distributed successfully!");
        setDistributionData({
          farmerId: "",
          distributions: [{
            teaType: "",
            packetSize: "",
            packetCount: ""
          }]
        });
        fetchInventory();
      } else {
        throw new Error(response.data.message || "Failed to distribute tea");
      }
    } catch (error) {
      setError(error.message || "Failed to distribute tea");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tea-distribution-container">
      <h2>Tea Packet Management</h2>
      
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "addProduction" ? "active" : ""}`}
          onClick={() => setActiveTab("addProduction")}
        >
          Add Production
        </button>
        <button
          className={`tab-btn ${activeTab === "distribution" ? "active" : ""}`}
          onClick={() => setActiveTab("distribution")}
        >
          Distribute Tea
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === "addProduction" && (
        <div className="section">
          <h3>Add Tea Production</h3>
          {isLoading ? (
            <p>Loading inventory...</p>
          ) : (
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>Tea Type</th>
                    <th>Packet Size</th>
                    <th>Current Stock</th>
                    <th>Add Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, index) => (
                    <tr key={index}>
                      <td>{item.teaType}</td>
                      <td>{item.packetSize}</td>
                      <td>{item.packetCount}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={newProduction[`${item.teaType}_${item.packetSize}`] || ""}
                          onChange={(e) => handleProductionChange(
                            item.teaType, 
                            item.packetSize, 
                            e.target.value
                          )}
                          placeholder="Enter quantity"
                        />
                      </td>
                      <td>
                        <button
                          className="add-btn"
                          onClick={() => handleAddProduction(
                            item.teaType, 
                            item.packetSize
                          )}
                          disabled={isLoading}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "distribution" && (
        <div className="section">
          <h3>Distribute Tea Packets</h3>
          <form onSubmit={handleDistributeTea}>
            <div className="form-group">
              <label>Farmer ID:</label>
              <input
                type="text"
                name="farmerId"
                value={distributionData.farmerId}
                onChange={handleFarmerIdChange}
                required
              />
            </div>

            <h4>Tea Distributions</h4>
            {distributionData.distributions.map((dist, index) => (
              <div key={index} className="distribution-row">
                <div className="form-group">
                  <label>Tea Type:</label>
                  <select
                    name="teaType"
                    value={dist.teaType}
                    onChange={(e) => handleDistributionInputChange(e, index)}
                    required
                  >
                    <option value="">Select Tea Type</option>
                    {inventory
                      .map(item => item.teaType)
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Packet Size:</label>
                  <select
                    name="packetSize"
                    value={dist.packetSize}
                    onChange={(e) => handleDistributionInputChange(e, index)}
                    required
                    disabled={!dist.teaType}
                  >
                    <option value="">Select Packet Size</option>
                    {dist.teaType && getAvailableSizesForType(dist.teaType).map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Packet Count:</label>
                  <input
                    type="number"
                    name="packetCount"
                    value={dist.packetCount}
                    onChange={(e) => handleDistributionInputChange(e, index)}
                    min="1"
                    required
                  />
                </div>

                {distributionData.distributions.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeDistributionRow(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <div className="form-actions">
              <button
                type="button"
                className="add-btn"
                onClick={addDistributionRow}
              >
                Add Another Distribution
              </button>
              
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Distributing..." : "Distribute Tea"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeaPacketDistribution;