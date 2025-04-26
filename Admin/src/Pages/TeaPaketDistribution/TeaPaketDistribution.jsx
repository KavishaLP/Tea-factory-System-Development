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
    distributions: [{
      teaType: "",
      packetSize: "",
      packetCount: ""
    }]
  });
  const [inventory, setInventory] = useState([]);
  const [availableVarieties, setAvailableVarieties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch inventory and available varieties on component mount
  useEffect(() => {
    fetchInventory();
    fetchAvailableVarieties();
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

  const fetchAvailableVarieties = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/tea-varieties",
        { withCredentials: true }
      );
      setAvailableVarieties(response.data.varieties || []);
    } catch (error) {
      console.error("Error fetching tea varieties:", error);
    }
  };

  const handleProductionInputChange = (e) => {
    const { name, value } = e.target;
    setProductionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    const sizes = availableVarieties
      .filter(v => v.tea_type === teaType)
      .map(v => v.packet_size);
    return [...new Set(sizes)];
  };

  const handleAddProduction = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!productionData.teaType || !productionData.packetSize || !productionData.packetCount) {
      setError("Please fill all fields");
      return;
    }

    if (productionData.packetCount <= 0) {
      setError("Packet count must be greater than 0");
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
        item => item.tea_type === dist.teaType && 
               item.packet_size === dist.packetSize
      );

      if (!availableItem || availableItem.packet_count < dist.packetCount) {
        setError(`Not enough inventory for ${dist.teaType} ${dist.packetSize} in row ${index + 1}`);
        return;
      }
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
      </div>

      {/* Error and Success Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Add Production Section */}
      {activeTab === "addProduction" && (
        <div className="section">
          <h3>Add Tea Production</h3>
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
                {availableVarieties
                  .map(v => v.tea_type)
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
                value={productionData.packetSize}
                onChange={handleProductionInputChange}
                required
                disabled={!productionData.teaType}
              >
                <option value="">Select Packet Size</option>
                {getAvailableSizesForType(productionData.teaType).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
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
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Production"}
            </button>
          </form>
        </div>
      )}

      {/* Distribute Tea Section */}
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
                      .map(item => item.tea_type)
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
                    {inventory
                      .filter(item => item.tea_type === dist.teaType)
                      .map(item => item.packet_size)
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .map(size => (
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