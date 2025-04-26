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

  // Fetch inventory when tab changes to addProduction
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
        // Initialize newProduction state
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

  const handleAddProduction = async (teaType, packetSize) => {
    const count = newProduction[`${teaType}_${packetSize}`];
    
    if (!count || count <= 0) {
      setError(`Please enter a valid count for ${teaType} ${packetSize}`);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-tea-production",
        {
          teaType,
          packetSize,
          packetCount: count,
          productionDate: new Date().toISOString().split('T')[0]
        },
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setSuccess(`Added ${count} ${packetSize} ${teaType} packets successfully!`);
        // Clear the input field
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
          {/* Distribution form implementation would go here */}
        </div>
      )}
    </div>
  );
};

export default TeaPacketDistribution;