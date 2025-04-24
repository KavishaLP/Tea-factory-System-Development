import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeaPaketDistribution.css";

const TeaPacketDistribution = () => {
  const [activeTab, setActiveTab] = useState("newRequests");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: "",
    year: "",
    month: "",
    teaPacketType: "",
    paymentOption: ""
  });

  // Get current year and month for default filter values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  // Fetch data on component mount or when the active tab changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchTeaPacketRequests();
        setRequests(data || []);
        setFilteredRequests(data || []);
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", error);
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, requests, activeTab]);

  const applyFilters = () => {
    let result = [...requests];

    // Filter by status based on active tab
    result = result.filter(request => {
      if (activeTab === "newRequests") return request.status === "Pending";
      if (activeTab === "confirmedRequests") return request.status === "Approved";
      if (activeTab === "deletedRequests") return request.status === "Rejected";
      return true;
    });

    // Apply other filters
    if (filters.userId) {
      result = result.filter(request => 
        request.userId.toString().includes(filters.userId)
      );
    }

    if (filters.year) {
      result = result.filter(request => {
        const requestDate = new Date(request.requestDate);
        return requestDate.getFullYear().toString() === filters.year;
      });
    }

    if (filters.month) {
      result = result.filter(request => {
        const requestDate = new Date(request.requestDate);
        return (requestDate.getMonth() + 1).toString().padStart(2, '0') === filters.month;
      });
    }

    if (filters.teaPacketType) {
      result = result.filter(request => 
        request.teaPacketType === filters.teaPacketType
      );
    }

    if (filters.paymentOption) {
      result = result.filter(request => 
        request.paymentOption === filters.paymentOption
      );
    }

    setFilteredRequests(result);
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
      month: "",
      teaPacketType: "",
      paymentOption: ""
    });
  };

  // Fetch tea packet requests from the backend
  const fetchTeaPacketRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/admin/get-tea-packet-requests",
        { withCredentials: true }
      );
  
      if (response.data.status === "Success") {
        return response.data.teaPacketRequests || [];
      } else {
        throw new Error(response.data.message || "Failed to fetch tea packet requests.");
      }
    } catch (error) {
      console.error("Error fetching tea packet requests:", error);
      throw error;
    }
  };

  // Handle Confirm action
  const handleConfirm = async (requestId) => {
    setError("");
    try {
      await confirmRequest(requestId);
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.request_id === requestId ? { ...request, status: "Approved" } : request
        )
      );
      alert("Request confirmed successfully!");
    } catch (error) {
      setError("Failed to confirm request. Please try again.");
      console.error("Error confirming request:", error);
    }
  };

  // Confirm a tea packet request
  const confirmRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/confirm-tea-packets",
        { requestId: requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to confirm request.");
      }
    } catch (error) {
      console.error("Error confirming request:", error);
      throw error;
    }
  };

  // Handle Delete action
  const handleDelete = async (requestId) => {
    setError("");
    try {
      await deleteRequest(requestId);
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.request_id === requestId ? { ...request, status: "Rejected" } : request
        )
      );
      alert("Request deleted successfully!");
    } catch (error) {
      setError("Failed to delete request. Please try again.");
      console.error("Error deleting request:", error);
    }
  };

  // Delete a tea packet request
  const deleteRequest = async (requestId) => {
    try {
      const response = await axios.post(
        "http://localhost:8081/api/admin/delete-tea-packets",
        { requestId: requestId },
        { withCredentials: true }
      );
      if (response.data.status !== "Success") {
        throw new Error(response.data.message || "Failed to delete request.");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
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

  // Get unique tea packet types for filter dropdown
  const getUniqueTeaPacketTypes = () => {
    const types = new Set();
    requests.forEach(request => types.add(request.teaPacketType));
    return Array.from(types);
  };

  // Get unique payment options for filter dropdown
  const getUniquePaymentOptions = () => {
    const options = new Set();
    requests.forEach(request => options.add(request.paymentOption));
    return Array.from(options);
  };

  return (
    <div className="tpd-content">
      <div className="tpd-grid">
        <h2>Tea Packet Request History</h2>
        <div className="history-section">
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
            
            <div className="filter-group">
              <label>Tea Packet Type:</label>
              <select
                name="teaPacketType"
                value={filters.teaPacketType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                {getUniqueTeaPacketTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Payment Option:</label>
              <select
                name="paymentOption"
                value={filters.paymentOption}
                onChange={handleFilterChange}
              >
                <option value="">All Options</option>
                {getUniquePaymentOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
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

          {/* Results Count */}
          <div className="results-count">
            Showing {filteredRequests.length} of {requests.length} records
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* History Table */}
          <div className="table-container">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredRequests.length === 0 ? (
              <p>No tea packet requests found matching your filters.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Tea Packet Type</th>
                    <th>Packet Size</th>
                    <th>Amount</th>
                    <th>Payment Option</th>
                    <th>Status</th>
                    {activeTab === "newRequests" && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.request_id}>
                      <td>{new Date(request.requestDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</td>
                      <td>{request.userId}</td>
                      <td>{request.userName}</td>
                      <td>{request.teaPacketType}</td>
                      <td>{request.teaPacketSize}</td>
                      <td>{request.amount}</td>
                      <td>{request.paymentOption}</td>
                      <td>
                        <span className={`status ${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      {activeTab === "newRequests" && (
                        <td className="action-buttons">
                          <button
                            className="confirm-button"
                            onClick={() => handleConfirm(request.request_id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(request.request_id)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button>&laquo;</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>&raquo;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaPacketDistribution;