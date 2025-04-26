import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdvanceUpdate.css";

function AdvanceUpdate() {
  const [activeTab, setActiveTab] = useState("newRequests");
  const [newRequests, setNewRequests] = useState([]);
  const [confirmedRequests, setConfirmedRequests] = useState([]);
  const [filteredConfirmed, setFilteredConfirmed] = useState([]);
  const [deletedRequests, setDeletedRequests] = useState([]);
  const [filteredDeleted, setFilteredDeleted] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // For add advance modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdvance, setNewAdvance] = useState({
    userId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0] // Default to today's date
  });
  
  // For farmer suggestions
  const [farmerSuggestions, setFarmerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter states for each tab
  const [filters, setFilters] = useState({
    userId: "",
    year: "",
    month: ""
  });

  // Get current year and month for default filter values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  // Fetch farmer suggestions
  const fetchFarmerSuggestions = async (query) => {
    try {
      const response = await axios.post(
        'http://localhost:8081/api/admin/search-farmers-indb',
        { query },
        { withCredentials: true }
      );

      if (response.data.Status === 'Success') {
        setFarmerSuggestions(response.data.farmers);
      } else {
        setFarmerSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching farmer suggestions:', error);
      setFarmerSuggestions([]);
    }
  };

  // Handle user ID input change with suggestions
  const handleUserIdChange = (e) => {
    const { value } = e.target;
    setNewAdvance(prev => ({ ...prev, userId: value }));

    if (value.length >= 2) {
      fetchFarmerSuggestions(value);
      setShowSuggestions(true);
    } else {
      setFarmerSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (farmer) => {
    setNewAdvance(prev => ({ 
      ...prev, 
      userId: farmer.userId 
    }));
    setFarmerSuggestions([]);
    setShowSuggestions(false);
  };

  // Fetch advance requests
  useEffect(() => {
    const fetchAdvanceRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(
          "http://localhost:8081/api/admin/get-advance-requests",
          { withCredentials: true }
        );
        
        if (response.data.status === "Success") {
          const requests = response.data.advanceRequests;
          setNewRequests(requests.filter((req) => req.action === "Pending"));
          
          const confirmed = requests.filter((req) => req.action === "Approved");
          setConfirmedRequests(confirmed);
          setFilteredConfirmed(confirmed);
          
          const deleted = requests.filter((req) => req.action === "Rejected");
          setDeletedRequests(deleted);
          setFilteredDeleted(deleted);
        } else {
          setError(response.data.message || "Failed to fetch advance requests.");
        }
      } catch (error) {
        console.error("Error fetching advance requests:", error);
        setError("An error occurred while fetching advance requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvanceRequests();
  }, [activeTab, showAddModal]); // Refresh when modal closes

  // Apply filters when they change
  useEffect(() => {
    if (activeTab === "confirmedRequests") {
      applyConfirmedFilters();
    } else if (activeTab === "deletedRequests") {
      applyDeletedFilters();
    }
  }, [filters, confirmedRequests, deletedRequests, activeTab]);

  const applyConfirmedFilters = () => {
    let result = [...confirmedRequests];
    result = applyCommonFilters(result);
    setFilteredConfirmed(result);
  };

  const applyDeletedFilters = () => {
    let result = [...deletedRequests];
    result = applyCommonFilters(result);
    setFilteredDeleted(result);
  };

  const applyCommonFilters = (requests) => {
    let result = [...requests];

    if (filters.userId) {
      result = result.filter(request => 
        request.userId.toString().includes(filters.userId)
      );
    }

    if (filters.year) {
      result = result.filter(request => {
        const requestDate = new Date(request.date);
        return requestDate.getFullYear().toString() === filters.year;
      });
    }

    if (filters.month) {
      result = result.filter(request => {
        const requestDate = new Date(request.date);
        return (requestDate.getMonth() + 1).toString().padStart(2, '0') === filters.month;
      });
    }

    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      userId: "",
      year: "",
      month: ""
    });
  };

  // Handle add advance form changes
  const handleAdvanceChange = (e) => {
    const { name, value } = e.target;
    setNewAdvance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit new advance
  const handleAddAdvance = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!newAdvance.userId || !newAdvance.amount) {
      setError("User ID and Amount are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/add-advance",
        {
          userId: newAdvance.userId,
          amount: parseFloat(newAdvance.amount),
          date: newAdvance.date
        },
        { withCredentials: true }
      );

      if (response.data.status === "Success") {
        alert("Advance added successfully!");
        setShowAddModal(false);
        setNewAdvance({
          userId: "",
          amount: "",
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        setError(response.data.message || "Failed to add advance.");
      }
    } catch (error) {
      console.error("Error adding advance:", error);
      setError(error.response?.data?.message || "An error occurred while adding advance.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to confirm an advance request
  const handleConfirm = async (id) => {
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-advance",
        { advanceId: id },
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        const confirmedRequest = newRequests.find((req) => req.advn_id === id);
  
        if (confirmedRequest) {
          setNewRequests(newRequests.filter((req) => req.advn_id !== id));
          const updatedConfirmed = [...confirmedRequests, { ...confirmedRequest, action: "Approved" }];
          setConfirmedRequests(updatedConfirmed);
          setFilteredConfirmed(updatedConfirmed);
        }
  
        alert("Advance request confirmed successfully!");
      } else {
        setError(response.data.message || "Failed to confirm advance request.");
      }
    } catch (error) {
      console.error("Error confirming advance request:", error);
      setError("An error occurred while confirming the advance request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete an advance request
  const handleDelete = async (id) => {
    setIsLoading(true);
    setError("");
  
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-advance",
        { advanceId: id },
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        const request = newRequests.find((req) => req.advn_id === id);
        if (request) {
          const updatedDeleted = [...deletedRequests, { ...request, action: "Rejected" }];
          setDeletedRequests(updatedDeleted);
          setFilteredDeleted(updatedDeleted);
          setNewRequests(newRequests.filter((req) => req.advn_id !== id));
        }
        alert("Advance request deleted successfully!");
      } else {
        setError(response.data.message || "Failed to delete advance request.");
      }
    } catch (error) {
      console.error("Error deleting advance request:", error);
      setError("An error occurred while deleting the advance request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate years for dropdown (last 5 years)
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  return (
    <div className="advance-update-container">
      <div className="content-wrapper">
        <div className="content">
          <div className="page-header">
            <h1>Advance Requests</h1>
            <button 
              className="add-advance-button"
              onClick={() => setShowAddModal(true)}
            >
              Add Advance
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "newRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("newRequests")}
            >
              New Requests
            </button>
            <button
              className={`tab-button ${activeTab === "confirmedRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("confirmedRequests")}
            >
              Confirmed Requests
            </button>
            <button
              className={`tab-button ${activeTab === "deletedRequests" ? "active" : ""}`}
              onClick={() => setActiveTab("deletedRequests")}
            >
              Deleted Requests
            </button>
          </div>

          {/* Loading and Error Messages */}
          {isLoading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}

          {/* New Requests Table */}
          {activeTab === "newRequests" && (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newRequests.map((request) => (
                    <tr key={request.advn_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>LKR {request.amount}</td>
                      <td>{new Date(request.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</td>
                      <td>
                        <button
                          className="confirm-button"
                          onClick={() => handleConfirm(request.advn_id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(request.advn_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Confirmed Requests Table */}
          {activeTab === "confirmedRequests" && (
            <div className="requests-table">
              {/* Filter Controls */}
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Search by User ID:</label>
                  <input
                    type="text"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    placeholder="Enter user ID"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Filter by Year:</label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Years</option>
                    {generateYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Filter by Month:</label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    disabled={!filters.year}
                  >
                    <option value="">All Months</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  onClick={resetFilters}
                  className="reset-filters"
                >
                  Reset Filters
                </button>
              </div>

              <div className="results-count">
                Showing {filteredConfirmed.length} of {confirmedRequests.length} records
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConfirmed.map((request) => (
                    <tr key={request.advn_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>LKR {request.amount}</td>
                      <td>{new Date(request.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Deleted Requests Table */}
          {activeTab === "deletedRequests" && (
            <div className="requests-table">
              {/* Filter Controls */}
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Search by User ID:</label>
                  <input
                    type="text"
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    placeholder="Enter user ID"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Filter by Year:</label>
                  <select
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Years</option>
                    {generateYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Filter by Month:</label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    disabled={!filters.year}
                  >
                    <option value="">All Months</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  onClick={resetFilters}
                  className="reset-filters"
                >
                  Reset Filters
                </button>
              </div>

              <div className="results-count">
                Showing {filteredDeleted.length} of {deletedRequests.length} records
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Farmer Name</th>
                    <th>Advance Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeleted.map((request) => (
                    <tr key={request.advn_id}>
                      <td>{request.userId}</td>
                      <td>{request.firstName +' '+ request.lastName}</td>
                      <td>LKR {request.amount}</td>
                      <td>{new Date(request.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Advance Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Advance</h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddAdvance}>
              <div className="input-group">
                <label>Farmer ID</label>
                <input
                  type="text"
                  name="userId"
                  value={newAdvance.userId}
                  onChange={handleUserIdChange}
                  required
                  placeholder="Start typing to search farmer IDs"
                  autoComplete="off"
                />
                {showSuggestions && farmerSuggestions.length > 0 && (
                  <ul className="suggestions-dropdown">
                    {farmerSuggestions.map((farmer, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(farmer)}>
                        {farmer.userId} - {farmer.firstName} {farmer.lastName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="input-group">
                <label>Amount (LKR)</label>
                <input
                  type="number"
                  name="amount"
                  value={newAdvance.amount}
                  onChange={handleAdvanceChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter advance amount"
                />
              </div>

              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newAdvance.date}
                  onChange={handleAdvanceChange}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add Advance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvanceUpdate;