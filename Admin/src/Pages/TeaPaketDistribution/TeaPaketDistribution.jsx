import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeaPaketDistribution.css";

const TeaPacketDistribution = () => {
  const [activeTab, setActiveTab] = useState("addProduction");
  const [productionData, setProductionData] = useState({
    teaType: "",
    packetSize: "",
    packetCount: "",
    productionDate: new Date().toISOString().split('T')[0]
  });
  const [distributionData, setDistributionData] = useState({
    farmerId: "",
    teaType: "",
    packetSize: "",
    packetCount: ""
  });
  const [inventory, setInventory] = useState([]);
  const [distributionHistory, setDistributionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch inventory and distribution history on component mount
  useEffect(() => {
    fetchInventory();
    fetchDistributionHistory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/tea-inventory",
        { withCredentials: true }
      );
      setInventory(response.data.inventory || []);
    } catch (error) {
      setError("Failed to fetch inventory data.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistributionHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/tea-distribution",
        { withCredentials: true }
      );
      setDistributionHistory(response.data.distributionHistory || []);
    } catch (error) {
      setError("Failed to fetch distribution history.");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductionInputChange = (e) => {
    const { name, value } = e.target;
    setProductionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDistributionInputChange = (e) => {
    const { name, value } = e.target;
    setDistributionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduction = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!productionData.teaType || !productionData.packetSize || !productionData.packetCount) {
      setError("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-tea-production",
        productionData,
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setSuccess("Tea production added successfully!");
        setProductionData({
          teaType: "",
          packetSize: "",
          packetCount: "",
          productionDate: new Date().toISOString().split('T')[0]
        });
        fetchInventory();
      } else {
        throw new Error(response.data.message || "Failed to add production");
      }
    } catch (error) {
      setError(error.message || "Failed to add tea production");
      console.error("Error:", error);
    }
  };

  const handleDistributeTea = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!distributionData.farmerId || !distributionData.teaType || 
        !distributionData.packetSize || !distributionData.packetCount) {
      setError("Please fill all fields");
      return;
    }

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
          teaType: "",
          packetSize: "",
          packetCount: ""
        });
        fetchInventory();
        fetchDistributionHistory();
      } else {
        throw new Error(response.data.message || "Failed to distribute tea");
      }
    } catch (error) {
      setError(error.message || "Failed to distribute tea");
      console.error("Error:", error);
    }
  };

  return (
    <div className="tea-distribution-container">
      <h2>Tea Packet Management</h2>
      
      {/* Tabs */}
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
        <button
          className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Current Inventory
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Add Production Section */}
      {activeTab === "addProduction" && (
        <div className="section">
          <h3>Add Daily Tea Production</h3>
          <form onSubmit={handleAddProduction}>
            <div className="form-group">
              <label>Tea Type:</label>
              <select
                name="teaType"
                value={productionData.teaType}
                onChange={handleProductionInputChange}
                required
              >
                <option value="">Select Tea Type</option>
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
                <option value="Type 3">Type 3</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Packet Size:</label>
              <select
                name="packetSize"
                value={productionData.packetSize}
                onChange={handleProductionInputChange}
                required
              >
                <option value="">Select Packet Size</option>
                <option value="40g">40g</option>
                <option value="100g">100g</option>
                <option value="1kg">1kg</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Packet Count:</label>
              <input
                type="number"
                name="packetCount"
                value={productionData.packetCount}
                onChange={handleProductionInputChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Production Date:</label>
              <input
                type="date"
                name="productionDate"
                value={productionData.productionDate}
                onChange={handleProductionInputChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Add Production
            </button>
          </form>
        </div>
      )}

      {/* Distribute Tea Section */}
      {activeTab === "distribution" && (
        <div className="section">
          <div className="distribution-section">
            <h3>Distribute Tea Packets</h3>
            <form onSubmit={handleDistributeTea}>
              <div className="form-group">
                <label>Farmer ID:</label>
                <input
                  type="text"
                  name="farmerId"
                  value={distributionData.farmerId}
                  onChange={handleDistributionInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tea Type:</label>
                <select
                  name="teaType"
                  value={distributionData.teaType}
                  onChange={handleDistributionInputChange}
                  required
                >
                  <option value="">Select Tea Type</option>
                  {Array.from(new Set(inventory.map(item => item.teaType))).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Packet Size:</label>
                <select
                  name="packetSize"
                  value={distributionData.packetSize}
                  onChange={handleDistributionInputChange}
                  required
                >
                  <option value="">Select Packet Size</option>
                  <option value="40g">40g</option>
                  <option value="100g">100g</option>
                  <option value="1kg">1kg</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Packet Count:</label>
                <input
                  type="number"
                  name="packetCount"
                  value={distributionData.packetCount}
                  onChange={handleDistributionInputChange}
                  min="1"
                  required
                />
              </div>
              
              <button type="submit" className="submit-btn">
                Distribute Tea
              </button>
            </form>
          </div>
          
          <div className="distribution-history">
            <h3>Distribution History</h3>
            {isLoading ? (
              <p>Loading...</p>
            ) : distributionHistory.length === 0 ? (
              <p>No distribution records found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Farmer ID</th>
                    <th>Tea Type</th>
                    <th>Packet Size</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.distributionDate).toLocaleDateString()}</td>
                      <td>{record.farmerId}</td>
                      <td>{record.teaType}</td>
                      <td>{record.packetSize}</td>
                      <td>{record.packetCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Current Inventory Section */}
      {activeTab === "inventory" && (
        <div className="section">
          <h3>Current Tea Packet Inventory</h3>
          {isLoading ? (
            <p>Loading inventory...</p>
          ) : inventory.length === 0 ? (
            <p>No inventory records found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tea Type</th>
                  <th>Packet Size</th>
                  <th>Available Count</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={index}>
                    <td>{item.teaType}</td>
                    <td>{item.packetSize}</td>
                    <td>{item.packetCount}</td>
                    <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default TeaPacketDistribution;