import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Configurations.css";
import { FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

function FertilizerConfigurations() {
  const [activeTab, setActiveTab] = useState("viewFertilizers");
  const [fertilizerPrices, setFertilizerPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    fertilizerType: "",
    packetType: "",
    price: "",
    count: "0"
  });

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Deletion confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Fetch all fertilizer prices
  const fetchFertilizerPrices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8081/api/manager/fertilizer-prices",
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setFertilizerPrices(response.data.fertilizerPrices);
      } else {
        setError("Failed to load fertilizer prices");
      }
    } catch (error) {
      console.error("Error fetching fertilizer prices:", error);
      setError("Error loading fertilizer prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load fertilizer prices on component mount
  useEffect(() => {
    fetchFertilizerPrices();
  }, []);

  // Handle input change in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For price and count, only allow numbers and decimal points
    if ((name === "price" || name === "count") && value !== "") {
      // Allow empty string or valid decimal numbers
      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle adding new fertilizer price
  const handleAddFertilizer = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.fertilizerType || !formData.packetType || !formData.price) {
      setError("Fertilizer type, packet type, and price are required");
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://localhost:8081/api/manager/fertilizer-prices/add",
        formData,
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setFormData({
          fertilizerType: "",
          packetType: "",
          price: "",
          count: "0"
        });
        fetchFertilizerPrices();
        setActiveTab("viewFertilizers");
      } else {
        setError(response.data.message || "Failed to add fertilizer price");
      }
    } catch (error) {
      console.error("Error adding fertilizer price:", error);
      setError(error.response?.data?.message || "Error adding fertilizer price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set up form for editing
  const handleEditFertilizer = (fertilizer) => {
    setFormData({
      fertilizerType: fertilizer.fertilizerType,
      packetType: fertilizer.packetType,
      price: fertilizer.price,
      count: fertilizer.count.toString()
    });
    setIsEditMode(true);
    setEditingId(fertilizer.fertilizer_veriance_id);
    setActiveTab("addFertilizer");
  };

  // Handle updating fertilizer price
  const handleUpdateFertilizer = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!formData.fertilizerType || !formData.packetType || !formData.price) {
      setError("Fertilizer type, packet type, and price are required");
      return;
    }
    
    try {
      setLoading(true);
      
      const updateData = {
        ...formData,
        fertilizer_veriance_id: editingId
      };
      
      const response = await axios.put(
        "http://localhost:8081/api/manager/fertilizer-prices/update",
        updateData,
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        setFormData({
          fertilizerType: "",
          packetType: "",
          price: "",
          count: "0"
        });
        setIsEditMode(false);
        setEditingId(null);
        fetchFertilizerPrices();
        setActiveTab("viewFertilizers");
      } else {
        setError(response.data.message || "Failed to update fertilizer price");
      }
    } catch (error) {
      console.error("Error updating fertilizer price:", error);
      setError(error.response?.data?.message || "Error updating fertilizer price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set up confirmation for deletion
  const confirmDeleteFertilizer = (fertilizer) => {
    setDeletingId(fertilizer.fertilizer_veriance_id);
    setDeletingItem(fertilizer);
    setShowDeleteConfirm(true);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeletingId(null);
    setDeletingItem(null);
    setShowDeleteConfirm(false);
  };

  // Handle deleting fertilizer price
  const handleDeleteFertilizer = async () => {
    if (!deletingId) return;
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        "http://localhost:8081/api/manager/fertilizer-prices/delete",
        { fertilizer_veriance_id: deletingId },
        { withCredentials: true }
      );
      
      if (response.data.status === "Success") {
        fetchFertilizerPrices();
        setShowDeleteConfirm(false);
        setDeletingId(null);
        setDeletingItem(null);
      } else {
        setError(response.data.message || "Failed to delete fertilizer price");
      }
    } catch (error) {
      console.error("Error deleting fertilizer price:", error);
      setError(error.response?.data?.message || "Error deleting fertilizer price. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form and edit mode
  const handleCancelEdit = () => {
    setFormData({
      fertilizerType: "",
      packetType: "",
      price: "",
      count: "0"
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  return (
    <div className="cfa-content">
      <h2>Fertilizer Configurations</h2>
      <div className="cfa-grid">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "viewFertilizers" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("viewFertilizers");
              setIsEditMode(false);
              handleCancelEdit();
            }}
          >
            View Fertilizer Prices
          </button>
          <button
            className={`tab-button ${activeTab === "addFertilizer" ? "active" : ""}`}
            onClick={() => {
              if (!isEditMode) {
                handleCancelEdit();
              }
              setActiveTab("addFertilizer");
            }}
          >
            {isEditMode ? "Edit Fertilizer" : "Add New Fertilizer"}
          </button>
        </div>

        {/* Display error message if present */}
        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* View Fertilizer Prices Table */}
        {activeTab === "viewFertilizers" && (
          <div className="fertilizer-list">
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : fertilizerPrices.length > 0 ? (
              <table className="fertilizer-table">
                <thead>
                  <tr>
                    <th>Fertilizer Type</th>
                    <th>Packet Type</th>
                    <th>Price (Rs)</th>
                    <th>Inventory Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fertilizerPrices.map((fertilizer) => (
                    <tr key={fertilizer.fertilizer_veriance_id}>
                      <td>{fertilizer.fertilizerType}</td>
                      <td>{fertilizer.packetType}</td>
                      <td>{parseFloat(fertilizer.price).toFixed(2)}</td>
                      <td>{fertilizer.count}</td>
                      <td className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => handleEditFertilizer(fertilizer)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => confirmDeleteFertilizer(fertilizer)}
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">No fertilizer prices found. Add some using the "Add New Fertilizer" tab.</div>
            )}
          </div>
        )}

        {/* Add/Edit Fertilizer Form */}
        {activeTab === "addFertilizer" && (
          <form onSubmit={isEditMode ? handleUpdateFertilizer : handleAddFertilizer} className="fertilizer-form">
            <h3>{isEditMode ? "Edit Fertilizer Price" : "Add New Fertilizer Price"}</h3>
            
            <div className="input-group">
              <label htmlFor="fertilizerType">Fertilizer Type</label>
              <input
                type="text"
                id="fertilizerType"
                name="fertilizerType"
                value={formData.fertilizerType}
                onChange={handleInputChange}
                placeholder="Enter fertilizer type (e.g., Urea, Compost)"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="packetType">Packet Type</label>
              <input
                type="text"
                id="packetType"
                name="packetType"
                value={formData.packetType}
                onChange={handleInputChange}
                placeholder="Enter packet type (e.g., 5kg, 10kg)"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="price">Price (Rs)</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="count">Inventory Count</label>
              <input
                type="text"
                id="count"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                placeholder="Enter inventory count"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className={`submit-button ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? 
                  (isEditMode ? "Updating..." : "Adding...") : 
                  (isEditMode ? "Update Fertilizer" : "Add Fertilizer")}
              </button>
              
              {isEditMode && (
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>
                Are you sure you want to delete the following fertilizer price?
              </p>
              <div className="delete-item-details">
                <p><strong>Fertilizer Type:</strong> {deletingItem.fertilizerType}</p>
                <p><strong>Packet Type:</strong> {deletingItem.packetType}</p>
                <p><strong>Price:</strong> Rs. {parseFloat(deletingItem.price).toFixed(2)}</p>
              </div>
              <p className="delete-warning">
                <FaExclamationTriangle /> This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button 
                  onClick={handleDeleteFertilizer} 
                  className="confirm-delete-button"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
                </button>
                <button 
                  onClick={cancelDelete}
                  className="cancel-delete-button"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FertilizerConfigurations;